# Decisions

Newest first. Each entry: context, decision, rationale, consequences. Do not reopen a decision without Ahmed.

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
