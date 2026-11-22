# 009 - Ahmed Hamdan Portfolio: "Transmission" Radio Site

## How To Read This Plan

This is the build plan for Ahmed Hamdan's portfolio at `ahmedmhamdan.github.io`. It is written for two readers: Ahmed, to understand the whole project and approve its choices, and a fresh coding session (terminal Codex or Claude Code), to implement it without any chat history.

- **Status:** active. The direction, stack, hosting and scope were approved on 2026-11-18. Phase 0 (scaffold) is done. Ahmed has not yet reviewed this plan text line by line; if anything here contradicts what he says, his word wins and this file gets updated.
- **Copies:** this file (`docs/PLAN.md`) is the working copy inside the repository. Ahmed's private planning vault keeps the same plan as plan 009.
- **Still undecided:** the content Ahmed must supply (poems, photos, write-ups, links, music rights), and the code licence. See Open Questions.
- **Companion docs:** `docs/design/direction.md` (exact design and behaviour numbers), `docs/design/reference/g-radio-wall.html` (the approved interactive mock), `docs/CONTENT.md` (content inventory), `docs/DECISIONS.md`.

## Executive Summary

Ahmed wants a portfolio people remember after one visit. Most developer portfolios look alike; this one is a radio. On the left stands a full physical radio drawn in CSS: a seven-segment LED display, a five-row FM dial (88 to 108 MHz), a tuning knob, preset keys, a speaker and an antenna. On the right, a full-bleed LED wall reacts to the signal with a different animation for each band, above a content panel holding the text, photos and poems.

You navigate by tuning. Each band is a section (ME, WORK, SECURITY, POETRY, CONTACT), and each printed station on the dial is a real page with its own URL. Between stations you hear static and see noise; on a station the signal locks, the text decodes out of the static, and the music in the "What I listen to" player plays through the radio, filtered while you tune and clear when locked.

The implementation is a static Astro site with TypeScript. Every station is plain, readable HTML first (search engines, screen readers and no-JS visitors get everything); the radio, wall and audio are small framework-free scripts that enhance it. It deploys free to GitHub Pages, manually.

## Problem And Context

### Problem

Ahmed is about to graduate in cybersecurity and works as a full-stack developer (Laravel + React). He needs one link to put on a CV, LinkedIn and applications (jobs, freelance clients, scholarships) that shows skill rather than listing it, carries his voice (including poetry), and makes contacting him easy.

### Current State And Evidence

- Repository `ahmedMhamdan/ahmedMhamdan.github.io` (public) holds the Phase 0 scaffold: Astro 7.4, a content collection with all 14 stations as Markdown (13 still marked placeholder), a readable baseline page per station, self-hosted fonts, CI, and a manual deploy workflow.
- The approved design is an interactive single-file mock: `docs/design/reference/g-radio-wall.html`, with screenshots in `docs/design/screenshots/`. Ahmed's verdict on it: "kinda" good, start building. It was verified in a browser: tuning, lock, content decode, LED wall per band, music playback through the filter chain.
- Real evidence for content: Elancer (bilingual Laravel + React marketplace, in progress); security coursework and labs; a team research paper on AI-assisted SQLi/XSS detection. No testimonials, clients, metrics or awards exist and none may be invented.

### Why Now

Graduation is close and applications are starting. A portfolio is needed before then, and the design direction is settled.

## Goals And Success Measures

### Goals

1. A visitor understands within one screen who Ahmed is, what he builds, and how to reach him.
2. The radio mechanic is memorable and works: tuning by knob, dial, keys, wheel and keyboard; lock, decode, static, wall and sound all react to one signal.
3. Everything is readable and reachable without JavaScript, by keyboard, and with a screen reader.
4. Light and fast on mid-range phones and weak connections.
5. Ready for an Arabic (RTL) version later without a rewrite.

### Non-Goals

- No CMS, backend, database, accounts, comments, analytics or newsletter.
- No blog or updates feed, no CTF hunt, no gaming channel content (all excluded by Ahmed for now).
- No React or other UI framework runtime.
- No redesign of the approved direction.

### Measurable Success

- Lighthouse (mobile) on the deployed site: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95.
- Initial JavaScript ≤ 40 KB gzip; total transfer for the home page ≤ 300 KB before any photo or audio.
- Every station reachable by link and keyboard; zero axe violations on every page.
- Zero placeholders live at launch (enforced by the deploy workflow).

## Users And Stakeholders

- **Recruiters and clients** (remote full-stack or security roles): scan fast; need the pitch, the work and contact in seconds.
- **Scholarship and admissions committees:** read for the person and story; need the Story station and seriousness.
- **Friends and poetry readers:** browse slowly; need the poems to be beautiful and readable.
- **Ahmed:** owner, sole content author and decision maker.

## User Journeys And Key Flows

1. **Recruiter from a CV link** lands on `/` (ME · ABOUT, already tuned): name, one-line pitch, facts, two buttons: GET IN TOUCH (tunes to EMAIL) and SEE THE WORK (tunes to ELANCER). Time to contact: one click.
2. **Explorer** grabs the knob and turns: the needle sweeps the five rows, static and a heterodyne whistle rise between stations, the LCD scrambles, the wall shows noise; resting near a station, AFC pulls it in, the TUNED lamp lights, a click plays, the panel content decodes, the wall switches to that band's animation, and the URL changes to the station page.
3. **Keyboard user** presses 1 to 5 to jump to a band, ← → for the previous or next station; the knob is a focusable slider (arrows ±0.1 MHz, Page Up/Down next/previous station).
4. **Shared link** to `/poetry/poem-i/` opens with the dial already on 100.7 and the poem showing; back and forward retune the dial.
5. **Listener** presses play: the jazz track plays through the radio; DIAL FX makes tuning audible; the speaker cone pulses with the bass; the wall shows a small spectrum.
6. **No-JS or screen-reader visitor** gets the same pages as plain HTML with real links for every station.

## Scope

### In Scope

- Five bands, 14 stations: ME (About 88.7, Photos 90.1, Story 91.4), WORK (Elancer 92.9, Laravel 94.3, React 95.4), SECURITY (Lab notes 96.8, Research 98.6), POETRY (Poem I 100.7, Poem II 102.1, Poem III 103.3), CONTACT (Email 104.9, GitHub 106.3, LinkedIn 107.5). Frequencies may change; the build enforces spacing and band ranges.
- The radio object, LED wall, content panel, music player and dial sound effects as in the reference mock.
- Responsive layouts (desktop, tablet, phone), reduced motion, keyboard, screen-reader support.
- SEO basics: titles, descriptions, canonical URLs, Open Graph image, sitemap, robots.txt.
- Manual deployment to GitHub Pages.

### Out Of Scope

- Anything listed under Non-Goals.
- Publishing the music before rights are confirmed.
- Publishing coursework answers before deadlines, or lab material from systems Ahmed does not own.

### Deferred

- Arabic version (architecture ready from the start; translation and RTL layout later).
- Custom domain.
- More tracks in the player.
- Case study pages beyond the station panel (Elancer "CASE STUDY · SOON").

## Requirements

### Functional Requirements

- **FR-01 Station pages.** Every station is a static HTML page at `/<band>/<slug>/` (ME · ABOUT at `/`), generated from `src/content/stations/**`. Done in Phase 0.
- **FR-02 Content model.** Station frontmatter is validated at build time: band, LED key (≤ 9 cells, A–Z 0–9 space), frequency inside its band, spacing ≥ 0.8 MHz from neighbours, alt text required with images, `placeholder` flag. Done in Phase 0; extended in Phase 1 for station-specific blocks (facts, actions, gallery).
- **FR-03 Radio object.** The left column renders the radio from the mock: antenna, handle, piano preset keys, case with screws, LCD (FM, seven-segment frequency, 14-segment station key, TUNED and AFC lamps, 10-bar signal meter), dial window (five band rows, station marks, needle), name plate, speaker grille, tuning knob, seek buttons, volume knob.
- **FR-04 Tuning.** Continuous frequency 88–108 MHz with eased motion, AFC snap and lock exactly as specified in `docs/design/direction.md` (Tuning model). Inputs: knob drag (one turn = 2 MHz), dragging along the dial window (Phase 5), wheel on the dial or knob, preset keys and band keys, station marks, seek buttons, keyboard.
- **FR-05 URL sync.** Locking a station pushes its URL; popstate retunes the dial; loading any station URL starts tuned to it.
- **FR-06 Content panel.** On lock: content slides in, `[data-decode]` text decodes out of random characters over 600 ms, images pixel-resolve, static overlay fades with signal strength. Between stations (strength < 0.15): the idle panel "BETWEEN STATIONS · Turn the dial".
- **FR-07 LED wall.** Full-bleed dot-matrix canvas behind the program area with per-band animations (ME name scroll, WORK bars and scan cursor, SECURITY firewall and packets, POETRY waves, CONTACT Morse "HELLO" and ping arcs), image billboard for stations with an image, noise between stations, pointer ripples, lock ripple, music spectrum.
- **FR-08 Music player.** "What I listen to" player bottom-right: play/pause, 14-segment marquee title, time readout, DIAL FX toggle, volume knob on the radio. Hidden entirely when no track is configured.
- **FR-09 Radio sound.** Web Audio graph with filtered music, static, heterodyne whistle and lock click, all reacting to signal strength and tuning speed (direction.md, Audio).
- **FR-10 Physical feedback.** Speaker cone pulses with the music; antenna springs when tuning and lights its tip on lock; preset key for the active band stays pressed.
- **FR-11 Contact.** Email, GitHub and LinkedIn stations with real links (`rel="me"`), copyable email.
- **FR-12 Poems.** Each poem station is a designed piece: typographic layout per poem, line breaks preserved, no text in images.
- **FR-13 SEO and sharing.** Per-page title and description, canonical, Open Graph image, sitemap.xml, robots.txt, "NO SIGNAL" 404.
- **FR-14 Deploy.** Manual GitHub Actions deploy to Pages that refuses placeholder content unless explicitly overridden. Done in Phase 0.

### Quality Requirements

- **QR-01 Readable first.** All text is real HTML; canvases are `aria-hidden`; the site is fully usable without JavaScript (plain links on the dial).
- **QR-02 Accessibility.** WCAG 2.2 AA: contrast ≥ 4.5:1 for text (ghost segments are decorative and hidden); visible focus (amber outline); knob and volume are `role="slider"` with value text; live region announces the tuned station; zero axe violations.
- **QR-03 Reduced motion.** `prefers-reduced-motion`: instant tuning, no decode scramble, no slide-in, no pixel-resolve, still wall frame, no antenna spring.
- **QR-04 Performance.** Measurable Success budgets; canvas loops stop when the tab is hidden or the page is off screen; the wall caps at about 30 fps and draws only changed state; no layout thrash in the frame loop.
- **QR-05 Privacy.** No analytics, trackers, cookies, third-party requests or embeds. Fonts self-hosted. No personal email, phone, student ID or local paths in the repo until Ahmed chooses what to publish.
- **QR-06 Security.** Static site only. Content Security Policy via `<meta http-equiv>`: `default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'` (adjust only if Astro output requires hashes). No `innerHTML` with untrusted input (all content is build-time). External links use `rel="noopener"`. Dependencies kept current; `npm audit` reviewed each phase.
- **QR-07 Audio etiquette.** No autoplay. Audio context created only on a user gesture. Volume remembered for the session only.
- **QR-08 Arabic readiness.** Strings live in content files or one UI strings module, not in canvas or images; new CSS uses logical properties; layout tested with `dir="rtl"` at least once before launch.
- **QR-09 Maintainability.** Framework-free TypeScript modules with one responsibility each; pure tuning math separated from DOM and tested; `npm run check` clean.
- **QR-10 Honesty.** No invented claims; placeholders visibly marked; content reviewed by Ahmed before launch.

## Proposed System

### Architecture Overview

```
Markdown stations ──► Astro content collection (validated) ──► static pages /<band>/<slug>/
                                                              │
                                     every page = radio layout + all station panels
                                                              │
               client scripts (TypeScript, bundled by Astro/Vite, one entry)
   tuner state ─► dial scale · LCD · lamps · meter · knob · antenna
              ─► panel (swap, decode, static, resolve) ─► history.pushState
              ─► wall (per-band animation, billboard, noise, ripples, spectrum)
              ─► audio (filters, static, whistle, click) ◄─ player (<audio>)
```

One state object (frequency `f`, `target`, nearest station, distance, strength, locked station) is computed per animation frame by the tuner and read by every other module. Modules never talk to each other directly.

### Components And Responsibilities

| Unit | Kind | Responsibility |
| --- | --- | --- |
| `src/content.config.ts` | build | Station schema and guards |
| `src/lib/dial.ts` | shared TS | Constants (LO, HI, PER, TUNING), band math, spacing guard |
| `src/lib/tuning.ts` (Phase 2) | shared TS, pure | `nearest`, `strengthAt`, `isLocked`, `ease`, `afcPending`, `afcPull`, `nextStation`, `prevStation`, readout and antenna math; unit tested in `tuning.test.ts` |
| `src/lib/sound.ts` (Phase 4) | shared TS, pure | Per-frame sound targets, marquee and time cells, volume angle; unit tested in `sound.test.ts` |
| `src/data/tracks.ts` (Phase 4) | build | The player's tracks; empty until the music rights are confirmed |
| `src/lib/scale.ts` (Phase 2) | shared TS | Dial scale geometry (ticks, marks, needle), used by `Radio.astro` at build time and by the dial script |
| `src/components/Radio.astro` (Phase 1) | markup + CSS | Radio object; station marks as real `<a>` links |
| `src/components/Program.astro` (Phase 1) | markup + CSS | Wall canvas, stage head, panel, footer hint |
| `src/components/Panel*.astro` (Phase 1) | markup | Station panel layouts: about, gallery, case, list, poem, contact |
| `src/components/Player.astro` (Phase 4) | markup + CSS | Music player |
| `src/scripts/main.ts` | client entry | Starts the modules and runs the first frame at once; owns the rAF loop (sleeps when idle) and visibility pause |
| `src/scripts/state.ts` | client | The one state object; `need()` for required DOM hooks |
| `src/scripts/tuner.ts` | client | Inputs (knob, wheel, keys, links, back/forward), easing, AFC, lock |
| `src/scripts/dial.ts` | client | Moves the SVG scale: needle, lit row and ticks, station marks, preset keys, seek links |
| `src/scripts/readouts.ts` | client | LCD digits and key, lamps, meter, knob rotation and slider value, antenna, stage head (cone in Phase 4) |
| `src/scripts/panel.ts` | client | Swap from `<template>`, decode, static overlay, pixel resolve, idle, live region, URL sync |
| `src/scripts/wall.ts` | client | LED wall buffers, animations, billboard, noise, ripples, spectrum |
| `src/scripts/audio.ts` | client | Web Audio graph and per-frame tick |
| `src/scripts/player.ts` | client | Player UI, marquee, time, DIAL FX, volume |
| `src/scripts/rotary.ts` (Phase 4) | client | Turning a knob by hand: tuning and volume |

### Data Model And State

- **Station (build time):** `id` ("work/elancer"), `band`, `key` (LED label), `freq`, `title`, `kicker`, `lede`, `image` + `imageAlt`, `href`, `placeholder`, Markdown body. Phase 1 adds optional `facts` (label/value list), `actions` (label + target station id or URL), `gallery` (images with alt and caption), and `layout` (about | gallery | case | list | poem | contact) so panels match the mock.
- **Embedded client data:** each page includes a small JSON list of stations in dial order (`id`, `row`, `key`, `freq`, `path`, `title`, `name`) plus the current station id in a `<script type="application/json" id="radio-data">`, and one `<template data-panel="<id>">` per other station (and one for the idle panel) with its rendered panel HTML. No runtime fetch.
- **Runtime state (one object):** `stations`, `f`, `target`, `dragging`, `lastMove`, `near`, `dist`, `strength`, `locked`, `afc`, `row`, `df`, `current`, `reduceMotion`; Phase 4 added `audio { ready, playing, fx, volume, level, bins }` (the player and the audio write it; `level` drives the cone, `bins` the wall's spectrum).
- **Tracks:** `src/data/tracks.ts` lists `{ title, src: '/audio/<file>.mp3', credit? }`; one approved excerpt since 2026-11-21 (an empty list removes the player).

### Interfaces And Integrations

- No external services. GitHub Actions builds; GitHub Pages hosts.
- Browser APIs: Canvas 2D, Web Audio (`AudioContext`, `MediaElementAudioSourceNode`, `BiquadFilterNode`, `AnalyserNode`, `OscillatorNode`), Pointer Events with pointer capture, History API, `matchMedia`, `document.fonts`, Page Visibility, `IntersectionObserver`.

### Permissions And Trust Boundaries

- All content is authored by Ahmed at build time; no user input reaches the page. The only trust boundary is the public repository: anything committed is public forever, so private material (music, photos not chosen, contact details, coursework) stays out of git until Ahmed approves it.
- Deploy permissions are limited to the deploy workflow (`pages: write`, `id-token: write`); CI is read-only.

### Important Design Decisions

See `docs/DECISIONS.md`. In short: Astro + TypeScript, no UI framework; one page per station with progressive enhancement; panels embedded as templates rather than fetched; a single rAF loop with a shared state object; Canvas 2D (not WebGL) for the wall; GitHub Pages with manual deploys; music held back until rights are clear.

## Implementation Roadmap

Each phase ends with: `npm run check` clean, `npm run build` clean, a browser check of affected stations at 1440×900, 1024×768 and 390×844, and a short progress note at the end of this file. Stop after each phase and show Ahmed before starting the next.

### Phase 0: Scaffold (done 2026-11-18)

- **Outcome:** repository, Astro 7 + TypeScript, content collection with 14 stations and build guards, readable baseline pages, DSEG fonts self-hosted with the OFL licence, CI on every push, manual deploy workflow with a placeholder gate, AGENTS.md, PRODUCT.md, docs.
- **Verification done:** `npm run build` (15 pages), `npx astro check` (0 errors), spacing and band guards proven to fail the build with a bad station.

### Phase 1: Radio shell and panels (static, no client JS) (done 2026-11-19)

- **Outcome:** every page looks like the reference mock at rest, tuned to its own station, with no JavaScript: the radio on the left and the program area on the right, with the panel styled per station.
- **Dependencies:** Phase 0.
- **Tasks:**
  1. Extend the station schema with `layout`, `facts`, `actions`, `gallery` (FR-02). Move the mock's panel copy into the Markdown files.
  2. Build `Radio.astro`: port the mock's `.radio` markup and CSS (antenna, handle, keys, case, LCD, dial window, plate, lower). Station marks and band keys become `<a href>` links. Render the LCD and meter for the current station on the server (ghost cells `aria-hidden`; a visually hidden "Tuned to 92.9 MHz, Elancer" text for screen readers).
  3. Port the speaker grille SVG generation to build time (Astro frontmatter loop).
  4. Build `Program.astro` and panel components for each layout; replace `StationPage.astro` with a `RadioLayout.astro`.
  5. Scale the radio to fit the viewport height with CSS (`min()` and `dvh`) instead of the mock's JS `fit()`, if achievable; otherwise a tiny inline script.
  6. Draw a static dial scale (ticks, marks, needle at the station) with CSS or inline SVG so the no-JS page looks complete.
- **Files:** `src/content.config.ts`, `src/content/stations/**`, `src/components/Radio.astro`, `Program.astro`, `Panel*.astro`, `src/layouts/RadioLayout.astro`, `src/styles/global.css`, `src/pages/*`.
- **Requirements:** FR-01, FR-02, FR-03 (static), FR-06 (static), FR-11, FR-12 (structure), QR-01, QR-02, QR-05, QR-08.
- **Checks:** with JS disabled every station is reachable from the dial links; axe clean; contrast AA on all real text; the page matches `docs/design/screenshots/` at 1280×800.
- **Acceptance:** Ahmed agrees the static radio matches the mock.
- **Rollback:** revert the phase commits; the Phase 0 baseline still works.

### Phase 2: Tuner engine (done 2026-11-20)

- **Outcome:** the radio works: knob, wheel, keys, links and keyboard tune the dial; AFC and lock behave as in the mock; panels swap with decode and static; URLs follow the dial.
- **Dependencies:** Phase 1.
- **Tasks:**
  1. `src/lib/tuning.ts` pure functions plus `src/lib/tuning.test.ts` (node:test; Node 24 runs TypeScript directly, or add Vitest if imports get awkward). Cover nearest, strength, lock, AFC conditions, next/prev wrap-around, band of a frequency.
  2. `src/scripts/main.ts`: one rAF loop, `document.fonts.ready` start, pause on `visibilitychange`, `reduceMotion` from `matchMedia` (live-updating).
  3. `tuner.ts`: rotary drag with pointer capture (one turn = 2 MHz), wheel (`deltaY × 0.0025`, non-passive only on the dial and knob), keys 1–5, ← →, knob slider keys, link clicks intercepted (`preventDefault`, then tune to the station; modifier-clicks keep normal link behaviour).
  4. `dial-canvas.ts` and `readouts.ts`: the canvas dial, LCD digits and scrambled key, lamps, meter, preset keys, knob rotation, antenna spring and tip.
  5. `panel.ts`: swap panel HTML from `<template>`, slide-in, decode, pixel resolve, static overlay canvas, idle panel, `aria-live="polite"` announcement of the locked station only (not every frame), `history.pushState` on lock and `popstate` retune, `document.title` update.
  6. Data-tune actions (GET IN TOUCH → EMAIL, SEE THE WORK → ELANCER) as links that the tuner intercepts.
- **Files:** `src/lib/tuning.ts`, `src/lib/tuning.test.ts`, `src/scripts/*.ts`, `src/layouts/RadioLayout.astro`, `package.json` (test script).
- **Requirements:** FR-04, FR-05, FR-06, FR-10 (antenna, keys), QR-02, QR-03, QR-04, QR-09.
- **Checks:** unit tests pass; manual: sweep 88→108 with the knob, AFC pulls in from within 0.35 MHz after resting about 0.4 s, lock below 0.06 MHz, back and forward buttons retune, reduced motion makes tuning instant.
- **Acceptance:** tuning feels like the mock or better; Ahmed approves.
- **Rollback:** the script is one entry; removing its `<script>` tag returns the working static site.

### Phase 3: LED wall (done 2026-11-20)

- **Outcome:** the right side comes alive: per-band animations, billboards, noise, ripples.
- **Dependencies:** Phase 2 (state object).
- **Tasks:** port the mock's wall: ghost dot layer cached in an offscreen canvas, red and amber buffers with decay, the five band animations, billboard halftone for stations with images (computed once per image and size), noise between stations, pointer ripples (throttled), lock ripple, resize and DPR handling, about 30 fps cap. Optimise the draw: batch dots by colour and alpha bucket rather than one `fillStyle` per dot; skip frames when nothing is lit and nothing changed. Reduced motion: draw one still frame per station.
- **Files:** `src/scripts/wall.ts`, `src/components/Program.astro`.
- **Requirements:** FR-07, QR-03, QR-04.
- **Checks:** Chrome performance panel: wall frame under 4 ms on a mid-range laptop at 1440×900; no long tasks while idle; phone check (frame rate steady, or reduce dot density on small or low-power screens).
- **Acceptance:** each band reads as its own animation; Ahmed approves.
- **Rollback:** the wall module can be disabled independently (the canvas stays empty).

### Phase 4: Sound and player (done 2026-11-21)

- **Outcome:** music through the radio and dial sound effects.
- **Dependencies:** Phase 2; a licensed excerpt for production (development can use a local, git-ignored file in `public/audio/`).
- **Tasks:** `audio.ts` graph and per-frame tick exactly as direction.md; `Player.astro` and `player.ts` (play/pause, marquee, time, DIAL FX, volume knob wiring, `aria-pressed`, accessible labels with the track title and credit); speaker cone driven by the analyser; spectrum strip on the wall; `src/data/tracks.ts` empty by default, so the player is not rendered.
- **Files:** `src/scripts/audio.ts`, `src/scripts/player.ts`, `src/components/Player.astro`, `src/data/tracks.ts`.
- **Requirements:** FR-08, FR-09, FR-10 (cone), QR-07.
- **Checks:** no audio before a click; Safari/iOS unlock works; tab hidden pauses the loops but not the music; volume and DIAL FX behave; no clicks or pops when filters move.
- **Acceptance:** Ahmed approves the sound.
- **Rollback:** an empty `tracks.ts` removes the player; the FX still need a user gesture.

### Phase 5: Responsive, accessibility, polish

- **Outcome:** great on phones and tablets, fully accessible, Arabic-ready.
- **Dependencies:** Phases 1–4.
- **Tasks:**
  1. Phone layout (done: Ahmed approved `docs/design/reference/phone-mock.html` on 2026-11-21 and it is built; `docs/DECISIONS.md`, 2026-11-21, "The phone layout"). Originally proposed: a compact head unit on top (LCD, preset keys, seek), the dial window full width with drag-to-tune along the rows, the wall as a 160–200 px strip behind the stage head, the panel full width, and the player as a slim bar at the bottom. Touch targets ≥ 44 px.
  2. Tablet layout: radio scaled, program narrower (built 2026-11-22; Ahmed's verdict on four points pending, Open Question 10; `docs/DECISIONS.md`, 2026-11-22).
  3. Accessibility pass: keyboard-only run, screen reader (NVDA + Chrome, VoiceOver if available), focus order, skip link to the panel, live region wording, reduced motion, 200% zoom.
  4. RTL readiness: render a page with `dir="rtl"`; fix physical CSS properties.
  5. Impeccable critique and audit against the reference mock and `docs/design/direction.md`; fix findings.
  6. CSP meta tag (QR-06).
- **Requirements:** QR-01 to QR-08.
- **Checks:** Lighthouse budgets, axe clean on all 15 pages, manual screen-reader script.
- **Acceptance:** Ahmed tries it on his own phone and approves.

### Phase 6: Content and launch

- **Outcome:** real content, live site.
- **Dependencies:** content from Ahmed (`docs/CONTENT.md`), music rights decision, code licence decision.
- **Tasks:** replace every placeholder; optimise photos with `astro:assets` (AVIF/WebP, sizes); design each poem layout with Ahmed; Open Graph image (1200×630, the radio tuned to ABOUT); sitemap and robots.txt; README credits (music credit if used); Pages settings: Source = GitHub Actions; run the deploy workflow; verify the live site; tag `v1.0.0`.
- **Requirements:** FR-11, FR-12, FR-13, FR-14, QR-10.
- **Checks:** deploy gate passes without override; live Lighthouse; all links work; share preview renders (Open Graph).
- **Acceptance:** Ahmed approves the live site. Plan closes.

## Testing And Verification Strategy

### Automated Tests

- `npm run check` (Astro + TypeScript) and `npm run build` on every push (CI).
- Content guards in the build: schema, band range, spacing, alt text.
- Unit tests for `src/lib/tuning.ts` (Phase 2) run in CI.
- Deploy gate: no `placeholder: true` unless overridden.
- Optional (Phase 5): a Playwright smoke test that loads each page, checks the title and that the panel text exists, and runs axe. Add only if it stays cheap to maintain.

### Manual Verification

Per phase, as listed. Browsers: Chrome, Firefox, Safari (or WebKit through Playwright), Chrome on Android, Safari on iOS if available. Viewports 1440×900, 1280×800, 1024×768, 390×844.

### Security Verification

- No secrets or private data in git (review `git diff --staged` before every commit; the `.gitignore` blocks audio).
- CSP present and the console clean of CSP violations.
- `npm audit` reviewed each phase (known: picomatch advisory in build tooling, no fix available; static output unaffected).
- External links `rel="noopener"`; no third-party requests (check the network panel).

### Final Acceptance Matrix

| Requirement | Evidence |
| --- | --- |
| FR-01, FR-02 | Build output lists 15 pages; guard failures demonstrated |
| FR-03, FR-10 | Visual match to screenshots; key, antenna and cone behaviour observed |
| FR-04, FR-05 | Manual tuning script; unit tests; back/forward check |
| FR-06 | Lock, decode, static and idle observed on every station |
| FR-07 | Each band's wall animation and billboards observed |
| FR-08, FR-09, QR-07 | Audio checks in Phase 4 |
| FR-11, FR-12 | Ahmed's content review |
| FR-13 | Lighthouse SEO; share preview |
| FR-14 | Successful manual deploy; gate blocks placeholders |
| QR-01 to QR-03 | No-JS run, axe, screen reader, reduced-motion run |
| QR-04 | Lighthouse and performance-panel numbers |
| QR-05, QR-06 | Network panel shows only same-origin requests; CSP present |
| QR-08 | RTL test page screenshot |
| QR-09 | `npm run check` clean; module boundaries as specified |
| QR-10 | Ahmed's sign-off; zero placeholders |

## Data Migration, Rollout, And Rollback

- No data migration.
- **Rollout:** deploy manually from the Actions tab after Phase 6 (earlier preview deploys are allowed with `allow_placeholders` if Ahmed wants to share progress). Before the first deploy, set Settings → Pages → Source to "GitHub Actions" so GitHub does not publish the raw repository with Jekyll.
- **Rollback:** re-run the deploy workflow on the previous tag or commit (workflow_dispatch lets you pick the ref), or unpublish the site from Settings → Pages.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Canvas wall too heavy on phones | 30 fps cap, batching, visibility pause, lower density or a static wall on small or low-power screens |
| Effects hurt readability | Readable-first rule; panel background opaque enough; reduced-motion path |
| Music rights unclear | Only a 3:24 excerpt Ahmed approved is published; on a takedown, empty the track list (the player hides), remove the file and redeploy |
| Placeholders go live | Deploy gate; launch checklist |
| Private data committed to a public repo | AGENTS.md rules; `.gitignore`; staged-diff review |
| Novelty confuses recruiters | Home is already tuned to ABOUT with a clear pitch and contact button; plain links on the dial |
| Scope creep (blog, CTF, extra sections) | Non-Goals; new ideas go to a new plan |
| Build-tool advisory (picomatch) | Static output; monitor Astro releases |

## Assumptions

- GitHub Pages free hosting is enough (static, low traffic).
- Ahmed will supply real content before launch; the site can be built fully with placeholders until then.
- The mock's numbers (easing, AFC, lock, wall rates) are the target feel; small tuning is allowed if it feels better and Ahmed agrees.

## Open Questions

1. Poems: which ones, and the title of each (Poem I–III are placeholders)?
2. Photos: which photos of Ahmed (portrait for ABOUT, gallery for PHOTOS), with captions?
3. Security: which lab write-ups to publish; what can be shared about the research paper and when?
4. Work: confirm the Laravel and React lists; Elancer screenshots, source link (public or private?), case study timing.
5. Contact: which public email address, and the LinkedIn URL?
6. Music: Ahmed approved publishing an excerpt of the track (0:00–3:24) on 2026-11-21. Still open: its source and credit line.
7. Code licence: all rights reserved (default), MIT for the code with content excluded, or something else?
8. Phone layout: resolved 2026-11-21. Ahmed approved `docs/design/reference/phone-mock.html` with its five points beyond the plan (`docs/DECISIONS.md`).
9. Timeline for the Arabic version and a custom domain.
10. Tablet layout (built 2026-11-22): approve it; on tall tablets keep the radio standing at the bottom or centre it; enlarge the scaled radio's tap areas on touch screens (seek buttons 30px and preset keys 33×15px at 768px wide); shrink the stage on short tablet screens (`docs/DECISIONS.md`, 2026-11-22).

## Decisions

Recorded in `docs/DECISIONS.md` (newest first). Key ones: the Transmission radio concept; the seven-segment LED radio on the left with the Family Radio dial; the LED wall on the right; the station list; no nickname and "cybersecurity graduate" wording; Gaza only in ME; English first, Arabic-ready; Astro + TypeScript without React; GitHub Pages user site, public repository, manual deploys; the music held back until its rights are clear.

## Dependencies And Prerequisites

- Node ≥ 22.23.4 (24 recommended), npm.
- GitHub account `ahmedMhamdan` with Pages enabled (Source: GitHub Actions) before the first deploy.
- Fonts already in the repo: DSEG (OFL-1.1) and Barlow Semi Condensed (OFL-1.1, Fontsource).
- Content from Ahmed for Phase 6.

## Terminal Codex Handoff

```text
Read docs/PLAN.md completely before editing anything.
Work in the ahmedMhamdan.github.io repository root and follow its AGENTS.md (also read PRODUCT.md, docs/design/direction.md and open docs/design/reference/g-radio-wall.html in a browser).
Treat the plan as the approved product and implementation contract. Inspect the current code before relying on file-impact guidance, preserve unrelated dirty work, and do not expand scope.
Implement the plan phase by phase starting with the first phase not marked done, run the specified verification, and keep the plan's requirement IDs in your progress report. Stop after each phase and show Ahmed before continuing.
If current code contradicts the plan or a material decision is missing, stop and ask Ahmed instead of guessing.
```

## Progress And Closure

### Progress Log

- **2026-11-18:** Plan approved (direction, stack, hosting, scope). Phase 0 done: Astro 7.4 scaffold, 14 stations, baseline pages, guards, fonts, CI, manual deploy, docs. Public repository created. CI passed on the first push. GitHub had auto-enabled legacy Jekyll publishing for the *.github.io repository; the Pages source is now "GitHub Actions", so the site stays 404 until the first manual deploy.
- **2026-11-19:** Phase 1 accepted by Ahmed, who asked to go live with it; the first deploy runs as a preview with `allow_placeholders` (13 stations are still placeholders). Static radio shell and panels with no client JavaScript: station schema extended (`layout`, `facts`, `actions`, `gallery`, `tag`, `imagePending`; action targets checked at build) and the mock's panel copy moved into the Markdown (FR-02); `Radio.astro` with band keys, station marks, preset keys and seek buttons as links, a server-rendered LCD and meter, a build-time dial scale SVG and speaker grille, and a CSS-only fit (FR-03 static, QR-01); `Program.astro`, six panel layouts and `RadioLayout.astro` replacing `StationPage.astro` (FR-06 static, FR-11, FR-12 structure); interface strings in `src/lib/ui.ts` and logical properties outside the radio (QR-08). Checks: `npm run check` 0 errors, 0 warnings, 0 hints; `npm run build` 15 pages, 0 scripts, about 5.5 KB gzip HTML plus 5 KB CSS per page; axe 0 violations on all 15 pages at 1280×800 and 390×844, with the contrast cases axe could not decide (gradients, dot grid, SVG scale) computed by hand at ≥ 4.5:1; every page links all 14 stations and every link resolves; only same-origin requests (QR-05); `npm audit` 0 vulnerabilities. Browser check at 1456×910 (screenshot scale), 1280×800, 1024×768 and 390×844. Port choices recorded in `docs/DECISIONS.md` (2026-11-19).
- **2026-11-20:** Phase 2 done and pushed to `main` at Ahmed's request (not deployed yet; deploys stay manual). The radio tunes: knob drag (one turn = 2 MHz), wheel on the dial window and knob, keys 1–5 and ← → anywhere, the knob as a slider (arrows ±0.1 MHz, Page Up/Down, Home/End), and every station link (band keys, marks, preset keys, seek, panel actions) tune instead of loading, while modifier clicks and external links behave normally (FR-04). AFC pulls in from within 0.35 MHz after the dial rests 0.42 s; lock below 0.06 MHz; seek wraps around the dial. The URL, title and a polite announcement change only when the dial settles; back and forward retune without pushing (FR-05). Panels swap from templates with slide-in, decode and pixel resolve; static over the panel between stations, then the idle panel on a solid plate (FR-06). LCD, lamps, meter, scrambled key, preset keys, knob rotation, antenna spring and tip, stage head (FR-10 antenna and keys). Reduced motion: instant tuning, no scramble, jitter, slide, decode or resolve, still static, and the loop sleeps (QR-02, QR-03). Pure tuning math in `src/lib/tuning.ts`, DOM modules in `src/scripts/`, one state object (QR-09). Checks: `npm test` 25/25 (also in CI); `npm run check` 0 errors, 0 warnings, 0 hints; `npm run build` 15 pages, one script of 13.0 KB raw, 5.7 KB gzip (budget 40 KB), pages about 7.5 KB gzip HTML with the embedded panels; a scripted browser run (headless Edge, 35/35) covering every input, AFC, history, deep links, reduced motion, the no-JS fallback and a clean console; axe 0 violations on all 15 pages at 1280×800 and 390×844 and between stations, with the idle plate's text computed by hand at ≥ 5.3:1; `npm audit` 0 vulnerabilities. Performance (QR-04), tuning sweeps at 1456×910: script and render cost per frame median 1.2 ms, p95 2.1 ms, no frame over 16 ms at full CPU speed (before the static and layout fixes: median 5.8 ms, p95 10.5 ms); with the CPU slowed 4×, median 2.6 ms, p95 33 ms (before: 13 ms and 103 ms); the loop sleeps at rest and while the tab is hidden. Screenshots at 1456×910, 1024×768 and 390×844 match the mock. Open for Phase 5: the interim phone layout still shows the keyboard-shortcut hint. Choices recorded in `docs/DECISIONS.md` (2026-11-20).
- **2026-11-20:** Phase 3 done (LED wall). The wall lights the program area: the ME name scroll, WORK bars and scan cursor, SECURITY firewall and packets, POETRY waves, CONTACT Morse "HELLO" and ping arcs, noise and neighbour columns between stations, pointer ripples, a big ring on a press on empty wall, and the lock ripple from the radio's side (FR-07; the music spectrum waits for Phase 4). Billboards: ELANCER's image and PHOTOS' first photo will show as a dot-matrix halftone revealed top-down with an amber scanline; no image exists yet, so both show their band's animation until Ahmed supplies them (tested with an injected image). Reduced motion: one still frame per station, no ripples, the loop sleeps (QR-03). The canvas has one pixel per dot, scaled and masked by CSS over the CSS grid of unlit dots: one `putImageData` per frame, none when nothing changed; about 30 draws per second; it stops when the tab is hidden or the wall is off screen (QR-04). Checks: `npm run check` 0 errors, 0 warnings, 0 hints; `npm test` 25/25; `npm run build` 15 pages, one script of 19.4 KB raw, 8.4 KB gzip (budget 40 KB); a scripted wall run in headless Edge, 27/27 (each band's pattern, ripples, billboard reveal and then no uploads, hidden tab, reduced motion, resize at 1× and 2×, the narrow strip, off-screen pause, clean console); the Phase 2 run 35/35, with its "loop sleeps" checks now taken with the wall hidden, because the wall is meant to keep animating; axe 0 violations on all 15 pages at 1280×800 and 390×844 and between stations; screenshots at 1456×910, 1024×768 and 390×844. Performance at 1440×900 (QR-04), full speed: at rest a whole frame costs median 0.7–0.95 ms, p95 under 1.5 ms, main thread 5–7% busy, no long tasks; tuning sweeps median 3.4 ms (3.0 without the wall), p95 6.7 ms (5.8); the wall's own code 0.3–0.5 ms per wall frame (budget 4 ms); a billboard's halftone is one 16 ms task per image, outside animation frames. With the CPU slowed 4×, headless Edge inflates short tasks 16–25× rather than 4×, so only frame rates are meaningful there: the wall keeps about 25 fps at rest on desktop and 28 fps at 390×844 (3× pixel ratio) once the narrow layout limits it to the strip behind the stage head (6–13 fps before). Open for Phase 5: on the phone-size layout, tuning under 4× runs at about 1–5 fps with or without the wall (the panel's static overlay is part of the cost; profile on a real phone); lit dots sit behind the stage-head text on the phone strip, as the mock's packet lanes do on desktop. Choices recorded in `docs/DECISIONS.md` (2026-11-20, Phase 3).
- **2026-11-20:** Phases 2 and 3 deployed at Ahmed's request: the "Deploy to GitHub Pages" workflow ran on `f19fcfc` with `allow_placeholders` (13 stations are still placeholders), run 44780725132. Live check at https://ahmedmhamdan.github.io: the page loads the client script, key 3 tunes to SECURITY · LAB NOTES (URL and stage head follow), the wall draws 30 frames a second, and the console is clean.
- **2026-11-21:** Phase 4 done (sound and player) on branch `feat/phase-4-sound`; not committed yet. The radio sounds: the graph from `direction.md` (music through highpass, lowpass and gain into an analyser; static from a 2 s noise loop through a 2200 Hz bandpass; a sine whistle; one volume) with the mock's per-frame numbers: static and a whistle between stations, the music muffled and thinned as the signal weakens, a click on every lock, all only while DIAL FX is on; every change glides, and a parameter is sent only when its target moves (FR-09). The "What I listen to" player: play/pause, a 12-cell marquee advancing every 240 ms, mm:ss time, DIAL FX with `aria-pressed`, the track title (and credit) as visually hidden text; the volume knob on the radio is a slider (FR-08). The speaker cone pulses with the music (FR-10) and the wall shows the spectrum (FR-07). Nothing is created or loaded before a press; the audio context sleeps with neither music nor DIAL FX; the volume is remembered for the session only (QR-07). Reduced motion: the sound works as usual; no marquee scroll, cone pulse or spectrum; the loop sleeps while the music plays (QR-03). `src/data/tracks.ts` stays empty: no player, a decorative volume knob, no sound; development uses a git-ignored local list and file. Checks: `npm run check` 0 errors, 0 warnings, 0 hints; `npm test` 36/36 (11 new for the sound math); `npm run build` 15 pages, one script of 25.6 KB raw, 10.9 KB gzip (budget 40 KB). A scripted sound run in headless Edge, 47/47: no audio context, `play()` or audio request before a press, even while tuning; volume keys, drag and session memory; play, marquee, time, cone and spectrum; filters, static, whistle and lock click between and on stations; parameters only glide (no direct jumps) and nothing is sent at rest; DIAL FX off; a hidden tab stops the frames but not the music; pause sleeps the context; DIAL FX pressed first; reduced motion; clean console. Without tracks, 4/4: no player, decorative volume knob, no audio, clean console. The Phase 2 run 35/35 and the Phase 3 run 27/27 with the player present. axe 0 violations on all 15 pages at 1280×800 and 390×844 and between stations, with and without the player, and on the player at rest and playing at 1280×800, 1024×768 and 390×844; the player's text, which axe could not decide over the dot grid, computed by hand at ≥ 5.0:1 (the red readouts 4.6:1) even with a full amber ripple behind it. Screenshots at 1456×910, 1024×768 (the player wraps below the hint) and 390×844; no horizontal overflow. Performance at 1440×900, tuning sweeps at full speed (QR-04): Web Audio calls cost median 0.2 ms, p95 0.4 ms per frame (about 6 calls); whole-frame script median 2.6–3.9 ms with music and DIAL FX against 3.4–3.8 ms without (run-to-run noise), p95 5.6–5.8 ms against 4.9–5.6 ms. With the CPU slowed 4×, headless Edge was too unsteady to compare (sound off also fell to 8–40 frames per sweep); sound on was never slower in paired runs. Not verified here: Safari and iOS (no WebKit available; the context is made and resumed inside the press, and `play()` runs inside it), and the sound by ear (headless runs have no audio output): both are part of Ahmed's acceptance. Choices recorded in `docs/DECISIONS.md` (2026-11-21).
- **2026-11-21:** Phase 4 committed (`b6f23c3` code, `1f4ed36` docs), fast-forwarded to `main` and deployed at Ahmed's request: CI passed on `1f4ed36`, and the "Deploy to GitHub Pages" workflow ran on it with `allow_placeholders` (13 stations are still placeholders), run 44912389368. Live check at https://ahmedmhamdan.github.io: the same client script as the local build (25.6 KB raw, with the audio code); key 3 tunes to SECURITY · LAB NOTES (URL, title and stage head follow); the console is clean. As intended, the live site has no player and no sound: `src/data/tracks.ts` stays empty until the music rights, the excerpt and the credit line are confirmed (`docs/CONTENT.md`, Music), so the volume knob stays decorative there. The sound can be tried locally with a git-ignored track.
- **2026-11-21:** The music is live. Ahmed asked to see Phase 4 on the site with its one track and approved publishing an excerpt (the source of the 66-minute mix, a YouTube download, and its licence are unknown; a takedown could disable the repository). `public/audio/lock-in.mp3` is the mix's first song, 0:00–3:24, ending in the silence before the second song: 4.9 MB, 192 kbps, cut on MP3 frame boundaries without re-encoding, its length header rewritten (the browser reports 204.5 s). It is the one audio file allowed in git, listed in `src/data/tracks.ts`, with no credit line yet (`docs/DECISIONS.md`, 2026-11-21, "The music goes live as an excerpt"; `docs/CONTENT.md`, Music). Checks on a build without the local files, as CI builds: `npm run check` 0 errors, 0 warnings, 0 hints; `npm test` 36/36; `npm run build` 15 pages with the file in `dist/audio/`; the sound run 47/47 with the excerpt; at the end of the track the player stops at 3:24 and shows Play again. Committed as `6390629` on `main`. The HTTPS push failed (HTTP 408: the upload ran at about 10–25 KB/s and GitHub gives up after about 17 s), so, with Ahmed's approval, a temporary write deploy key for this repository pushed it over SSH (the fourth attempt; three were reset by the connection), and the key was then deleted from GitHub and this machine. The "Deploy to GitHub Pages" workflow ran on `6390629` with `allow_placeholders`, run 44924353359. Live check at https://ahmedmhamdan.github.io: the page has the player, `/audio/lock-in.mp3` is served (4,908,929 bytes), and the sound run passes 47/47 against the live site (FR-08, FR-09, QR-07). Still for Ahmed: the sound by ear, Safari and iOS on his phone, and the music's source and credit line.
- **2026-11-21:** Phase 5 started on branch `feat/phase-5-polish`. Task 1: the phone layout proposal, `docs/design/reference/phone-mock.html` (self-contained, fonts embedded, no audio), shown to Ahmed for a verdict (Open Question 8) before it was built (Ahmed approved it on 2026-11-21; see the next entry). It proposes a head unit on top (preset keys, LCD, the dial full width, the name plate between 44px seek buttons; no knob, speaker or volume knob on phones), drag-to-tune along the dial rows (the needle follows the finger; a tap snaps to the nearest station in that row; `touch-action: pan-y`, so a vertical swipe still scrolls), the LED wall as a 144px strip under the panel's top edge with no stage head, an LCD that docks at the top with the seek buttons once half the dial has scrolled away (a seek from it keeps the reader on the panel: the panel holds its height between stations), a 64px player bar at the bottom, and a two-column layout for phones held sideways. Checks in headless Edge with emulated touch, 11/11: drag follows the finger without scrolling the page, AFC locks on release, taps on a station, the track and a band key, a vertical swipe on the dial scrolls without tuning, the dock appears, seeks and returns to the dial, the player toggles, every button is at least 44×44, no errors. Screenshots at 390×844, 360×780 and 844×390 with no horizontal overflow. Dial rows are 32px: a station's tap area is its row cell (at least 32px tall and about 50px wide), above the 24px WCAG AA minimum but under the plan's 44px, a trade for a dial that still leaves the panel's heading on the first screen. The Impeccable detector flags only what `direction.md` already accepts (ghost segments, the LCD and dial glass inside the case) and the wide tracking of the short uppercase labels. Next, unblocked by the mock: tablet layout, accessibility pass, RTL test, CSP (QR-06), Impeccable critique.
- **2026-11-22:** Phase 5, task 1 done: the phone layout, built from `docs/design/reference/phone-mock.html` after Ahmed approved it on 2026-11-21 with its five points beyond the plan (Open Question 8 closed; `docs/DECISIONS.md`, 2026-11-21, "The phone layout"). Up to 699px wide and on phones held sideways: the head unit across the top (preset keys, short antenna, LCD, the five-row dial full width as one scaled drawing, the name plate between 44px seek buttons; no handle, speaker, tuning knob or volume knob) (FR-03); dragging along the dial window tunes, by touch and with a mouse, while vertical swipes scroll the page, a tap on the track tunes to the nearest station of its row, and each lock during a drag gives a short vibration where supported (FR-04); the LED wall as a 144px strip under the panel's top edge, with no stage head (FR-07); the LCD docks at the top with the seek buttons once half the dial has scrolled away, and a press on it goes back to the dial; the panel holds its height between stations; the player is a bar fixed to the bottom (FR-08); safe areas for the notch and home indicator; touch wording for the footer hint and the idle panel (in `src/lib/ui.ts`, QR-08); the About portrait beside the heading, so "Ahmed Hamdan" is on the first screen. The desktop looks as before; its one change is that the dial can be dragged with the mouse. Checks: `npm run check` 0 errors, 0 warnings, 0 hints; `npm test` 39/39 (new `scale.test.ts` for the pointer-to-frequency math); `npm run build` 15 pages, one script of 28.6 KB raw, 12.0 KB gzip (was 25.6 and 10.9; budget 40 KB); a new scripted phone run in headless Edge with emulated touch, 34/34 (layout at 390, 375, 360 and 320 wide, the dial's scale and labels aligned, drag, taps, preset key, vertical swipe, dock, panel hold, seek follow, back to the dial with focus, every button at least 44×44, the player bar, reduced motion, band names clear of the first stations, the sideways layout, the desktop unchanged, mouse drag, a clean console); the Phase 2 run 35/35, the wall run 27/27 and the sound run 47/47; axe 0 violations on all 15 pages at 1280×800, 390×844 and 844×390 (touch), with the dock showing, between stations, and on the player at rest and playing (QR-02; it caught the dock button's spoken name missing its visible text, now fixed); screenshots at 1456×910, 1024×768, 390×844, 375×667, 360×780, 320×640 and 844×390 (and 768×1024, still the interim stack). Performance at 390×844, 3× pixel ratio, CPU slowed 4×, in alternating runs against the live build (QR-04): at rest 53–55 fps (live 57–60), tuning 19–22 fps (live 17–27). Not tested: a real phone, Safari and iOS, and the vibration. Committed (`4702331` code, `e1534a8` docs) and pushed to `main` at Ahmed's request; not deployed. Next: tablet layout, accessibility pass, RTL test, CSP (QR-06), Impeccable critique.
- **2026-11-22:** Phase 5, task 2 built: the tablet layout, 700–959px wide (`docs/DECISIONS.md`, 2026-11-22; `docs/design/direction.md`, "Layout (tablet)"). The desktop layout replaces the interim stack: the whole radio, scaled to fit the height and at most half the width, stands at the bottom of a column as wide as itself (0.74 at 768×1024), and the program takes the rest: the full-height wall, the stage head, the panel scrolling inside, and the footer with the hint and the compact player across it (FR-03, FR-07, FR-08). The page does not scroll; the panel has no backdrop blur (QR-04). Found on the way and fixed: on desktop screens shorter than about 746px (1366×657, 1280×720) the bottom of the radio was cut off; it now takes up only its scaled height. Checks: `npm run check` 0 errors, 0 warnings, 0 hints; `npm test` 39/39; `npm run build` 15 pages, the client script unchanged (12.0 KB gzip; only CSS changed); a new scripted tablet run in headless Edge with emulated touch, 21/21 (768×1024: no page scroll, the whole radio on screen, the column at most half the width, the full radio and stage head, no dock, the panel scrolling inside without blur, the player across the footer, the touch hint, a touch drag along the dial locking a WORK station with the URL, a tap on a station mark, the knob turned by touch, a tap on preset key 1, a 44×44 play button; 820×1180, 744×1133, 700×900, 800×600, 940×760 and 959×1024 without overflow; the desktop at 960 and the phone at 699; a clean console); the phone run 34/34, the Phase 2 run 35/35, the wall run and the sound run all passing; the desktop pixel-identical to `main` at 1456×910, 1440×900, 1280×800, 1024×768, 960×1024 and 1920×1080 on three stations; axe 0 violations on all 15 pages at 1280×800, 768×1024 (touch), 390×844 and 844×390 (touch), with the dock showing and between stations on the desktop and the tablet (QR-02). Performance at 768×1024, 2× pixel ratio, CPU slowed 2×, in alternating runs against `main` (QR-04): at rest 56–60 fps (`main`, the interim stack with a 120px wall strip: 57–59); the tuning measurement is too unsteady in headless Edge to compare (5–17 fps on both builds, and 7–9 fps on the desktop with `main` too). Screenshots at 768×1024, 820×1180, 744×1133, 700×900, 800×600, 940×760 and 959×1024, and before and after the fix at 1366×657. Open for Ahmed: Open Question 10 (approve the layout; the radio's place on tall tablets; tap areas on touch tablets; the stage on short screens). Not tested: a real tablet, Safari. Committed (`e88053d` fix, `88b048b` tablet, and the docs commit after them) and pushed to `main` at Ahmed's request; not deployed. Next: Ahmed's verdict on Open Question 10, then the accessibility pass, RTL test, Impeccable critique and CSP (QR-06).

### Closure Checklist

- [ ] Phases 1–6 accepted by Ahmed
- [ ] Zero placeholders; deploy gate passes without override
- [ ] Live site verified (Lighthouse budgets, axe, links, share preview)
- [ ] Music published only with confirmed rights, or omitted
- [ ] Code licence decided
- [ ] `v1.0.0` tagged

### Closure Outcome

Not closed.
