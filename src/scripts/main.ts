// Tuner entry: one state object and one requestAnimationFrame loop that sleeps whenever nothing
// changes and while the tab is hidden (QR-04). The music keeps playing in a hidden tab; only the
// pictures stop. Without this script every page still works: the
// dial marks are plain links and each station is a real page.
// Power on: a page opens with the radio off (global.css); after POWER_MS it switches on just below the
// page's station and tunes in to it, static and all. Not with reduced motion, nor where CSS cannot
// tell that scripts run (then there is no "off" to start from).
import { LO, type StationInfo } from '../lib/dial';
import { createAudio } from './audio';
import { createDial } from './dial';
import { createDock } from './dock';
import { createPanel } from './panel';
import { createPlayer } from './player';
import { createReadouts } from './readouts';
import { createState, need } from './state';
import { createTuner } from './tuner';
import { createWall } from './wall';

const POWER_MS = 450;
const BOOT_MHZ = 0.5; // how far below its station the dial wakes up

interface RadioData {
  current: string;
  stations: StationInfo[];
}

function start() {
  const data: RadioData = JSON.parse(need(document, '#radio-data').textContent ?? '');
  const radio = need(document, '[data-radio]');
  const program = need(document, '.program');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const s = createState(data.stations, data.current, motion.matches);
  const root = document.documentElement;
  const boot = !s.reduceMotion && matchMedia('(scripting: enabled)').matches;
  if (boot) {
    // Below the station, but nearer to it than to the station under it, so it is the one that comes in.
    const home = s.current.freq;
    const under = s.stations.filter((st) => st.freq < home).at(-1);
    s.f = s.target = home - Math.min(BOOT_MHZ, home - LO, under ? (home - under.freq) / 2 - 0.05 : BOOT_MHZ);
    s.booting = true;
  }

  let raf = 0;
  let last = 0;
  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!raf) last = performance.now();
    schedule();
  };

  const step = createTuner(radio, s, wake);
  // Sound and the player exist only when the page has a player (a track in src/data/tracks.ts).
  // The audio renders first: the cone and the wall read the music it measures.
  const player = program.querySelector<HTMLElement>('[data-player]');
  const sound = player ? createAudio(need(player, 'audio'), s) : null;
  const renders: ((dt: number, now: number) => boolean)[] = [
    ...(sound ? [sound.render] : []),
    createDial(radio, s),
    createReadouts(radio, program, s),
    createPanel(program, s),
    createDock(radio, program, s),
    createWall(program, s, wake),
    ...(player && sound ? [createPlayer(player, radio, s, sound, wake)] : []),
  ];

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(50, Math.max(0, now - last));
    last = now;
    let busy = step(dt, now);
    for (const render of renders) busy = render(dt, now) || busy;
    if (busy) schedule();
  }

  motion.addEventListener('change', () => {
    s.reduceMotion = motion.matches;
    wake();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return wake();
    cancelAnimationFrame(raf);
    raf = 0;
  });
  // First frame right away, even in a background tab, so the slider has its value from the start.
  last = performance.now();
  frame(last);

  if (!boot) root.dataset.power = 'on';
  else
    setTimeout(() => {
      root.dataset.power = 'on';
      // Tune in, unless the visitor already took the dial.
      if (s.booting) {
        s.target = s.current.freq;
        s.lastMove = performance.now();
      }
      wake();
    }, POWER_MS);
}

start();
