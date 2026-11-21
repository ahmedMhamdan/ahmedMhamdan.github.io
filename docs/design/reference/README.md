# Reference mock

`g-radio-wall.html` is the approved design, as a single self-contained HTML file. It is the visual and behavioural spec for the build. It is a mock, not production code: port its behaviour into the typed modules described in `docs/PLAN.md`; do not ship this file.

## Open it

Open the file directly in a browser, or serve this folder on loopback, for example:

```sh
npx serve docs/design/reference -l tcp://127.0.0.1:5178
```

Stop the server when finished.

- Fonts load from Google Fonts and jsDelivr in the mock only. The real site self-hosts them.
- The music player expects `/audio/1.mp3`, which is not in the repository (rights not cleared). Without it the player shows its UI but plays nothing; tuning and the visuals still work.
- `img/p1005.jpg` and `img/p0.jpg` are stock placeholders from picsum.photos (Unsplash licence), standing in for Ahmed's portrait and an Elancer screenshot.
- Everything labelled PLACEHOLDER, DRAFT LIST, TO CHOOSE or TO CONFIRM is placeholder content.

## Phone layout (Phase 5, approved 2026-11-21)

`phone-mock.html` is the phone layout Ahmed approved on 2026-11-21 (plan Phase 5, task 1; Open Question 8). It is the visual and behavioural spec for phones, as `g-radio-wall.html` is for the desktop; it is not production code. The build follows it; `docs/design/direction.md` (Layout, phone) has the numbers.

- Open it in a wide window to see a board of four live frames (first screen, reading, tuning, phone on its side), or open it on a phone or in a narrow window to use it directly. `?state=top|read|tune|land` opens one state.
- Self-contained: the DSEG and Barlow Semi Condensed fonts (SIL OFL 1.1) are embedded, so it fetches nothing. It has no audio: the player only shows its states.
- What it shows: a head unit on top (preset keys, LCD, the five-row dial full width, the name plate between the seek buttons; no knob, speaker or volume knob); drag along a dial row and the needle follows the finger, a tap tunes to the nearest station in that row, a vertical swipe still scrolls; the LED wall as a 144px strip with the panel overlapping its last 16px and no stage head; once half the dial has scrolled away, its LCD docks at the top with the seek buttons (a tap on it scrolls back to the dial); the player as a 64px bar at the bottom; on a phone held sideways, the head unit on the left and the program on the right.
