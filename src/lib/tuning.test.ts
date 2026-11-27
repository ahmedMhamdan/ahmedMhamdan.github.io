// Unit tests for the tuning math. Run: npm test (Node runs TypeScript directly).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HI, LO, TUNING, clampFreq, rowOf } from './dial.ts';
import {
  FRAME_MS,
  afcGliding,
  afcPending,
  afcPull,
  angleDelta,
  antennaAngle,
  ease,
  freqCells,
  isLocked,
  keyCells,
  keyReadout,
  knobAngle,
  meterBars,
  nearest,
  nextStation,
  normalizePath,
  prevStation,
  springStep,
  strengthAt,
} from './tuning.ts';

const S = [88.7, 90.1, 92.9, 100.7, 107.5].map((freq) => ({ freq }));
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

describe('dial', () => {
  it('maps a frequency to its band row, 108.0 on the last row', () => {
    assert.equal(rowOf(88), 0);
    assert.equal(rowOf(91.99), 0);
    assert.equal(rowOf(92), 1);
    assert.equal(rowOf(107.5), 4);
    assert.equal(rowOf(HI), 4);
    assert.equal(rowOf(LO - 1), 0);
  });
  it('clamps to the dial', () => {
    assert.equal(clampFreq(80), LO);
    assert.equal(clampFreq(120), HI);
    assert.equal(clampFreq(95.4), 95.4);
  });
});

describe('signal', () => {
  it('finds the nearest station', () => {
    assert.equal(nearest(S, 88).freq, 88.7);
    assert.equal(nearest(S, 91.6).freq, 92.9);
    assert.equal(nearest(S, 104).freq, 100.7);
    assert.equal(nearest(S, 108).freq, 107.5);
  });
  it('strength falls to zero at 0.4 MHz', () => {
    assert.equal(strengthAt(0), 1);
    close(strengthAt(0.2), 0.5);
    assert.equal(strengthAt(0.4), 0);
    assert.equal(strengthAt(3), 0);
  });
  it('locks within 0.06 MHz', () => {
    assert.ok(isLocked(0));
    assert.ok(isLocked(0.059));
    assert.ok(!isLocked(0.06));
  });
});

describe('ease', () => {
  it('approaches the target by 7.5% per 60 Hz frame', () => {
    close(ease(88, 98, FRAME_MS), 88.75);
  });
  it('snaps when close', () => {
    assert.equal(ease(92.899, 92.9, FRAME_MS), 92.9);
  });
  it('moves the same distance on a 120 Hz screen', () => {
    const half = ease(ease(88, 98, FRAME_MS / 2), 98, FRAME_MS / 2);
    close(half, ease(88, 98, FRAME_MS), 1e-9);
  });
});

describe('AFC', () => {
  const rest = { dragging: false, restMs: 500 };
  it('pulls a resting dial onto a station within 0.35 MHz', () => {
    assert.equal(afcPull({ ...rest, f: 92.6, target: 92.6, near: 92.9 }), 92.9);
    assert.equal(afcPull({ ...rest, f: 93.2, target: 93.2, near: 92.9 }), 92.9);
  });
  it('waits until the dial has rested 420 ms', () => {
    assert.equal(afcPull({ ...rest, restMs: 400, f: 92.6, target: 92.6, near: 92.9 }), null);
    assert.ok(afcPending({ ...rest, restMs: 400, f: 92.6, target: 92.6, near: 92.9 }));
  });
  it('leaves a dragging or still-moving dial alone', () => {
    assert.equal(afcPull({ ...rest, dragging: true, f: 92.6, target: 92.6, near: 92.9 }), null);
    assert.equal(afcPull({ ...rest, f: 92.6, target: 92.7, near: 92.9 }), null);
  });
  it('ignores stations out of range or already on target', () => {
    assert.equal(afcPull({ ...rest, f: 92.5, target: 92.5, near: 92.9 }), null);
    assert.equal(afcPull({ ...rest, f: 92.898, target: 92.898, near: 92.9 }), null);
    assert.equal(afcPull({ ...rest, f: 92.89, target: 92.9, near: 92.9 }), null);
    assert.ok(!afcPending({ ...rest, f: 92.5, target: 92.5, near: 92.9 }));
  });
  it('keeps the lamp lit while gliding onto a nearby station', () => {
    assert.ok(afcGliding(92.7, 92.9, 92.9));
    assert.ok(!afcGliding(91.0, 92.9, 92.9)); // still far away
    assert.ok(!afcGliding(92.9, 92.9, 92.9)); // arrived
    assert.ok(!afcGliding(92.7, 93.1, 92.9)); // target is not a station
  });
});

describe('seek', () => {
  it('steps to the next and previous station from the dial position', () => {
    assert.equal(nextStation(S, 88.7).freq, 90.1);
    assert.equal(nextStation(S, 95).freq, 100.7);
    assert.equal(prevStation(S, 92.9).freq, 90.1);
    assert.equal(prevStation(S, 95).freq, 92.9);
  });
  it('skips a station the dial is already on', () => {
    assert.equal(nextStation(S, 90.08).freq, 92.9);
    assert.equal(prevStation(S, 90.12).freq, 88.7);
  });
  it('wraps at both ends', () => {
    assert.equal(nextStation(S, 107.5).freq, 88.7);
    assert.equal(prevStation(S, 88.7).freq, 107.5);
  });
});

describe('readouts', () => {
  it('fills the meter with strength and keeps it steady when locked', () => {
    assert.equal(meterBars(1, true, 1), 10);
    assert.equal(meterBars(0.5, false, 0), 5);
    assert.equal(meterBars(0.5, false, 1), 3);
    assert.equal(meterBars(0, false, 1), 0);
  });
  it('shows the key when locked, blanks with no signal, keeps spaces', () => {
    const rnd = () => 0.99;
    assert.equal(keyReadout('ELANCER', 0.2, true, rnd), 'ELANCER  ');
    assert.equal(keyReadout('ELANCER', 0, false, rnd), '         ');
    const weak = keyReadout('LAB NOTES', 0.5, false, rnd);
    assert.equal(weak.length, 9);
    assert.equal(weak[3], ' ');
    assert.notEqual(weak, 'LAB NOTES');
  });
  it('keeps the key with a steady random source (reduced motion)', () => {
    assert.equal(keyReadout('POEM II', 0.3, false, () => 0), 'POEM II  ');
  });
  it('formats segment cells', () => {
    assert.equal(freqCells(88.7), '!88.7');
    assert.equal(freqCells(100.66), '100.7');
    assert.equal(keyCells('POEM I'), 'POEM!I!!!');
    assert.equal(keyCells('GITHUB'), 'GITHU8!!!'); // DSEG14's 8 reads as a B
  });
  it('turns the knob once per 2 MHz', () => {
    assert.equal(knobAngle(88), 0);
    assert.equal(knobAngle(90), 360);
    close(knobAngle(88.7), 126);
  });
});

describe('paths', () => {
  it('normalizes station paths', () => {
    assert.equal(normalizePath('/'), '/');
    assert.equal(normalizePath('/index.html'), '/');
    assert.equal(normalizePath('/work/elancer'), '/work/elancer/');
    assert.equal(normalizePath('/work/elancer/'), '/work/elancer/');
    assert.equal(normalizePath('/work/elancer/index.html'), '/work/elancer/');
  });
});

describe('motion helpers', () => {
  it('wraps angle differences across ±π', () => {
    close(angleDelta(3, -3), 2 * Math.PI - 6);
    close(angleDelta(-3, 3), 6 - 2 * Math.PI);
    close(angleDelta(0.1, 0.3), 0.2);
  });
  it('springs the antenna back to rest', () => {
    let s = springStep({ a: 0, v: 0 }, 0.5);
    assert.ok(s.a < 0);
    for (let i = 0; i < 600; i++) s = springStep(s, 0);
    assert.ok(Math.abs(s.a) < 0.01 && Math.abs(s.v) < 0.01);
    assert.equal(antennaAngle(0), -13);
    assert.equal(antennaAngle(50), -4);
    assert.equal(antennaAngle(-50), -22);
  });
  it('uses the mock’s constants', () => {
    assert.equal(TUNING.lockWithin, 0.06);
    assert.equal(TUNING.afcWithin, 0.35);
    assert.equal(TUNING.afcRestMs, 420);
  });
});
