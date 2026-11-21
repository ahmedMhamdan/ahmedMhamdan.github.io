// The "What I listen to" player (FR-08) and the volume knob on the radio. It exists only when
// src/data/tracks.ts lists a track. Nothing plays and no audio loads before a press (QR-07):
// the first press of play loads the track and turns DIAL FX on (unless the visitor already set it).
// The marquee advances one cell every 240 ms while the music plays (still with reduced motion);
// the volume is remembered for the session only.
import { SOUND, VOLUME_SWEEP, clamp01, marqueeCells, timeCells, volumeAngle } from '../lib/sound';
import { ui } from '../lib/ui';
import type { Sound } from './audio';
import { rotary } from './rotary';
import { need, type RadioState } from './state';

const PLAY = 'M7 4v16l13-8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';
const VOLUME_KEY = 'radio-volume';

export function createPlayer(player: HTMLElement, radio: HTMLElement, s: RadioState, sound: Sound, wake: () => void) {
  const a = s.audio;
  const media = need<HTMLAudioElement>(player, 'audio');
  const play = need<HTMLButtonElement>(player, '[data-play]');
  const icon = need<SVGPathElement>(play, 'path');
  const fx = need<HTMLButtonElement>(player, '[data-fx]');
  const marquee = need(player, '[data-marquee]');
  const time = need(player, '[data-time]');
  const title = player.dataset.title ?? '';
  const knob = need(radio, '[data-volume]');
  const grip = need(knob, '.grip');

  let fxChosen = false;
  let loaded = false;
  let step = 0;
  let stepAt = 0;
  let shownTime = '';

  // ---- volume: the knob on the radio becomes a slider (−135° to +135°) ----
  knob.removeAttribute('aria-hidden');
  knob.setAttribute('role', 'slider');
  knob.setAttribute('aria-label', ui.volume);
  knob.setAttribute('aria-valuemin', '0');
  knob.setAttribute('aria-valuemax', '100');
  knob.tabIndex = 0;

  function setVolume(v: number, remember = true) {
    a.volume = clamp01(v);
    const pct = Math.round(a.volume * 100);
    grip.style.transform = `rotate(${volumeAngle(a.volume).toFixed(1)}deg)`;
    knob.setAttribute('aria-valuenow', String(pct));
    knob.setAttribute('aria-valuetext', `${pct}%`);
    if (remember)
      try {
        sessionStorage.setItem(VOLUME_KEY, String(a.volume));
      } catch {
        // Storage blocked: the volume just isn't remembered.
      }
    wake();
  }
  let saved = NaN;
  try {
    saved = parseFloat(sessionStorage.getItem(VOLUME_KEY) ?? '');
  } catch {
    // Storage blocked: start from the default.
  }
  setVolume(Number.isFinite(saved) ? saved : a.volume, false);

  rotary(knob, { turn: (rad) => setVolume(a.volume + rad / VOLUME_SWEEP) });
  const nudge = (d: number) => setVolume(Math.round((a.volume + d) * 100) / 100);
  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') nudge(0.05);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') nudge(-0.05);
    else if (e.key === 'PageUp') nudge(0.1);
    else if (e.key === 'PageDown') nudge(-0.1);
    else if (e.key === 'Home') setVolume(0);
    else if (e.key === 'End') setVolume(1);
    else return;
    e.preventDefault(); // also keeps the arrows from seeking stations
  });

  // ---- DIAL FX and play/pause ----
  function setFx(on: boolean) {
    a.fx = on;
    fx.setAttribute('aria-pressed', String(on));
    sound.sync();
    wake();
  }
  fx.addEventListener('click', () => {
    fxChosen = true;
    sound.start();
    setFx(!a.fx);
  });

  play.addEventListener('click', () => {
    sound.start(); // inside the click, so browsers (and iOS) let the sound start
    if (!loaded) {
      loaded = true;
      media.src = media.dataset.src ?? '';
      if (!fxChosen) setFx(true);
    }
    if (media.paused) media.play().catch(() => undefined);
    else media.pause();
  });

  function showState() {
    a.playing = !media.paused && !media.ended;
    icon.setAttribute('d', a.playing ? PAUSE : PLAY);
    play.setAttribute('aria-label', a.playing ? ui.pause : ui.play);
    sound.sync();
    wake();
  }
  for (const type of ['play', 'pause', 'ended']) media.addEventListener(type, showState);
  // A track that cannot load stops the player instead of leaving it "playing" silence.
  media.addEventListener('error', () => {
    if (!media.paused) media.pause();
    showState();
  });
  media.addEventListener('timeupdate', () => {
    const t = timeCells(media.currentTime);
    if (t !== shownTime) time.textContent = shownTime = t;
  });

  player.hidden = false;

  return function render(_dt: number, now: number): boolean {
    if (a.playing && !s.reduceMotion && now - stepAt >= SOUND.marqueeMs) {
      stepAt = now;
      marquee.textContent = marqueeCells(title, ++step);
    }
    // The audio keeps the loop running while the music plays.
    return false;
  };
}
