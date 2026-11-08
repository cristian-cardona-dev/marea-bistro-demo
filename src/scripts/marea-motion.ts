// src/scripts/marea-motion.ts — Marea editorial motion layer
//
// - Hero image [data-motion="hero"] img: scale + object-position tied to
//   scroll via CSS scroll-driven animations (primary) or JS fallback.
// - Hero mask entrance: one-time circular aperture reveal on load via Motion.
// - Hero entrance: staggered opacity/y choreography on load.
// - Nav: link entrance on load.
// - Menu: category heading + item scroll reveals (JS fallback only).
// - Gallery: figure scroll reveal + image drift (JS fallback only).
// - Reservas: panel scroll reveal (JS fallback only).
// - Footer: scroll reveal (JS fallback only).
// - Press feedback on interactive controls.
// - Live prefers-reduced-motion: all motion removed, content visible.
// - Defensive: zero targets = no-op. Nothing hides content; images and
//   text stay visible if JS fails, loads late, an image fails, or reduced
//   motion is on.
//
// Connected from src/layouts/BaseLayout.astro as an Astro processed script.
// Uses the existing `motion` dependency (^14.9.0); no new dependencies.

import { animate, inView, transform } from 'motion';

/* ---------- Feature detection ---------- */
const SUPPORTS_SCROLL_DRIVEN = (() => {
  try {
    // Check for all features we actually use:
    // - animation-timeline: scroll()
    // - animation-range
    // - view-timeline (for named timelines)
    // - timeline-scope (on :root)
    return CSS.supports('animation-timeline', 'scroll()') &&
           CSS.supports('animation-range', '0% 100%') &&
           CSS.supports('view-timeline', '--test block') &&
           CSS.supports('timeline-scope', '--test');
  } catch {
    return false;
  }
})();

/* ---------- Selectors ---------- */
const HERO_SELECTOR = '[data-motion="hero"]';
const HERO_TEXT_SELECTORS = 'figcaption > div > p, [data-hero-heading], .btn-square, a[href="#carta"]';
const NAV_LINK_SELECTORS = '#main-nav a';
const INTERACTION_SELECTORS =
  '[data-motion="section"] a, [data-motion="section"] button, [data-motion="dish"] a, [data-motion="dish"] button';
const REVEAL_SELECTORS = '.market-item, #galeria figure, #carta h3, #reservas, #reservas li, footer';

/* ---------- Hero parallax is desktop-only ---------- */
const HERO_DESKTOP_QUERY = '(min-width: 1024px)';
let heroDesktopMedia: MediaQueryList | null = null;

function heroParallaxAllowed(): boolean {
  return heroDesktopMedia?.matches ?? false;
}

/* ---------- Hero parallax constants (JS fallback) ---------- */
const HERO_SCALE_MIN = 1;
const HERO_SCALE_MAX = 1.04;
const HERO_POSITION_TOP_MIN = 50; // % — object-position stays at center
const HERO_POSITION_TOP_MAX = 50; // % — image drifts upward as it scales, reduced range for desktop
const PRESS_SCALE_ACTIVE = 0.98;

/* ---------- Motion timing ---------- */
const ENTRANCE_DURATION = 0.7; // Motion durations are seconds.
const ENTRANCE_EASE = 'easeOut';
const NAV_ENTRANCE_DURATION = 0.4;
const REVEAL_DURATION = 0.45;
const REVEAL_EASE = 'easeOut';
const STAGGER_STEP_MS = 110;
const STAGGER_MAX_MS = 450;
const NAV_STAGGER_STEP_MS = 55;
const NAV_STAGGER_MAX_MS = 220;
const HERO_MASK_DURATION = 0.9; // seconds for horizontal shutter

/* ---------- State ---------- */
let heroStage: HTMLElement | null = null;
let heroImg: HTMLImageElement | null = null;
let heroFrame = 0;
let heroPending = false;
let reduced = false;
let reduceMedia: MediaQueryList | null = null;

let revealStops: (() => void)[] = [];
let revealAnimations: ReturnType<typeof animate>[] = [];
let pressCleanups: (() => void)[] = [];
let entranceTimers: number[] = [];

/* ---------- Helpers ---------- */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clearEntranceTimers(): void {
  entranceTimers.forEach((t) => clearTimeout(t));
  entranceTimers = [];
}

function heroValues(): { scale: number; objectPositionTop: number } {
  const rect = heroStage?.getBoundingClientRect() ?? { top: 0, height: 0 };
  const viewHeight = window.innerHeight;
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
  if (reduced || !heroImg || !heroParallaxAllowed()) return;
  const { scale, objectPositionTop } = heroValues();
  heroImg.style.transform = `scale(${scale})`;
  heroImg.style.objectPosition = `50% ${objectPositionTop}%`;
}

function scheduleHero(): void {
  if (heroPending || !heroParallaxAllowed()) return;
  heroPending = true;
  heroFrame = requestAnimationFrame(updateHero);
}

function startHero(): void {
  if (reduced || !heroImg || !heroParallaxAllowed()) return;
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

/* ---------- Breakpoint change: parallax lives on desktop only ---------- */
function onHeroBreakpointChange(): void {
  if (heroParallaxAllowed() && !reduced && !SUPPORTS_SCROLL_DRIVEN) startHero();
  else stopHero();
}

function restoreVisible(targets: HTMLElement[]): void {
  targets.forEach((el) => {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.style.removeProperty('clip-path');
  });
}

function trackAnimation(animation: ReturnType<typeof animate>, cleanup?: () => void): void {
  revealAnimations.push(animation);
  const settle = (): void => {
    revealAnimations = revealAnimations.filter((item) => item !== animation);
    cleanup?.();
  };
  animation.then(settle, settle);
}

/* ---------- Hero mask entrance (JS-driven, one-time on load) ---------- */
function choreographHeroMask(): void {
  if (reduced || !heroImg) return;
  try {
    // Horizontal shutter: start fully clipped, animate open
    heroImg.style.clipPath = 'inset(0 100% 0 0)';
    const animation = animate(
      heroImg,
      { clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] },
      { duration: 900, ease: 'easeOut' }
    );
    trackAnimation(animation, () => {
      heroImg?.classList.add('mask-revealed');
      heroImg?.style.removeProperty('clip-path');
    });
  } catch {
    heroImg?.classList.add('mask-revealed');
    heroImg?.style.removeProperty('clip-path');
  }
}

/* ---------- Press feedback ---------- */
function attachPressFeedback(): void {
  if (reduced) return;
  try {
    pressCleanups.forEach((cleanup) => cleanup());
    pressCleanups = [];
    document.querySelectorAll<HTMLElement>(INTERACTION_SELECTORS).forEach((el) => {
      let active: ReturnType<typeof animate> | null = null;
      let pressed = false;
      const playPress = (from: number, to: number, duration: number): void => {
        const animation = animate(el, { scale: [from, to] }, { duration });
        active = animation;
        const clearTransform = (): void => {
          if (active !== animation) return;
          active = null;
          el.style.removeProperty('transform');
        };
        animation.then(clearTransform, clearTransform);
      };
      const release = (): void => {
        if (!pressed) return;
        pressed = false;
        if (active) {
          active.stop();
          active = null;
        }
        playPress(PRESS_SCALE_ACTIVE, 1, 0.16);
      };
      const onPointerDown = (): void => {
        pressed = true;
        if (active) active.stop();
        playPress(1, PRESS_SCALE_ACTIVE, 0.1);
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

/* ---------- Hero entrance — on load, staggered ---------- */
function choreographHeroEntrance(): void {
  if (reduced) return;
  const stage = document.querySelector<HTMLElement>(HERO_SELECTOR);
  if (!stage) return;
  try {
    const targets = Array.from(
      stage.querySelectorAll<HTMLElement>(HERO_TEXT_SELECTORS)
    );
    if (!targets.length) return;
    targets.forEach((el, i) => {
      const delayMs = Math.min(i * STAGGER_STEP_MS, STAGGER_MAX_MS);
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      const timer = window.setTimeout(() => {
        try {
          const a = animate(
            el,
            { opacity: [0, 1], y: [30, 0] },
            { duration: ENTRANCE_DURATION, ease: ENTRANCE_EASE }
          );
          trackAnimation(a, () => {
            el.style.removeProperty('opacity');
            el.style.removeProperty('transform');
          });
        } catch {
          restoreVisible([el]);
        }
      }, delayMs);
      entranceTimers.push(timer);
    });
  } catch {
    stage.querySelectorAll<HTMLElement>(HERO_TEXT_SELECTORS).forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

/* ---------- Nav entrance — on load, staggered ---------- */
function choreographNavEntrance(): void {
  if (reduced) return;
  const nav = document.querySelector<HTMLElement>('#main-nav');
  if (!nav) return;
  try {
    const targets = Array.from(
      nav.querySelectorAll<HTMLElement>(NAV_LINK_SELECTORS)
    );
    if (!targets.length) return;
    targets.forEach((el, i) => {
      const delayMs = Math.min(i * NAV_STAGGER_STEP_MS, NAV_STAGGER_MAX_MS);
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      const timer = window.setTimeout(() => {
        try {
          const a = animate(
            el,
            { opacity: [0, 1], y: [10, 0] },
            { duration: NAV_ENTRANCE_DURATION, ease: ENTRANCE_EASE }
          );
          trackAnimation(a, () => {
            el.style.removeProperty('opacity');
            el.style.removeProperty('transform');
          });
        } catch {
          restoreVisible([el]);
        }
      }, delayMs);
      entranceTimers.push(timer);
    });
  } catch {
    nav.querySelectorAll<HTMLElement>(NAV_LINK_SELECTORS).forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

/* ---------- Scroll reveals — one-shot, IntersectionObserver (JS fallback) ---------- */
function revealSections(): void {
  if (reduced) return;
  if (typeof IntersectionObserver === 'undefined') return;
  if (SUPPORTS_SCROLL_DRIVEN) return; // CSS handles it

  try {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS)
    );
    if (!targets.length) return;
    targets.forEach((el, i) => {
      const delayMs = Math.min(i * 55, STAGGER_MAX_MS);
      const stop = inView(el, () => {
        const delay = delayMs / 1000;
        let animation: ReturnType<typeof animate>;
        if (el.matches('#galeria figure')) {
          if (typeof CSS !== 'undefined' && CSS.supports('clip-path', 'inset(0 0 14% 0 round 8px)')) {
            animation = animate(
              el,
              { opacity: [0.78, 1], y: [18, 0], clipPath: ['inset(0 0 16% 0 round 8px)', 'inset(0 0 0 0 round 8px)'] },
              { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }
            );
          } else {
            animation = animate(el, { opacity: [0, 1], y: [22, 0] }, { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay });
          }
        } else if (el.matches('#reservas li')) {
          animation = animate(el, { opacity: [0, 1], x: [18, 0] }, { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay });
        } else if (el.matches('footer')) {
          animation = animate(el, { opacity: [0, 1], y: [12, 0] }, { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay });
        } else if (el.matches('#carta h3')) {
          animation = animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay });
        } else {
          const distance = el.matches('.market-item') ? 16 : 12;
          animation = animate(el, { opacity: [0, 1], y: [distance, 0] }, { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay });
        }
        trackAnimation(animation, () => {
          el.style.removeProperty('opacity');
          el.style.removeProperty('transform');
          el.style.removeProperty('clip-path');
        });
        stop(); // one-shot
      }, { margin: '-12% 0 0 0' });
      revealStops.push(stop);
    });
  } catch {
    document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS).forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.removeProperty('clip-path');
    });
  }
}

function stopReveals(): void {
  revealStops.forEach((stop) => stop());
  revealStops = [];
  revealAnimations.forEach((a) => a.stop());
  revealAnimations = [];
}

function stopEntrances(): void {
  clearEntranceTimers();
}

function onReduceChange(): void {
  const next = reduceMedia?.matches ?? false;
  if (next === reduced) return;
  reduced = next;
  if (reduced) {
    stopHero();
    stopReveals();
    stopEntrances();
    if (heroImg) {
      heroImg.style.transform = '';
      heroImg.style.objectPosition = '';
      heroImg.style.clipPath = '';
      heroImg.classList.remove('mask-revealed');
    }
    document.querySelectorAll<HTMLElement>('#galeria figure').forEach((figure) => {
      figure.style.clipPath = '';
    });
    document.querySelectorAll<HTMLElement>('#galeria .gallery-img').forEach((img) => {
      img.style.transform = '';
    });
    pressCleanups.forEach((cleanup) => cleanup());
    pressCleanups = [];
    restoreVisible(
      Array.from(
        document.querySelectorAll<HTMLElement>(
          `${REVEAL_SELECTORS}, ${HERO_TEXT_SELECTORS}, ${NAV_LINK_SELECTORS}`
        )
      )
    );
  } else {
    if (!SUPPORTS_SCROLL_DRIVEN && heroParallaxAllowed()) startHero();
    attachPressFeedback();
  }
}

/* ---------- Init ---------- */
function init(): void {
  if (typeof window === 'undefined') return;
  try {
    const stage = document.querySelector<HTMLElement>(HERO_SELECTOR);
    heroStage = stage ?? null;
    heroImg = stage?.querySelector<HTMLImageElement>('img') ?? null;

    reduceMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = reduceMedia.matches;
    reduceMedia.addEventListener('change', onReduceChange);

    // Desktop-only parallax gate for the JS fallback layer (the CSS
    // scroll-driven parallax is already scoped to @media (min-width: 1024px)).
    heroDesktopMedia = window.matchMedia(HERO_DESKTOP_QUERY);
    heroDesktopMedia.addEventListener('change', onHeroBreakpointChange);

    if (!reduced) {
      // JS-owned horizontal shutter (clip-path mask), runs even when CSS
      // scroll-driven animations are supported. CSS handles parallax/reveals
      // via @supports; this is the fallback-only JS layer.
      choreographHeroMask();
      // JS entrance effects only when scroll-driven animations are not supported:
      if (!SUPPORTS_SCROLL_DRIVEN) {
        if (heroParallaxAllowed()) startHero();
        choreographHeroEntrance();
        choreographNavEntrance();
        revealSections();
      }
      attachPressFeedback();
    } else {
      attachPressFeedback();
    }
  } catch {
    // Motion is progressive enhancement. Any failure leaves the page
    // exactly as HTML/CSS rendered it — fully visible.
  }
}

init();