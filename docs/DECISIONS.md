# Decisions

Newest first. Each entry: context, decision, rationale, consequences. Do not reopen a decision without Ahmed.

## 2026-11-27: A playlist of seven songs, each with its own colour (decided, not built yet)

- **Context:** Ahmed asked for the "What I listen to" player to become a list of songs from his music folder, and for the site to change colour with the song: dark blue for "104.6 Sky FM", the others chosen for him. He was told that these are other artists' songs, that the files would be public in the repository, that a takedown can disable the repository and the site, and that git keeps every committed file.
- **Decision:**
  1. **Seven songs, full length** (Ahmed's choice over short clips; he accepts the risk): Skychaser – 104.6 Sky FM (the "Skychaser" file, not the version with the film quote), Medasin – Magic, blut own – drifting, Sleep Party People – I'm Not Human At All, cult member – u weren't here i really miss you, SILO – MEANINGFUL LOVE, Luvcat – He's My Man. The files, sizes and credit lines are in `docs/CONTENT.md`, "Music".
  2. **A colour per song** while it plays: the LED colour (`--lit`: LCD and dial segments, needle, wall, kickers, the primary button) and a dark tint of it as the ground (page, wall's unlit dots, LCD glass). The radio's case stays black; amber stays for lock, AFC and focus. Ahmed approved the palette: dark blue `#3d7bff` on `#060d18` (104.6 Sky FM), violet, aqua, moon white, rose, lime and wine red (values in `docs/CONTENT.md`). Each LED colour passes 4.5:1 as text on its panel and behind the button's dark text.
  3. **One song per commit and push:** Ahmed's upload is slow, so each song goes up on its own.
- **Still open (ask Ahmed when it is built):** fade back to red on pause (proposed) or keep the song's colour; whether the current track ("you got a lot to finish. let's lock in.") stays in the list; the list's design (proposed: previous, next and a list button; the list opens above the player, a colour dot per song; a tap plays a song; the next starts when one ends).
- **Consequences:** `AGENTS.md` now allows the songs Ahmed chose in `docs/CONTENT.md`; each file is allowed by name in `.gitignore` when it is added. About 48 MB of audio in the repository. Reduced motion: the colour changes without a fade.

## 2026-11-27: ABOUT's content, and the panel first on short desktop windows

- **Context:** The first content station. On Ahmed's laptop (a 1536×730 browser window, a 1920×1080 screen at 125%) the 300px LED stage left the panel 326px tall, and the radio stood in a 520px column with 88px of empty space each side. He asked for more room for the panel: a smaller LED strip and the radio at the left edge, without bigger text on the wall.
- **Decision (layout, desktop):**
  1. **The panel comes first:** the stage is `clamp(144px, 100dvh − 540px, 300px)`, so the panel keeps about 436px and the stage takes the rest, up to 300px from 840px tall. 1536×730: stage 190px, panel 436px (was 326px). 1440×790: 250px. 1366×657: 144px, panel 409px (was 253px). Windows 840px tall and up are unchanged.
  2. **The stage head hides under a 240px stage** (desktop windows under 780px tall), as on phones and short tablets: the wall's words would run into it, and the LCD and the kicker already name the station.
  3. **The radio's column fits the radio:** `452px × fit + 68px`, 34px each side, so a short window's radio stands near the left edge and the program gets the width it frees (1536×730: panel 920px → 1027px wide). At full size the column is 520px as before.
- **Decision (wall):** each ME station scrolls its own words, from a `wall` field in its frontmatter (ME band only; the build checks): ABOUT "HELLO, I'M AHMED", PHOTOS "SNAPSHOTS", STORY "MY STORY" (Ahmed's choice from proposals). The letters stay sized to the stage (14 rows on a 190px stage); Ahmed preferred room for the panel to bigger letters.
- **Decision (ABOUT):** Ahmed's portrait (crop B of his photo, 4:5, no metadata), the pitch line as before, a paragraph in his voice (cybersecurity studies; Jawla, his startup, now; Elancer, finished, before; the gym, boxing, reading and writing poetry; "Tune to the Poetry band to see some of it", since the poems will be pictures), facts (Focus: cybersecurity, application security, software engineering, Laravel, React; Languages; Off the clock: gym, boxing, reading and writing poetry). SEE THE WORK links out to his GitHub; GET IN TOUCH still tunes to EMAIL. ELANCER's status is now "Finished".
- **Decision (ABOUT layout):** the portrait is 30% of the panel, from 240px to 300px (as tall as the panel's content box on his laptop). The two buttons come right after the pitch line, before the paragraph and the facts, so they show without scrolling on every desktop window checked; with the paragraph after the facts they fell 68–203px below the panel's edge. In a panel under 600px wide (phones, tablets) the portrait is full width under the kicker and the heading (Ahmed: the 96px portrait was too small; this replaces that point of the 2026-11-21 phone layout), capped so it is never taller than the screen minus 80px (a phone held sideways: 248×310).
- **Consequences:** CSS, the `wall` field (`content.config.ts`, `stationInfo()`, `wall.ts`) and ABOUT's content. ABOUT is Ready (`placeholder` removed). The test scripts outside the repository were updated for the change (SEE THE WORK now links out) and two timing waits (the tablet run now waits for the URL, which follows a long sweep 4–6 s later in headless Edge, live included); the keyboard run probes the visible part of a focused element.

## 2026-11-27: Ahmed's answers to the critique, and Phase 5 accepted

- **Context:** The Impeccable critique (2026-11-26, below) left four concept points for Ahmed. One more was put to him: the small label above each panel heading (the kicker, such as "ME · ABOUT"), which Impeccable's craft rules discourage but both approved mocks use. Phase 5's acceptance was Ahmed trying the site on his own phone.
- **Decision:** Ahmed approved all four points as built and kept the kickers:
  1. The dial's labels scale with the radio, as in the approved mock, even where that puts them under 12px (about 10px at 1280×800, 8px at 1366×657). This is the one accepted exception to the 12px minimum; the stations are also named in the seek buttons, the LCD and the panel.
  2. The stage head and the footer hint stay as they are, over the wall.
  3. The 404 stays as built: its own "NO SIGNAL" page with a "Back to the dial" button.
  4. The home page's GET IN TOUCH jumps to CONTACT, as now.
  5. The kicker above each panel heading stays.
- **Acceptance:** Ahmed tried the site on his own phone and approved it. Phase 5 is done.
- **Consequences:** No code changes. The music's credit line and the code licence come from Ahmed later (Open Questions 6 and 7); nothing is added for them until he gives them. Next is Phase 6, content, station by station.

## 2026-11-26: Impeccable critique and fixes (Phase 5, task 5)

- **Context:** Plan Phase 5, task 5: an Impeccable critique against the reference mock, `docs/design/direction.md` and `PRODUCT.md`, from two independent assessments. A design review (screens at desktop, tablet and phone sizes, every band, between stations, the keyboard and the 404) rated the site 29 of 36 on its heuristics, "good": the strongest parts are the states (searching, locked, the idle plate), the phone translation of the radio and the accessibility work. The Impeccable detector found nothing in the source; in the browser it flagged only what `direction.md` already accepts (ghost segments, the LCD inside the case, the wide tracking of short uppercase labels) and false positives (the empty photo frame, the dial's SVG).
- **Decision (craft, fixed):**
  1. **The stage head's band and key are red again.** `readouts.ts` writes a new `<b>` on every lock, and the scoped rule did not reach it, so after the first lock they were grey. The rule is now global inside the stage head, as in the mock.
  2. **The footer hint wraps before the player does,** as in the mock: the hint is a flexible column of at least 14rem. At 1280×800 the player stays beside the hint, the footer is 104px instead of 132px and the panel grows from 368px to 396px; the home page's GET IN TOUCH, cut off by 33px before, now loses only its last 5px with the placeholder copy. Every other desktop size is pixel-identical to `main` (1456×910, 1440×900, 1024×768, 960×1024, 1920×1080, on three stations).
  3. **The 404's link is the panel's rubber button** (44px), not amber text: amber stays for lock, AFC and focus.
  4. **Spoken names:** the dial's station links lost a stray space before the frequency ("ABOUT, 88.7 MHz", was "ABOUT , 88.7 MHz"); seek buttons say "GitHub" and "LinkedIn" (were "Github", "Linkedin").
- **Left for Ahmed (concept, not craft):** the dial's labels fall under the 12px minimum when the radio scales to the window (about 10px at 1280×800, 8px at 1366×657), because the approved design scales the whole radio; the stage head and the footer are real text over lit dots; a 404 inside the radio instead of a bare page; whether the home page's GET IN TOUCH should glide across the whole dial or jump.
- **Consequences:** With the final ABOUT copy, check again that GET IN TOUCH shows without scrolling at 1280×800 (`docs/CONTENT.md`). On 1366×657 and 1024×768 the panel has to scroll to reach it.

## 2026-11-25: Content Security Policy (Phase 5, task 6; QR-06)

- **Context:** QR-06 asks for a policy in a `<meta http-equiv>` tag (GitHub Pages cannot set headers), adjusted only if Astro's output needs hashes.
- **Decision:** `default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; form-action 'none'`, as the first tag after the charset in `Base.astro`, in production builds only (the dev server injects its own scripts). No hashes are needed: each page has one external module script, and its JSON page data is a data block the browser never runs. `'unsafe-inline'` for styles covers Astro's small inlined stylesheets (the 404 page) and the inline `style` the scripts set. `data:` images are the LED dot grid and its mask. `base-uri` and `form-action` are additions to the plan's list: they do not fall back to `default-src`, and the site has no forms.
- **Consequences:** A meta policy cannot set `frame-ancestors` (browsers ignore it there), so other sites could still frame the pages; GitHub Pages offers no header for it. Checked on all 15 built pages: no violation on load, while tuning, with the music and Web Audio, DIAL FX, the volume, wall ripples and the phone dock.

## 2026-11-25: Right-to-left check (Phase 5, task 4; QR-08)

- **Context:** Before an Arabic version, every layout and panel was rendered with `<html dir="rtl" lang="ar">`.
- **Found:** The page already mirrors: the radio moves to the right, the program to the left, panels, lists, facts and contact rows start on the right, and the tablet and desktop players follow the page direction. The radio, the segment readouts, the dock and the phone's player bar stay left to right on purpose (a physical dial). Outside the radio, the only physical CSS is the wall canvas's `left: 0` (on purpose: the dot grid starts at the top left either way).
- **Decisions:**
  - The short-window player (zoomed desktop, 2026-11-25) uses logical padding and follows the page direction, like the tablet's.
  - On the LED wall, what faces the radio mirrors with it, as the lock ripple already did: WORK's scan cursor runs towards the radio, SECURITY's firewall stands on the radio's side with the packets running into it, and CONTACT's pings spread from the radio's edge. Text (the name scroll) never mirrors.
- **Consequences:** English text in a right-to-left page puts its final full stop on the left (".from the start"); that is how browsers lay out English in a right-to-left paragraph and goes away with Arabic text. The left-to-right site is unchanged (the wall run passes as before).

## 2026-11-25: Accessibility pass fixes (Phase 5, task 3)

- **Context:** The accessibility pass (keyboard, focus, skip link, live region, reduced motion, 200% and 400% zoom, target size, text spacing, forced colours; WCAG 2.2 AA) found five things to change. NVDA is not installed on this machine, so the screen-reader check was done on the browser's accessibility tree, not by ear.
- **Decisions:**
  1. **Focus never hides under the phone's bars** (WCAG 2.4.11). On phones the page has `scroll-padding`: 64px at the top for the docked LCD and 72px at the bottom for the player bar (8px and 64px on a phone held sideways), so a link reached with Tab, the skip link's target and the panel after a seek from the dock all stop clear of both. It replaces the panel's `scroll-margin-top`, which did the last of these.
  2. **Short desktop windows: the stage gives way.** A 1920×1080 screen zoomed to 200% is a 960×540 window, where the 300px stage left the panel 136px tall. The desktop stage is now `clamp(144px, 100dvh − 357px, 300px)`: 300px on every window 657px tall and up (so every common laptop window, 1366×657 included, is pixel-identical to before), and below that the panel keeps the 253px it has at 1366×657. A stage under 240px (desktop under 597px tall) has no stage head, as on short tablets.
  3. **No fixed bars in a zoomed phone layout.** In the phone layout with a mouse and under 400px tall (a desktop zoomed to 200–400%: 1280×800 at 200% with the browser's toolbars is about 640×357, at 400% 320×200), the dock and the fixed player bar would cover a third to two thirds of the screen. There the player sits at the end of the page, as on a tablet, and the dock stays hidden (`dock.ts`). Phones never match: upright they are taller, held sideways they are touch.
  4. **One announcement, not two.** When the tuning knob has focus, its value text already says the station ("95.4 MHz, Work, React"), so the live region stays quiet instead of repeating "Tuned to Work, React".
  5. **Windows High Contrast keeps the radio.** In forced colours the radio, the docked LCD and the player keep their own colours (`forced-color-adjust: none`; their text already meets AA), so they still look like a radio; the panel and the rest of the page take the visitor's colours.
- **Known and left for Ahmed:**
  - On phones 320–360px wide, LAB NOTES (96.8 MHz) sits 4px after the band name "SECURITY", and touches it when a visitor enlarges letter spacing (WCAG 1.4.12). The dial is a fixed drawing and positions come from frequencies, so the fix is in the content: start SECURITY at 97.2 MHz or higher when its stations are chosen (`docs/CONTENT.md`).
  - Zoom enlarges the panel's text but not the radio's on the desktop and the tablet: the radio scales to fit the window's height, so at 200% its labels stay about the size they were. Every station is also reachable by keyboard (1–5, arrows), and the phone layout, which a 1280px-wide window reaches at 200%, shows the dial full width.
- **Consequences:** CSS and two small script changes (`dock.ts`, `panel.ts`); the client script is still 12.0 KB gzip (11,990 bytes, 53 more). Desktop windows 657px tall and up are pixel-identical to before.

## 2026-11-25: The tablet layout approved, with Ahmed's four answers (Open Question 10)

- **Context:** The tablet layout (2026-11-22, below) left four points open for Ahmed.
- **Decision:** Ahmed approved the layout and answered the other three:
  1. **Approved** as built.
  2. **Centre the radio.** On every tablet the radio is centred in the screen height, from the antenna tip to the bottom of the case: the column's padding holds the antenna above the case (176px at full size, scaled) and 15px each side. At 768×1024 that leaves about 180px above and below; at 820×1180 about 230px. When the height is what limits the scale (an 800×600 window), it fills the height as before.
  3. **Larger tap areas on touch tablets.** On touch screens (`any-pointer: coarse`) the seek buttons, the volume knob and the preset keys get tap areas of about 44px without changing their look: invisible pseudo-elements sized 44px divided by the radio's scale. A seek button reaches outwards, away from the volume knob, and the volume knob 6px each side, so they meet halfway across the 12px gap. Measured at 768×1024: seek buttons 44×44 (drawn 30), volume knob 46×46 (drawn 37), preset keys 37×42 (drawn 33×15; the width is the key pitch, and the case covers the key's last 2px). The dial rows stay 29px, as drawn; a tap on the track tunes to the nearest station in its row.
  4. **A shorter stage on short screens.** On tablet screens shorter than 756px the stage gives up height first, `clamp(144px, 100dvh − 456px, 300px)`, so the panel keeps about 336px; it never gets shorter than the phone's 144px strip. At 800×600 the panel is 338px tall (was 180px).
- **Added with point 4, for Ahmed's review:** under 696px tall the stage is under 240px, and the stage head is hidden there, as on phones. The ME band's name scroll is sized to the stage, and at 144px its letters ran into the stage head's text. The LCD and the panel's heading already name the station. The stage head keeps its grid row, so nothing moves.
- **Consequences:** CSS only (`Radio.astro`, `Program.astro`); the client script is unchanged. The desktop at 960px and up is pixel-identical to before, and phones are unchanged (their seek buttons are already 44px and their preset keys keep their own taller target). Still not tested on a real tablet or in Safari.

## 2026-11-22: The tablet layout (Phase 5; approved 2026-11-25 with the answers above)

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
