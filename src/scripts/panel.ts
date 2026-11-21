// The content panel (FR-06) and the page around it (FR-05).
// On lock: the station's panel swaps in from its <template>, slides in, its [data-decode] text
// resolves out of random characters and its images resolve from big pixels. Between stations:
// static over the panel, then the idle panel. When the dial settles: URL, title and announcement.
// Reduced motion: the panel swaps at once, with no slide, decode, pixel resolve or moving static.
import type { StationInfo } from '../lib/dial';
import { normalizePath } from '../lib/tuning';
import { ui } from '../lib/ui';
import { need, type RadioState } from './state';

const IDLE = 'idle';
const DECODE_MS = 600;
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const RESOLVE_STEPS = [40, 26, 16, 10, 6, 3]; // block sizes in px, 95 ms apart
const RESOLVE_MS = 95;

interface Decode {
  el: Element;
  text: string;
  t0: number;
}

export function createPanel(program: HTMLElement, s: RadioState) {
  const view = need(program, '.view');
  const canvas = need<HTMLCanvasElement>(program, 'canvas.static');
  const status = need(document, '[data-tuner-status]');
  const hint = need(program, '[data-hint]');

  // The keyboard shortcuts and dragging the dial work now, so the footer can mention them
  // (global.css shows the words for the input at hand).
  const variant = (className: string, words: { strong: string; rest: string }) => {
    const span = document.createElement('span');
    const strong = document.createElement('b');
    span.className = className;
    strong.textContent = words.strong;
    span.append(strong, words.rest);
    return span;
  };
  hint.replaceChildren(variant('for-keys', ui.hintLive), variant('for-touch', ui.hintTouch));

  const templates = new Map<string, HTMLTemplateElement>();
  for (const t of program.querySelectorAll<HTMLTemplateElement>('template[data-panel]')) templates.set(t.dataset.panel!, t);
  // The panel the page arrived with becomes a template too, before anything decodes it.
  const first = document.createElement('template');
  first.content.append(...[...view.childNodes].map((n) => n.cloneNode(true)));
  templates.set(s.current.id, first);

  let shown = s.current.id;
  let current: StationInfo = s.current;
  let decodes: Decode[] = [];
  let opacity = 0;
  const ctx = canvas.getContext('2d');
  const noise = ctx?.createImageData(canvas.width, canvas.height);
  // Known from scroll events, so a swap never has to read layout mid-frame.
  let scrolled = false;
  view.addEventListener('scroll', () => (scrolled = view.scrollTop > 0), { passive: true });

  function show(id: string, now: number, animate: boolean) {
    const t = templates.get(id);
    if (!t) return;
    shown = id;
    const hadFocus = view.contains(document.activeElement) && document.activeElement !== view;
    if (scrolled) view.scrollTop = 0;
    scrolled = false;
    view.replaceChildren(t.content.cloneNode(true));
    // Focus was on something that just left (a panel button): keep it in the panel.
    if (hadFocus) view.focus({ preventScroll: true });
    view.classList.toggle('in', animate);
    decodes = [];
    if (!animate) return view.removeAttribute('aria-busy');
    view.querySelectorAll<HTMLImageElement>('.pic img').forEach(resolve);
    decodes = [...view.querySelectorAll('[data-decode]')].map((el) => ({ el, text: el.textContent ?? '', t0: now }));
    if (decodes.length) view.setAttribute('aria-busy', 'true');
  }

  function decode(now: number) {
    decodes = decodes.filter((d) => {
      const k = Math.min(1, (now - d.t0) / DECODE_MS);
      const n = Math.floor(d.text.length * k);
      d.el.textContent = d.text.slice(0, n) + d.text.slice(n).replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      return k < 1;
    });
    if (!decodes.length) view.removeAttribute('aria-busy');
  }

  // Static is a window into a pool of random reddish specks, two screens long. Each frame shows the
  // pool from a random offset and renews a slice of it: random enough to the eye, and a copy instead
  // of 50,000 Math.random() calls a frame.
  const pixels = canvas.width * canvas.height;
  const out = noise && new Uint32Array(noise.data.buffer);
  let pool: Uint32Array | undefined;
  let renew = 0;

  function drawStatic() {
    if (!ctx || !noise || !out) return;
    if (!pool) {
      pool = new Uint32Array(pixels * 2);
      for (let i = 0; i < pool.length; i++) pool[i] = speck();
    }
    for (let i = 0; i < pixels / 8; i++) {
      pool[renew] = speck();
      renew = (renew + 1) % pool.length;
    }
    const at = (Math.random() * pixels) | 0;
    out.set(pool.subarray(at, at + pixels));
    ctx.putImageData(noise, 0, 0);
  }

  return function render(_dt: number, now: number): boolean {
    const animate = !s.reduceMotion;
    if (s.locked) {
      if (shown !== s.locked.id) show(s.locked.id, now, animate);
    } else if (s.strength < 0.15 && shown !== IDLE) show(IDLE, now, false);
    if (decodes.length) decode(now);

    // Static: reddish noise, stronger the weaker the signal; still with reduced motion.
    const op = s.locked ? 0 : Math.min(0.9, (1 - s.strength) * 0.95);
    const changed = op !== opacity;
    if (changed) canvas.style.opacity = (opacity = op).toFixed(2);
    if (op > 0.02 && (animate || changed)) drawStatic();

    if (s.current !== current) {
      current = s.current;
      if (normalizePath(location.pathname) !== current.path) history.pushState({ station: current.id }, '', current.path);
      document.title = current.title;
      status.textContent = `${ui.tunedTo} ${current.name}`;
    }

    return decodes.length > 0 || (animate && op > 0.02);
  };
}

/** One static pixel as packed RGBA (little-endian, as in every browser): reddish, opaque half the time. */
function speck(): number {
  if (Math.random() < 0.5) return 0;
  const v = Math.random() * 255;
  return (255 << 24) | ((v * 0.35) << 16) | ((v * 0.45) << 8) | v;
}

/** Pixel resolve: the new image appears in big blocks that sharpen to the real picture. */
function resolve(img: HTMLImageElement) {
  const frame = img.parentElement;
  if (!frame) return;
  const c = document.createElement('canvas');
  c.className = 'res';
  c.setAttribute('aria-hidden', 'true');
  frame.append(c);
  const go = () => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    const x = c.getContext('2d');
    const small = document.createElement('canvas');
    const sx = small.getContext('2d');
    if (!x || !sx || !w || !h) return c.remove();
    c.width = w;
    c.height = h;
    x.imageSmoothingEnabled = false;
    let i = 0;
    const step = () => {
      const b = RESOLVE_STEPS[i];
      small.width = Math.max(1, Math.ceil(w / b));
      small.height = Math.max(1, Math.ceil(h / b));
      cover(sx, img, small.width, small.height);
      x.clearRect(0, 0, w, h);
      x.drawImage(small, 0, 0, w, h);
      setTimeout(++i < RESOLVE_STEPS.length ? step : () => c.remove(), RESOLVE_MS);
    };
    step();
  };
  // Measure on the next frame, once the browser has laid the new panel out anyway.
  if (img.complete && img.naturalWidth) requestAnimationFrame(go);
  else {
    img.addEventListener('load', go, { once: true });
    img.addEventListener('error', () => c.remove(), { once: true });
  }
}

/** Draw an image to fill w×h, cropped like object-fit: cover. */
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * r;
  const ih = img.naturalHeight * r;
  ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}
