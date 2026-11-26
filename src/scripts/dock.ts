// Phones (plan Phase 5; docs/design/reference/phone-mock.html): the page scrolls, with the head unit at
// the top and the panel below it. Three things keep the radio at hand while reading:
// - Once half the dial has scrolled under the top edge, its LCD docks at the top with the seek buttons
//   (readouts.ts keeps its cells in step with the radio's); a press on it goes back up to the dial.
// - A seek from the dock brings the new station's panel into view under it (the page's scroll-padding,
//   RadioLayout.astro, keeps it clear of the dock).
// - Between stations the panel keeps its height, so the page never shrinks under a finger on the dial.
// Layout is read only by observers and event handlers, never in a frame.
import { need, type RadioState } from './state';

const SIDE = '(orientation: landscape) and (max-height: 520px) and (pointer: coarse)';
/** The phone layouts: the same media queries as Radio.astro, Program.astro and Player.astro. */
const PHONE = `(max-width: 699px), ${SIDE}`;
/** A short window with a mouse in the phone layout (a zoomed desktop): no dock (Player.astro, RadioLayout.astro). */
const SHORT = '(max-width: 699px) and (max-height: 399px) and (pointer: fine)';
const DOCK_H = 56; // 44px LCD and buttons + 6px above and below (Radio.astro)

export function createDock(radio: HTMLElement, program: HTMLElement, s: RadioState) {
  const panel = need(program, '.panel');
  const dialwin = need(radio, '.dialwin');
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  const phone = matchMedia(PHONE);
  const side = matchMedia(SIDE);
  const short = matchMedia(SHORT);

  // ---- the dock: shown on an upright phone once the dial is half out of sight ----
  let dialAway = false;
  const showDock = () => {
    if (!dock) return;
    const upright = phone.matches && !side.matches && !short.matches;
    dock.hidden = !upright;
    dock.classList.toggle('on', upright && dialAway);
  };
  new IntersectionObserver(
    ([e]) => {
      dialAway = e.intersectionRatio < 0.5 && e.boundingClientRect.top < DOCK_H;
      showDock();
    },
    { rootMargin: `-${DOCK_H}px 0px 0px 0px`, threshold: [0, 0.5, 1] },
  ).observe(dialwin);
  phone.addEventListener('change', showDock);
  side.addEventListener('change', showDock);
  short.addEventListener('change', showDock);
  showDock();

  let follow = false;
  dock?.addEventListener('click', (e) => {
    const t = e.target as Element;
    // A seek from the dock: the tuner handles the link; the new panel comes into view once it settles.
    if (t.closest('a[data-seek]')) follow = true;
    if (!t.closest('[data-dock-top]')) return;
    scrollTo({ top: 0, behavior: s.reduceMotion ? 'auto' : 'smooth' });
    // The dock hides as the dial comes back: focus moves to the station on the dial.
    radio.querySelector<HTMLElement>('.stn[aria-current="page"]')?.focus({ preventScroll: true });
  });

  // ---- the panel holds its height between stations (phones only: on a desktop it is a fixed row) ----
  let height = 0;
  new ResizeObserver(([e]) => (height = e.borderBoxSize?.[0]?.blockSize ?? panel.offsetHeight)).observe(panel);
  let holding = false;
  let current = s.current;

  return function render(): boolean {
    const settled = !!s.locked && !s.dragging && s.f === s.target;
    if (!settled && !holding && phone.matches && height) {
      panel.style.minHeight = `${height}px`;
      holding = true;
    } else if (settled && holding) {
      panel.style.minHeight = '';
      holding = false;
    }

    if (s.current !== current) {
      current = s.current;
      if (follow) {
        follow = false;
        // After this frame: scrolling into view has to measure the page.
        setTimeout(() => panel.scrollIntoView({ block: 'start', behavior: s.reduceMotion ? 'auto' : 'smooth' }));
      }
    }
    return false;
  };
}
