// A 5×7 dot-matrix font for the LED wall's words: the classic character-LCD shapes, one LED per dot, so
// every letter is crisp (a scaled font rasterised this small broke up into stray dots). On a taller stage
// the letters grow 2× or 3× with Scale2x/Scale3x, which rounds their corners and diagonals instead of
// making blocks. Each glyph is 7 rows, top to bottom; each row is one base-32 digit of 5 bits, the left
// column the highest bit. Glyphs are proportional: empty side columns are trimmed. Characters not here
// are left out.

const ROWS = 7;
const SPACE = 3; // columns of a space
const GAP = 1; // columns between letters

const GLYPHS: Record<string, string> = {
  A: 'ehhvhhh', B: 'uhhuhhu', C: 'ehggghe', D: 'sihhhis', E: 'vgguggv', F: 'vgguggg', G: 'ehgnhhf',
  H: 'hhhvhhh', I: 'e44444e', J: '72222ic', K: 'hikokih', L: 'ggggggv', M: 'hrllhhh', N: 'hhpljhh',
  O: 'ehhhhhe', P: 'uhhuggg', Q: 'ehhhlid', R: 'uhhukih', S: 'fgge11u', T: 'v444444', U: 'hhhhhhe',
  V: 'hhhhha4', W: 'hhhllla', X: 'hha4ahh', Y: 'hhha444', Z: 'v1248gv',
  0: 'ehjlphe', 1: '4c4444e', 2: 'eh1248v', 3: 'v2421he', 4: '26aiv22', 5: 'vgu11he', 6: '68guhhe',
  7: 'v124888', 8: 'ehhehhe', 9: 'ehhf12c',
  ',': '0000c48', "'": 'c480000', '.': '00000cc', '·': '0004000', '!': '4444404', '?': 'eh12404',
  '-': '000e000', '&': 'cik8lid', ':': '0cc0cc0', '/': '01248g0', '"': 'aaa0000', '(': '2488842',
  ')': '8422248', '+': '044v440',
};
const SAME: Record<string, string> = { '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '•': '·' };

export interface DotText {
  /** Width and height in LEDs. */
  w: number;
  h: number;
  /** 1 where an LED is lit, row by row. */
  m: Uint8Array;
}

/** The rows of one glyph as bit masks, and its trimmed columns (from the left, 0–4). */
function glyph(ch: string): { rows: number[]; left: number; width: number } | null {
  const code = GLYPHS[SAME[ch] ?? ch];
  if (!code) return null;
  const rows = [...code].map((c) => parseInt(c, 32));
  const all = rows.reduce((a, r) => a | r, 0);
  if (!all) return { rows, left: 0, width: SPACE };
  let left = 0;
  while (!(all & (16 >> left))) left++;
  let right = 4;
  while (!(all & (16 >> right))) right--;
  return { rows, left, width: right - left + 1 };
}

/** Text in capitals as LEDs, at 1×, 2× or 3× the font's size. */
export function dotText(text: string, k: number): DotText {
  const glyphs: { rows: number[]; left: number; width: number }[] = [];
  for (const ch of text.toUpperCase()) {
    const g = ch === ' ' ? { rows: [], left: 0, width: SPACE } : glyph(ch);
    if (g) glyphs.push(g);
  }
  const w = Math.max(1, glyphs.reduce((a, g) => a + g.width + GAP, 0));
  const m = new Uint8Array(w * ROWS);
  let x0 = 0;
  for (const g of glyphs) {
    for (let y = 0; y < g.rows.length; y++)
      for (let c = 0; c < g.width; c++) if (g.rows[y] & (16 >> (g.left + c))) m[y * w + x0 + c] = 1;
    x0 += g.width + GAP;
  }
  const one = { w, h: ROWS, m };
  return k >= 3 ? scale3x(one) : k === 2 ? scale2x(one) : one;
}

/** The pixel at x, y; 0 outside. */
const at = ({ w, h, m }: DotText, x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);

/** Scale2x (EPX): each dot becomes 2 × 2, and a corner takes its neighbours' value where they agree. */
function scale2x(src: DotText): DotText {
  const w = src.w * 2;
  const m = new Uint8Array(w * src.h * 2);
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const [B, D, E, F, H] = [at(src, x, y - 1), at(src, x - 1, y), at(src, x, y), at(src, x + 1, y), at(src, x, y + 1)];
      const flat = B === H || D === F;
      const i = 2 * y * w + 2 * x;
      m[i] = !flat && D === B ? D : E;
      m[i + 1] = !flat && B === F ? F : E;
      m[i + w] = !flat && D === H ? D : E;
      m[i + w + 1] = !flat && H === F ? F : E;
    }
  return { w, h: src.h * 2, m };
}

/** Scale3x: each dot becomes 3 × 3, the same idea with the diagonal neighbours. */
function scale3x(src: DotText): DotText {
  const w = src.w * 3;
  const m = new Uint8Array(w * src.h * 3);
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const [A, B, C] = [at(src, x - 1, y - 1), at(src, x, y - 1), at(src, x + 1, y - 1)];
      const [D, E, F] = [at(src, x - 1, y), at(src, x, y), at(src, x + 1, y)];
      const [G, H, I] = [at(src, x - 1, y + 1), at(src, x, y + 1), at(src, x + 1, y + 1)];
      const e =
        B === H || D === F
          ? [E, E, E, E, E, E, E, E, E]
          : [
              D === B ? D : E,
              (D === B && E !== C) || (B === F && E !== A) ? B : E,
              B === F ? F : E,
              (D === B && E !== G) || (D === H && E !== A) ? D : E,
              E,
              (B === F && E !== I) || (H === F && E !== C) ? F : E,
              D === H ? D : E,
              (D === H && E !== I) || (H === F && E !== G) ? H : E,
              H === F ? F : E,
            ];
      for (let j = 0; j < 9; j++) m[(3 * y + ((j / 3) | 0)) * w + 3 * x + (j % 3)] = e[j];
    }
  return { w, h: src.h * 3, m };
}
