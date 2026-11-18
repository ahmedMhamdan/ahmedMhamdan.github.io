import { getCollection, type CollectionEntry } from 'astro:content';
import { assertSpacing } from './dial';

export type Station = CollectionEntry<'stations'>;

/** The station served at "/". */
export const HOME_ID = 'me/about';

export const stationPath = (id: string) => (id === HOME_ID ? '/' : `/${id}/`);

/** All stations in dial order (low to high frequency). Fails the build on bad spacing. */
export async function getStations(): Promise<Station[]> {
  return assertSpacing(await getCollection('stations'));
}
