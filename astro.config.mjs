// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

const fontsource = (pkg, file) => `./node_modules/${pkg}/files/${file}`;

export default defineConfig({
  site: 'https://charliebrockmeier.com',
  output: 'static',
  trailingSlash: 'never',
  redirects: { '/contact': '/recruiter' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-sans',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource-variable/schibsted-grotesk', 'schibsted-grotesk-latin-wght-normal.woff2')],
            weight: '400 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Jersey 10',
      cssVariable: '--font-pixel',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource/jersey-10', 'jersey-10-latin-400-normal.woff2')],
            weight: 400,
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource/newsreader', 'newsreader-latin-400-normal.woff2')],
            weight: 400,
            style: 'normal',
          },
          {
            src: [fontsource('@fontsource/newsreader', 'newsreader-latin-400-italic.woff2')],
            weight: 400,
            style: 'italic',
          },
        ],
      },
    },
  ],
});
