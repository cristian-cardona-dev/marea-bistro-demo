# Customization Guide

This guide shows you how to customize the restaurant template by editing `src/config/site.ts`.

## Quick Start

1. Open `src/config/site.ts` in any code editor (VS Code, etc.)
2. Change the values you want
3. Run `npm run dev` to see changes live
4. Run `npm run build` when ready to deploy

## 1. Change Restaurant Name

```typescript
brand: {
  name: "Your Restaurant Name",
  tagline: "Your tagline here",
  // ...
}
```

## 2. Change Colors

```typescript
theme: {
  mode: "dark", // or "light"
  colors: {
    ground: "#0A1628",     // Background
    groundAlt: "#F5F0E8",  // Alternate background
    ink: "#F8F5F0",        // Text color
    accent: "#C4553A",     // Buttons, links
    secondary: "#D4A853",  // Highlights
    muted: "#8B8680",      // Secondary text
  },
  // ...
}
```

Use any hex color. The entire site updates automatically.

## 3. Change Fonts

```typescript
theme: {
  fonts: {
    display: "Playfair Display",  // Headings
    body: "Lato",                 // Body text
  },
}
```

Then install the font:
```bash
npm install @fontsource/playfair-display @fontsource/lato
```

And add imports in `src/layouts/BaseLayout.astro`:
```astro
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/lato/400.css';
```

## 4. Change Menu

Add, remove, or edit dishes in the `menu.categories` array:

```typescript
menu: {
  currency: "€",
  categories: [
    {
      id: "entrantes",
      name: "Entrantes",
      items: [
        {
          name: "Your Dish Name",
          description: "Description of the dish",
          price: 15,
          image: "/images/your-dish.jpg",
          tags: ["tag1", "tag2"],
          featured: true,  // Shows in hero selector
          ingredients: ["Ingredient 1", "Ingredient 2"],
          story: "Story behind the dish",
          pairing: "Suggested wine pairing",
        },
      ],
    },
  ],
}
```

## 5. Change Hours

```typescript
hours: [
  { day: "Lunes", closed: true },
  { day: "Martes - Domingo", open: "12:00", close: "15:30", open2: "19:00", close2: "23:00" },
]
```

## 6. Change Location

```typescript
location: {
  address: "Your Street, Number",
  city: "Your City",
  country: "Your Country",
  phone: "+34 600 000 000",
  email: "info@yourrestaurant.com",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=...",
  coordinates: { lat: 0.0, lng: 0.0 },
}
```

To get your map embed URL:
1. Go to Google Maps
2. Search your address
3. Click "Share" → "Embed a map"
4. Copy the `src` URL

## 7. Change Social Links

```typescript
social: {
  instagram: "https://instagram.com/yourhandle",
  tiktok: "https://tiktok.com/@yourhandle",
  facebook: "https://facebook.com/yourpage",
  whatsapp: "https://wa.me/34600000000",
}
```

Remove any link by setting it to `undefined` or deleting the line.

## 8. Change Images

Only the OG image is controlled from `src/config/site.ts` (`images.ogImage`). The images shown in the Hero, About and Gallery sections are imported directly in their Astro components (`src/components/Hero.astro`, `src/components/About.astro`, `src/components/Gallery.astro`) from `src/assets/` (Astro's `astro:assets` pipeline), and the Menu interlude image is served from `public/images/`. `siteConfig.images.hero` and `siteConfig.images.gallery` are not read by any component.

To change a component image:

1. Replace the imported asset (e.g. `src/assets/user-supplied/hero-desktop-original.png`, `src/assets/hero/mediterranean-sea-view.jpg`, `src/assets/gallery/marea-octopus-elegant.jpg`) — or add a new file under `src/assets/` and update the import in the component.
2. For the Menu interlude, replace `public/images/fresh-ingredients-slate.jpg` (and its `*-800w.jpg` / `*-1600w.jpg` variants) and update the `creditByFile` lookup in `src/components/Menu.astro` if the filename changes.
3. Update `images.ogImage` in `src/config/site.ts` for the social/SEO preview image.

To change the OG image only:

```typescript
images: {
  ogImage: "/images/og.jpg",
}
```

**Image recommendations:**
- Hero: 1920x1080px (landscape)
- Gallery: 800x800px (square)
- OG image: 1200x630px
- Format: WebP or JPEG

**Credits:** per-image source and licence records live in `public/images/credits.json`. Components that display credited images (Gallery, Menu interlude, the coast beat in About) read from that file; uncredited images render "Imagen suministrada para esta demostración". Add a record there when introducing a new third-party image.

## 9. Change SEO

```typescript
seo: {
  title: "Your Restaurant — Your City",
  description: "Description for Google search results",
  keywords: ["restaurant", "your city", "cuisine type"],
  siteUrl: "https://yourrestaurant.com",
}
```

## 10. Change Content

```typescript
content: {
  aboutText: "Your restaurant story...",
  footerText: "© 2026 Your Restaurant. All rights reserved.",
}
```

## 11. Reservations

```typescript
reservations: {
  enabled: true,  // Currently informational only: the homepage does not read this flag to show/hide the booking action
  minParty: 1,
  maxParty: 8,
  advanceDays: 30,
  whatsappFallback: true,
  emailFallback: "reservas@yourrestaurant.com",
}
```

The current homepage always renders a booking button that opens a prefilled `mailto:` link (it does not send automatically or confirm a booking). `enabled` is kept in the schema/config for future use but is not wired to page visibility.

## 12. Deploy

### Vercel
1. Push to GitHub
2. Go to vercel.com → Import project
3. Auto-deploys on every push

### Netlify
1. Push to GitHub
2. Go to netlify.com → Add new site
3. Build command: `npm run build`
4. Publish directory: `dist`

## Troubleshooting

**Build fails with "Cannot find module":**
- Run `npm install` to ensure all dependencies are installed.

**Images not showing:**
- Check that image paths start with `/` (e.g., `/images/photo.jpg`)
- Ensure images are in `public/images/` (this template serves them as static files; there is no Astro Image optimization pipeline)

**Colors not updating:**
- Make sure you're editing `theme.colors` in `src/config/site.ts`
- Restart the dev server (`npm run dev`)

**Reservations are mailto-only:**
- The current homepage does not include a reservation form. The booking button opens a prefilled `mailto:` link using `reservations.emailFallback`; it does not send automatically or confirm a booking.
- A standalone `ReservationForm` React component exists in `src/components/` but is optional and not mounted on the current homepage. If you mount it, treat it as a demo (no backend): it does not send emails or confirm bookings.
- To enable real reservations, connect a backend service (Formspree, EmailJS, etc.) and wire it into your chosen component.
