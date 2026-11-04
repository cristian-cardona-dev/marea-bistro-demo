PACT HANDOFF — coder → reviewer
SESSION: trace-marea-quality-2026-11-02 / loop-marea-quality-2026-11-02 / task-marea-static-pact-refresh
WORKTREE: C:\Users\CARDONA\Desktop\portfolio\restaurant-template-marea-v0 (branch ai/marea-v0, base c3350fc01057ae5cd655131e4b230fa9968dfd61)
STATUS: completed (documentation-only refresh; no commit/push/merge per brief)

SUBTASK: Final static Mercado Central interior hero — single sticky archive image, no scene swap / second layer / IntersectionObserver / data-market-scene; bento gallery exterior → Albufera → artichokes with linked source/license credits; valid menu list; SiteConfig gallery parity; static mobile hero; reduced-motion-safe section reveals; localhost:4323 Playwright config; 10-test static-hero suite including 0_story_hero_static_credits_gallery_mobile; screenshots captured; official inspector not run (Chrome exited code 0).

IMPLEMENTED
- src/components/Hero.astro: rewritten as a single static, sticky Mercado Central interior archive image at desktop. No scene swapping, no second image layer, no IntersectionObserver in Hero, no [data-market-scene] attribute on Hero. Mobile: ordinary static interior hero.
- src/components/Menu.astro: every <ul> direct child is an <li class="market-item"> wrapping a .market-row (name/price) plus its .market-note paragraph — no bare <p> under <ul>. Borderless ledger rhythm preserved.
- src/pages/index.astro: credits.json as single attribution source; gallery built from siteConfig.images.gallery in order exterior → Albufera → artichokes; each caption renders title/creator/license/via plus clickable fuente + licencia hyperlinks (target="_blank" rel="noopener", underline, inherited color). One bento composition: exterior full width (lg:col-span-2), Albufera + artichokes paired at tablet/desktop, stacked at phone. Captions 16px (text-base).
- src/config/site.ts: images.gallery synced to [mercado-central-exterior, albufera-gaianes, valencia-market-artichokes] — parity with the rendered bento gallery.
- src/styles/global.css: hero cross-fade transition removed; simple reduced-motion-safe section reveals preserved.
- tests/e2e/restaurant.spec.ts: suite = 10 cases including 0_story_hero_static_credits_gallery_mobile; static-hero, credit-link, gallery and mobile assertions; no scene-sequence behavior assertion.
- playwright.config.ts: baseURL + webServer.url/host set to localhost:4323 (app reachable at localhost, not 127.0.0.1); reuseExistingServer preserved.

TESTS (parent-verified final gate; coder ran no build/E2E — docs-only)
- npm run test:e2e -- --project=chromium: 10 passed / 0 failed. Playwright webServer triggered a single current build at localhost:4323.
- npx astro check: 0 errors, 0 warnings (9 pre-existing deprecation hints only).
- git diff --check: clean (only benign LF/CRLF line-ending warnings).
- Taste lint: 0 FAIL / 1 WARN (intentional 1px outline — accepted).
- Official inspector (inspect.mjs): NOT run — Chrome exited early code 0. Inspector unavailable; no PASS claim.

Screenshot evidence (captured via one dev server; server kept alive; no process killed):
- screenshot-mobile-390x844.png, screenshot-tablet-768x1024.png, screenshot-desktop-1280x720.png, screenshot-desktop-1440x900.png
- screenshot-desktop-scroll-carta.png, screenshot-desktop-scroll-galeria.png, screenshot-desktop-scroll-reservas.png
- screenshot-reduced-motion-1280x720.png

ASSUMPTIONS
[1] credits.json remains the single source of truth for image attribution; no second metadata source introduced (per scope_out).
[2] Bento order exterior → Albufera → artichokes matches the rendered gallery and SiteConfig parity as verified by the parent gate.
[3] Reduced-motion behavior = static hero, no cross-fade; content always visible (simplest truthful behavior per brief).

CONCERNS
- Official inspector (inspect.mjs) unavailable — Chrome exited early code 0; visual quality rests on screenshot + E2E evidence only. Reviewer: human should review final screenshots; no production-readiness claim.
- playwright.config.ts host set to localhost (required for the app to load); reviewer should note config diff if promoting.
- Worktree remains dirty on ai/marea-v0 with all changes uncommitted; PACT-HANDOFF.md itself is untracked. No commit/push/merge per brief.

NEXT STEPS
- Reviewer (fresh, independent) + T2 Guardian to evaluate screenshots and green gate; human reviews final screenshots; no production-readiness claim.
- No commit/push/merge — worktree left on ai/marea-v0 with changes uncommitted, per brief/no-commit policy.
