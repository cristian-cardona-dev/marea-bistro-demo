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
  googleBusiness: z.string().url().optional(),
  googleRating: z.number().min(0).max(5).optional(),
  googleReviewCount: z.number().int().optional(),
});

const SiteConfigSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    logo: z.string(),
    yearFounded: z.number(),
    capacity: z.object({ indoor: z.number(), terrace: z.number() }),
    chef: z.string(),
    specialty: z.string(),
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
// ============================================================

export const siteConfig: SiteConfig = SiteConfigSchema.parse({
  brand: {
    name: "Marea",
    tagline: "Donde el mar se sienta a la mesa",
    logo: "/images/logo.svg",
    yearFounded: 2019,
    capacity: { indoor: 48, terrace: 12 },
    chef: "Lucia Ferrer",
    specialty: "Arroces de mar y pescados a la brasa",
  },

  theme: {
    mode: "dark",
    colors: {
      ground: "#0A1628",
      groundAlt: "#F5F0E8",
      ink: "#F8F5F0",
      accent: "#8B3A20",
      secondary: "#D4A853",
      muted: "#908B85",
    },
    fonts: {
      display: "Fraunces",
      body: "Inter",
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
          { name: "Carpaccio de gamba roja", description: "Gamba de Denia, aceite de oliva, limón, sal de Ibiza", price: 16, image: "/images/carpaccio.jpg", tags: ["marisco", "crudo"], featured: true, ingredients: ["Gamba roja de Denia", "Aceite de oliva virgen extra", "Limón de Ibiza", "Sal marina"], story: "Plato estrella desde 2019. La gamba roja de Denia es considerada la mejor del Mediterráneo.", pairing: "Albariño Rías Baixas" },
          { name: "Croquetas de marisco", description: "Bechamel de marisco, panko, alioli de ajo negro", price: 12, image: "/images/croquetas.jpg", tags: ["marisco", "frito"] },
          { name: "Ensalada de pulpo", description: "Pulpo a la gallega, patata confitada, pimentón, aceite", price: 14, image: "/images/gallery-octopus.jpg", tags: ["marisco", "ensalada"], featured: true, ingredients: ["Pulpo gallego", "Patata confitada", "Pimentón de la Vera", "Aceite de oliva"], story: "Receta de la abuela de Lucia. El pulpo se cocina a baja temperatura durante 4 horas.", pairing: "Verdejo Rueda" },
          { name: "Mejillones a la marinera", description: "Mejillones de roca, vino blanco, ajo, perejil", price: 13, image: "/images/mejillones.jpg", tags: ["marisco", "vapor"] },
        ],
      },
      {
        id: "principales",
        name: "Principales",
        items: [
          { name: "Paella de marisco", description: "Arroz bomba, gamba, mejillón, sepia, azafrán (mín. 2 pers.)", price: 22, image: "/images/paella.jpg", tags: ["arroz", "marisco"], featured: true, ingredients: ["Arroz bomba de Valencia", "Gamba roja", "Mejillón de roca", "Sepia", "Azafrán de La Mancha"], story: "La paella que da sentido a Marea. Arroz bomba de la Albufera, cocido a fuego de leña.", pairing: "Albariño Rías Baixas" },
          { name: "Fideuá negra", description: "Fideo fino, sepia, alioli, tinta de calamar", price: 19, image: "/images/fideua.jpg", tags: ["pasta", "marisco"] },
          { name: "Lubina a la brasa", description: "Lubina salvaje, verduras de temporada, salsa de limón", price: 24, image: "/images/lubina.jpg", tags: ["pescado", "brasa"], featured: true, ingredients: ["Lubina salvaje del Mediterráneo", "Verduras de temporada", "Salsa de limón y hierbas"], story: "Pescado del día, cocinado a la brasa con madera de naranjo. Sabor ahumado único.", pairing: "Verdejo Rueda" },
          { name: "Arroz a banda", description: "Arroz con sabor a mar, alioli, langostinos", price: 20, image: "/images/arroz-banda.jpg", tags: ["arroz", "marisco"] },
          { name: "Calamar relleno", description: "Calamar, sobrasada, piñones, salsa de tomate", price: 21, image: "/images/calamar.jpg", tags: ["marisco", "relleno"] },
        ],
      },
      {
        id: "postres",
        name: "Postres",
        items: [
          { name: "Tarta de queso valenciana", description: "Queso fresco, naranja, base de galleta", price: 8, image: "/images/tarta-queso.jpg", tags: ["dulce", "queso"] },
          { name: "Crema catalana", description: "Clásica, con azúcar quemado", price: 7, image: "/images/crema-catalana.jpg", tags: ["dulce", "clásico"] },
          { name: "Helado de turrón", description: "Turrón de Jijona, almendra tostada", price: 6, image: "/images/helado-turron.jpg", tags: ["dulce", "helado"] },
        ],
      },
      {
        id: "vinos",
        name: "Vinos",
        items: [
          { name: "Albariño Rías Baixas", description: "Blanco fresco y mineral", price: 5, image: "/images/vino-blanco.jpg", tags: ["blanco", "galicia"] },
          { name: "Verdejo Rueda", description: "Blanco aromático y afrutado", price: 4.5, image: "/images/vino-blanco.jpg", tags: ["blanco", "rueda"] },
          { name: "Rosado Navarra", description: "Rosado ligero y fresco", price: 4, image: "/images/vino-blanco.jpg", tags: ["rosado", "navarra"] },
          { name: "Tempranillo Rioja", description: "Tinto con crianza", price: 5.5, image: "/images/vino-tinto.jpg", tags: ["tinto", "rioja"] },
          { name: "Monastrell Alicante", description: "Tinto potente y mediterráneo", price: 6, image: "/images/vino-tinto.jpg", tags: ["tinto", "alicante"] },
          { name: "Cava Brut", description: "Espumoso catalán", price: 6, image: "/images/vino-blanco.jpg", tags: ["espumoso", "cataluña"] },
          { name: "Vermut rojo", description: "Aperitivo clásico", price: 4, image: "/images/vino-tinto.jpg", tags: ["aperitivo"] },
          { name: "Agua mineral", description: "Agua de manantial", price: 2.5, image: "/images/vino-blanco.jpg", tags: ["bebida"] },
        ],
      },
    ],
  },

  social: {
    instagram: "https://instagram.com/mareabistro",
    tiktok: "https://tiktok.com/@mareabistro",
    facebook: "https://facebook.com/mareabistro",
    whatsapp: "https://wa.me/34612345678",
    googleBusiness: "https://g.page/mareabistro",
    googleRating: 4.8,
    googleReviewCount: 127,
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
    hero: "/images/hero-paella.jpg",
    gallery: [
      "/images/gallery-market.jpg",
      "/images/gallery-coast.jpg",
      "/images/gallery-tiles.jpg",
      "/images/gallery-octopus.jpg",
    ],
    ogImage: "/images/hero-paella.jpg",
  },

  seo: {
    title: "Marea — Bistro Mediterráneo en Valencia",
    description: "Bistro mediterráneo en Ruzafa, Valencia. Arroces de mar, pescados a la brasa y vinos del Mediterráneo.",
    keywords: ["bistro", "mediterráneo", "Valencia", "restaurante", "arroces", "mariscos"],
    siteUrl: "",
  },

  content: {
    aboutText: "En Marea creemos que el mar no es solo un ingrediente, es una forma de entender la cocina. Cada mañana, Lucia Ferrer recorre el mercado de Ruzafa seleccionando el pescado del día. Cada noche, el horno de leña se enciende a las 5 de la tarde para que, cuando llegues, el fuego esté listo para recibir la lubina salvaje, el pulpo gallego y el arroz bomba de la Albufera. No somos un restaurante de moda. Somos un bistro donde el mar se sienta a la mesa.",
    footerText: "© 2019-2026 Marea Bistro. Todos los derechos reservados.",
  },
});
