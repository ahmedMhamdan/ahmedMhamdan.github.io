# Design direction contract: Transmission

The approved direction for the site. The interactive source of truth is `reference/g-radio-wall.html`; this file names its parts and records its numbers so they survive the port. When this file and the mock disagree, the mock wins unless Ahmed has decided otherwise in `../DECISIONS.md`.

Screenshots: `screenshots/g-me-about.png` (ME · ABOUT, tuned), `screenshots/g-work-elancer.png` (WORK · ELANCER with the billboard).

## The world

- **Concept:** Transmission. The site is a radio; tuning is navigation; one signal drives text, light and sound.
- **Left:** a full physical portable radio in seven-segment LED style: matte dark case, red LED segments over unlit ghost cells, rubber and bakelite controls, chrome antenna. The dial is the Family Radio dial: one continuous 88–108 MHz band printed as five rows, one per section, with a segmented needle.
- **Right:** a full-bleed LED wall (dot matrix) that answers the signal with a different animation per band, behind a dark content panel for the readable content, and a music player.
- **Tone:** precise, warm, a little playful. Instrument, not nostalgia: no wood grain, no sepia, no skeuomorphic gloss beyond what makes the object read.
- **Not:** a copy of any existing portfolio; a terminal/hacker cliché; neon glow.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ground` | `#121110` | page ground, wall off-dots base |
| `--case` | `#211d1a` | radio case mid-tone (gradient `#2a2522 → #1c1917 58% → #171412`) |
| `--lit` | `#ff3b1f` | lit LED segments, primary accent, primary button |
| `--ghost` | `#2b1915` | unlit segments, inactive ticks; decorative only, `aria-hidden` |
| `--amber` | `#ffb000` | lock state, AFC lamp, malicious packets, wall secondary, focus ring |
| `--text` | `#e6dad3` | headings and body on the panel |
| `--label` | `#c2b3ab` | default UI labels |
| `--quiet` | `#9a8c85` | secondary labels (≥ 4.5:1 on the case and panel) |
| `--dimlabel` | `#9a7a70` | only on the darkest grounds (LCD, dial window); check contrast where used |
| `--rubber` | `#24211f` | buttons and keys |
| `--rule` | `#2a2725` | hairlines, panel edge |
| LCD glass | `#0b0a09` | LCD background, inset shadow |
| Dial glass | `#0d0c0b` | dial window background |
| Wall off-dot | `#1d1310` | unlit LED dots |

Body text on the panel uses `#d8ccc5`. Selection: `--lit` background, black text.

## Type

- **Barlow Semi Condensed** (300, 300 italic, 400, 500, 600, 700, 800), self-hosted via Fontsource. Labels: 700, 12–13px, letter-spacing 0.14–0.26em, uppercase. Headings: 600, 2.6rem, line-height 1.02. Lede 1.3rem/1.45. Body 1.15rem/1.55, max 62ch. Poems: 300 italic, 1.55rem/1.6, max 40ch, `white-space: pre-line`.
- **DSEG7 Classic Bold** for numbers (frequency 56px, band digits 13px, time 15px, preset keys 11px).
- **DSEG14 Classic Bold** for the station key (22px, 9 cells) and the player marquee (20px, 12 cells).
- Segment readouts are two stacked spans: ghost cells (`~` lights all segments, `188.8` for frequency) and lit text. A space must be written as `!` (blank cell of equal width) or the cells misalign.
- Minimum size 12px anywhere. No text-shadow glow.

## Layout (desktop reference 1280×800)

- Page: CSS grid `520px | 1fr`, full viewport, no page scroll; the panel scrolls internally.
- **Radio** 452×722 (plus about 196px of antenna, handle and keys above), bottom-centred in its column, scaled down to fit the viewport height (`scale = min(1, (innerHeight − 30) / 918)`).
- **Case:** radius 28px, padding 22/22/24, rows `144px 204px 30px 1fr`, gap 12px, four screws in the corners.
  - **LCD** (row 1): "FM" label, frequency (DSEG7 56px), "MHz" top right; status line: station key (DSEG14 22px), TUNED lamp (`--lit` when locked), AFC lamp (`--amber` while AFC pulls), 10-bar signal meter (bars 9–10 amber).
  - **Dial window** (row 2): five rows `78px | 1fr`; band key = band number (DSEG7) + band name; station marks positioned at `(freq − 88 − band×4) / 4 × 100%`. Canvas overlay: 41 ticks per row (major every 10), active row ticks `rgba(255,59,31,.55)`, others `--ghost`; station marks 5×6px (amber when locked, red on the active row, `#3a201a` otherwise); needle dashed 4px-on/3px-off across all rows, 4px wide and solid red inside the active row, 2px at 35% elsewhere.
  - **Plate** (row 3): "AHMED HAMDAN" (800, 15px, 0.26em) and "CYBERSECURITY · FULL-STACK" (600, 12px, 0.12em), no wrapping.
  - **Lower** (row 4): speaker 212px (SVG grille: rings r = 12…96 step 10, holes r 2.6, about one hole per 10px of circumference, alternate rings offset) and controls: tuning knob 122px with red grip dot, "TUNING" label, previous/next seek buttons 40px, volume knob 50px (−135° to +135°).
- **Above the case:** antenna 7×180px at −13°, chrome gradient, ball tip, red tip lamp when locked; carry handle; five piano preset keys 44×20px (pressed key drops 7px and lights red).
- **Program** (right): wall canvas fills the column. Overlay grid rows `300px | 1fr | 104px`, side padding 48px.
  - Stage head: "SIGNAL" left; right "BAND · KEY · 88.7 MHz" (band and key in `--lit`) or "SEARCHING".
  - Panel: radius 10px, `rgba(18,17,16,.9)`, 1px `--rule` inset edge, `backdrop-filter: blur(2px)`, padding 28/32, internal scroll, static canvas overlay (`mix-blend-mode: screen`).
  - Footer: hint "**Turn the dial** · 1–5 jump to a band · ← → next station"; player on the right.
- **Panel layouts:** about (240px portrait 4:5 + text, facts list, two actions), gallery (4 columns, 4:5), case (image 16:8 + text, meta row, actions), list (rows with right-aligned category labels), poem, contact (large link rows with right-aligned labels; active row in `--lit`).
- **Buttons:** 44px tall, radius 6px, `--rubber` with a 3px bottom shadow; primary = `--lit` with dark text. Pressed state moves 2px down.

Phone and tablet layouts are not designed yet (plan Phase 5).

## Tuning model

| Quantity | Value |
| --- | --- |
| Range | 88.0–108.0 MHz, 4 MHz per band row |
| Easing | each frame `f += (target − f) × 0.075`; snap when `|target − f| < 0.002`; reduced motion: `f = target` |
| Knob | one full turn = 2 MHz; while dragging `f = target` (direct) |
| Wheel | `target −= deltaY × 0.0025` on the dial window and knob |
| Keyboard | 1–5 band presets (first station of the band); ← → previous/next station (wraps); knob focused: arrows ±0.1 MHz, Page Up/Down next/previous |
| AFC | when not dragging, ≥ 420 ms since the last move, `|target − f| < 0.01`, and the nearest station is 0.004–0.35 MHz away: `target = station.freq`, AFC lamp on (also on while gliding to a station target within 0.35) |
| Lock | distance < 0.06 MHz |
| Strength | `max(0, 1 − distance / 0.4)` |
| Idle panel | not locked and strength < 0.15 |
| Station key readout | every 70 ms; locked: the key; otherwise each character survives with probability `strength × 0.8`, else a random letter (or blank when strength ≤ 0.15) |
| Meter | `round(strength × 10 − (locked ? 0 : random × 2))` bars |
| Knob angle | `(f − 88) / 2 × 360°` |
| Antenna spring | `v += −a × 0.08 − v × 0.12 + Δf × −60; a += v`; angle `−13° + clamp(a, ±9°)` |

On lock: click sound, station mark turns amber, panel shows the station, stage head updates, a ripple runs from the left edge of the wall (centre y = 45% of the wall, strength 0.9, radius up to 90% of the width).

## Content panel motion

- Slide-in of panel children: 550 ms `cubic-bezier(.16,1,.3,1)`, from `translateY(14px)` with `blur(3px)` and opacity 0; 60 ms stagger.
- Decode: `[data-decode]` text resolves left to right over 600 ms; unresolved characters are random `a–z0–9` (spaces kept).
- Image pixel-resolve: block sizes 40 → 26 → 16 → 10 → 6 → 3px, 95 ms per step, then the real image.
- Static overlay: 200×120 canvas, reddish noise (`r = v`, `g = 0.45v`, `b = 0.35v`, half the pixels transparent), opacity `min(0.9, (1 − strength) × 0.95)`, zero when locked.
- Reduced motion: none of the above; content appears at once.

## LED wall

- Dot pitch 8px, lit dot 5×5px inset 1.5px; off dots `#1d1310` pre-rendered once per resize.
- Stage = top 292px (`STG` rows); the panel sits below it, and the lower wall still shows faint motion.
- Two intensity buffers (red, amber); writes keep the maximum; per-frame decay 0.74 (0.35 for the ME name scroll so letters stay crisp; 0 with reduced motion). Amber draws over red. About 30 fps.
- **ME:** "AHMED HAMDAN  ·  " rendered to a bitmap at stage height (Barlow 800), scrolling 14 cells/s.
- **WORK:** bar columns every 2 cells, heights `3 + (sin(k·1.7)·.5+.5)(sin(k·.27)·.5+.5)(STG−5)`, scrolling 6 cells/s, top cell full intensity, body 55%; an amber scan cursor sweeps right to left at 40 cells/s.
- **SECURITY:** an amber firewall line at 26% of the width (every other row); packet lanes every 3 rows, 3 packets per lane, speeds `22 + (lane mod 5) × 7` cells/s, moving right to left. Normal packets (red) pass through; every sixth is malicious (amber) and bursts into a ring at the firewall.
- **POETRY:** layered sine waves: main red `sin(x·.07 + t)·sin(x·.019 − .32t)` at ±38% of the stage, amber `sin(x·.041 − .6t)` at ±20% (40% intensity), two faint red waves lower on the wall (22% and 16%).
- **CONTACT:** Morse "HELLO" scrolling 9 cells/s across the stage middle (3 rows thick, 3 cells per dit); two amber ping arcs expanding from the left edge.
- **Billboard:** stations with an image (PHOTOS, ELANCER) show the image as an LED halftone (luminance^1.4, threshold 0.12), revealed top-down at 34 rows/s with an amber scanline, instead of the band animation.
- **Noise between stations:** `180 × (1 − weight)` random red dots, plus flickering vertical columns where neighbouring stations sit (mapped ±2 MHz across the width).
- **Ripples:** pointer move (at most every 140 ms) strength 0.45, radius 9 cells; pointer down on empty space strength 1, radius 40; growth 0.045 cells/ms.
- **Spectrum:** while music plays, 48 analyser bins → amber bars up to 6 cells tall at the stage bottom (35%).
- Animation weight: 1 when locked, otherwise `strength × 0.6`.

## Sound

Created only after the first click on play or DIAL FX.

```
<audio> → MediaElementSource → highpass → lowpass → music gain → analyser (fft 256) → volume → output
white noise (2 s loop) → bandpass 2200 Hz, Q 0.5 → noise gain → volume
sine oscillator (whistle) → whistle gain → volume
```

Per frame (`fx` = DIAL FX on, `moving = min(1, speed × 40)`):

- Noise gain: 0 when locked and still; otherwise `fx × ((1 − strength) × 0.09 + moving × 0.05)`.
- Whistle: frequency `220 + distance × 5200` Hz; gain `fx × (1 − distance / 0.4) × 0.018` when 0.02 < distance < 0.4, else 0.
- Clarity `c = fx ? (locked ? 1 : strength × 0.8) : 1`: highpass `20 + (1 − c) × 650` Hz, lowpass `1500 + c² × 17000` Hz, music gain `0.3 + 0.7c`. All parameter changes use `setTargetAtTime` (0.03–0.08 s) to avoid clicks.
- Lock click: 1300 Hz square, gain 0.04 → exponential ramp to silence in 35 ms (only when DIAL FX is on).
- First play sets the source and turns DIAL FX on. Default volume 0.8.

Player: play/pause button 56px; marquee of the track title in 12 DSEG14 cells, advancing every 240 ms while playing; elapsed time `mm:ss` in DSEG7; "WHAT I LISTEN TO" caption; DIAL FX toggle with a lamp (`aria-pressed`). The track title is also available as visually hidden text.

## Accessibility rules for this world

- Ghost cells, canvases and the speaker are `aria-hidden`; every readout has a text equivalent (sr-only text or `aria-valuetext` on the knob, for example "92.9 MHz, Elancer").
- Station marks and band keys are links; the knob and volume are sliders; seek buttons have labels.
- The live region announces only lock changes ("Tuned to Work, Elancer").
- Focus ring: 2px `--amber`, offset 4px.

## Detector notes

Impeccable's detector flags two things in this world on purpose: low contrast on unlit ghost segments (decorative, hidden from assistive tech) and nested cards for the LCD and dial windows (glass panes set into one physical object, not stacked cards). Both were reviewed and accepted on the mock. Real text must still pass contrast.
