// Unit tests for the dial scale geometry. Run: npm test.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HI, LO, rowOf } from './dial.ts';
import { H, W, freqAtPoint, markAt, needleX } from './scale.ts';

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

describe('scale', () => {
  it('finds the frequency under the needle of any frequency', () => {
    for (const f of [88, 88.7, 91.99, 92, 96.8, 103.3, 107.5]) {
      const row = rowOf(f);
      const y = 6 + (row + 0.5) * ((H - 12) / 5);
      const hit = freqAtPoint(needleX(f), y);
      assert.equal(hit.row, row);
      close(hit.freq, f, 1e-2);
    }
  });
  it('finds a station at its mark', () => {
    const m = markAt(92.9);
    const hit = freqAtPoint(m.x + 2.5, m.y + 3);
    assert.equal(hit.row, 1);
    close(hit.freq, 92.9, 1e-2);
  });
  it('clamps points outside the scale to the nearest row and track end', () => {
    assert.deepEqual(freqAtPoint(-50, -50), { row: 0, freq: LO });
    assert.deepEqual(freqAtPoint(W + 50, H + 50), { row: 4, freq: HI });
    // Over the band keys: the start of that row.
    assert.equal(freqAtPoint(20, 6 + 2.5 * ((H - 12) / 5)).freq, 96);
  });
});
