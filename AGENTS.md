# AGENTS.md: ahmedmhamdan.github.io

Canonical instructions for any coding agent (Codex, Claude Code, others) working in this repository. `CLAUDE.md` only imports this file.

## What this is

The personal portfolio of **Ahmed Hamdan**, a cybersecurity graduate and full-stack developer (Laravel + React) who also writes poetry. The site is a radio: a full physical radio on the left (seven-segment LED display, a five-row FM dial from 88 to 108 MHz, a tuning knob, a speaker), and a full-bleed LED wall plus content panel on the right. Tuning the dial is the navigation. Each station is a real static page.

Live URL (after the first manual deploy): https://ahmedmhamdan.github.io

## Read before working

1. `PRODUCT.md`: who it is for, brand commitments, constraints (Impeccable product brief).
2. `docs/README.md`: map of the docs.
3. `docs/PLAN.md`: the build plan, phases, requirements (FR/QR IDs) and acceptance checks. Work phase by phase.
4. `docs/design/direction.md`: the design contract: tokens, anatomy, motion, sound, the wall animations, and the exact tuning numbers.
5. `docs/design/reference/g-radio-wall.html`: the approved interactive mock. **It is the visual and behavioural spec.** Port it faithfully; do not redesign it.
6. `docs/CONTENT.md`: what content exists, what is a placeholder, what Ahmed still has to supply.
7. `docs/DECISIONS.md`: decisions already made. Do not reopen them without Ahmed.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server (background) | `npx astro dev --background`, then `npx astro dev status`, `npx astro dev logs`, `npx astro dev stop` |
| Type and template check | `npm run check` |
| Unit tests (tuning math, `node:test`) | `npm test` |
| Production build | `npm run build` (outputs `dist/`) |
| Preview the build | `npm run preview` |

Node >= 22.23.4 (CI uses Node 24). The dev and preview servers bind to `127.0.0.1` (see `astro.config.mjs`). Stop any server you start before you finish.

## Project map

```
src/
  content.config.ts        station collection schema (band, key, freq, title, ...) with build-time guards
  content/stations/<band>/<slug>.md   one file per station; id = URL (/work/elancer/), me/about is "/"
  lib/dial.ts              dial constants (88–108 MHz, 4 MHz per band, tuning numbers) and spacing guard
  lib/stations.ts          getStations() in dial order (with guards), stationPath(), HOME_ID, neighbours, spokenName, stationInfo() (with the billboard image)
  lib/tuning.ts            pure tuning math (nearest, strength, lock, AFC, seek, readouts, antenna); tests in tuning.test.ts
  lib/scale.ts             dial scale geometry shared by Radio.astro (build) and scripts/dial.ts and tuner.ts (run time: the needle, the frequency under a pointer); tests in scale.test.ts
  lib/sound.ts             pure sound and player math (per-frame sound targets, marquee, time, volume); tests in sound.test.ts
  lib/ui.ts                interface strings in one place (Arabic-ready)
  data/tracks.ts           the playlist in playing order (title, artist, file, colours); songs Ahmed approved only (docs/CONTENT.md, Music); a git-ignored tracks.local.ts may list local files for development
  scripts/main.ts          client entry: state, one rAF loop that sleeps when idle and while the tab is hidden, and the power-on (the radio opens switched off and tunes in to the page's station)
  scripts/state.ts         the one shared state object (tuner writes, everything else reads)
  scripts/tuner.ts         inputs (knob, dial drag, wheel, keys, links, back/forward), easing, AFC, lock
  scripts/dial.ts          moves the SVG scale: needle, lit row, marks, preset keys, seek links
  scripts/readouts.ts      LCD (and the docked LCD), lamps, meter, knob slider, antenna, stage head, speaker cone
  scripts/dock.ts          phones: the LCD docked at the top once the dial scrolls away, seek follow, the panel's height held between stations
  scripts/panel.ts         panel swap from <template>, decode, pixel resolve, static, idle, URL/title/announcement
  scripts/wall.ts          LED wall: band animations, billboards, noise, ripples, music spectrum; one canvas pixel per dot, scaled and masked by CSS; its LED colour follows the song
  scripts/ledfont.ts       the wall's 5×7 dot-matrix font (1×, or 2×/3× smoothed with Scale2x/Scale3x)
  scripts/audio.ts         Web Audio graph (music through the radio, static, whistle, lock click) and its per-frame tick; made on the first press only
  scripts/player.ts        "What I listen to" playlist: starts on the first click or tap, play/pause, previous/next, the song list, marquee, time, DIAL FX, each song's colours, and the volume knob on the radio
  scripts/rotary.ts        turning a knob by hand (pointer capture, angle deltas): tuning and volume knobs
  layouts/Base.astro       html shell, fonts, meta
  layouts/RadioLayout.astro      every station page: radio left, program right; complete without JS
  components/Radio.astro   the radio object at rest (LCD, dial scale SVG, links, speaker grille built at build time), its phone head unit and the docked LCD
  components/Program.astro LED wall (dot grid, canvas, mask), stage head, panel, footer hint and player
  components/Player.astro  music player markup and the song list (a popover), rendered only when tracks.ts lists a song
  components/Panel*.astro  panel layouts: about, gallery, case, list, poem, contact (+ PanelHead, Pic, Actions)
  pages/index.astro        home (ME · ABOUT)
  pages/[...slug].astro    every other station
  pages/404.astro          "NO SIGNAL"
  styles/global.css        design tokens, @font-face for DSEG, segment readout classes
  styles/panel.css         panel layout styles (global, scoped under .view; container queries)
public/fonts/              DSEG7/DSEG14 Classic Bold woff2 + SIL OFL licence (keep the licence file)
docs/                      plan, design contract, reference mock, content inventory, decisions
.github/workflows/         ci.yml (every push), deploy.yml (manual only)
```

Client modules load from one `<script>` in `RadioLayout.astro` (entry `src/scripts/main.ts`); each returns a render function that reports whether it still needs frames. Sound and the player start only when the page has a player. Keep them framework-free TypeScript.

## Hard rules

### Identity and copy
- Public name is **Ahmed Hamdan**. No nickname, handle or call sign anywhere in the site, metadata, alt text, or commit-visible copy.
- Describe him as a **cybersecurity graduate**, never a student.
- Gaza appears only in the ME band (About/Story), never as a headline or tagline.
- Never invent testimonials, clients, metrics, awards, employers, dates or project claims. Unknown content stays a visible placeholder with `placeholder: true`.
- English at launch. Keep text out of images and canvases so an Arabic (RTL) version can follow: use logical CSS properties (`margin-inline`, `inset-inline-start`) in new CSS.

### Privacy and safety (public repository)
- Never commit audio files, unreleased photos, private notes, credentials or `.env` files. `public/audio/` and `*.mp3` are git-ignored on purpose; the exceptions are allowed by name in `.gitignore`: the excerpt Ahmed approved, `public/audio/lock-in.mp3`, and the seven full songs he chose on 2026-11-27 for the playlist, accepting the takedown risk (list in `docs/CONTENT.md`, "Music"). Any other music ships only after Ahmed confirms it. Push each song in its own commit (his upload is slow).
- Never commit Ahmed's personal email address, phone number, student ID, or local machine paths. Contact details are added only when Ahmed confirms them.
- Lab write-ups only from labs on Ahmed's own machines; no coursework answers before their deadlines; nothing that targets third-party systems.
- No analytics, trackers, third-party embeds, or external font/CDN requests. Self-host everything.

### Design
- Impeccable is the design authority for this project. The approved direction is fixed (see `docs/DECISIONS.md`). Port the reference mock; improve craft, not concept.
- Real text is HTML. Canvas (wall, dial scale, static) is decoration and must be `aria-hidden="true"`.
- Unlit ghost segments (`--ghost`) are decorative only and always `aria-hidden`. All real text meets WCAG AA (4.5:1 normal, 3:1 large).
- Minimum text size 12px. No glow shadows on text. One accent (`--lit`), amber (`--amber`) only for lock/AFC/focus.
- Respect `prefers-reduced-motion`: instant tuning, no decode scramble, still wall, no image pixel-resolve.

### Behaviour and performance
- Audio starts only after a user gesture, never before. The music starts on the visitor's first click or tap anywhere on the page (Ahmed, 2026-11-27), never from a key press alone, and not again in a session once they pause it; the next song follows when one ends.
- Every station is reachable by plain links and by keyboard (1–5 bands, arrow keys, knob as `role="slider"`).
- Tuning to a station updates the URL with `history.pushState` to its real page; back/forward retunes the dial.
- Canvas loops pause when the tab is hidden and when nothing changes; target 60 fps on a mid-range laptop and a stable frame rate on mid-range phones.
- Budget: initial JS under 40 KB gzip, no runtime dependencies beyond Astro's output.

## Working rules

- Build phase by phase from `docs/PLAN.md`. Each phase ends with `npm run check`, `npm test` and `npm run build` passing and a browser check of the affected stations.
- Commit and push only when Ahmed asks. Use clear conventional messages (`feat(radio): ...`, `docs: ...`).
- Deploy is manual: Actions tab → "Deploy to GitHub Pages" → Run workflow. It refuses to deploy while any station has `placeholder: true` unless `allow_placeholders` is ticked.
- Record new decisions in `docs/DECISIONS.md` (newest first) and update `docs/CONTENT.md` when content arrives.
- Audit note: Phase 0 saw a picomatch ReDoS advisory in build tooling (static output unaffected); on 2026-11-19 `npm audit` reports 0 vulnerabilities. If it returns, do not run `npm audit fix --force` (it downgrades Astro); re-check when Astro updates.

## Astro documentation

Full documentation: https://docs.astro.build

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Client-side scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
- [Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
