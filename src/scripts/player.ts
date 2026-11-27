// The "What I listen to" player (FR-08) and the volume knob on the radio. It exists only when
// src/data/tracks.ts lists a song. With several songs it is a playlist: previous, next, the list above the
// player, and the next song starts when one ends (after the last, the first).
// The music starts on the visitor's first click or tap anywhere on the page (Ahmed, 2026-11-27). Browsers
// allow sound only after such a gesture, so no audio loads or plays before it. A key press alone never
// starts it (it would talk over a screen reader), a press on the player itself is left to that button,
// and once the visitor pauses, nothing starts by itself again in this session.
// Each song turns the site its colour (--lit and --ground on <html>, and the wall through the state); a
// pause keeps it, the next song changes it. The first song to play turns DIAL FX on, unless the visitor
// already set it. The marquee advances one cell every 240 ms while the music plays (still with reduced
// motion); the volume is remembered for the session only.
import { SOUND, VOLUME_SWEEP, clamp01, marqueeCells, timeCells, volumeAngle } from '../lib/sound';
import { ui } from '../lib/ui';
import type { Sound } from './audio';
import { rotary } from './rotary';
import { need, type RadioState } from './state';

const PLAY = 'M7 4v16l13-8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';
const VOLUME_KEY = 'radio-volume';
const PAUSED_KEY = 'radio-paused';
const RESTART_AFTER = 3; // s: "previous" further into a song than this starts it again

const remember = (key: string, value: string | null) => {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked: nothing is remembered.
  }
};
const recall = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export function createPlayer(player: HTMLElement, radio: HTMLElement, s: RadioState, sound: Sound, wake: () => void) {
  const a = s.audio;
  const media = need<HTMLAudioElement>(player, 'audio');
  const play = need<HTMLButtonElement>(player, '[data-play]');
  const icon = need<SVGPathElement>(play, 'path');
  const fx = need<HTMLButtonElement>(player, '[data-fx]');
  const marquee = need(player, '[data-marquee]');
  const time = need(player, '[data-time]');
  const nowText = need(player, '[data-now]');
  const list = need(player, '[data-list]');
  const songs = [...list.querySelectorAll<HTMLButtonElement>('[data-track]')];
  const listButton = player.querySelector<HTMLButtonElement>('[data-list-button]');
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const knob = need(radio, '[data-volume]');
  const grip = need(knob, '.grip');

  let index = 0;
  let title = songs[0]?.dataset.marquee ?? '';
  let loaded = false;
  let fxChosen = false;
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

  function setVolume(v: number, keep = true) {
    a.volume = clamp01(v);
    const pct = Math.round(a.volume * 100);
    grip.style.transform = `rotate(${volumeAngle(a.volume).toFixed(1)}deg)`;
    knob.setAttribute('aria-valuenow', String(pct));
    knob.setAttribute('aria-valuetext', `${pct}%`);
    if (keep) remember(VOLUME_KEY, String(a.volume));
    wake();
  }
  const saved = parseFloat(recall(VOLUME_KEY) ?? '');
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

  // ---- DIAL FX ----
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

  // ---- songs: choosing one loads it and gives the site its colours ----
  function select(i: number) {
    index = (i + songs.length) % songs.length;
    const song = songs[index];
    media.src = song.dataset.src ?? '';
    title = song.dataset.marquee ?? '';
    step = 0;
    marquee.textContent = marqueeCells(title, 0);
    nowText.textContent = `${ui.track}: ${song.dataset.name ?? ''}`;
    time.textContent = shownTime = timeCells(0);
    songs.forEach((el, j) => (j === index ? el.setAttribute('aria-current', 'true') : el.removeAttribute('aria-current')));
    paint(song.dataset.lit ?? s.lit, song.dataset.ground ?? '');
  }

  function paint(lit: string, ground: string) {
    const root = document.documentElement.style;
    root.setProperty('--lit', lit);
    if (ground) root.setProperty('--ground', ground);
    if (themeColor && ground) themeColor.content = ground;
    s.lit = lit;
    wake();
  }

  /** Play song i (inside a click or tap, so browsers and iOS let the sound start). */
  function playSong(i: number, auto = false) {
    sound.start();
    if (!loaded && !fxChosen) setFx(true);
    loaded = true;
    if (i !== index || !media.src) select(i);
    remember(PAUSED_KEY, null);
    media.play().catch(() => {
      // The browser refused (no gesture after all): wait for the next one.
      if (auto) arm(true);
    });
  }

  play.addEventListener('click', () => {
    arm(false);
    if (!loaded || media.paused) playSong(index);
    else {
      media.pause();
      remember(PAUSED_KEY, '1');
    }
  });
  player.querySelector('[data-next]')?.addEventListener('click', () => playSong(index + 1));
  player.querySelector('[data-prev]')?.addEventListener('click', () => {
    if (loaded && media.currentTime > RESTART_AFTER) {
      media.currentTime = 0;
      if (media.paused) playSong(index);
    } else playSong(index - 1);
  });

  // ---- the list: a popover above the player (a sheet above the phone's bar) ----
  const native = typeof list.showPopover === 'function';
  function place() {
    const r = player.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const st = list.style;
    st.bottom = `${Math.round(innerHeight - r.top + 8)}px`;
    st.maxHeight = `${Math.max(160, Math.round(r.top - 16))}px`;
    if (r.width >= vw - 1) {
      st.left = st.right = '8px';
      st.width = 'auto';
    } else if (document.dir === 'rtl') {
      st.left = `${Math.round(r.left)}px`;
      st.right = 'auto';
    } else {
      st.right = `${Math.round(vw - r.right)}px`;
      st.left = 'auto';
    }
  }
  const closeList = () => {
    if (native) list.hidePopover();
    else if (!list.hidden) {
      list.hidden = true;
      listButton?.setAttribute('aria-expanded', 'false');
    }
  };
  if (native) list.addEventListener('beforetoggle', (e) => (e as ToggleEvent).newState === 'open' && place());
  else if (listButton) {
    // No popover support: the button shows and hides the list itself.
    list.hidden = true;
    listButton.setAttribute('aria-expanded', 'false');
    listButton.setAttribute('aria-controls', list.id);
    listButton.addEventListener('click', () => {
      place();
      list.hidden = !list.hidden;
      listButton.setAttribute('aria-expanded', String(!list.hidden));
    });
    list.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeList();
      listButton.focus();
    });
  }
  songs.forEach((el, i) =>
    el.addEventListener('click', () => {
      playSong(i);
      closeList();
    }),
  );

  // ---- state from the media element ----
  function showState() {
    a.playing = !media.paused && !media.ended;
    icon.setAttribute('d', a.playing ? PAUSE : PLAY);
    play.setAttribute('aria-label', a.playing ? ui.pause : ui.play);
    sound.sync();
    wake();
  }
  for (const type of ['play', 'pause']) media.addEventListener(type, showState);
  // When a song ends the next one plays: the visitor started the music, so this is not autoplay.
  media.addEventListener('ended', () => (songs.length > 1 ? playSong(index + 1) : showState()));
  // A song that cannot load stops the player instead of leaving it "playing" silence.
  media.addEventListener('error', () => {
    if (!media.paused) media.pause();
    showState();
  });
  media.addEventListener('timeupdate', () => {
    const t = timeCells(media.currentTime);
    if (t !== shownTime) time.textContent = shownTime = t;
  });

  // ---- the first click or tap anywhere starts the music ----
  // Browsers count a mouse press, or a finger or pen lifted after a tap (not a scroll), as the gesture.
  function onGesture(e: PointerEvent) {
    if ((e.pointerType === 'mouse') !== (e.type === 'pointerdown')) return;
    arm(false);
    if (a.playing || (e.target as Element | null)?.closest?.('[data-player]')) return;
    playSong(index, true);
  }
  function arm(on: boolean) {
    for (const type of ['pointerdown', 'pointerup'] as const)
      if (on) addEventListener(type, onGesture, true);
      else removeEventListener(type, onGesture, true);
  }
  if (recall(PAUSED_KEY) !== '1') arm(true);

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
