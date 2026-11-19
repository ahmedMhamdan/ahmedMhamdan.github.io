import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { BAND_IDS, bandRange } from './lib/dial';

// Panel layouts from the reference mock (docs/design/direction.md, "Panel layouts").
//   about    portrait + heading, lede, facts, actions
//   gallery  heading + grid of photos with captions
//   case     optional image + heading, lede, facts (meta row), actions
//   list     heading, body text and optional labelled rows (facts)
//   poem     poem title + verse (the Markdown body)
//   contact  heading + one large link row per CONTACT station
export const LAYOUTS = ['about', 'gallery', 'case', 'list', 'poem', 'contact'] as const;

// One Markdown file per station: src/content/stations/<band>/<slug>.md
// The entry id (e.g. "me/about") is also the page URL (/me/about/).
const stations = defineCollection({
  loader: glob({ base: './src/content/stations', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        band: z.enum(BAND_IDS),
        // Label shown in the 14-segment display: at most 9 cells, capitals, digits and spaces only.
        key: z.string().max(9).regex(/^[A-Z0-9 ]+$/),
        freq: z.number().min(88).max(108),
        title: z.string(),
        layout: z.enum(LAYOUTS),
        kicker: z.string().optional(),
        lede: z.string().optional(),
        // Small amber tag after the heading, for example "DRAFT LIST".
        tag: z.string().optional(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        // An image belongs here but has not been supplied: renders an empty, marked frame.
        imagePending: z.boolean().default(false),
        // Contact stations link out; other stations may link to source or a live demo.
        href: z.string().optional(),
        // Label/value pairs: the facts list (about), the meta row (case) or the rows (list).
        facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
        // Buttons. `to` is a station id ("contact/email"), `href` an external URL.
        // With neither, the button shows disabled (not available yet).
        actions: z
          .array(
            z.object({
              label: z.string(),
              to: z.string().optional(),
              href: z.url().optional(),
              primary: z.boolean().default(false),
            }),
          )
          .default([]),
        // Photos for the gallery layout. An entry without an image is a marked empty frame.
        gallery: z
          .array(z.object({ image: image().optional(), alt: z.string().optional(), caption: z.string() }))
          .default([]),
        // Anything not yet supplied or confirmed by Ahmed. Placeholders render visibly marked.
        placeholder: z.boolean().default(false),
      })
      .superRefine((s, ctx) => {
        const { lo, hi } = bandRange(s.band);
        if (s.freq <= lo || s.freq >= hi) {
          ctx.addIssue({ code: 'custom', message: `${s.freq} MHz is outside the ${s.band} band (${lo}–${hi}).` });
        }
        if (s.image && !s.imageAlt) {
          ctx.addIssue({ code: 'custom', message: 'imageAlt is required when image is set.' });
        }
        if (s.imagePending && (s.image || !s.placeholder)) {
          ctx.addIssue({ code: 'custom', message: 'imagePending needs placeholder: true and no image.' });
        }
        s.actions.forEach((a, i) => {
          if (a.to && a.href) ctx.addIssue({ code: 'custom', message: `actions[${i}]: use either to or href, not both.` });
        });
        s.gallery.forEach((g, i) => {
          if (g.image && !g.alt) ctx.addIssue({ code: 'custom', message: `gallery[${i}]: alt is required with an image.` });
          if (!g.image && !s.placeholder)
            ctx.addIssue({ code: 'custom', message: `gallery[${i}] has no image; the station must be placeholder: true.` });
        });
      }),
});

export const collections = { stations };
