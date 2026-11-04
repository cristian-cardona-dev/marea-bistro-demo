// src/config/site.ts
// ============================================================
// RESTAURANT TEMPLATE — CONFIGURATION FILE
// ============================================================
// This is the ONLY file you need to edit to customize your site.
// Change the values below and run `npm run dev` to see changes.
// ============================================================

import { z } from 'zod';

// --- Schema validation (do not edit) ---

const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const MenuItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  ingredients: z.array(z.string()).optional(),
  story: z.string().optional(),
  pairing: z.string().optional(),
});

const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(MenuItemSchema),
});

const SocialSchema = z.object({
  instagram: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  facebook: z.string().url().optional(),
  whatsapp: z.string().url().optional(),
});

const SiteConfigSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    logo: z.string(),
  }),
  theme: z.object({
    mode: z.enum(['dark', 'light']),
    colors: z.object({
      ground: ColorSchema,
      groundAlt: ColorSchema,
      ink: ColorSchema,
      accent: ColorSchema,
      secondary: ColorSchema,
      muted: ColorSchema,
    }),
    fonts: z.object({
      display: z.string(),
      body: z.string(),
    }),
  }),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    phone: z.string(),
    email: z.string().email(),
    mapEmbedUrl: z.string().url(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
  }),
  hours: z.array(z.object({
    day: z.string(),
    open: z.string().optional(),
    close: z.string().optional(),
    open2: z.string().optional(),
    close2: z.string().optional(),
    closed: z.boolean().optional(),
  })),
  menu: z.object({
    currency: z.string(),
    categories: z.array(MenuCategorySchema),
  }),
  social: SocialSchema,
  reservations: z.object({
    enabled: z.boolean(),
    minParty: z.number(),
    maxParty: z.number(),
    advanceDays: z.number(),
    whatsappFallback: z.boolean(),
    emailFallback: z.string().email(),
  }),
  images: z.object({
    hero: z.string(),
    gallery: z.array(z.string()),
    ogImage: z.string(),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    siteUrl: z.string().optional().default(''),
  }),
  content: z.object({
    aboutText: z.string(),
    footerText: z.string(),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// ============================================================
// DEMO DATA: Marea Bistro (edit this to customize your restaurant)
// All data is sample/demo content. Marea is a fictional restaurant.
// ============================================================

export const siteConfig: SiteConfig = SiteConfigSchema.parse({
  brand: {
    name: "Marea",
    tagline: "Bistró mediterráneo · Valencia",
    logo: "/images/logo.svg",
  },

  theme: {
    mode: "light",
    colors: {
      ground: "#F2F3EE",
      groundAlt: "#E6EBE6",
      ink: "#18343A",
      accent: "#1A6F70",
      secondary: "#53706C",
      muted: "#4B615E",
    },
    fonts: {
      display: "Newsreader",
      body: "DM Sans",
    },
  },

  location: {
    address: "Carrer del Mar, 14, Ruzafa",
    city: "Valencia",
    country: "España",
    phone: "+34 963 000 000",
    email: "hola@mareabistro.com",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.5!2d-0.3763!3d39.4699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDI4JzExLjYiTiAwwrAyMic1NC43Ilc!5e0!3m2!1ses!2ses!4v1",
    coordinates: { lat: 39.4699, lng: -0.3763 },
  },

  hours: [
    { day: "Martes - Jueves", open: "13:00", close: "16:00", open2: "20:00", close2: "23:30" },
    { day: "Viernes - Sábado", open: "13:00", close: "16:30", open2: "20:00", close2: "00:00" },
    { day: "Domingo", open: "13:00", close: "17:00" },
    { day: "Lunes", closed: true },
  ],

  menu: {
    currency: "€",
    categories: [
      {
        id: "entrantes",
        name: "Entrantes",
        items: [
          { name: "Carpaccio de gamba roja", description: "Gamba de Denia, aceite de oliva, limón, sal de Ibiza", price: 16, tags: ["marisco", "crudo"] },
          { name: "Croquetas de marisco", description: "Bechamel de marisco, panko, alioli de ajo negro", price: 12, tags: ["marisco", "frito"] },
          { name: "Ensalada de pulpo", description: "Pulpo a la gallega, patata confitada, pimentón, aceite", price: 14, tags: ["marisco", "ensalada"] },
          { name: "Mejillones a la marinera", description: "Mejillones de roca, vino blanco, ajo, perejil", price: 13, tags: ["marisco", "vapor"] },
        ],
      },
      {
        id: "principales",
        name: "Principales",
        items: [
          { name: "Paella de marisco", description: "Arroz bomba, gamba, mejillón, sepia, azafrán (mín. 2 pers.)", price: 22, tags: ["arroz", "marisco"] },
          { name: "Fideuá negra", description: "Fideo fino, sepia, alioli, tinta de calamar", price: 19, tags: ["pasta", "marisco"] },
          { name: "Lubina a la brasa", description: "Lubina salvaje, verduras de temporada, salsa de limón", price: 24, tags: ["pescado", "brasa"] },
          { name: "Arroz a banda", description: "Arroz con sabor a mar, alioli, langostinos", price: 20, tags: ["arroz", "marisco"] },
          { name: "Calamar relleno", description: "Calamar, sobrasada, piñones, salsa de tomate", price: 21, tags: ["marisco", "relleno"] },
        ],
      },
      {
        id: "postres",
        name: "Postres",
        items: [
          { name: "Tarta de queso valenciana", description: "Queso fresco, naranja, base de galleta", price: 8, tags: ["dulce", "queso"] },
          { name: "Crema catalana", description: "Clásica, con azúcar quemado", price: 7, tags: ["dulce", "clásico"] },
          { name: "Helado de turrón", description: "Turrón de Jijona, almendra tostada", price: 6, tags: ["dulce", "helado"] },
        ],
      },
      {
        id: "vinos",
        name: "Vinos",
        items: [
          { name: "Albariño Rías Baixas", description: "Blanco fresco y mineral", price: 5, tags: ["blanco", "galicia"] },
          { name: "Verdejo Rueda", description: "Blanco aromático y afrutado", price: 4.5, tags: ["blanco", "rueda"] },
          { name: "Rosado Navarra", description: "Rosado ligero y fresco", price: 4, tags: ["rosado", "navarra"] },
          { name: "Tempranillo Rioja", description: "Tinto con crianza", price: 5.5, tags: ["tinto", "rioja"] },
          { name: "Monastrell Alicante", description: "Tinto potente y mediterráneo", price: 6, tags: ["tinto", "alicante"] },
          { name: "Cava Brut", description: "Espumoso catalán", price: 6, tags: ["espumoso", "cataluña"] },
          { name: "Vermut rojo", description: "Aperitivo clásico", price: 4, tags: ["aperitivo"] },
          { name: "Agua mineral", description: "Agua de manantial", price: 2.5, tags: ["bebida"] },
        ],
      },
    ],
  },

  social: {
    instagram: "https://instagram.com/mareabistro",
    tiktok: "https://tiktok.com/@mareabistro",
    facebook: "https://facebook.com/mareabistro",
    whatsapp: "https://wa.me/34612345678",
  },

  reservations: {
    enabled: true,
    minParty: 1,
    maxParty: 8,
    advanceDays: 30,
    whatsappFallback: true,
    emailFallback: "reservas@mareabistro.com",
  },

  images: {
    hero: "/images/marea-hero-food.jpg",
    gallery: [
      "/images/marea-paella.jpg",
      "/images/marea-octopus-grilled.jpg",
      "/images/marea-crema-tostada.jpg",
    ],
    ogImage: "/images/marea-hero-food.jpg",
  },

  seo: {
    title: "Marea — Bistró Mediterráneo en Valencia",
    description: "Bistró mediterráneo en Ruzafa, Valencia. Arroces de mar, pescados a la brasa y vinos del Mediterráneo. Contenido de demostración.",
    keywords: ["bistro", "mediterráneo", "Valencia", "restaurante", "arroces", "mariscos"],
    siteUrl: "",
  },

  content: {
    aboutText: "Demostración: Marea es un restaurante ficticio. Este sitio es una plantilla de portada para un bistró mediterráneo en Valencia. Los platos, precios, horarios y datos de contacto son contenido de ejemplo.",
    footerText: "© 2026 Marea Bistro. Demo — contenido de ejemplo.",
  },
});
