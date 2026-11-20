// Tuner entry: one state object and one requestAnimationFrame loop that sleeps whenever nothing
// changes and while the tab is hidden (QR-04). Without this script every page still works: the
// dial marks are plain links and each station is a real page.
import type { StationInfo } from '../lib/dial';
import { createDial } from './dial';
import { createPanel } from './panel';
import { createReadouts } from './readouts';
import { createState, need } from './state';
import { createTuner } from './tuner';
import { createWall } from './wall';

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
  const renders: ((dt: number, now: number) => boolean)[] = [
    createDial(radio, s),
    createReadouts(radio, program, s),
    createPanel(program, s),
    createWall(program, s, wake),
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
}

start();
