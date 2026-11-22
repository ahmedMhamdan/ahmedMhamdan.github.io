# Decisions

Newest first. Each entry: context, decision, rationale, consequences. Do not reopen a decision without Ahmed.

## 2026-11-22: The tablet layout (Phase 5; built, awaiting Ahmed's verdict)

- **Context:** Plan Phase 5, task 2: "radio scaled, program narrower", for screens 700–959px wide. Until now this range had the interim stack (the full radio, then the program, and the page scrolled), so on a 768×1024 iPad the panel started below the bottom of the screen.
- **Decision:** The desktop layout, adapted (`RadioLayout.astro`, `Radio.astro`, `Program.astro`, `Player.astro`, all under `(max-width: 959px)`, with the phone rules after them):
  - The whole radio as on the desktop (handle, antenna, preset keys, LCD, dial, plate, speaker, tuning knob, seek buttons, volume knob), scaled to fit the screen height, as on the desktop, and at most half the width. Its column is as wide as the scaled radio plus 24px each side, and it stands at the bottom of the column, as on the desktop. At 768×1024 it is scaled to 0.74 (336px wide), at 820×1180 to 0.81.
  - The program takes the rest of the width: the full-height LED wall, the stage head (12px, 0.2em tracking), the panel and the footer, with 16px side margins. The page does not scroll; the panel scrolls inside, as on the desktop.
  - The panel has no backdrop blur, as on phones, so a wall frame never makes the browser repaint it; it is 94% opaque instead of 90%.
  - The player uses the phone's compact size (44px play button, 15px marquee, 64px tall) across the footer, under the hint: the desktop player, about 415px wide, does not fit a column of 350–480px.
  - No docked LCD and no panel hold, since the page does not scroll. Touch tablets get the touch wording, as phones do.
  - Found on the way, a desktop fix: on screens shorter than about 746px (1366×657, a common laptop window, or 1280×720) the bottom of the radio was cut off, because the radio is scaled with a transform while its layout box stayed 722px tall. A negative top margin of the height the scale removes makes it take up only its scaled height. At 746px tall and above the desktop is pixel-identical to before.
- **Rationale:** The plan's wording. A tablet keeps the whole instrument, knob and speaker included, and the panel's heading is on the first screen.
- **Open for Ahmed (Open Question 10):**
  1. Approve the layout.
  2. On tall tablets the radio stands at the bottom with empty space above the antenna (about 430px at 820×1180). Keep it, or centre the radio vertically?
  3. Scaled, the radio's controls fall under the 44px target rule on touch tablets. At 768px wide the seek buttons are 30px, the dial rows 29px, the preset keys 33×15px and the volume knob 37px (the tuning knob is 91px). All but the preset keys meet the WCAG 2.2 AA minimum of 24px, and the preset keys repeat the band keys on the dial. Proposed: enlarge the seek buttons' and preset keys' tap areas on touch screens without changing their look, as the phone's preset keys do.
  4. An 800×600 window leaves the panel 180px tall, because the stage stays at the desktop's 300px (the desktop has the same on short screens). Shrink the stage on short tablet screens?
- **Consequences:** The desktop at 960px and up is unchanged, apart from the short-screen fix. Only CSS changed; the client script is still 12.0 KB gzip. Not tested on a real tablet or in Safari.

## 2026-11-21: The phone layout (Phase 5)

- **Context:** The plan's phone proposal (Phase 5, task 1) was drawn as `docs/design/reference/phone-mock.html` and shown to Ahmed with five points that go beyond the plan. Ahmed approved the mock and all five points on 2026-11-21 (Open Question 8).
- **Decision:** Build the mock for screens up to 699px wide and for phones held sideways (landscape, at most 520px tall, coarse pointer). The five approved points:
  1. No tuning knob, speaker or volume knob on phones: the dial is dragged instead, and phones have volume buttons.
  2. No stage head ("SIGNAL · BAND · KEY") on phones: the LCD and the panel already name the station, and no text sits over lit dots.
  3. The wall strip is 144px tall (the plan said 160–200px), and the panel overlaps its last 16px.
  4. Dial rows are 32px, not 44px. A station's target is its row cell (at least 32px tall and about 50px wide at 390px), above the WCAG 2.2 AA minimum of 24px, and a tap on the track tunes to the nearest station in that row. This keeps the panel's heading on the first screen.
  5. Once half the dial has scrolled away, its LCD docks at the top with the seek buttons.
- **Build details:**
  - Dragging along the dial window tunes, by touch, pen or mouse, on every screen size: a press becomes a drag once it has moved 6px sideways and more sideways than down. The needle follows the pointer along the row under it (`freqAtPoint` in `src/lib/scale.ts`), and on release AFC takes over. On a phone that can vibrate, each lock during a drag gives an 8ms tick. `touch-action: pan-y` leaves vertical swipes to the page. A tap on a station link tunes as a link does, a tap on the track tunes to the nearest station in that row, and the click that ends a mouse drag is ignored. On a desktop the dial window shows a sideways-arrow cursor. This adds an input to the desktop, which the mock does not have.
  - The docked LCD (`src/scripts/dock.ts`) is a second copy of the seek links and the LCD cells; `dial.ts` and `readouts.ts` update both. A press on its LCD scrolls back to the dial and focuses the current station's mark. A seek from it brings the new panel into view under it (`scroll-margin-top: 64px`). It shows on upright phones only, and stays hidden without JavaScript.
  - Between stations the panel keeps its last height on phones, so the page never shrinks under a finger on the dial. The height comes from a `ResizeObserver`, never from a read in a frame.
  - The wall's stage now ends at the panel's top edge (`panel.offsetTop`) on every layout. On a desktop that is the same line as before.
  - In a panel narrower than 600px, the About portrait (96px) sits beside the kicker and the heading, so "Ahmed Hamdan" is on the first screen (its top at 651px of 844 on a 390×844 screen).
  - The phone panel has no backdrop blur, so a wall frame never makes the browser repaint it; it is 96% opaque instead.
  - The player is a bar fixed to the bottom of the screen: 64px, or 56px on a phone held sideways, plus the home-indicator area. The page ends above it.
  - Safe areas: the viewport meta has `viewport-fit=cover`, and the head unit, the dock and the player keep clear of the notch and the home indicator with `env(safe-area-inset-*)`.
  - On touch screens (`(hover: none) and (pointer: coarse)`) the footer hint reads "Drag along the dial or tap a station" and the idle panel "Let go near a station and it locks in." Both wordings are in the HTML (`src/lib/ui.ts`), and CSS shows one.
  - Under 360px wide, the band names and station names have tighter letter spacing, so they clear the first stations at 320px.
  - On a phone held sideways, the page has two columns: on the left, the head unit stays in place, centred in the screen height, without antenna or keys; on the right, the program scrolls (wall strip 112px). There is no dock in this layout.
  - Tablets (700–959px) keep the interim stacked layout until task 2.
- **Rationale:** The dial is the site's one idea, so on a phone it gets the full width and the finger, and the parts a phone does not need (knob, speaker, volume) give it room. The dock and the panel hold keep the radio at hand while reading without a layout jump.
- **Consequences:** The client script is 12.0 KB gzip (was 10.9). The desktop looks as before; its one change is that the dial can be dragged. Not tested yet: a real phone, Safari and iOS, and the vibration.

## 2026-11-21: The music goes live as an excerpt

- **Context:** Ahmed asked to see Phase 4 on the live site with its one track. The track is a 66-minute jazz piano mix (95 MB) downloaded from YouTube; its source and licence are unknown. Live audio has to be in the public repository, and a takedown could make GitHub disable the repository and the site. Ahmed chose a short excerpt over the full mix and confirmed it may be published.
- **Decision:** Publish the mix's first song, 0:00 to 3:24, as `public/audio/lock-in.mp3`. It ends in the silence before the second song, so the player never cuts off mid-phrase. That made it 4.9 MB, not the 2:45 and 4 MB first proposed. The file is cut on MP3 frame boundaries without re-encoding (192 kbps; its length header is rewritten), is the one audio file allowed in git (by name in `.gitignore`), and is listed in `src/data/tracks.ts`. There is no credit line while the source is unknown.
- **Rationale:** An excerpt keeps git history and phone data small (it loads only on a press of play) and limits what is exposed while the rights are unclear; a natural ending sounds finished.
- **Consequences:** The live site has the player and the radio sound. If a takedown comes, empty `published` in `tracks.ts`, remove the file and redeploy. Still open: the source and a credit line.

## 2026-11-21: Phase 4 sound and player details (for Ahmed's review)

- **Context:** Porting the mock's sound and player (plan Phase 4) needed some calls the mock and the plan leave open.
- **Decisions:**
  - The audio graph, the per-frame numbers, the glide times, the lock click and the default volume are the mock's (`direction.md`, Sound). Every change glides (`setTargetAtTime`), and a parameter is sent only when its target moves, so a radio at rest sends nothing. Dial speed is measured as in the mock (MHz per 60 Hz frame, smoothed) at any refresh rate.
  - Nothing exists before a press: the first press of play or DIAL FX makes the audio context inside the click, which also unlocks iOS. The track file loads on the first press of play only (its URL waits in a data attribute, so nothing is fetched before).
  - The first play turns DIAL FX on, as in the mock, unless the visitor has already set DIAL FX themselves.
  - The audio context sleeps while there is neither music nor DIAL FX (battery), and wakes on the next press.
  - The player and the sound exist only when `src/data/tracks.ts` lists a track. With the committed empty list there is no player, the volume knob stays decorative and the radio is silent (DIAL FX lives in the player).
  - The player is rendered hidden and the script shows it: without JavaScript it could not play.
  - Volume knob: a slider from 0 to 100% (arrows ±5, Page Up/Down ±10, Home/End), turned by hand like the tuning knob (a 270° sweep covers the range), remembered for the session only (`sessionStorage`). Both knobs share the drag code (`src/scripts/rotary.ts`).
  - Speaker cone: the mock's peak level with a short fall-off, so it pulses rather than jitters. The grille's SVG scales on its own compositor layer, so the pulse never repaints the holes.
  - Wall spectrum: the mock's 48 bins, up to 6 cells, 35% amber, standing on the stage's last row.
  - Reduced motion: music and dial sounds work as usual, but the marquee holds still, the cone does not pulse, the wall shows no spectrum and the frame loop sleeps while the music plays. The time readout still counts.
  - Marquee: a "." lights the decimal point of the cell before it, as DSEG14 draws it, so it takes no cell of its own; other punctuation is dropped, as in the mock.
  - A track that cannot load stops the player instead of showing "playing".
  - Footer: when the column is too narrow for the hint and the player side by side (1024×768, for example), the player wraps below the hint and the footer row grows. Below 480px the player tightens its gaps and its marquee to 16px. Phase 5 designs the phone player.
  - Segment readouts always run left to right (`direction: ltr` on `.seg`), so the player's cells stay over their ghosts in a right-to-left page.
  - Screen readers: the player is a region named "What I listen to"; the visible caption with the same words is hidden from them; the track title (and credit, when there is one) is visually hidden text; DIAL FX is a toggle button with `aria-pressed`, its visible text as its name.
  - Development uses a git-ignored `src/data/tracks.local.ts` that lists a git-ignored file in `public/audio/`. The committed `tracks.ts` stays empty, and CI never has either file.
- **Open for Ahmed:** if the music's licence requires a visible credit, where it goes (today it is read with the title by screen readers only; the README credits come in Phase 6).
- **Consequences:** The client script is 10.9 KB gzip (was 8.4). With the committed empty track list the pages look and behave as in Phase 3.

## 2026-11-20: Phase 3 LED wall details (for Ahmed's review)

- **Context:** Porting the mock's LED wall (plan Phase 3) needed a drawing method that stays cheap on phones, and some calls the mock and the plan leave open.
- **Decisions:**
  - The unlit dot grid stays the CSS background of the program area (as in Phase 1). The wall canvas has one pixel per LED; CSS scales it up 8× without smoothing (`image-rendering: pixelated`) and a CSS mask with the same 8px grid cuts each cell to its 5×5 dot. A frame is one `putImageData` of a few thousand pixels, skipped when nothing changed, and the canvas does not depend on the pixel ratio. This replaces the plan's offscreen ghost layer and the batched `fillRect` per lit dot: a first version did that, and between stations it cost about 1–3 ms per frame; the image version costs about 0.3–0.5 ms.
  - Brightness is the pixel's alpha (256 levels), so there are no brightness buckets.
  - Billboards: a case study's image or a gallery's first photo, as in the mock (ELANCER, PHOTOS); the ABOUT portrait keeps the name scroll. The build makes a 320px WebP and puts its URL in the station data. It loads as the dial approaches; the halftone is computed once per image and wall size, in the image's own task, not in an animation frame. Until an image exists (none does yet) the band animation stands in.
  - The animations, decay, noise, ripples and lock ripple use the mock's numbers. Decay scales with real frame time; draws are at most about 30 per second.
  - The stage is measured from the stage head (the 300px row gives 36 rows, as in the mock). The ME name scroll is drawn from `ui.siteName` at stage height − 8 rows, at least 10.
  - The lock ripple starts on the radio's side of the wall: left, or right in a right-to-left page.
  - A press on the panel or on a control does not send the big ripple ("empty space" in the direction); the mock excluded only buttons and links.
  - Reduced motion: one still frame per station (ME shows the name from its first letter, the other bands their frame at 3 s, as the mock), noise between stations from a fixed seed so the frame does not flicker, redrawn only when the station or the dial position changes, and no ripples.
  - While it is on screen with motion allowed, the wall keeps the frame loop running (the wall is alive by design). It stops when off screen (IntersectionObserver) or when the tab is hidden. The Phase 2 "loop sleeps at rest" now holds for the radio alone.
  - In the interim narrow layout (below 960px) the lit wall is only the 120px strip behind the stage head. Behind the panel it was hidden anyway, and a wall changing under the panel made the browser redo the panel's backdrop blur every frame: on a phone-sized screen with the CPU slowed 4× that cut the wall from about 28 to 6–13 fps.
  - The music spectrum on the wall waits for the audio in Phase 4.
- **Consequences:** The client script is 8.4 KB gzip (was 5.7). Pages without JavaScript look as before.

## 2026-11-20: Phase 2 tuner details (for Ahmed's review)

- **Context:** Making the radio tune (plan Phase 2) needed some calls the mock and the plan leave open, and two places where the mock's look failed the accessibility rules.
- **Decisions:**
  - The dial scale stays the SVG rendered with the page (`src/lib/scale.ts`); the script moves the needle and recolours ticks and marks. The plan named a canvas module (`dial-canvas.ts`); the module is `src/scripts/dial.ts` and draws nothing, so the no-JS dial and the live dial are the same drawing.
  - Easing and AFC use the mock's numbers per 60 Hz frame, converted so they feel the same at any refresh rate. The antenna spring runs in fixed 60 Hz steps.
  - Seek (← →, Page Up/Down, the seek links) counts from where the dial is heading, so repeated presses walk station by station during a glide. Grabbing the knob mid-glide holds the dial where it is.
  - The address bar, title and screen-reader announcement change only when the dial settles on a station, never during a sweep; back and forward retune the dial. The slider's value follows the target. Home and End on the knob go to the first and last station.
  - Reduced motion: tuning is instant, the station key and meter do not scramble or jitter, the antenna stays still, panels swap without slide, decode or pixel resolve, and the static is a still frame.
  - Between stations the idle words sit on a solid plate above the static, like a set's on-screen display. In the mock the static covered them; that failed AA on real text.
  - After a mouse drag the knob keeps focus without a focus ring (`:focus-visible`); the amber ring shows for keyboard focus.
  - The volume knob stays decorative (`aria-hidden`) until the player exists (Phase 4).
  - The script does not wait for `document.fonts.ready`: the first frame runs at once, so the slider has its value immediately. Nothing measures text, so late fonts change nothing.
  - Every page embeds the other stations' panels as `<template data-panel>` (about +2 KB gzip per page) instead of fetching them.
  - Unit tests use `node:test` on the TypeScript sources (`npm test`, also in CI); `@types/node` is the one new dev dependency.
  - Static is drawn from a precomputed pool of noise pixels, and the panel swap never reads layout mid-frame; this cut tuning frame cost about fourfold in the profiler.
- **Consequences:** The site ships one client script (about 5.7 KB gzip). Without it every page still works as in Phase 1.

## 2026-11-19: Phase 1 port details (for Ahmed's review)

- **Context:** Porting the reference mock's radio and panels to static Astro pages (plan Phase 1) needed a few small calls the mock does not make.
- **Decisions:**
  - Placeholder images are marked empty frames ("PLACEHOLDER"), not the mock's stock photos, which must not reach the live site (`docs/CONTENT.md`).
  - Preset key digits use 12px (AGENTS minimum; the mock had 11px) and a lighter unpressed colour (`--key-digit`, 5.2:1); the pressed key face is slightly darker so the lit digit passes 4.5:1. The mock's values failed AA on the key face.
  - Preset keys repeat the band keys in the dial window, so they are pointer-only links (`aria-hidden`, out of the tab order); the band keys carry the names.
  - Without JavaScript the knob and volume are decorative; they become sliders when the tuner script runs. The footer hint reads "Pick a station on the dial" until then, because the 1–5 and arrow-key shortcuts need the script.
  - The radio scales to the viewport with CSS only (`tan(atan2())` turns two lengths into a ratio), replacing the mock's `fit()` script.
  - The radio keeps its left-to-right shape in a right-to-left page (`direction: ltr` on the object); the page and panel layouts mirror.
  - Below 960px wide an interim stacked layout (radio, then panel, page scrolls) stands in until the phone design in Phase 5.
- **Consequences:** Phase 1 ships no client JavaScript. The station schema gained `layout`, `facts`, `actions`, `gallery`, `tag` and `imagePending`.

## 2026-11-18: Starter scope and repository

- **Context:** Ahmed approved the design and asked for a repository with starter code and docs, to continue in a fresh session.
- **Decision:** Public repository `ahmedMhamdan/ahmedMhamdan.github.io` (GitHub Pages user site). Starter = scaffold, content model, readable baseline pages, fonts, CI, a manual deploy workflow with a placeholder gate, docs. The radio itself is built from Phase 1 onward.
- **Rationale:** A user site gives the clean URL `ahmedmhamdan.github.io` for free; manual deploys keep placeholders off the live site.
- **Consequences:** Everything committed is public: no music, private photos, personal email or local paths in git. Pages must use "GitHub Actions" as its source before the first deploy.

## 2026-11-18: Stack: Astro + TypeScript, no React

- **Context:** Ahmed first asked for React, then said not to use React if it makes the site worse or heavier.
- **Decision:** Astro 7 static output + framework-free TypeScript for the radio, wall and audio.
- **Rationale:** The site is content plus one custom interactive object; a UI framework adds runtime weight without benefit. Astro gives real HTML per station, content collections and image optimisation.
- **Consequences:** Client code is plain DOM, Canvas and Web Audio modules sharing one state object.

## 2026-11-18: Layout: full radio left, LED wall right

- **Context:** Earlier mocks had a compact radio and a program area with a signal strip. Ahmed wanted the left side to be a full radio and the right side to be bolder, with an animation per category.
- **Decision:** The left column is a complete physical radio; the right is a full-bleed LED wall with per-band animations behind the content panel (reference mock `g-radio-wall.html`).
- **Consequences:** The phone layout needs its own design (Phase 5).

## 2026-11-18: Music

- **Decision:** A "What I listen to" player bottom-right with one track for now (jazz piano), playing through the radio with dial sound effects.
- **Consequences:** The file stays out of git until rights and an excerpt are confirmed.

## 2026-11-18: Identity wording

- **Decision:** Public name Ahmed Hamdan; no nickname or call sign anywhere; "cybersecurity graduate", never "student"; professional tone.

## 2026-11-17: Direction: seven-segment LED radio with the Family Radio dial

- **Context:** Four directions were compared as live mocks (Received Pictures, The Family Radio, The Tuner Display, and a standard portfolio for reference).
- **Decision:** Mix the seven-segment LED tuner look with the Family Radio's dial mechanic: one continuous dial in five band rows; you tune to reach a section, with a radio-signal feel.

## 2026-11-17: Concept, scope and language

- **Decision:** The "Transmission" concept. Bands: ME (About, Photos, Story), WORK (Elancer, Laravel, React), SECURITY (Lab notes, Research; light, items chosen later), POETRY (poems as designed pieces), CONTACT (Email, GitHub, LinkedIn). Excluded for now: gaming channel content, an updates log, a CTF hunt. Gaza only in the ME band. English at launch, Arabic-ready. Free subdomain first.
