# Content inventory

What each station needs, what exists, and what Ahmed still has to supply. Update this file whenever content arrives. A station keeps `placeholder: true` in its frontmatter until its row here says **Ready**.

Rules: no invented claims, clients, metrics or testimonials; no nickname; "cybersecurity graduate", never "student"; Gaza only in the ME band; no coursework answers before deadlines; lab write-ups only from Ahmed's own machines.

| Freq | Station | File | Have | Need from Ahmed | Status |
| --- | --- | --- | --- | --- | --- |
| 88.7 | ME · ABOUT | `me/about.md` | Pitch line, facts (focus, languages, off the clock) | Portrait photo (4:5), approve the pitch wording | Placeholder |
| 90.1 | ME · PHOTOS | `me/photos.md` | Nothing | 4–8 photos of himself with a short caption each (place), permission to publish | Placeholder |
| 91.4 | ME · STORY | `me/story.md` | Nothing | Story in his own words: studies, why security and web, where he is heading. Gaza may appear here, honestly | Placeholder |
| 92.9 | WORK · ELANCER | `work/elancer.md` | One-line description, role, stack, status | Screenshots (16:8), source link (or "private"), live demo if any, case study later | Placeholder |
| 94.3 | WORK · LARAVEL | `work/laravel.md` | Draft list of skills | Confirm or replace items; link projects if any | Placeholder |
| 95.4 | WORK · REACT | `work/react.md` | Draft list of skills | Confirm or replace items | Placeholder |
| 96.8 | SECURITY · LAB NOTES | `security/lab-notes.md` | Intro line | Choose 2–4 write-ups (own labs only), each with a title, a short summary, maybe a link | Placeholder |
| 98.6 | SECURITY · RESEARCH | `security/research.md` | Topic, type, status | What can be shared publicly and when; teammates' consent to be named; link once published | Placeholder |
| 100.7 | POETRY · POEM I | `poetry/poem-i.md` | Nothing | Poem text and title; layout ideas | Placeholder |
| 102.1 | POETRY · POEM II | `poetry/poem-ii.md` | Nothing | Poem text and title | Placeholder |
| 103.3 | POETRY · POEM III | `poetry/poem-iii.md` | Nothing | Poem text and title | Placeholder |
| 104.9 | CONTACT · EMAIL | `contact/email.md` | Nothing | The public email address to show (a dedicated address is recommended) | Placeholder |
| 106.3 | CONTACT · GITHUB | `contact/github.md` | https://github.com/ahmedMhamdan | Nothing | Ready |
| 107.5 | CONTACT · LINKEDIN | `contact/linkedin.md` | Nothing | LinkedIn profile URL | Placeholder |

The number of stations per band can change (for example two poems or five). Frequencies must stay inside their band and at least 0.8 MHz apart; the build checks both.

Station frontmatter (validated in `src/content.config.ts`): `layout` picks the panel (about, gallery, case, list, poem, contact); `facts` are label/value pairs (the facts list, the meta row, or list rows); `actions` are buttons (`to` a station id, `href` a URL, neither = shown disabled); `gallery` holds photos with `alt` and `caption`; `tag` is the small amber label after the heading (for example "Draft list"); `imagePending: true` shows a marked empty frame until the image arrives (placeholder stations only).

## Music

- Track: "you got a lot to finish. let's lock in." (jazz piano), a 66-minute mix downloaded from YouTube; its source and licence are unknown.
- **Published excerpt** (Ahmed approved it on 2026-11-21): `public/audio/lock-in.mp3`, the mix's first song from 0:00 to 3:24, ending in the silence before the second song; 192 kbps MP3 cut on frame boundaries without re-encoding, 4.9 MB, loaded only when a visitor presses play. It is the one audio file allowed in git (by name in `.gitignore`) and is listed in `src/data/tracks.ts`. No credit line while the source is unknown.
- Risk Ahmed accepted: if the rights holder files a takedown, GitHub can disable the repository and the site. Then remove the file from `tracks.ts` and the repository (the player hides when the list is empty) and redeploy.
- Still open: the source and credit line (add `credit` in `tracks.ts`, and decide where a visible credit goes if a licence requires one).
- The full mix stays out of git. Development may still use it from `public/audio/`, listed in the git-ignored `src/data/tracks.local.ts` (`export const tracks = [{ title, src: '/audio/<file>.mp3' }]`), which replaces the published list in local builds.
- Another track: same steps (excerpt in `public/audio/` and allowed by name in `.gitignore`, `{ title, src, credit }` in `published`), only after Ahmed confirms its rights.

## Images

- Placeholders in the reference mock (`docs/design/reference/img/`) are stock photos from picsum.photos (Unsplash licence). They are design placeholders only and must not appear on the live site.
- Real photos go in `src/assets/` (optimised by `astro:assets`), never in `public/`. Every image needs alt text.
- The LED wall shows a station's image as a dot-matrix billboard while it is tuned: the image of a `case` station (ELANCER) and the first photo of a `gallery` station (PHOTOS). Choose images that still read at about 175 × 36 dots (bold shapes, clear contrast). Until they arrive, those stations show their band's animation.

## Licence

- Fonts: DSEG (SIL OFL 1.1, licence in `public/fonts/`), Barlow Semi Condensed (SIL OFL 1.1).
- Code and content licence: **undecided**. Until decided, all rights reserved. Options: all rights reserved; MIT for code with content (text, poems, photos) excluded.
