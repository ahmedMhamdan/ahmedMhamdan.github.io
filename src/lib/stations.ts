import { getCollection, type CollectionEntry } from 'astro:content';
import { BANDS, assertSpacing, type BandId } from './dial';

export type Station = CollectionEntry<'stations'>;

/** The station served at "/". */
export const HOME_ID = 'me/about';

export const stationPath = (id: string) => (id === HOME_ID ? '/' : `/${id}/`);

/** All stations in dial order (low to high frequency). Fails the build on bad spacing or broken action targets. */
export async function getStations(): Promise<Station[]> {
  const stations = assertSpacing(await getCollection('stations'));
  const ids = new Set(stations.map((s) => s.id));
  for (const s of stations) {
    for (const a of s.data.actions) {
      if (a.to && !ids.has(a.to)) throw new Error(`Station "${s.id}": action "${a.label}" points to unknown station "${a.to}".`);
    }
  }
  return stations;
}

export const bandLabel = (band: BandId) => BANDS.find((b) => b.id === band)!.label;

/** First station of a band: where the band key and preset key 1–5 tune. */
export const firstOfBand = (stations: Station[], band: BandId) => stations.find((s) => s.data.band === band);

/** Previous and next station on the dial, wrapping at both ends (seek buttons). */
export function neighbours(stations: Station[], id: string) {
  const i = stations.findIndex((s) => s.id === id);
  const n = stations.length;
  return { prev: stations[(i - 1 + n) % n], next: stations[(i + 1) % n] };
}

/** Frequency as the display shows it: "88.7", "100.7". */
export const freqText = (freq: number) => freq.toFixed(1);

/**
 * Readable name for assistive text: "Work, Elancer", "Poetry, Poem III".
 * LED keys and band labels are capitals; screen readers may spell capitals out.
 */
export function spokenName(s: Station) {
  const soft = (text: string) =>
    text
      .toLowerCase()
      .split(' ')
      .map((w) => (/^[ivx]+$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  return `${soft(bandLabel(s.data.band))}, ${soft(s.data.key)}`;
}
