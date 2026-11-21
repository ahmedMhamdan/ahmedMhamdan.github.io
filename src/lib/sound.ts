// Pure sound and player math shared by the client audio (src/scripts/audio.ts, player.ts), the player
// markup and the tests (sound.test.ts). Numbers: docs/design/direction.md, "Sound". No DOM, no Astro imports.
import { TUNING } from './dial.ts';

export const SOUND = {
  volume: 0.8, // default volume
  noiseSeconds: 2, // white noise loop
  noiseHz: 2200, // static: bandpass centre
  noiseQ: 0.5,
  fftSize: 256, // analyser: 128 bins of about 170 Hz
  click: { hz: 1300, gain: 0.04, ms: 35 }, // lock click: square wave, exponential fade
  marqueeCells: 12,
  marqueeMs: 240, // the marquee advances one cell this often while playing
} as const;

export interface SoundInput {
  /** Signal strength 0..1 and MHz to the nearest station (the tuner's). */
  strength: number;
  dist: number;
  locked: boolean;
  /** How fast the dial moves, 0..1 (movingFrom). */
  moving: number;
  /** DIAL FX on. */
  fx: boolean;
}

/** Where every parameter of the radio sound heads on this frame. */
export interface SoundTargets {
  noise: number; // static gain
  whistleHz: number;
  whistle: number; // heterodyne whistle gain
  highpass: number; // Hz
  lowpass: number; // Hz
  music: number; // music gain before the volume
}

/** Dial speed as the mock measures it (MHz per 60 Hz frame, smoothed) to 0..1. */
export const movingFrom = (speed: number) => Math.min(1, speed * 40);

/**
 * The radio's sound for one frame: static and a whistle between stations, the music muffled and thinned
 * the weaker the signal. With DIAL FX off the music plays clean and the dial is silent.
 */
export function soundTargets({ strength, dist, locked, moving, fx }: SoundInput): SoundTargets {
  const on = fx ? 1 : 0;
  const span = TUNING.strengthSpan;
  const still = locked && moving < 0.05;
  const whistle = dist > 0.02 && dist < span ? (1 - dist / span) * 0.018 : 0;
  const c = fx ? (locked ? 1 : strength * 0.8) : 1; // clarity
  return {
    noise: still ? 0 : on * ((1 - strength) * 0.09 + moving * 0.05),
    whistleHz: 220 + dist * 5200,
    whistle: on * whistle,
    highpass: 20 + (1 - c) * 650,
    lowpass: 1500 + c * c * 17000,
    music: 0.3 + 0.7 * c,
  };
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Volume knob rotation in degrees: −135° (silent) to +135° (full). */
export const volumeAngle = (v: number) => -135 + clamp01(v) * 270;

/** One full sweep of the volume knob (270°) in radians. */
export const VOLUME_SWEEP = 1.5 * Math.PI;

/**
 * The marquee: 12 fourteen-segment cells of the track title, `step` cells along. Letters, digits, space,
 * "." and "-" only; a "." lights the decimal point of the cell before it, so it takes no cell of its own.
 */
export function marqueeCells(title: string, step: number): string {
  const text = `   ${title.toUpperCase().replace(/[^A-Z0-9 .-]/g, '')}   `;
  const cells = (text.match(/[^.]\.?|\./g) ?? []).map((c) => (c === '.' ? '!.' : c.replace(' ', '!')));
  const n = cells.length;
  if (!n) return '!'.repeat(SOUND.marqueeCells);
  const k = ((step % n) + n) % n;
  return Array.from({ length: SOUND.marqueeCells }, (_, i) => cells[(k + i) % n]).join('');
}

/** Elapsed time as "mm:ss" in seven-segment cells ("!" blanks a leading zero; minutes wrap at 100). */
export function timeCells(seconds: number): string {
  const sec = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(sec / 60) % 100).padStart(2, '!')}:${String(sec % 60).padStart(2, '0')}`;
}
