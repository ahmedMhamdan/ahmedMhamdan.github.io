import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { BAND_IDS, bandRange } from './lib/dial';

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
        kicker: z.string().optional(),
        lede: z.string().optional(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        // Contact stations link out; other stations may link to source or a live demo.
        href: z.string().optional(),
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
      }),
});

export const collections = { stations };
