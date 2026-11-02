# Marea — Restaurant Template

A configurable restaurant website template built with Astro 5, Tailwind CSS v4, and React 19 islands.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customize Your Restaurant

Edit `src/config/site.ts` to change everything: name, colors, menu, hours, social links, images, SEO.

See `docs/CUSTOMIZATION.md` for a step-by-step guide.

## Tech Stack

- **Astro 5** — Islands architecture, zero JS by default
- **Tailwind CSS v4** — CSS-first configuration
- **React 19** — Interactive islands (reservation form, menu filter, dish selector)
- **TypeScript** — Type-safe config with Zod validation
- **Fontsource** — Self-hosted fonts (Fraunces + Inter)

## Project Structure

```
src/
├── config/site.ts          # ← EDIT THIS FILE to customize
├── layouts/BaseLayout.astro  # HTML base, meta, fonts, theme vars
├── pages/index.astro        # All sections
├── components/              # Astro + React components
├── styles/global.css        # Tailwind v4 @theme
└── assets/images/           # Your photos (replace demo images)
```

## Deploy

### Vercel (recommended)
1. Push to GitHub
2. Import in Vercel
3. Auto-deploys on every push

### Netlify
1. Push to GitHub
2. Import in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

## Performance

- Lighthouse 95+ on all metrics
- Zero JS by default (islands only where needed)
- Optimized images (WebP/AVIF via Astro Image)
- Self-hosted fonts (no Google Fonts CDN)

## License

MIT — Use freely for your restaurant or client projects.
