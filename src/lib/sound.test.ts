// Unit tests for the sound and player math. Run: npm test (Node runs TypeScript directly).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SOUND, clamp01, marqueeCells, movingFrom, soundTargets, timeCells, volumeAngle } from './sound.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const at = (over: Partial<Parameters<typeof soundTargets>[0]>) =>
  soundTargets({ strength: 1, dist: 0, locked: true, moving: 0, fx: true, ...over });

describe('soundTargets', () => {
  it('is clean and silent when locked and still', () => {
    const t = at({});
    assert.equal(t.noise, 0);
    assert.equal(t.whistle, 0);
    assert.equal(t.highpass, 20);
    assert.equal(t.lowpass, 18500);
    assert.equal(t.music, 1);
  });

  it('hisses on a locked station while the dial still moves', () => {
    close(at({ moving: 1 }).noise, 0.05);
    assert.equal(at({ moving: 0.04 }).noise, 0);
  });

  it('muffles the music and adds static and a whistle between stations', () => {
    const t = at({ strength: 0.5, dist: 0.2, locked: false });
    close(t.noise, 0.045);
    close(t.whistleHz, 220 + 0.2 * 5200);
    close(t.whistle, 0.5 * 0.018);
    const c = 0.4;
    close(t.highpass, 20 + (1 - c) * 650);
    close(t.lowpass, 1500 + c * c * 17000);
    close(t.music, 0.3 + 0.7 * c);
  });

  it('keeps the whistle out of the lock window and past the signal span', () => {
    assert.equal(at({ dist: 0.01, strength: 0.975 }).whistle, 0);
    assert.equal(at({ dist: 0.4, strength: 0, locked: false }).whistle, 0);
  });

  it('plays the music clean and the dial silent with DIAL FX off', () => {
    const t = at({ strength: 0, dist: 0.5, locked: false, moving: 1, fx: false });
    assert.equal(t.noise, 0);
    assert.equal(t.whistle, 0);
    assert.equal(t.lowpass, 18500);
    assert.equal(t.music, 1);
  });

  it('maps dial speed to 0..1', () => {
    assert.equal(movingFrom(0), 0);
    close(movingFrom(0.0125), 0.5);
    assert.equal(movingFrom(1), 1);
  });
});

describe('volume', () => {
  it('turns the knob from −135° to +135°', () => {
    assert.equal(volumeAngle(0), -135);
    close(volumeAngle(SOUND.volume), 81);
    assert.equal(volumeAngle(1), 135);
    assert.equal(volumeAngle(2), 135);
    assert.equal(clamp01(-1), 0);
  });
});

describe('marqueeCells', () => {
  const title = "you got a lot to finish. let's lock in.";
  it('starts with three blank cells, as in the mock', () => {
    assert.equal(marqueeCells(title, 0), '!!!YOU!GOT!A');
  });
  it('gives the decimal point no cell of its own and drops other punctuation', () => {
    assert.equal(marqueeCells(title, 20), 'FINISH.!LETS!');
    assert.equal(marqueeCells(title, 20).replace(/\./g, '').length, 12);
  });
  it('wraps around, also for short titles', () => {
    assert.equal(marqueeCells('ab', 0), '!!!A8!!!!!!A');
    assert.equal(marqueeCells('ab', 3), 'A8!!!!!!A8!!');
    assert.equal(marqueeCells('ab', 8), marqueeCells('ab', 0));
    assert.equal(marqueeCells('', 3), '!!!!!!!!!!!!');
  });
});

describe('timeCells', () => {
  it('shows mm:ss with a blank leading cell', () => {
    assert.equal(timeCells(0), '!0:00');
    assert.equal(timeCells(65.9), '!1:05');
    assert.equal(timeCells(3960), '66:00');
    assert.equal(timeCells(Number.NaN), '!0:00');
  });
});
