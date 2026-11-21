// The dial window and the keys around it: the needle, ticks and station marks on the SVG scale,
// the lit band row, the pressed preset key, the locked station mark, and the seek links.
// The scale stays the SVG rendered with the page (src/lib/scale.ts); the script only moves it.
import { BANDS, type StationInfo } from '../lib/dial';
import { MARK_LOCK, MARK_OFF, MARK_ON, TICK_OFF, TICK_ON, needlePaths, needleX } from '../lib/scale';
import { nextStation, prevStation } from '../lib/tuning';
import { ui } from '../lib/ui';
import { need, type RadioState } from './state';

export function createDial(radio: HTMLElement, s: RadioState) {
  const rows = [...radio.querySelectorAll<HTMLElement>('.row')];
  const keys = [...radio.querySelectorAll<HTMLElement>('.pk')];
  const ticks = [...radio.querySelectorAll<SVGPathElement>('[data-ticks]')];
  const byId = <T extends Element>(selector: string, attr: string) =>
    new Map([...radio.querySelectorAll<T>(selector)].map((el) => [el.getAttribute(attr), el]));
  const marks = byId<SVGRectElement>('[data-mark]', 'data-mark');
  const links = byId<HTMLAnchorElement>('[data-station]', 'data-station');
  const needle = need<SVGGElement>(radio, '[data-needle]');
  const [needleOut, needleIn] = [...needle.children];
  const needles = BANDS.map((_, i) => needlePaths(i));
  // The radio's seek links and the docked LCD's (phones).
  const seeks = (dir: string) => [...document.querySelectorAll<HTMLAnchorElement>(`a[data-seek="${dir}"]`)];
  const seekPrev = seeks('prev');
  const seekNext = seeks('next');

  let row = -1;
  let x = NaN;
  let locked: StationInfo | null | undefined;
  let current: StationInfo | undefined;

  return function render(): boolean {
    const rowChanged = s.row !== row;
    if (rowChanged) {
      row = s.row;
      rows.forEach((el, i) => el.classList.toggle('on', i === row));
      keys.forEach((el, i) => el.classList.toggle('on', i === row));
      ticks.forEach((el, i) => el.setAttribute('fill', i === row ? TICK_ON : TICK_OFF));
      needleOut.setAttribute('d', needles[row].outRow);
      needleIn.setAttribute('d', needles[row].inRow);
    }

    const nx = needleX(s.f);
    if (nx !== x) {
      x = nx;
      needle.setAttribute('transform', `translate(${nx} 0)`);
    }

    if (rowChanged || s.locked !== locked) {
      locked = s.locked;
      for (const st of s.stations) {
        const on = st === locked;
        marks.get(st.id)?.setAttribute('fill', on ? MARK_LOCK : st.row === row ? MARK_ON : MARK_OFF);
        links.get(st.id)?.classList.toggle('lock', on);
      }
    }

    // The page the address bar shows: current mark, and seek links relative to it (for middle-click and labels).
    if (s.current !== current) {
      current = s.current;
      links.forEach((el, id) => (id === current!.id ? el.setAttribute('aria-current', 'page') : el.removeAttribute('aria-current')));
      const prev = prevStation(s.stations, current.freq);
      const next = nextStation(s.stations, current.freq);
      for (const a of seekPrev) {
        a.href = prev.path;
        a.setAttribute('aria-label', `${ui.previousStation}: ${prev.name}`);
      }
      for (const a of seekNext) {
        a.href = next.path;
        a.setAttribute('aria-label', `${ui.nextStation}: ${next.name}`);
      }
    }
    return false;
  };
}
