// Turning a round knob by hand: pointer capture, and the angle the pointer moved around the knob's
// centre since the last event. Used by the tuning knob (tuner.ts) and the volume knob (player.ts).
import { angleDelta } from '../lib/tuning';

export interface Turn {
  start?(): void;
  /** Radians since the last call, clockwise positive. */
  turn(rad: number): void;
  end?(): void;
}

export function rotary(el: HTMLElement, on: Turn) {
  let drag: { cx: number; cy: number; a: number } | null = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    drag = { cx, cy, a: Math.atan2(e.clientY - cy, e.clientX - cx) };
    on.start?.();
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
    const d = angleDelta(drag.a, a);
    drag.a = a;
    on.turn(d);
  });
  const release = () => {
    if (!drag) return;
    drag = null;
    on.end?.();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('lostpointercapture', release);
}
