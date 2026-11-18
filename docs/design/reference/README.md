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
