// Tuning inputs and the per-frame tuning step (FR-04, FR-05).
// Inputs: knob drag (one turn = 2 MHz), dragging along the dial window (the needle follows the pointer;
// a tap on the track tunes to the nearest station in that row), wheel on the dial window and knob,
// keys 1–5 and ← →, the knob as a slider, every station link (band keys, marks, preset keys, seek,
// panel actions), and the browser's back and forward buttons. Numbers: docs/design/direction.md,
// "Tuning model".
import { HI, LO, TUNING, clampFreq, rowOf } from '../lib/dial';
import { H, W, freqAtPoint } from '../lib/scale';
import {
  afcGliding,
  afcPending,
  afcPull,
  ease,
  isLocked,
  nearest,
  nextStation,
  normalizePath,
  prevStation,
  strengthAt,
} from '../lib/tuning';
import { ui } from '../lib/ui';
import { rotary } from './rotary';
import { need, type RadioState } from './state';

const DRAG_START_PX = 6; // a press must move this far sideways before it tunes (taps and swipes stay taps and swipes)
const LOCK_BUZZ_MS = 8; // a tick under the finger when a drag reaches a station (phones that can vibrate)

export function createTuner(radio: HTMLElement, s: RadioState, wake: () => void) {
  const { stations } = s;
  const byPath = new Map(stations.map((st) => [st.path, st]));
  const knob = need(radio, '[data-knob]');

  const moved = () => {
    s.lastMove = performance.now();
    s.booting = false; // the visitor took over the dial
    wake();
  };
  const tuneTo = (freq: number) => {
    if (s.dragging) return;
    s.target = clampFreq(freq);
    if (s.reduceMotion) s.f = s.target;
    moved();
  };
  // Seek from where the dial is heading, so pressing twice moves two stations.
  const seek = (dir: 1 | -1) => tuneTo((dir > 0 ? nextStation : prevStation)(stations, s.target).freq);
  const firstOfRow = (row: number) => stations.find((st) => st.row === row);

  // The knob becomes a real slider only now; without the script it is decoration.
  knob.removeAttribute('aria-hidden');
  knob.setAttribute('role', 'slider');
  knob.setAttribute('aria-label', ui.tuningDial);
  knob.setAttribute('aria-valuemin', String(LO));
  knob.setAttribute('aria-valuemax', String(HI));
  knob.tabIndex = 0;

  // Rotary drag. Grabbing the knob mid-glide holds the dial where it is.
  rotary(knob, {
    start() {
      s.dragging = true;
      s.target = s.f;
      moved();
    },
    turn(rad) {
      s.target = clampFreq(s.target + (rad / (2 * Math.PI)) * TUNING.mhzPerTurn);
      s.f = s.target;
      moved();
    },
    end() {
      s.dragging = false;
      moved();
    },
  });

  // Drag along the dial window: the needle follows the pointer along the row under it, as on a slide-rule
  // dial. touch-action: pan-y (Radio.astro) leaves vertical swipes to the page, so a press tunes only once
  // it moves sideways. A tap on a station link tunes as a link; a tap on the track tunes to the nearest
  // station in that row. Layout is read in these handlers, never in a frame.
  const dialwin = need(radio, '.dialwin');
  const scale = need<SVGSVGElement>(dialwin, 'svg.scale');
  dialwin.dataset.drag = '';
  const pointAt = (e: MouseEvent) => {
    const r = scale.getBoundingClientRect();
    return freqAtPoint(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
  };
  let press: { id: number; x: number; y: number; moved: boolean } | null = null;
  let swallowClick = false;
  dialwin.addEventListener('pointerdown', (e) => {
    swallowClick = false;
    if (e.button !== 0 || (e.target as Element).closest('.bandkey')) return;
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  });
  dialwin.addEventListener('pointermove', (e) => {
    if (!press || e.pointerId !== press.id) return;
    if (!press.moved) {
      const dx = Math.abs(e.clientX - press.x);
      if (dx < DRAG_START_PX || dx < Math.abs(e.clientY - press.y)) return;
      press.moved = true;
      dialwin.setPointerCapture(e.pointerId);
      s.dragging = true;
    }
    s.target = s.f = clampFreq(pointAt(e).freq);
    moved();
  });
  const release = (e: PointerEvent) => {
    // A touch starts captured by the link under it; taking the capture fires lostpointercapture there.
    if (!press || e.pointerId !== press.id || (e.type === 'lostpointercapture' && e.target !== dialwin)) return;
    const dragged = press.moved;
    press = null;
    if (!dragged) return;
    swallowClick = e.type === 'pointerup';
    s.dragging = false;
    moved();
  };
  dialwin.addEventListener('pointerup', release);
  dialwin.addEventListener('pointercancel', release);
  dialwin.addEventListener('lostpointercapture', release);
  dialwin.addEventListener(
    'click',
    (e) => {
      // The click that ends a mouse drag is not a tap.
      if (swallowClick) {
        swallowClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if ((e.target as Element).closest('a')) return;
      const { row, freq } = pointAt(e);
      let best: (typeof stations)[number] | undefined;
      for (const st of stations) if (st.row === row && (!best || Math.abs(st.freq - freq) < Math.abs(best.freq - freq))) best = st;
      if (best) tuneTo(best.freq);
    },
    true,
  );

  // Wheel on the dial window and the knob (non-passive only there, so the page still scrolls elsewhere).
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    tuneTo(s.target - px * TUNING.wheelMhzPerPx);
  };
  dialwin.addEventListener('wheel', wheel, { passive: false });
  knob.addEventListener('wheel', wheel, { passive: false });

  // The knob as a slider: arrows ±0.1 MHz on a 0.1 grid, Page Up/Down next/previous station,
  // Home/End the first and last station.
  knob.addEventListener('keydown', (e) => {
    const step = (d: number) => tuneTo(Math.round((s.target + d) * 10) / 10);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') step(TUNING.keyStep);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') step(-TUNING.keyStep);
    else if (e.key === 'PageUp') seek(1);
    else if (e.key === 'PageDown') seek(-1);
    else if (e.key === 'Home') tuneTo(stations[0].freq);
    else if (e.key === 'End') tuneTo(stations[stations.length - 1].freq);
    else return;
    e.preventDefault();
  });

  // Anywhere on the page: 1–5 jump to a band, ← → previous/next station.
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const row = e.key.length === 1 ? '12345'.indexOf(e.key) : -1;
    const first = row >= 0 ? firstOfRow(row) : undefined;
    if (first) tuneTo(first.freq);
    else if (e.key === 'ArrowRight') seek(1);
    else if (e.key === 'ArrowLeft') seek(-1);
    else return;
    e.preventDefault();
  });

  // Station links tune instead of loading a page. Modifier clicks, new tabs and external links behave normally.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    if (a.dataset.seek) {
      e.preventDefault();
      seek(a.dataset.seek === 'next' ? 1 : -1);
      return;
    }
    const url = new URL(a.href);
    const st = url.origin === location.origin && !url.hash ? byPath.get(normalizePath(url.pathname)) : undefined;
    if (!st) return;
    e.preventDefault();
    tuneTo(st.freq);
  });

  // Back and forward retune the dial; the page for that station is already in the address bar.
  addEventListener('popstate', () => {
    const st = byPath.get(normalizePath(location.pathname));
    if (st) tuneTo(st.freq);
  });

  /** One frame of tuning: ease, AFC, lock. Returns true while the dial still has somewhere to go. */
  return function step(dt: number, now: number): boolean {
    const prevF = s.f;
    if (!s.dragging) s.f = s.reduceMotion ? s.target : ease(s.f, s.target, dt);

    const near = nearest(stations, s.f);
    const afc = { f: s.f, target: s.target, dragging: s.dragging, restMs: now - s.lastMove, near: near.freq };
    const pull = afcPull(afc);
    if (pull !== null) s.target = pull;
    s.afc = pull !== null || afcGliding(s.f, s.target, near.freq);

    const wasLocked = s.locked;
    s.near = near;
    s.dist = Math.abs(near.freq - s.f);
    s.strength = strengthAt(s.dist);
    s.locked = isLocked(s.dist) ? near : null;
    if (s.dragging && s.locked && s.locked !== wasLocked && 'vibrate' in navigator) navigator.vibrate(LOCK_BUZZ_MS);
    s.row = rowOf(s.f);
    s.df = s.f - prevF;
    // Settled on a station: it becomes the page (URL, title, announcement), and any power-on is over.
    if (s.locked && !s.dragging && s.f === s.target) {
      s.current = s.locked;
      s.booting = false;
    }

    return s.dragging || s.f !== s.target || afcPending(afc);
  };
}
