# Content inventory

What each station needs, what exists, and what Ahmed still has to supply. Update this file whenever content arrives. A station keeps `placeholder: true` in its frontmatter until its row here says **Ready**.

Rules: no invented claims, clients, metrics or testimonials; no nickname; "cybersecurity graduate", never "student"; Gaza only in the ME band; no coursework answers before deadlines; lab write-ups only from Ahmed's own machines.

| Freq | Station | File | Have | Need from Ahmed | Status |
| --- | --- | --- | --- | --- | --- |
| 88.7 | ME · ABOUT | `me/about.md` | Portrait (`src/assets/stations/me/about.jpg`, crop of Ahmed's photo, no metadata), pitch line, a paragraph in his voice, facts, GET IN TOUCH (EMAIL) and SEE THE WORK (his GitHub); the wall scrolls "HELLO, I'M AHMED" (all approved 2026-11-27) | Nothing | Ready |
| 90.1 | ME · PHOTOS | `me/photos.md` | Nothing | 4–8 photos of himself with a short caption each (place), permission to publish | Placeholder |
| 91.4 | ME · STORY | `me/story.md` | Nothing | Story in his own words: studies, why security and web, where he is heading. Gaza may appear here, honestly | Placeholder |
| 92.9 | WORK · ELANCER | `work/elancer.md` | One-line description, role, stack, status (finished, Ahmed 2026-11-27) | Screenshots (16:8), source link (or "private"), live demo if any, case study later | Placeholder |
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

ABOUT's two buttons come right after the pitch line, so they show without scrolling on every desktop window checked (1280×800, 1366×657, 1440×790, 1536×730, 1920×950); the paragraph and the facts follow and may need a short scroll. On phones and tablets the full-width portrait comes first, so the buttons are below it.

Work in progress that has no station yet: Jawla, Ahmed's startup (the ABOUT paragraph names it). Ask him whether it gets a WORK station when the WORK band is filled.

A band's first station needs room on narrow phones: its label sits after the band's name on the dial. LAB NOTES at 96.8 MHz is the tightest (4px from "SECURITY" on 320–360px phones, and touching it when a visitor enlarges letter spacing, WCAG 1.4.12). When the SECURITY stations are chosen, start the band at 97.2 MHz or higher (about 20px more room); the other bands' first stations already have 20px or more.

Station frontmatter (validated in `src/content.config.ts`): `layout` picks the panel (about, gallery, case, list, poem, contact); `facts` are label/value pairs (the facts list, the meta row, or list rows); `actions` are buttons (`to` a station id, `href` a URL, neither = shown disabled); `gallery` holds photos with `alt` and `caption`; `tag` is the small amber label after the heading (for example "Draft list"); `imagePending: true` shows a marked empty frame until the image arrives (placeholder stations only).

## Music

- **Built 2026-11-27:** the "What I listen to" playlist, in this order, then "you got a lot to finish. let's lock in." last, in the radio's red (`docs/DECISIONS.md`, 2026-11-27). The site takes each song's colour when it is chosen; a pause keeps it. The music starts on the visitor's first click or tap. Ahmed chose to publish the **full songs** and accepts the takedown risk below. Each song is committed and pushed on its own (a slow upload line), allowed by name in `.gitignore`.

| # | Song (title, artist) | File in Ahmed's music folder | Published as (`public/audio/`) | Size | Colour: LED / ground |
| --- | --- | --- | --- | --- | --- |
| 1 | 104.6 Sky FM (slowed and reverb), Skychaser | `Skychaser - 104.6 Sky Fm (Slowed and Reverb).mp3` | `skychaser-sky-fm.mp3` | 4.1 MB | dark blue `#3d7bff` / `#060d18` |
| 2 | Magic (slowed and reverb), Medasin | `Medasin - Magic [slowed reverb].mp3` (the title uses stylised Unicode letters) | `medasin-magic.mp3` | 10.3 MB | violet `#b48cff` / `#110d19` |
| 3 | drifting, blut own | `blut own - drifting.mp3` | `blut-own-drifting.mp3` | 4.8 MB | aqua `#3fe0c8` / `#081514` |
| 4 | I'm Not Human At All, Sleep Party People | `Sleep Party People - I'm Not Human At All.mp3` | `sleep-party-people-not-human.mp3` | 10.6 MB | moon white `#e4e0ff` / `#0f0f14` |
| 5 | u weren't here i really miss you (slowed x reverb), cult member | `cult member - u weren't here i really miss you (slowed x reverb).mp3` | `cult-member-u-werent-here.mp3` | 8.5 MB | rose `#ff6f9f` / `#170b11` |
| 6 | MEANINGFUL LOVE (TikTok version), SILO | `SILO - MEANINGFUL LOVE [TIKTOK VERSION].mp3` | `silo-meaningful-love.mp3` | 4.5 MB | lime `#a8f060` / `#0d130a` |
| 7 | He's My Man, Luvcat | `Luvcat - He's My Man {lyric video}.mp3` | `luvcat-hes-my-man.mp3` | 5.6 MB | wine red `#ff3b5c` / `#16090c` |

  About 48 MB in all. The published copies are the same MP3 frames with the tags removed (no re-encoding; only the encoder's name in the first frame remains). Every LED colour passes 4.5:1 as text on its panel and on the song list, and as the background of the dark button text (dark blue is the darkest blue that does: 5.0:1 on the panel, 4.7:1 on the list).
- **The original track** (live since 2026-11-21, now last in the list): "you got a lot to finish. let's lock in." (jazz piano), the first song of a 66-minute mix downloaded from YouTube (source and licence unknown), published as `public/audio/lock-in.mp3`: 0:00 to 3:24, 192 kbps MP3 cut on frame boundaries without re-encoding, 4.9 MB, loaded only when it plays. No credit line while the source is unknown.
- **Risk Ahmed accepted:** these are other artists' songs. If a rights holder files a takedown, GitHub can disable the repository and the site. Then remove the song from `tracks.ts` and the repository and redeploy. Git keeps every committed file in its history, so removed songs still count towards the repository's size.
- Development may still use local files from `public/audio/`, listed in the git-ignored `src/data/tracks.local.ts` (`export const tracks = [{ title, artist, src: '/audio/<file>.mp3', color }]`), which replaces the published list in local builds.

## Images

- Placeholders in the reference mock (`docs/design/reference/img/`) are stock photos from picsum.photos (Unsplash licence). They are design placeholders only and must not appear on the live site.
- Real photos go in `src/assets/` (optimised by `astro:assets`), never in `public/`. Every image needs alt text.
- The LED wall shows a station's image as a dot-matrix billboard while it is tuned: the image of a `case` station (ELANCER) and the first photo of a `gallery` station (PHOTOS). Choose images that still read at about 175 × 36 dots (bold shapes, clear contrast). Until they arrive, those stations show their band's animation.

## Licence

- Fonts: DSEG (SIL OFL 1.1, licence in `public/fonts/`), Barlow Semi Condensed (SIL OFL 1.1).
- Code and content licence: **undecided**. Until decided, all rights reserved. Options: all rights reserved; MIT for code with content (text, poems, photos) excluded.
