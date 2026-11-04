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

import { animate, transform } from 'motion';

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

function onReduceChange(): void {
  const next = reduceMedia?.matches ?? false;
  if (next === reduced) return;
  reduced = next;
  reduced ? stopHero() : startHero();
}

function attachPressFeedback(): void {
  if (reduced) return;
  try {
    document.querySelectorAll<HTMLElement>(INTERACTION_SELECTORS).forEach((el) => {
      let active: Animation | null = null;
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
      el.addEventListener('pointerdown', () => {
        pressed = true;
        if (active) active.stop();
        active = animate(el, { scale: [1, PRESS_SCALE_ACTIVE] }, { duration: 100 });
      });
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
    });
  } catch {
    // Press feedback is ornamental; never let it break the page.
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
  } catch {
    // Motion is progressive enhancement. Any failure leaves the page
    // exactly as HTML/CSS rendered it — fully visible.
  }
}

init();
