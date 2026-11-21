// The "What I listen to" player's tracks (FR-08). While this list is empty no player is rendered and
// the radio makes no sound. A track ships only after Ahmed confirms the right to publish it, the
// excerpt (2–4 minutes, at most 4 MB) and the credit line: docs/CONTENT.md, "Music".

export interface Track {
  /** As the marquee and screen readers give it. */
  title: string;
  /** Same-origin file under public/audio/, e.g. "/audio/excerpt.mp3". */
  src: string;
  /** Credit line required by the licence, read with the title. */
  credit?: string;
}

const published: Track[] = [];

// Development only: a git-ignored tracks.local.ts beside this file may list a local, git-ignored file
// from public/audio/ (`export const tracks = [{ title, src }]`). CI and the deploy never have either.
const local = Object.values(import.meta.glob<{ tracks: Track[] }>('./tracks.local.ts', { eager: true }))[0]?.tracks;

export const tracks: Track[] = local ?? published;
