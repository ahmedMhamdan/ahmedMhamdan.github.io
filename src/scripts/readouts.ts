// Everything on the radio that reads the signal: the LCD (frequency, station key, TUNED and AFC
// lamps, 10-bar meter), the knob's rotation and slider value, the antenna's spring and tip, the
// stage head over the wall, and the LCD's text for screen readers. Also the speaker cone, which
// pulses with the music (FR-10). DOM is touched only on change.
import { BANDS, TUNING, type StationInfo } from '../lib/dial';
import {
  FRAME_MS,
  antennaAngle,
  freqCells,
  isLocked,
  keyCells,
  keyReadout,
  knobAngle,
  meterBars,
  nearest,
  springStep,
  type Spring,
} from '../lib/tuning';
import { ui } from '../lib/ui';
import { need, type RadioState } from './state';

const steady = () => 0;
const CONE_PULSE = 0.07; // the cone grows by up to 7% on a peak (mock)

export function createReadouts(radio: HTMLElement, program: HTMLElement, s: RadioState) {
  const digits = need(radio, '.digits .l');
  const alpha = need(radio, '.alpha .l');
  const tuned = need(radio, '[data-lamp="tuned"]');
  const afc = need(radio, '[data-lamp="afc"]');
  const bars = [...radio.querySelectorAll<HTMLElement>('.sigm i')];
  const lcdText = need(radio, '[data-lcd-text]');
  const knob = need(radio, '[data-knob]');
  const grip = need(knob, '.grip');
  const antenna = need(radio, '.antenna');
  const stagehead = need(program, '[data-stagehead]');
  const cone = need<SVGSVGElement>(radio, '[data-cone]');
  // The LCD docked at the top of a phone screen (dock.ts) shows the same cells.
  const dockFreq = document.querySelector('[data-dock-freq]');
  const dockKey = document.querySelector('[data-dock-key]');
  const dockLamp = document.querySelector('[data-dock-lamp]');

  let shownF = '';
  let angle = NaN;
  let lit = -1;
  let keyText = '';
  let keyAt = -Infinity;
  let locked: StationInfo | null | undefined;
  let valueText = '';
  let spring: Spring = { a: 0, v: 0 };
  let springTime = 0;
  let springDf = 0;
  let tilt = NaN;
  let coneScale = 1;

  const tunedText = (st: StationInfo) => `${st.freq.toFixed(1)} ${ui.mhz}, ${st.name}`;

  return function render(dt: number, now: number): boolean {
    const searching = !s.locked && !s.reduceMotion;

    const f = freqCells(s.f);
    if (f !== shownF) {
      digits.textContent = shownF = f;
      if (dockFreq) dockFreq.textContent = f;
    }

    const a = knobAngle(s.f);
    if (a !== angle) grip.style.transform = `rotate(${(angle = a).toFixed(2)}deg)`;

    // The slider reports where the user set it (the target), not every step of the glide.
    const near = nearest(s.stations, s.target);
    const vt = isLocked(Math.abs(near.freq - s.target)) ? tunedText(near) : `${s.target.toFixed(1)} ${ui.mhz}`;
    if (vt !== valueText) {
      valueText = vt;
      knob.setAttribute('aria-valuenow', s.target.toFixed(1));
      knob.setAttribute('aria-valuetext', vt);
    }

    tuned.classList.toggle('on', !!s.locked);
    dockLamp?.classList.toggle('on', !!s.locked);
    afc.classList.toggle('on', s.afc);

    const n = meterBars(s.strength, !!s.locked, s.reduceMotion ? 0 : Math.random());
    if (n !== lit) {
      lit = n;
      bars.forEach((el, i) => el.classList.toggle('on', i < n));
    }

    const lockChanged = s.locked !== locked;
    if (lockChanged) {
      locked = s.locked;
      antenna.classList.toggle('rx', !!locked);
      lcdText.textContent = locked
        ? `${ui.tunedTo} ${locked.freq.toFixed(1)} ${ui.mhz}: ${locked.name}`
        : ui.searchingText;
      if (locked) {
        const b = document.createElement('b');
        b.textContent = `${BANDS[locked.row].label} · ${locked.key}`;
        stagehead.replaceChildren(b, ` · ${locked.freq.toFixed(1)} ${ui.mhz}`);
      } else stagehead.textContent = ui.searching;
    }

    // Station key: re-rolled every 70 ms while searching, steady when locked or with reduced motion.
    if (lockChanged || now - keyAt >= TUNING.keyReadoutMs) {
      keyAt = now;
      const k = keyCells(keyReadout(s.near.key, s.strength, !!s.locked, s.reduceMotion ? steady : Math.random));
      if (k !== keyText) {
        alpha.textContent = keyText = k;
        if (dockKey) dockKey.textContent = k;
      }
    }

    // Antenna: a spring kicked by the dial's movement, stepped at 60 Hz whatever the screen rate.
    let swinging = false;
    if (s.reduceMotion) spring = { a: 0, v: 0 };
    else {
      springTime += dt;
      springDf += s.df;
      const steps = Math.floor(springTime / FRAME_MS);
      if (steps > 0) {
        springTime -= steps * FRAME_MS;
        for (let i = 0; i < steps; i++) spring = springStep(spring, springDf / steps);
        springDf = 0;
      }
      swinging = Math.abs(spring.a) > 0.01 || Math.abs(spring.v) > 0.01 || springDf !== 0;
      if (!swinging) spring = { a: 0, v: 0 };
    }
    const t = antennaAngle(spring.a);
    if (t !== tilt) antenna.style.transform = `rotate(${(tilt = t).toFixed(2)}deg)`;

    // Speaker cone: the music's level (0 when silent or with reduced motion; the audio keeps the frames coming).
    const c = 1 + s.audio.level * CONE_PULSE;
    if (c !== coneScale && (c === 1 || Math.abs(c - coneScale) > 0.001))
      cone.style.transform = (coneScale = c) === 1 ? '' : `scale(${c.toFixed(3)})`;

    return (searching && s.strength > 0) || swinging;
  };
}
