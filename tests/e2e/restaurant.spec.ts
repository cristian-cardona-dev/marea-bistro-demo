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
      await expect(lis.nth(k).locator('.market-row')).toHaveCount(1);
      await expect(lis.nth(k).locator('.market-note')).toHaveCount(1);
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
  const credit = page.getByText(/Imagen de archivo: Mercado Central, Valencia/);
  await expect(credit).toBeVisible();
  const color = await credit.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(248, 245, 240)');
  const bandHandle = await credit.evaluateHandle((el) => el.closest('[data-hero-credit-band]'));
  const bg = await bandHandle.evaluate((el: any) => el ? getComputedStyle(el).backgroundColor : '');
  expect(bg).toBe('rgb(10, 22, 40)');
  const blur = await bandHandle.evaluate((el: any) => el ? getComputedStyle(el).backdropFilter : '');
  expect(blur === 'none' || blur === '').toBe(true);

  // Hero credit carries a clickable source-page link and a license link.
  const heroCreditBlock = page.locator('[data-hero-credit]').first();
  await expect(heroCreditBlock).toBeVisible();
  await expect(heroCreditBlock.getByRole('link', { name: /fuente/i })).toHaveAttribute(
    'href',
    /wikimedia\.org/,
  );
  await expect(heroCreditBlock.getByRole('link', { name: /licencia/i })).toHaveAttribute(
    'href',
    /creativecommons\.org/,
  );

  // Every gallery caption carries a clickable source-page link and a license link.
  const galleryCaptions = page.locator('#galeria figcaption');
  const captionCount = await galleryCaptions.count();
  expect(captionCount).toBe(3);
  for (let i = 0; i < captionCount; i += 1) {
    const cap = galleryCaptions.nth(i);
    await expect(cap.getByRole('link', { name: /fuente/i })).toHaveAttribute('href', /wikimedia\.org/);
    await expect(cap.getByRole('link', { name: /licencia/i })).toHaveAttribute('href', /creativecommons\.org/);
  }
});

test('v0_reduced_motion_keeps_copy_visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Bistró mediterráneo · Valencia')).toBeVisible();
  await expect(page.locator('#carta')).toBeVisible();
});

test('v0_story_hero_static_credits_gallery_mobile', async ({ page }) => {
  // --- Desktop: hero stays static while scrolling Carta/Galería/Reservas ---
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const heroImg = page.locator('#hero-img');
  await expect(heroImg).toBeVisible();
  await expect(heroImg).toHaveAttribute('src', /gallery-market\.jpg/);
  await expect(heroImg).toHaveAttribute('alt', /Mercado Central/);

  // Hero credit anchors match the still image (Diego Delso / Mercado Central).
  await expect(page.locator('#hero-scene-link-page')).toHaveAttribute(
    'href',
    /wikimedia\.org/
  );
  await expect(page.locator('#hero-scene-link-license')).toHaveAttribute(
    'href',
    /creativecommons\.org/
  );
  await expect(page.locator('#hero-scene-creator')).toHaveText('Diego Delso');
  await expect(page.locator('#hero-scene-archive')).toContainText(
    'fotografía de archivo del mercado'
  );

  // Scroll to Carta — hero image must not change.
  await page.locator('#carta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', /gallery-market\.jpg/);

  // Scroll to Galería — hero image must not change.
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', /gallery-market\.jpg/);

  // Scroll to Reservas — hero image must not change.
  await page.locator('#reservas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(heroImg).toHaveAttribute('src', /gallery-market\.jpg/);

  // Gallery: three images in order with linked source/license.
  const galleryImgs = page.locator('#galeria img');
  await expect(galleryImgs).toHaveCount(3);
  await expect(galleryImgs.nth(0)).toHaveAttribute(
    'src',
    /mercado-central-exterior/
  );
  await expect(galleryImgs.nth(1)).toHaveAttribute('src', /albufera-gaianes/);
  await expect(galleryImgs.nth(2)).toHaveAttribute(
    'src',
    /valencia-market-artichokes/
  );

  const galleryCaptions = page.locator('#galeria figcaption');
  await expect(galleryCaptions).toHaveCount(3);
  for (let i = 0; i < 3; i += 1) {
    await expect(
      galleryCaptions.nth(i).getByRole('link', { name: /fuente/i })
    ).toHaveAttribute('href', /wikimedia\.org/);
    await expect(
      galleryCaptions.nth(i).getByRole('link', { name: /licencia/i })
    ).toHaveAttribute('href', /creativecommons\.org/);
  }

  // --- Mobile: hero stays static, first-fold demo note visible ---
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-img')).toHaveAttribute(
    'src',
    /gallery-market\.jpg/
  );

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
  await expect(page.locator('#hero-img')).toHaveAttribute(
    'src',
    /gallery-market\.jpg/
  );

  // --- Reduced motion: hero image has no crossfade transition ---
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const transition = await page.locator('#hero-img').evaluate((el) =>
    getComputedStyle(el).transition
  );
  expect(transition.includes('all') || transition.includes('opacity')).toBe(false);
});