import { test, expect } from '@playwright/test';

test('v0_has_plain_h1_descriptor_and_primary_action', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveText('Marea');
  await expect(page.getByText('Bistró mediterráneo · Valencia')).toBeVisible();
  await expect(page.getByRole('link', { name: /Reservar mesa/i }).first()).toBeVisible();
});

test('v0_configured_light_theme_reaches_root_and_bg_ground', async ({ page }) => {
  await page.goto('/');
  // Configured light mode/token reaches root HTML custom properties and body.
  const rootVars = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      ground: cs.getPropertyValue('--site-ground').trim(),
      ink: cs.getPropertyValue('--site-ink').trim(),
      accent: cs.getPropertyValue('--site-accent').trim(),
    };
  });
  expect(rootVars.ground).toBe('#F2F3EE');
  expect(rootVars.ink).toBe('#18343A');
  expect(rootVars.accent).toBe('#1A6F70');

  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).toBe('rgb(242, 243, 238)');

  // A bg-ground element (the header nav) carries the configured ground token.
  const navBg = await page.locator('nav').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(navBg).toBe('rgb(242, 243, 238)');
});

test('v0_menu_link_reaches_menu_section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Ver la carta|Carta/i }).first().click();
  await expect(page.locator('#carta')).toBeInViewport();

  // Ubicación nav link targets the existing #ubicacion anchor on the page.
  const ubicacion = page.getByRole('link', { name: /Ubicación/i });
  await expect(ubicacion).toBeVisible();
  await expect(ubicacion).toHaveAttribute('href', '#ubicacion');
  await expect(page.locator('#ubicacion')).toBeVisible();

  // Nav targets are touch-friendly: at least 44px min-height.
  const navLinks = page.locator('nav a');
  const navCount = await navLinks.count();
  for (let i = 0; i < navCount; i += 1) {
    const minHeight = await navLinks.nth(i).evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.minHeight || cs.height;
    });
    const value = parseInt(minHeight, 10);
    expect(!isNaN(value) && value >= 44).toBe(true);
  }

  // Menu list semantics: every direct child of each <ul> is an <li> wrapping a
  // .market-row plus its .market-note paragraph. No bare <p> under <ul>.
  const menuLists = page.locator('#carta ul');
  const listCount = await menuLists.count();
  expect(listCount).toBeGreaterThan(0);
  for (let i = 0; i < listCount; i += 1) {
    const list = menuLists.nth(i);
    const direct = list.locator(':scope > *');
    const dc = await direct.count();
    for (let j = 0; j < dc; j += 1) {
      const tag = await direct.nth(j).evaluate((el) => el.tagName.toLowerCase());
      expect(tag).toBe('li');
    }
    const lis = list.locator(':scope > li');
    const lc = await lis.count();
    expect(lc).toBeGreaterThan(0);
    for (let k = 0; k < lc; k += 1) {
      await expect(lis.nth(k)).toHaveClass(/market-item/);
      await expect(lis.nth(k).locator('.market-row')).toHaveCount(1);
      await expect(lis.nth(k).locator('.market-note')).toHaveCount(1);
      // .market-note is the adjacent sibling immediately after .market-row.
      await expect(lis.nth(k).locator('.market-row + .market-note')).toHaveCount(1);
    }
  }
});

test('v0_booking_action_reaches_booking_section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Reservar mesa/i }).first().click();
  await expect(page.locator('#reservas')).toBeInViewport();

  // The booking CTA opens a truthful prefilled mailto: a demo request only,
  // never a confirmation or email-sent claim. The decoded body is inspected
  // (not just the percent-encoded href) so misleading copy is caught.
  const cta = page.getByRole('link', { name: /Solicitar reserva/i }).first();
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute('href');
  expect(href).toMatch(/^mailto:/);
  expect(href).toContain(encodeURIComponent('reservas@mareabistro.com'));
  expect(href).toContain(encodeURIComponent('Solicitud de reserva'));
  expect(href).toContain(encodeURIComponent('demostración'));
  const decoded = decodeURIComponent(href ?? '');
  // Truthful body: no affirmative confirmation/sent claims, no misleading
  // "no se envía ningún mensaje"; the user decides whether to send.
  expect(decoded).not.toMatch(/confirmada|confirmado|confirmación|enviado|enviada|reservada|reservado/i);
  expect(decoded).toContain('no lo envía automáticamente');
  expect(decoded).toContain('Tú decides si enviar este mensaje');
  expect(decoded).not.toContain('no se envía ningún mensaje');
  const label = await cta.textContent();
  expect(label).toMatch(/solicitar/i);
});

test('v0_has_no_mobile_horizontal_overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test('v0_has_no_fake_canonical_or_rating_schema', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('v0_demo_disclosure_precedes_sample_claims', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const disclosure = page.locator('[data-demo-disclosure]').first();
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText(/ficticio/i);
  await expect(disclosure).toBeInViewport();
  const rect = await disclosure.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, innerHeight: window.innerHeight };
  });
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(rect.innerHeight);
  const relation = await page.evaluate(() => {
    const disc = document.querySelector('[data-demo-disclosure]');
    const claim = document.querySelector('[data-sample-claim]');
    if (!disc || !claim) return 'missing';
    return disc.compareDocumentPosition(claim) & Node.DOCUMENT_POSITION_FOLLOWING
      ? 'before'
      : 'after';
  });
  expect(relation).toBe('before');
});

test('v0_hero_credit_is_legible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Hero credit is the current Pexels illustrative photo, attributed truthfully
  // as archive material — never Marea's own venue or dish.
  const credit = page.locator('#hero-caption');
  await expect(credit).toBeVisible();
  await expect(credit).toContainText(/Fotografía ilustrativa de archivo/);
  await expect(credit).toContainText(/Seafood paella with lobster/);
  await expect(credit).not.toContainText(
    /Mercado Central|Wikimedia|Creative Commons|Diego Delso/,
  );

  // Creator plus the source-page and license links point at the Pexels provenance.
  await expect(page.locator('#hero-scene-creator')).toHaveText('Marcelo Verfe');
  await expect(page.locator('#hero-scene-link-page')).toHaveAttribute(
    'href',
    'https://www.pexels.com/photo/seafood-paella-with-lobster-16743486/',
  );
  await expect(page.locator('#hero-scene-link-license')).toHaveAttribute(
    'href',
    'https://www.pexels.com/license/',
  );

  // Legible and not hidden: opaque text on the plain ground surface (the former
  // dark credit band is gone), and no glassmorphism blur.
  const legibility = await credit.evaluate((el) => {
    const cs = getComputedStyle(el);
    let surface = el.parentElement as HTMLElement | null;
    let surfaceBg = 'rgba(0, 0, 0, 0)';
    while (surface) {
      const bg = getComputedStyle(surface).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        surfaceBg = bg;
        break;
      }
      surface = surface.parentElement as HTMLElement | null;
    }
    return {
      color: cs.color,
      opacity: cs.opacity,
      visibility: cs.visibility,
      display: cs.display,
      surfaceBg,
      backdrop: cs.backdropFilter,
    };
  });
  expect(legibility.opacity).toBe('1');
  expect(legibility.visibility).toBe('visible');
  expect(legibility.display).not.toBe('none');
  expect(legibility.color).not.toBe('transparent');
  expect(legibility.color).not.toBe(legibility.surfaceBg);
  // The credit sits on the plain ground surface, not a dark band.
  expect(legibility.surfaceBg).toBe('rgb(242, 243, 238)');
  expect(legibility.backdrop === 'none' || legibility.backdrop === '').toBe(true);

  // The former dark credit band attribute is no longer in the markup.
  await expect(page.locator('[data-hero-credit-band]')).toHaveCount(0);

  // The gallery keeps a single credited Pexels photo with source/license links.
  const galleryCaptions = page.locator('#galeria figcaption');
  await expect(galleryCaptions).toHaveCount(1);
  await expect(
    galleryCaptions.first().getByRole('link', { name: /fuente/i }),
  ).toHaveAttribute(
    'href',
    'https://www.pexels.com/photo/gourmet-grilled-octopus-on-elegant-plate-39452706/',
  );
  await expect(
    galleryCaptions.first().getByRole('link', { name: /licencia/i }),
  ).toHaveAttribute('href', 'https://www.pexels.com/license/');
});

test('v0_reduced_motion_keeps_copy_visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Bistró mediterráneo · Valencia')).toBeVisible();
  await expect(page.locator('#carta')).toBeVisible();
});

test('v0_story_hero_static_credits_gallery_mobile', async ({ page }) => {
  const heroSrc = /marea-hero-seafood\.jpg$/;

  // --- Desktop: hero stays static while scrolling Carta/Galería/Reservas ---
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const heroImg = page.locator('#hero-img');
  await expect(heroImg).toBeVisible();
  await expect(heroImg).toHaveAttribute('src', heroSrc);
  await expect(heroImg).toHaveAttribute('alt', /Fotografía ilustrativa de archivo/);
  await expect(heroImg).toHaveAttribute('alt', /Seafood paella with lobster/);
  await expect(heroImg).toHaveAttribute(
    'alt',
    /No representa el local ni los platos de Marea/
  );

  // Hero credit anchors match the still image (Pexels: Marcelo Verfe).
  await expect(page.locator('#hero-scene-link-page')).toHaveAttribute(
    'href',
    'https://www.pexels.com/photo/seafood-paella-with-lobster-16743486/'
  );
  await expect(page.locator('#hero-scene-link-license')).toHaveAttribute(
    'href',
    'https://www.pexels.com/license/'
  );
  await expect(page.locator('#hero-scene-creator')).toHaveText('Marcelo Verfe');
  await expect(page.locator('#hero-caption')).toContainText(
    'Fotografía ilustrativa de archivo'
  );

  // Scroll to Carta — the hero source must not change. The image may scale via
  // transform, but its src stays the same URL.
  await page.locator('#carta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', heroSrc);

  // Scroll to Galería — the hero source must not change.
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', heroSrc);

  // Scroll to Reservas — the hero source must not change.
  await page.locator('#reservas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', heroSrc);

  // Gallery: a single credited Pexels photo with linked source/license.
  const galleryImgs = page.locator('#galeria img');
  await expect(galleryImgs).toHaveCount(1);
  await expect(galleryImgs.first()).toHaveAttribute(
    'src',
    /marea-octopus-elegant\.jpg$/
  );
  await expect(galleryImgs.first()).toHaveAttribute(
    'alt',
    /Imagen de archivo: Gourmet grilled octopus on elegant plate/
  );
  await expect(galleryImgs.first()).toHaveAttribute(
    'alt',
    /No muestra el local ni los platos de Marea/
  );

  const galleryCaptions = page.locator('#galeria figcaption');
  await expect(galleryCaptions).toHaveCount(1);
  await expect(
    galleryCaptions.first().getByRole('link', { name: /fuente/i })
  ).toHaveAttribute(
    'href',
    'https://www.pexels.com/photo/gourmet-grilled-octopus-on-elegant-plate-39452706/'
  );
  await expect(
    galleryCaptions.first().getByRole('link', { name: /licencia/i })
  ).toHaveAttribute('href', 'https://www.pexels.com/license/');

  // --- Mobile: hero stays static, first-fold demo note visible ---
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-img')).toHaveAttribute('src', heroSrc);

  const disclosure = page.locator('[data-demo-disclosure]').first();
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText(/ficticio/i);
  const rect = await disclosure.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, innerHeight: window.innerHeight };
  });
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(rect.innerHeight);

  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.locator('#hero-img')).toHaveAttribute('src', heroSrc);

  // --- Reduced motion: hero image stays visible with no crossfade transition ---
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const reducedHero = page.locator('#hero-img');
  await expect(reducedHero).toBeVisible();
  const transitionProperty = await reducedHero.evaluate(
    (el) => getComputedStyle(el).transitionProperty
  );
  expect(transitionProperty).toBe('none');
});