// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages user site: served from the domain root, no `base` needed.
export default defineConfig({
  site: 'https://ahmedmhamdan.github.io',
  // Local dev and preview stay on loopback only.
  server: { host: '127.0.0.1' },
});
