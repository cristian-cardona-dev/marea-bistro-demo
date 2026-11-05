// src/scripts/marea-motion.ts — Marea editorial motion layer
//
// - Hero image [data-motion="hero"] img: scale + object-position tied to
//   scroll, from a visible baseline (scale 1). Never opacity-gated.
// - Section [data-motion="section"] / dish [data-motion="dish"]:
//   restrained press feedback via motion.animate().
// - Live prefers-reduced-motion: scroll-linked effects are removed when
//   reduced, restored when not.
// - Defensive: zero [data-motion] targets = no-op. Nothing in this file
//   hides content; images and text stay visible if JS fails, loads late,
//   an image fails, or reduced motion is on.
//
// Connected from src/layouts/BaseLayout.astro as an Astro processed script.
// Uses the existing `motion` dependency (^14.9.0); no new dependencies.

import { animate, inView, transform } from 'motion';

const HERO_SELECTOR = '[data-motion="hero"]';
const INTERACTION_SELECTORS =
  '[data-motion="section"] a, [data-motion="section"] button, [data-motion="dish"] a, [data-motion="dish"] button';

const HERO_SCALE_MIN = 1;
const HERO_SCALE_MAX = 1.06;
const HERO_POSITION_TOP_MIN = 50; // %
const HERO_POSITION_TOP_MAX = 30; // % — image drifts upward as it scales

const PRESS_SCALE_ACTIVE = 0.98;

let heroStage: HTMLElement | null = null;
let heroImg: HTMLImageElement | null = null;
let heroFrame = 0;
let heroPending = false;
let reduced = false;
let reduceMedia: MediaQueryList | null = null;

/* Reveal lifecycle tracking for live prefers-reduced-motion toggling. */
let revealStops: (() => void)[] = [];
let revealAnimations: ReturnType<typeof animate>[] = [];
/* Press-feedback lifecycle tracking for live reduce toggling. */
let pressCleanups: (() => void)[] = [];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function heroValues(): { scale: number; objectPositionTop: number } {
  const rect = heroStage?.getBoundingClientRect() ?? { top: 0, height: 0 };
  const viewHeight = window.innerHeight;
  // 0 when the hero top aligns with the viewport bottom edge,
  // 1 when it has scrolled to (past) the viewport top edge.
  const progress = clamp((viewHeight - rect.top) / viewHeight, 0, 1);
  return {
    scale: transform(progress, [0, 1], [HERO_SCALE_MIN, HERO_SCALE_MAX]),
    objectPositionTop: transform(
      progress,
      [0, 1],
      [HERO_POSITION_TOP_MIN, HERO_POSITION_TOP_MAX]
    ),
  };
}

function updateHero(): void {
  heroFrame = 0;
  heroPending = false;
  if (reduced || !heroImg) return;
  const { scale, objectPositionTop } = heroValues();
  heroImg.style.transform = `scale(${scale})`;
  heroImg.style.objectPosition = `50% ${objectPositionTop}%`;
}

function scheduleHero(): void {
  if (heroPending) return;
  heroPending = true;
  heroFrame = requestAnimationFrame(updateHero);
}

function startHero(): void {
  if (reduced || !heroImg) return;
  stopHero();
  updateHero();
  window.addEventListener('scroll', scheduleHero, { passive: true });
  window.addEventListener('resize', scheduleHero, { passive: true });
}

function stopHero(): void {
  cancelAnimationFrame(heroFrame);
  heroFrame = 0;
  heroPending = false;
  window.removeEventListener('scroll', scheduleHero);
  window.removeEventListener('resize', scheduleHero);
  if (heroImg) {
    heroImg.style.transform = '';
    heroImg.style.objectPosition = '';
  }
}

function restoreVisible(targets: HTMLElement[]): void {
  targets.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

function stopReveals(): void {
  revealStops.forEach((stop) => stop());
  revealStops = [];
  revealAnimations.forEach((a) => a.stop());
  revealAnimations = [];
}

function onReduceChange(): void {
  const next = reduceMedia?.matches ?? false;
  if (next === reduced) return;
  reduced = next;
  if (reduced) {
    stopHero();
    stopReveals();
    /* Detach press feedback and stop any active press animation. */
    pressCleanups.forEach((cleanup) => cleanup());
    pressCleanups = [];
    /* Leave every reveal target visible; never hide on reduce. */
    restoreVisible(
      Array.from(
        document.querySelectorAll<HTMLElement>(
          `${REVEAL_SELECTORS}, ${HERO_TEXT_SELECTORS}`
        )
      )
    );
  } else {
    /* Restore hero parallax and press feedback. Do not re-hide or replay
       completed reveal content when reduced motion is turned off. */
    startHero();
    attachPressFeedback();
  }
}

function attachPressFeedback(): void {
  if (reduced) return;
  try {
    /* Idempotent: detach any previously attached press listeners first. */
    pressCleanups.forEach((cleanup) => cleanup());
    pressCleanups = [];
    document.querySelectorAll<HTMLElement>(INTERACTION_SELECTORS).forEach((el) => {
      let active: ReturnType<typeof animate> | null = null;
      let pressed = false;
      const release = (): void => {
        if (!pressed) return;
        pressed = false;
        if (active) {
          active.stop();
          active = null;
        }
        active = animate(el, { scale: [PRESS_SCALE_ACTIVE, 1] }, { duration: 160 });
      };
      const onPointerDown = (): void => {
        pressed = true;
        if (active) active.stop();
        active = animate(el, { scale: [1, PRESS_SCALE_ACTIVE] }, { duration: 100 });
      };
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
      pressCleanups.push(() => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointerup', release);
        el.removeEventListener('pointercancel', release);
        el.removeEventListener('pointerleave', release);
        if (active) {
          active.stop();
          active = null;
        }
      });
    });
  } catch {
    // Press feedback is ornamental; never let it break the page.
  }
}

/* ------------------------------------------------------------------ */
/* Hero text choreography — one-shot, IntersectionObserver-backed.    */
/* Baseline HTML stays visible (opacity 1). JS applies the hidden       */
/* initial state only after a confirmed capability check; on failure   */
/* content is restored to fully visible. Never opacity-0 in CSS.       */
/* ------------------------------------------------------------------ */

const HERO_TEXT_SELECTORS =
  '[data-hero-heading], .btn-square, a[href="#carta"]';

function choreographHeroText(): void {
  if (reduced) return;
  const stage = document.querySelector<HTMLElement>(HERO_SELECTOR);
  if (!stage || typeof IntersectionObserver === 'undefined') return;
  try {
    const targets = Array.from(
      stage.querySelectorAll<HTMLElement>(HERO_TEXT_SELECTORS)
    );
    if (!targets.length) return;
    // Baseline stays fully visible. Each target is animated only when its
    // inView callback fires (brief visible-to-hidden snap at trigger, never
    // permanently hidden if the observer never fires).
    targets.forEach((el, i) => {
      const delayMs = Math.min(i * 70, 300); /* cap to --stagger-max */
      const stop = inView(el, () => {
        const a = animate(el, { opacity: [0, 1], y: [10, 0] }, {
          duration: 300,
          ease: 'easeOut',
          delay: delayMs,
        });
        revealAnimations.push(a);
        a.then(
          () => { revealAnimations = revealAnimations.filter((x) => x !== a); },
          () => { revealAnimations = revealAnimations.filter((x) => x !== a); }
        );
        stop(); // one-shot
      }, { margin: '-12% 0 0 0' });
      revealStops.push(stop);
    });
  } catch {
    // Restore visible on any setup failure.
    stage
      .querySelectorAll<HTMLElement>(HERO_TEXT_SELECTORS)
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
  }
}

/* ------------------------------------------------------------------ */
/* One-shot section/item reveals — IntersectionObserver-backed,       */
/* transform+opacity only, trigger once. Baseline stays visible.       */
/* ------------------------------------------------------------------ */

const REVEAL_SELECTORS = '.market-item, #galeria figure';

function revealSections(): void {
  if (reduced) return;
  if (typeof IntersectionObserver === 'undefined') return;
  try {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS)
    );
    if (!targets.length) return;
    // Baseline stays fully visible. Each target is animated only when its
    // inView callback fires (brief visible-to-hidden snap at trigger, never
    // permanently hidden if the observer never fires). Delays capped so no
    // row waits more than --stagger-max (300ms).
    targets.forEach((el, i) => {
      const delayMs = Math.min(i * 55, 300); /* cap to --stagger-max */
      const stop = inView(el, () => {
        const a = animate(el, { opacity: [0, 1], y: [14, 0] }, {
          duration: 350,
          ease: 'easeOut',
          delay: delayMs,
        });
        revealAnimations.push(a);
        a.then(
          () => { revealAnimations = revealAnimations.filter((x) => x !== a); },
          () => { revealAnimations = revealAnimations.filter((x) => x !== a); }
        );
        stop(); // one-shot
      }, { margin: '-10% 0 0 0' });
      revealStops.push(stop);
    });
  } catch {
    document
      .querySelectorAll<HTMLElement>(REVEAL_SELECTORS)
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
  }
}

function init(): void {
  if (typeof window === 'undefined') return;
  try {
    const stage = document.querySelector<HTMLElement>(HERO_SELECTOR);
    heroStage = stage ?? null;
    heroImg = stage?.querySelector<HTMLImageElement>('img') ?? null;

    reduceMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = reduceMedia.matches;
    reduceMedia.addEventListener('change', onReduceChange);

    if (!reduced) {
      startHero();
    }
    attachPressFeedback();
    choreographHeroText();
    revealSections();
  } catch {
    // Motion is progressive enhancement. Any failure leaves the page
    // exactly as HTML/CSS rendered it — fully visible.
  }
}

init();
