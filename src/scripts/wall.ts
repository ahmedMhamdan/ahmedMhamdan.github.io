// The LED wall (FR-07): a dot matrix behind the program area that answers the signal.
// Each band has its own animation; a station with an image shows it as an LED billboard; noise and
// flickering neighbour columns fill the gaps between stations; the pointer and every lock send ripples;
// while music plays, its spectrum stands along the foot of the stage.
// Numbers: docs/design/direction.md, "LED wall".
// Drawing: the unlit dots are the CSS background of .program. The canvas has one pixel per LED; CSS scales
// it up 8× without smoothing and a CSS mask cuts each cell down to its 5×5 dot, so a frame is one
// putImageData of a few thousand pixels whatever is lit, and none at all when nothing changed.
// About 30 fps; stops while the wall is off screen or the tab is hidden (QR-04).
// Reduced motion: one still frame per station, no ripples (QR-03).
import { ui } from '../lib/ui';
import { need, type RadioState } from './state';

const P = 8; // dot pitch, CSS px (the dot shape itself is the CSS mask in Program.astro)
const STAGE_GAP = 8; // the stage stops this far above the panel (300 px row → 36 rows; phone strip → 15)
const FRAME_MS = 1000 / 30;
const MIN_GAP_MS = FRAME_MS - 4; // a little slack for rAF jitter: every 2nd frame at 60 Hz, every 4th at 120 Hz
const DECAY = 0.74; // per 30 fps frame
const DECAY_NAME = 0.35; // the ME name scroll keeps its letters crisp
const OFF = 0.05; // dimmer than this, a dot is unlit
const FAMILY = '"Barlow Semi Condensed", system-ui, sans-serif';
const STILL_T = [0, 3, 3, 3, 3]; // reduced motion: animation time of the still frame per band (ME starts at the name)
const MAX_RIPPLES = 12;
const RIPPLE_GROWTH = 0.045; // cells per ms
const SPECTRUM_BINS = 48; // the lowest analyser bins (up to about 8 kHz), spread across the width
const SPECTRUM_ROWS = 6;
const SPECTRUM_V = 0.35;

// Packed RGB as ImageData stores it (little-endian ABGR, as in every browser): --lit and --amber.
const RED = 0x1f3bff;
const AMBER = 0x00b0ff;

/** "HELLO" in Morse at 3 cells per dit, with the gaps between marks, letters and repeats. */
const MORSE = (() => {
  const code: Record<string, string> = { H: '....', E: '.', L: '.-..', O: '---' };
  const q: number[] = [];
  for (const ch of 'HELLO') {
    for (const m of code[ch]) q.push(...Array<number>(m === '.' ? 1 : 3).fill(1), 0);
    q.push(0, 0);
  }
  return q.concat(Array<number>(18).fill(0));
})();

interface Mask {
  w: number;
  h: number;
  m: Uint8Array;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
  s: number;
  max: number;
}

interface Billboard {
  img: HTMLImageElement;
  ok: boolean | null;
  size: string;
  v: Float32Array | null;
}

export function createWall(program: HTMLElement, s: RadioState, wake: () => void) {
  const box = need(program, '.wall'); // the area the wall may light (CSS decides it)
  const canvas = need<HTMLCanvasElement>(box, 'canvas');
  const stagehead = need(program, '.stagehead');
  const panel = need(program, '.panel');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => false;

  // Grid, in cells: W × H, of which the top STG rows are the stage above the panel.
  let W = 0;
  let H = 0;
  let STG = 0;
  let N = 0;
  let red = new Float32Array(0);
  let amber = new Float32Array(0);
  let image: ImageData | null = null;
  let pixels = new Uint32Array(0); // the canvas's pixels: one per cell

  let pending: { w: number; h: number; stage: number } | null = null;
  let visible = true;
  let t = 0; // animation clock, seconds
  let drawnAt = -Infinity;
  let locked: RadioState['locked'] | undefined;
  let revealAt = -1; // billboard reveal start, ms
  let motion = !s.reduceMotion;
  let stillKey = '';
  let dirty = true; // something async arrived (font, image, size): redraw the still frame
  let rnd: () => number = Math.random;
  const ripples: Ripple[] = [];
  let lastRipple = 0;

  // ---- size: measured when it changes, applied at the next frame (never read layout mid-frame) ----
  // Pixel ratio does not matter: the canvas has one pixel per cell and CSS scales it.
  // The stage is the wall above the panel: below the stage head on a desktop, the strip above the
  // panel's top edge on a phone (where there is no stage head).
  const measure = () => {
    pending = { w: box.clientWidth, h: box.clientHeight, stage: panel.offsetTop };
    wake();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(box);
  resize.observe(stagehead);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  }).observe(box);

  function applySize({ w, h, stage }: NonNullable<typeof pending>) {
    const nw = Math.floor(w / P);
    const nh = Math.floor(h / P);
    STG = Math.max(4, Math.min(nh, Math.floor((stage - STAGE_GAP) / P)));
    dirty = true;
    if (nw === W && nh === H) return;
    W = nw;
    H = nh;
    N = W * H;
    // Whole cells only, so every canvas pixel lands on one dot of the background grid.
    canvas.width = Math.max(1, W);
    canvas.height = Math.max(1, H);
    canvas.style.width = `${W * P}px`;
    canvas.style.height = `${H * P}px`;
    red = new Float32Array(N);
    amber = new Float32Array(N);
    image = N ? ctx!.createImageData(W, H) : null;
    pixels = image ? new Uint32Array(image.data.buffer) : new Uint32Array(0);
  }

  // ---- the two intensity buffers: writes keep the brighter value ----
  function put(B: Float32Array, x: number, y: number, v: number) {
    if (v <= 0 || x < -0.5 || y < -0.5 || x >= W - 0.5 || y >= H - 0.5) return;
    const i = ((y + 0.5) | 0) * W + ((x + 0.5) | 0);
    if (v > B[i]) B[i] = v;
  }

  // ---- ME: the name, as a bitmap one LED per pixel, at stage height ----
  let fontReady = !document.fonts;
  let name: (Mask & { stage: number }) | null = null;
  document.fonts
    ?.load(`800 32px ${FAMILY}`)
    .catch(() => undefined)
    .then(() => {
      fontReady = true;
      dirty = true;
      wake();
    });

  function nameMask() {
    if (!fontReady) return null;
    if (!name || name.stage !== STG) name = { ...textMask(`${ui.siteName.toUpperCase()}  ·  `, Math.max(10, STG - 8)), stage: STG };
    return name;
  }

  // ---- the band animations: (time in s, weight 0..1) ----
  const bands: ((t: number, w: number) => void)[] = [
    // ME: the name scrolls 14 cells/s.
    (t, w) => {
      const b = nameMask();
      if (!b) return;
      const off = Math.floor(t * 14);
      const y0 = Math.max(0, Math.floor((STG - b.h) / 2) + 1);
      for (let x = 0; x < W; x++) {
        const cx = (x + off) % b.w;
        for (let y = 0; y < b.h; y++) if (b.m[y * b.w + cx]) put(red, x, y0 + y, w);
      }
    },
    // WORK: bar columns every 2 cells scroll 6 cells/s; an amber cursor sweeps right to left at 40 cells/s.
    (t, w) => {
      const off = Math.floor(t * 6);
      for (let x = 0; x < W; x += 2) {
        const k = x / 2 + off;
        const h = 3 + Math.floor((Math.sin(k * 1.7) * 0.5 + 0.5) * (Math.sin(k * 0.27) * 0.5 + 0.5) * (STG - 5));
        for (let y = 0; y < h; y++) put(red, x, STG - 1 - y, w * (y === h - 1 ? 1 : 0.55));
      }
      const cx = W - 1 - (Math.floor(t * 40) % W);
      for (let y = 0; y < STG; y++) put(amber, cx, y, w * 0.6);
    },
    // SECURITY: packets run right to left in lanes; every sixth is malicious and bursts on the amber firewall.
    (t, w) => {
      const fw = Math.floor(W * 0.26);
      for (let y = 0; y < H; y += 2) put(amber, fw, y, w * 0.7);
      const loop = W + 50;
      for (let lane = 0; lane < Math.floor(STG / 3); lane++) {
        const y = 1 + lane * 3;
        const speed = 22 + (lane % 5) * 7;
        for (let p = 0; p < 3; p++) {
          const raw = t * speed + p * 71 + lane * 43;
          const x = W - 1 - (raw % loop);
          if ((p + lane * 2 + Math.floor(raw / loop)) % 6 !== 0) {
            put(red, x, y, w);
            put(red, x + 1, y, w);
            put(red, x + 2, y, w * 0.5);
          } else if (x > fw + 1) {
            put(amber, x, y, w);
            put(amber, x + 1, y, w);
            put(amber, x + 2, y, w);
          } else {
            const k = (fw + 1 - x) / 4;
            if (k < 4)
              for (let j = 0; j < 8; j++) {
                const a = (j / 8) * Math.PI * 2;
                put(amber, fw + 1 + Math.cos(a) * k * 1.6, y + Math.sin(a) * k, w * (1 - k / 4));
              }
          }
        }
      }
    },
    // POETRY: layered sine waves; two faint ones lower on the wall.
    (t, w) => {
      const mid = STG * 0.5;
      for (let x = 0; x < W; x++) {
        put(red, x, mid + Math.sin(x * 0.07 + t) * Math.sin(x * 0.019 - t * 0.32) * STG * 0.38, w);
        put(amber, x, mid + Math.sin(x * 0.041 - t * 0.6) * STG * 0.2, w * 0.4);
        put(red, x, H * 0.62 + Math.sin(x * 0.05 + t * 0.5) * H * 0.08, w * 0.22);
        put(red, x, H * 0.8 + Math.sin(x * 0.033 - t * 0.42) * H * 0.06, w * 0.16);
      }
    },
    // CONTACT: Morse "HELLO" scrolls 9 cells/s across the stage; two amber pings spread from the left edge.
    (t, w) => {
      const off = Math.floor(t * 9);
      const my = Math.floor(STG / 2);
      for (let x = 0; x < W; x++)
        if (MORSE[(Math.floor(x / 3) + off) % MORSE.length]) for (let y = my - 1; y <= my + 1; y++) put(red, x, y, w);
      const reach = W * 1.3;
      for (let k = 0; k < 2; k++) {
        const r = ((t + k * 1.1) * 34) % reach;
        const v = w * (1 - r / reach) * 0.7;
        for (let a = -1.4; a <= 1.4; a += 0.02) put(amber, r * Math.cos(a), H * 0.45 + r * Math.sin(a) * 0.8, v);
      }
    },
  ];

  // ---- billboards: the station's image as an LED halftone, computed once per image and wall size ----
  const billboards = new Map<string, Billboard>();
  function billboard(src: string): Float32Array | null {
    let b = billboards.get(src);
    if (!b) {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      const entry: Billboard = { img, ok: null, size: '', v: null };
      const done = (ok: boolean) => {
        entry.ok = ok;
        // Sample the image now, in its own task, so no animation frame pays for it (only a resize does).
        if (ok && N) {
          entry.v = halftone(img, W, STG);
          entry.size = `${W}x${STG}`;
        }
        dirty = true;
        wake();
      };
      img.decode().then(() => done(true), () => done(false));
      billboards.set(src, (b = entry));
    }
    if (!b.ok) return null;
    const size = `${W}x${STG}`;
    if (b.size !== size) {
      b.v = halftone(b.img, W, STG);
      b.size = size;
    }
    return b.v;
  }

  function drawBillboard(v: Float32Array, w: number, now: number, full: boolean) {
    if (revealAt < 0) revealAt = now;
    const rows = full ? STG : Math.min(STG, ((now - revealAt) / 1000) * 34);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < W; x++) {
        const b = v[y * W + x];
        if (b > 0.12) put(red, x, y, b * w);
      }
    if (rows < STG) for (let x = 0; x < W; x++) put(amber, x, Math.floor(rows), w * 0.9);
  }

  // ---- between stations: random specks, and flickering columns where the neighbours sit (±2 MHz) ----
  function noise(n: number) {
    if (n <= 0.02) return;
    for (let i = 0; i < 180 * n; i++) put(red, rnd() * W, rnd() * STG, 0.2 + rnd() * 0.5 * n);
    for (const st of s.stations) {
      const x = ((st.freq - s.f + 2) / 4) * W;
      if (x >= 0 && x < W) for (let y = 0; y < STG; y++) if (rnd() < 0.5) put(red, x, y, 0.7 * n);
    }
  }

  // ---- ripples: amber rings from the pointer and from the left edge on every lock ----
  function ripple(x: number, y: number, t0: number, strength: number, max: number) {
    ripples.push({ x, y, t0, s: strength, max });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  }
  function drawRipples(now: number) {
    let n = 0;
    for (const r of ripples) {
      const R = Math.max(0, now - r.t0) * RIPPLE_GROWTH;
      if (R > r.max) continue;
      const a = r.s * (1 - R / r.max);
      const step = 1.2 / Math.max(4, R);
      for (let q = 0; q < Math.PI * 2; q += step) put(amber, r.x + Math.cos(q) * R, r.y + Math.sin(q) * R, a);
      ripples[n++] = r;
    }
    ripples.length = n;
  }
  const fromPointer = (e: PointerEvent, strength: number, max: number) => {
    if (s.reduceMotion || !W || !visible) return;
    const r = box.getBoundingClientRect();
    ripple((e.clientX - r.left) / P, (e.clientY - r.top) / P, performance.now(), strength, max);
    wake();
  };
  program.addEventListener(
    'pointermove',
    (e) => {
      if (e.timeStamp - lastRipple < 140) return;
      lastRipple = e.timeStamp;
      fromPointer(e, 0.45, 9);
    },
    { passive: true },
  );
  // A press on empty wall (not a control, not the panel) sends a big ring.
  program.addEventListener('pointerdown', (e) => {
    if (!(e.target as Element | null)?.closest?.('a, button, input, [tabindex], .panel')) fromPointer(e, 1, 40);
  });

  // ---- the music: amber bars up to 6 cells tall standing on the stage's last row ----
  function spectrum() {
    const bins = s.audio.bins;
    if (bins.length < SPECTRUM_BINS) return;
    for (let x = 0; x < W; x++) {
      const h = Math.round((bins[Math.floor((x / W) * SPECTRUM_BINS)] / 255) * SPECTRUM_ROWS);
      for (let y = 0; y < h; y++) put(amber, x, STG - 1 - y, SPECTRUM_V);
    }
  }

  // ---- one picture of the signal into the buffers ----
  function compose(time: number, now: number, still: boolean) {
    const st = s.near;
    const weight = s.locked ? 1 : s.strength * 0.6;
    // The image starts loading as the dial approaches; until it is ready the band animation stands in.
    const bb = st.billboard && s.strength > 0 ? billboard(st.billboard) : null;
    if (s.locked && bb) drawBillboard(bb, weight, now, still);
    else bands[st.row](time, weight);
    noise(s.locked ? 0 : 1 - weight);
    if (still) return;
    drawRipples(now);
    if (s.audio.playing) spectrum();
  }

  // ---- buffers to canvas: amber over red, alpha = brightness; uploaded only when a pixel changed ----
  function paint() {
    if (!image) return;
    let changed = false;
    for (let i = 0; i < N; i++) {
      const a = amber[i];
      const r = red[i];
      const px = a > OFF ? (alpha(a) | AMBER) >>> 0 : r > OFF ? (alpha(r) | RED) >>> 0 : 0;
      if (px !== pixels[i]) {
        pixels[i] = px;
        changed = true;
      }
    }
    if (changed) ctx!.putImageData(image, 0, 0);
  }

  return function render(_dt: number, now: number): boolean {
    if (pending) {
      applySize(pending);
      pending = null;
    }
    if (!N) return false;

    if (motion !== !s.reduceMotion) {
      motion = !s.reduceMotion;
      ripples.length = 0;
      dirty = true;
    }
    if (s.locked !== locked) {
      locked = s.locked;
      revealAt = -1;
      // The signal arrives from the radio's side of the wall (the right side in a right-to-left page).
      if (locked && motion && visible) ripple(document.dir === 'rtl' ? W - 1 : 0, H * 0.45, now, 0.9, W * 0.9);
    }
    if (!visible) return false;

    if (!motion) {
      // One still frame for this station (or this spot on the dial), redrawn only when it changes.
      const key = `${s.near.id}|${s.locked ? 'locked' : s.f.toFixed(2)}`;
      if (key === stillKey && !dirty) return false;
      stillKey = key;
      dirty = false;
      red.fill(0);
      amber.fill(0);
      rnd = seeded(7);
      compose(STILL_T[s.near.row], now, true);
      rnd = Math.random;
      paint();
      return false;
    }
    stillKey = '';

    // About 30 fps; the loop keeps running for the other modules in between.
    if (now - drawnAt < MIN_GAP_MS) return true;
    const step = Math.min(100, now - drawnAt);
    drawnAt = now;
    t += step / 1000;

    const d = Math.pow(s.near.row === 0 && !s.near.billboard ? DECAY_NAME : DECAY, step / FRAME_MS);
    for (let i = 0; i < N; i++) {
      const r = red[i] * d;
      const a = amber[i] * d;
      red[i] = r < 0.01 ? 0 : r;
      amber[i] = a < 0.01 ? 0 : a;
    }
    compose(t, now, false);
    paint();
    return true;
  };
}

/** Brightness as the alpha byte of a packed pixel. */
const alpha = (v: number) => (v >= 1 ? 255 : (v * 255 + 0.5) | 0) << 24;

/** Text as a 1-bit mask, one LED per pixel. */
function textMask(text: string, px: number): Mask {
  const c = document.createElement('canvas');
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return { w: 1, h: 1, m: new Uint8Array(1) };
  const style = () => {
    x.font = `800 ${px}px ${FAMILY}`;
    x.letterSpacing = `${Math.round(px * 0.08)}px`;
    x.textBaseline = 'top';
  };
  style();
  const w = Math.ceil(x.measureText(text).width) + 4;
  const h = Math.ceil(px * 1.05);
  c.width = w;
  c.height = h;
  style(); // resizing a canvas resets its state
  x.fillStyle = '#fff';
  x.fillText(text, 0, Math.round(px * 0.02));
  const d = x.getImageData(0, 0, w, h).data;
  const m = new Uint8Array(w * h);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 130 ? 1 : 0;
  return { w, h, m };
}

/** An image as LED brightness (luminance^1.4) at W × S cells, cropped to cover, a little above centre. */
function halftone(img: HTMLImageElement, W: number, S: number): Float32Array {
  const v = new Float32Array(W * S);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = S;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x || !img.naturalWidth) return v;
  const r = Math.max(W / img.naturalWidth, S / img.naturalHeight);
  const w = img.naturalWidth * r;
  const h = img.naturalHeight * r;
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, (W - w) / 2, (S - h) / 2.6, w, h);
  const d = x.getImageData(0, 0, W, S).data;
  for (let i = 0; i < v.length; i++) v[i] = Math.pow((d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255, 1.4);
  return v;
}

/** Small deterministic random source, so a still frame looks the same every time it is drawn. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}
