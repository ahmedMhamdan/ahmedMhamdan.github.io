// The "What I listen to" playlist (FR-08), in playing order: the music starts with the first song. While
// this list is empty no player is rendered and the radio makes no sound. A song ships only after Ahmed
// confirms it: docs/CONTENT.md, "Music". Each song may bring its own colours, which the whole site takes
// while it plays (src/scripts/player.ts); without them it plays in the radio's red.

export interface Track {
  /** The song, as the list and screen readers give it. */
  title: string;
  /** Who made it; the marquee reads "ARTIST - TITLE". */
  artist?: string;
  /** Same-origin file under public/audio/, e.g. "/audio/excerpt.mp3". */
  src: string;
  /** Credit line, read after the title when the licence asks for one. */
  credit?: string;
  /** The site's colours while this song plays: the LED colour (AA as text on the panel) and the ground. */
  color?: { lit: string; ground: string };
}

const published: Track[] = [
  // The first song of a mix, 0:00 to 3:24 (approved by Ahmed on 2026-11-21; source unknown, so no credit).
  { title: "you got a lot to finish. let's lock in.", src: '/audio/lock-in.mp3' },
];

// Development only: a git-ignored tracks.local.ts beside this file may list local, git-ignored files
// from public/audio/ (`export const tracks = [{ title, src }]`). CI and the deploy never have either.
const local = Object.values(import.meta.glob<{ tracks: Track[] }>('./tracks.local.ts', { eager: true }))[0]?.tracks;

export const tracks: Track[] = local ?? published;
