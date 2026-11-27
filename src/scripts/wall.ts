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
import { rgbOf } from '../lib/sound';
import { ui } from '../lib/ui';
import { dotText, type DotText } from './ledfont';
import { need, type RadioState } from './state';

const P = 8; // dot pitch, CSS px (the dot shape itself is the CSS mask in Program.astro)
const STAGE_GAP = 8; // the stage stops this far above the panel (300 px row → 36 rows; phone strip → 15)
const FRAME_MS = 1000 / 30;
const MIN_GAP_MS = FRAME_MS - 4; // a little slack for rAF jitter: every 2nd frame at 60 Hz, every 4th at 120 Hz
const DECAY = 0.74; // per 30 fps frame
const OFF = 0.05; // dimmer than this, a dot is unlit
const NAME_SPEED = 15; // cells per second: one cell every second frame
const STILL_T = [0, 3, 3, 3, 3]; // reduced motion: animation time of the still frame per band (ME starts at the name)
const MAX_RIPPLES = 12;
const RIPPLE_GROWTH = 0.045; // cells per ms
const SPECTRUM_BINS = 48; // the lowest analyser bins (up to about 8 kHz), spread across the width
const SPECTRUM_V = 0.4;

// Packed RGB as ImageData stores it (little-endian ABGR, as in every browser): --amber. The LED colour
// (--lit) comes from the state: the playing song's, gliding over GLIDE_MS like the CSS colours.
const AMBER = 0x00b0ff;
const GLIDE_MS = 1200;

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

  // Grid, in cells: W × H, of which the top STG rows are the stage above the panel. The stage head (when
  // shown) covers the rows above TOP; the music's bars stand in the last SPEC rows of the stage.
  let W = 0;
  let H = 0;
  let STG = 0;
  let TOP = 1;
  let SPEC = 2;
  let N = 0;
  let red = new Float32Array(0);
  let amber = new Float32Array(0);
  let image: ImageData | null = null;
  let pixels = new Uint32Array(0); // the canvas's pixels: one per cell

  let pending: { w: number; h: number; stage: number; head: number } | null = null;
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
  let litHex = s.lit;
  let lit = rgbOf(litHex);
  let litFrom = lit;
  let litTo = lit;
  let glideAt = -1;
  let LIT = packed(lit);

  // ---- size: measured when it changes, applied at the next frame (never read layout mid-frame) ----
  // Pixel ratio does not matter: the canvas has one pixel per cell and CSS scales it.
  // The stage is the wall above the panel: below the stage head on a desktop, the strip above the
  // panel's top edge on a phone (where there is no stage head).
  const measure = () => {
    // The stage head's words, when shown: the wall's own words start below them.
    const words = stagehead.firstElementChild;
    const head =
      words && getComputedStyle(stagehead).visibility === 'visible' && stagehead.offsetHeight
        ? words.getBoundingClientRect().bottom - box.getBoundingClientRect().top
        : 0;
    pending = { w: box.clientWidth, h: box.clientHeight, stage: panel.offsetTop, head };
    wake();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(box);
  resize.observe(stagehead);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  }).observe(box);

  function applySize({ w, h, stage, head }: NonNullable<typeof pending>) {
    const nw = Math.floor(w / P);
    const nh = Math.floor(h / P);
    STG = Math.max(4, Math.min(nh, Math.floor((stage - STAGE_GAP) / P)));
    TOP = head > 0 ? Math.ceil(head / P) + 1 : 1;
    SPEC = STG >= 30 ? 4 : STG >= 18 ? 3 : 2;
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

  // ---- ME: the station's words (or the name) in the 5×7 LED font, as big as the stage allows ----
  // Each font dot is k × k LEDs (k = 1 to 3), centred between the stage head and the music's bars.
  let name: (DotText & { key: string; y0: number }) | null = null;
  function nameMask() {
    const text = `${s.near.wall ?? ui.siteName}  ·  `;
    const key = `${text}|${STG}|${TOP}|${SPEC}`;
    if (name?.key !== key) {
      const room = STG - SPEC - 1 - TOP;
      const k = Math.max(1, Math.min(3, Math.floor(room / 7)));
      name = { ...dotText(text, k), key, y0: Math.max(0, TOP + Math.floor((room - 7 * k) / 2)) };
    }
    return name;
  }

  // ---- the band animations: (time in s, weight 0..1) ----
  // What faces the radio (the scan cursor's run, the firewall, the pings) sits on the radio's side of the
  // wall: the left, or the right in a right-to-left page. Text and the name scroll never mirror.
  let rtl = false;
  const side = (x: number) => (rtl ? W - 1 - x : x);
  const bands: ((t: number, w: number) => void)[] = [
    // ME: the station's words scroll 15 cells/s.
    (t, w) => {
      const b = nameMask();
      const off = Math.floor(t * NAME_SPEED);
      for (let x = 0; x < W; x++) {
        const cx = (x + off) % b.w;
        for (let y = 0; y < b.h; y++) if (b.m[y * b.w + cx]) put(red, x, b.y0 + y, w);
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
      const cx = side(W - 1 - (Math.floor(t * 40) % W));
      for (let y = 0; y < STG; y++) put(amber, cx, y, w * 0.6);
    },
    // SECURITY: packets run right to left in lanes; every sixth is malicious and bursts on the amber firewall.
    (t, w) => {
      // Computed as if the radio were on the left; side() mirrors each column for a right-to-left page.
      const fw = Math.floor(W * 0.26);
      for (let y = 0; y < H; y += 2) put(amber, side(fw), y, w * 0.7);
      const loop = W + 50;
      for (let lane = 0; lane < Math.floor(STG / 3); lane++) {
        const y = 1 + lane * 3;
        const speed = 22 + (lane % 5) * 7;
        for (let p = 0; p < 3; p++) {
          const raw = t * speed + p * 71 + lane * 43;
          const x = W - 1 - (raw % loop);
          if ((p + lane * 2 + Math.floor(raw / loop)) % 6 !== 0) {
            put(red, side(x), y, w);
            put(red, side(x + 1), y, w);
            put(red, side(x + 2), y, w * 0.5);
          } else if (x > fw + 1) {
            put(amber, side(x), y, w);
            put(amber, side(x + 1), y, w);
            put(amber, side(x + 2), y, w);
          } else {
            const k = (fw + 1 - x) / 4;
            if (k < 4)
              for (let j = 0; j < 8; j++) {
                const a = (j / 8) * Math.PI * 2;
                put(amber, side(fw + 1 + Math.cos(a) * k * 1.6), y + Math.sin(a) * k, w * (1 - k / 4));
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
    // CONTACT: Morse "HELLO" scrolls 9 cells/s across the stage; two amber pings spread from the radio's edge.
    (t, w) => {
      const off = Math.floor(t * 9);
      const my = Math.floor(STG / 2);
      for (let x = 0; x < W; x++)
        if (MORSE[(Math.floor(x / 3) + off) % MORSE.length]) for (let y = my - 1; y <= my + 1; y++) put(red, x, y, w);
      const reach = W * 1.3;
      for (let k = 0; k < 2; k++) {
        const r = ((t + k * 1.1) * 34) % reach;
        const v = w * (1 - r / reach) * 0.7;
        for (let a = -1.4; a <= 1.4; a += 0.02) put(amber, side(r * Math.cos(a)), H * 0.45 + r * Math.sin(a) * 0.8, v);
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

  // ---- ripples: amber rings from the pointer and from the radio's edge on every lock ----
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

  // ---- the music: thin amber bars (one LED wide, one apart) in the stage's last SPEC rows ----
  // Quiet bins light nothing, so there is no solid floor line; the bars stay lighter than the words.
  function spectrum() {
    const bins = s.audio.bins;
    if (bins.length < SPECTRUM_BINS) return;
    for (let x = 0; x < W; x += 2) {
      const h = Math.min(SPEC, Math.floor((bins[Math.floor((x / W) * SPECTRUM_BINS)] / 255) * (SPEC + 0.5)));
      for (let y = 0; y < h; y++) put(amber, x, STG - 1 - y, SPECTRUM_V);
    }
  }

  // ---- one picture of the signal into the buffers ----
  function compose(time: number, now: number, still: boolean) {
    rtl = document.dir === 'rtl';
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
      const px = a > OFF ? (alpha(a) | AMBER) >>> 0 : r > OFF ? (alpha(r) | LIT) >>> 0 : 0;
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
    // A new song's colour: glide to it (at once with reduced motion).
    if (s.lit !== litHex) {
      litHex = s.lit;
      litFrom = lit;
      litTo = rgbOf(litHex);
      glideAt = now;
    }
    let gliding = false;
    if (glideAt >= 0) {
      const k = s.reduceMotion ? 1 : Math.min(1, (now - glideAt) / GLIDE_MS);
      const e = 1 - (1 - k) * (1 - k);
      lit = litFrom.map((c, i) => Math.round(c + (litTo[i] - c) * e)) as typeof lit;
      LIT = packed(lit);
      dirty = true;
      gliding = k < 1;
      if (!gliding) glideAt = -1;
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
      return gliding;
    }
    stillKey = '';

    // About 30 fps; the loop keeps running for the other modules in between.
    if (now - drawnAt < MIN_GAP_MS) return true;
    const step = Math.min(100, now - drawnAt);
    drawnAt = now;
    t += step / 1000;

    // Everything fades out over a few frames, except the ME words: they are redrawn whole every frame, so
    // a letter that moves on leaves no trail of dim dots (the stage's rows above the music's bars).
    const d = Math.pow(DECAY, step / FRAME_MS);
    const crisp = s.near.row === 0 && !s.near.billboard ? (STG - SPEC) * W : 0;
    for (let i = 0; i < N; i++) {
      const r = i < crisp ? 0 : red[i] * d;
      const a = amber[i] * d;
      red[i] = r < 0.01 ? 0 : r;
      amber[i] = a < 0.01 ? 0 : a;
    }
    compose(t, now, false);
    paint();
    return true;
  };
}

/** RGB as a packed pixel without its alpha (little-endian ABGR). */
const packed = ([r, g, b]: number[]) => (b << 16) | (g << 8) | r;

/** Brightness as the alpha byte of a packed pixel. */
const alpha = (v: number) => (v >= 1 ? 255 : (v * 255 + 0.5) | 0) << 24;

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
