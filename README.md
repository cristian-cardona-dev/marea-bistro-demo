# Marea — Restaurant Template

A configurable restaurant website template built with Astro 7, Tailwind CSS v4, and React 19 (optional islands).

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

Edit `src/config/site.ts` to change everything: name, colors, menu, hours, social links, SEO, and the OG image. (Component images — Hero, About, Gallery and the Menu dishes — are imported directly in their Astro components from `src/assets/` or served from `public/images/`; they are not driven by `siteConfig.images` except `ogImage`.)

See `docs/CUSTOMIZATION.md` for a step-by-step guide.

## Tech Stack

- **Astro 7** — Islands architecture, zero JS by default
- **Tailwind CSS v4** — CSS-first configuration
- **React 19** — Optional interactive islands available in `src/components/` (reservation form, menu filter, dish selector); not mounted on the current homepage
- **TypeScript** — Type-safe config with Zod validation
- **Fontsource** — Self-hosted fonts (active pairing: Newsreader + DM Sans; Fraunces and Inter remain installed but unused by default)

## Project Structure

```
src/
├── config/site.ts          # ← EDIT THIS FILE to customize
├── layouts/BaseLayout.astro  # HTML base, meta, fonts, theme vars
├── pages/index.astro        # All sections
├── components/              # Astro + React components
├── styles/global.css        # Tailwind v4 @theme
└── scripts/marea-motion.ts  # Editorial motion layer (client)
public/
└── images/                  # Your photos (replace demo images); credits in credits.json
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

- Zero JS by default (islands only where needed)
- A small editorial motion layer runs as a client module (`src/scripts/marea-motion.ts`), targeting `[data-motion]` elements only; it never hides content and defers to `prefers-reduced-motion`
- Images are served from `public/images/` as ordinary `<img>` markup; no Astro Image pipeline/WebP/AVIF conversion is used on this page (Pexels/Wikimedia images are illustrative, not Marea's own food or venue)
- Self-hosted fonts (no Google Fonts CDN)

## License

MIT — Use freely for your restaurant or client projects.

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-11-09 | 0.0.2 | Full-screen hero with transparent minimal navbar |
