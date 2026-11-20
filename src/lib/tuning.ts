// Pure tuning math shared by the client tuner (src/scripts/) and its tests (tuning.test.ts).
// Numbers: docs/design/direction.md, "Tuning model". No DOM, no Astro imports, so Node can run the tests directly.
import { LO, TUNING } from './dial.ts';

export interface Tunable {
  freq: number;
}

/** The mock's numbers are per frame at 60 Hz; easing and the antenna scale by real frame time instead. */
export const FRAME_MS = 1000 / 60;

/** Station nearest to a frequency. `stations` is non-empty. */
export function nearest<T extends Tunable>(stations: readonly T[], f: number): T {
  let best = stations[0];
  for (const s of stations) if (Math.abs(s.freq - f) < Math.abs(best.freq - f)) best = s;
  return best;
}

/** Signal strength 0..1 at a distance (MHz) from the nearest station. */
export const strengthAt = (distance: number) => Math.max(0, 1 - distance / TUNING.strengthSpan);

export const isLocked = (distance: number) => distance < TUNING.lockWithin;

/** f after one frame of easing toward target, at the same speed on 60 Hz and 120 Hz screens. */
export function ease(f: number, target: number, dtMs: number): number {
  const d = target - f;
  if (Math.abs(d) < TUNING.snapWithin) return target;
  return f + d * (1 - Math.pow(1 - TUNING.ease, dtMs / FRAME_MS));
}

export interface AfcInput {
  f: number;
  target: number;
  dragging: boolean;
  /** Milliseconds since the last tuning input. */
  restMs: number;
  /** Frequency of the station nearest to f. */
  near: number;
}

/** AFC can still pull the dial onto `near` once it has rested long enough. */
export function afcPending({ f, target, dragging, near }: AfcInput): boolean {
  const dist = Math.abs(near - f);
  return !dragging && target !== near && dist > TUNING.afcMin && dist < TUNING.afcWithin;
}

/** The frequency AFC pulls the dial to on this frame, or null. */
export function afcPull(input: AfcInput): number | null {
  const { f, target, restMs, near } = input;
  if (restMs <= TUNING.afcRestMs || Math.abs(target - f) >= TUNING.afcSettled) return null;
  return afcPending(input) ? near : null;
}

/** The dial is gliding onto a station target close by: the AFC lamp stays lit. */
export function afcGliding(f: number, target: number, near: number): boolean {
  return Math.abs(target - f) > 0.003 && Math.abs(target - near) < TUNING.afcMin && Math.abs(near - f) < TUNING.afcWithin;
}

/** Seek: the first station above the dial, wrapping to the lowest. */
export function nextStation<T extends Tunable>(stations: readonly T[], f: number): T {
  return stations.find((s) => s.freq > f + TUNING.seekGap) ?? stations[0];
}

/** Seek: the first station below the dial, wrapping to the highest. */
export function prevStation<T extends Tunable>(stations: readonly T[], f: number): T {
  for (let i = stations.length - 1; i >= 0; i--) if (stations[i].freq < f - TUNING.seekGap) return stations[i];
  return stations[stations.length - 1];
}

/** Lit bars on the 10-bar meter. `jitter` (0..1) makes the needle nervous while searching. */
export function meterBars(strength: number, locked: boolean, jitter: number): number {
  return Math.max(0, Math.min(10, Math.round(strength * 10 - (locked ? 0 : jitter * 2))));
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * The 9-cell station key while searching: each character survives with probability strength × 0.8,
 * otherwise it is a random glyph, or blank when the signal is too weak. `rnd` returns 0..1.
 */
export function keyReadout(key: string, strength: number, locked: boolean, rnd: () => number): string {
  const cells = key.padEnd(9, ' ').slice(0, 9);
  if (locked) return cells;
  return [...cells]
    .map((c) => (c === ' ' || rnd() < strength * 0.8 ? c : strength > 0.15 ? GLYPHS[Math.floor(rnd() * GLYPHS.length)] : ' '))
    .join('');
}

/** Segment readouts: "!" is a blank cell as wide as a lit one. */
export const freqCells = (f: number) => f.toFixed(1).padStart(5, '!');
export const keyCells = (text: string) => text.padEnd(9, ' ').replace(/ /g, '!');

/** Knob rotation in degrees: one full turn per 2 MHz. */
export const knobAngle = (f: number) => ((f - LO) / TUNING.mhzPerTurn) * 360;

/** Smallest signed difference between two angles (radians), in (-π, π]. */
export function angleDelta(from: number, to: number): number {
  let x = to - from;
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x <= -Math.PI) x += 2 * Math.PI;
  return x;
}

export interface Spring {
  a: number;
  v: number;
}

/** One 60 Hz step of the antenna spring; `df` is the MHz the dial moved during the step. */
export function springStep({ a, v }: Spring, df: number): Spring {
  v += -a * 0.08 - v * 0.12 + df * -60;
  return { a: a + v, v };
}

/** Antenna angle in degrees: leans −13°, swings at most ±9°. */
export const antennaAngle = (a: number) => -13 + Math.max(-9, Math.min(9, a));

/** A station URL path in its canonical form: "/work/elancer" and "/work/elancer/index.html" become "/work/elancer/". */
export function normalizePath(pathname: string): string {
  const p = pathname.replace(/index\.html$/, '');
  return p.endsWith('/') ? p : `${p}/`;
}
