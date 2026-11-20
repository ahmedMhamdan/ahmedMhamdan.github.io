// Geometry of the dial scale SVG inside the dial window, in the radio's own pixels (the whole radio
// scales as one object). Used at build time by Radio.astro and at run time by the tuner, so the
// needle the script moves lines up with the scale the page was rendered with.
// Mirrors the mock's canvas: padding 6/12, band key column 78px, five equal rows.
import { BANDS, LO, PER, rowOf } from './dial.ts';

export const W = 408;
export const H = 204;
const PAD_X = 12;
const PAD_Y = 6;
const KEY_W = 78;
const ROW_H = (H - 2 * PAD_Y) / BANDS.length;
const TRACK_X = PAD_X + KEY_W;
const TRACK_W = W - 2 * PAD_X - KEY_W;

const n2 = (v: number) => +v.toFixed(2);
const rowTop = (row: number) => PAD_Y + row * ROW_H;
const baseline = (row: number) => rowTop(row) + ROW_H - 11;

/** Tick colours: the active row's ticks are lit at 55%, the others are ghost ticks. */
export const TICK_ON = 'rgba(255,59,31,.55)';
export const TICK_OFF = 'var(--ghost)';
/** Station mark colours: locked, on the active row, elsewhere. */
export const MARK_LOCK = 'var(--amber)';
export const MARK_ON = 'var(--lit)';
export const MARK_OFF = '#3a201a';

/** 41 ticks across one row, a major tick every 10. */
export function tickPath(row: number): string {
  let d = '';
  for (let t = 0; t <= 40; t++) {
    const x = TRACK_X + (t / 40) * TRACK_W;
    const h = t % 10 === 0 ? 10 : 5;
    d += `M${n2(x - 1)} ${n2(baseline(row) - h)}h2v${h}h-2z`;
  }
  return d;
}

/** Top-left corner of a 5×6px station mark. */
export function markAt(freq: number) {
  const row = rowOf(freq);
  return { x: n2(TRACK_X + ((freq - LO - row * PER) / PER) * TRACK_W - 2.5), y: n2(baseline(row) - 19) };
}

/** Horizontal position of the needle for a frequency (on its own row). */
export function needleX(f: number): number {
  const row = rowOf(f);
  return n2(TRACK_X + ((f - LO - row * PER) / PER) * TRACK_W);
}

/**
 * Needle drawn at x = 0 (the caller translates it): dashes 4px on, 3px off from the top row to the
 * bottom one; 4px wide and solid red inside the active row, 2px wide and faint elsewhere.
 */
export function needlePaths(activeRow: number) {
  let inRow = '';
  let outRow = '';
  for (let y = PAD_Y + 6; y < rowTop(BANDS.length - 1) + ROW_H - 4; y += 7) {
    if (y >= rowTop(activeRow) && y <= rowTop(activeRow) + ROW_H) inRow += `M-2 ${n2(y)}h4v4h-4z`;
    else outRow += `M-1 ${n2(y)}h2v4h-2z`;
  }
  return { inRow, outRow };
}
