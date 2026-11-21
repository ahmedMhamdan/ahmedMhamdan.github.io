# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 (static output, one real HTML page per station) + TypeScript. Content as Markdown in an Astro content collection. The radio, LED wall and audio are vanilla TypeScript modules (Canvas 2D, Web Audio, Pointer Events) shipped as small client scripts. No React or other UI framework runtime. Hosting: GitHub Pages user site (https://ahmedmhamdan.github.io); a custom domain may come later.

## Users

- Recruiters and clients hiring remote full-stack (Laravel + React) or security talent, scanning quickly between other candidates.
- Scholarship and admissions committees reading for the person, the story, and seriousness.
- People who know Ahmed personally or arrive for his poetry, browsing slowly for pleasure.

## Product Purpose

The professional home of Ahmed Hamdan: a cybersecurity graduate and full-stack developer (Laravel + React) who also writes poetry. Success: a visitor remembers him after one visit, understands what he builds, and has a clear way to contact him.

## Positioning

The site itself is the proof of skill: a working radio you tune by hand, an LED wall that answers the signal, music that plays through the radio. One idea, the radio signal, drives navigation, rendering and sound. Inspired by the "one idea drives everything" rule of experimental portfolios; it copies none of them.

## Operating Context

- Visitors arrive from a CV link, LinkedIn, GitHub, or a shared message, on laptops during work hours and on phones.
- Five bands (sections) with stations (pages): ME (About, Photos, Story), WORK (Elancer, Laravel, React), SECURITY (Lab notes, Research; light, Ahmed picks the items later), POETRY (each poem a designed piece), CONTACT (Email, GitHub, LinkedIn).
- Music: a "What I listen to" player, bottom-right. One track for now (jazz piano). The music plays through the radio: clean when tuned, filtered with static while the dial moves.
- Excluded for now: gaming channel content, a log/updates feed, a CTF hunt.

## Capabilities and Constraints

- English at launch; architecture ready for a full Arabic (RTL) version later.
- Static only: no backend, no database, no accounts, no tracking.
- Audio plays only after a visitor action.
- Coursework answers are never published before deadlines; lab write-ups only from labs on Ahmed's own machines.
- Undecided: final project and security list, poem selection, photo set, public email, LinkedIn URL, the music's source and credit line, code licence.

## Brand Commitments

- Public name: Ahmed Hamdan. Professional tone. No nickname or call sign anywhere on the site.
- Describe him as a cybersecurity graduate, never as a student.
- Gaza appears only in the ME section (About/Story), honestly, never as the headline idea.
- Direction chosen by Ahmed: a full physical radio on the left in seven-segment LED style (matte case, red LED segments with ghost cells, piano preset keys 1 to 5) using the Family Radio dial: one continuous 88 to 108 MHz dial in five band rows, a segmented needle, a draggable tuning knob, signal meter, auto-lock (AFC), text decoding out of static on lock. On the right, a full-bleed LED wall with a different animation per band, plus a content panel for text, images and poems.

## Evidence on Hand

- Elancer: a real bilingual (English/Arabic) Laravel + React freelance marketplace, in progress. Source link and screenshots to be supplied.
- Security coursework and labs (advanced ethical hacking, wireless security, digital forensics); team research topic: AI-assisted SQLi/XSS detection. Selection pending.
- Poems and photos: to be provided by Ahmed.
- Music: one local track (about 66 minutes, source and licence unknown). Public release needs publishing rights and a short excerpt; until then no audio file ships.
- No testimonials, clients, metrics, or awards exist. Do not invent any.

## Product Principles

1. Show, don't claim: the signal mechanics are the proof of skill.
2. One idea drives everything: navigation, rendering, sound.
3. Readable first: every word exists as real, selectable HTML under the effects.
4. Personal over corporate: his voice, his poems, his photos.
5. Light enough for weak connections and mid-range phones.

## Accessibility & Inclusion

Real HTML text under any canvas; full keyboard tuning; a reduced-motion version (still wall, instant tuning, no decode scramble); no autoplay audio; WCAG AA contrast for all real text (unlit ghost segments are decorative and aria-hidden); captions or a text description for any audio content.
