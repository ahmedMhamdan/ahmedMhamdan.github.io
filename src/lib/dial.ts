// The dial model shared by content validation, pages and (later) the client tuner.
// Numbers come from the approved reference mock: docs/design/reference/g-radio-wall.html

export const LO = 88; // MHz, left end of band 1
export const HI = 108; // MHz, right end of band 5
export const PER = 4; // MHz per band row

export const BANDS = [
  { id: 'me', label: 'ME' },
  { id: 'work', label: 'WORK' },
  { id: 'security', label: 'SECURITY' },
  { id: 'poetry', label: 'POETRY' },
  { id: 'contact', label: 'CONTACT' },
] as const;

export type BandId = (typeof BANDS)[number]['id'];
export const BAND_IDS = BANDS.map((b) => b.id) as [BandId, ...BandId[]];

/** Tuner behaviour constants (reference mock). */
export const TUNING = {
  ease: 0.075, // per-frame exponential approach of f toward target
  lockWithin: 0.06, // MHz: station counts as locked
  afcWithin: 0.35, // MHz: auto frequency control snaps to the nearest station when the dial rests
  afcRestMs: 420, // the dial must rest this long before AFC snaps
  strengthSpan: 0.4, // MHz: signal strength = 1 - distance / strengthSpan
} as const;

/** Stations must be further apart than two AFC radii, or AFC would fight between them. */
export const MIN_SPACING = 0.8; // MHz: 2 × afcWithin (0.35) + margin

export const bandIndex = (band: BandId) => BAND_IDS.indexOf(band);

export const bandRange = (band: BandId) => {
  const lo = LO + bandIndex(band) * PER;
  return { lo, hi: lo + PER };
};

/** 0..1 position of a frequency along its band row. */
export const rowPosition = (freq: number, band: BandId) => (freq - bandRange(band).lo) / PER;

/** Throws at build time if two stations sit too close together. */
export function assertSpacing<T extends { id: string; data: { freq: number } }>(stations: T[]): T[] {
  const sorted = [...stations].sort((a, b) => a.data.freq - b.data.freq);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].data.freq - sorted[i - 1].data.freq;
    if (gap < MIN_SPACING) {
      throw new Error(
        `Stations "${sorted[i - 1].id}" and "${sorted[i].id}" are ${gap.toFixed(2)} MHz apart; minimum is ${MIN_SPACING} MHz.`,
      );
    }
  }
  return sorted;
}
