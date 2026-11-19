# ahmedmhamdan.github.io

Portfolio of **Ahmed Hamdan**: cybersecurity graduate and full-stack developer (Laravel + React).

The site is a radio. Turn the dial on the left to tune between five bands (Me, Work, Security, Poetry, Contact); the LED wall on the right answers the signal, and the music plays through the radio.

> Status: work in progress. The radio and station panels are live as static pages (no JavaScript yet), with placeholder content still marked as such. Tuning, the LED wall and audio come next, ported from the approved design in `docs/design/reference/`.

## Stack

[Astro](https://astro.build) 7 + TypeScript, static output, hosted on GitHub Pages. No UI framework runtime; the radio is plain TypeScript with Canvas 2D and Web Audio.

## Develop

```sh
npm ci
npx astro dev --background   # http://127.0.0.1:4321
npm run check
npm run build
```

Docs for contributors and coding agents: [`AGENTS.md`](AGENTS.md), [`docs/`](docs/README.md).

## Credits

- Seven-segment fonts: [DSEG](https://www.keshikan.net/fonts-e.html) by keshikan, SIL Open Font License 1.1 (`public/fonts/DSEG-LICENSE.txt`).
- Barlow Semi Condensed by Jeremy Tribby, SIL Open Font License 1.1, via Fontsource.
