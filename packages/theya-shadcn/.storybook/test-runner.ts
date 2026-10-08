import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';
import path from 'node:path';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// Visual regression (THEYA_VISUAL=1): one screenshot per story after its
// play function, compared with a baseline in __visual__/<theme>/ next to
// this package. Baselines are local and git-ignored — font rendering
// differs between machines, so they're only comparable on the machine
// that made them. Axe is skipped in this mode (the normal runs cover it).
// Opt a story out with parameters: { visual: { disable: true } }, or
// cover live content with parameters: { visual: { mask: ['<selector>'] } }.
const VISUAL = process.env.THEYA_VISUAL === '1';
const THEME = process.env.THEYA_THEME === 'dark' ? 'dark' : 'light';
// Mobile pass: THEYA_VIEWPORT=360 (Android) or 375 (iPhone) sets the page
// width, keeps baselines apart per width, and fails a story whose page
// scrolls sideways — naming the elements that stick out.
const VIEWPORT = Number(process.env.THEYA_VIEWPORT) || 0;
// THEYA_FORCED=1: Windows High Contrast (forced colors). Combine with
// THEYA_VISUAL=1 to keep a separate set of baselines for it.
const FORCED = process.env.THEYA_FORCED === '1';
const VISUAL_DIR = path.join(process.cwd(), '__visual__', [THEME, VIEWPORT || null, FORCED ? 'forced' : null].filter(Boolean).join('-'));

/**
 * Wires axe-core's full violation output (rule id, impact, affected DOM node,
 * and a "how to fix" summary) into the test-runner's console output — without
 * this, a11y issues only show up as a bare count ("Found N a11y violations").
 */
const config: TestRunnerConfig = {
  // Stories whose play test drives the desktop layout (a column that drops
  // below md, a nav that moves into a drawer) don't run at mobile widths.
  tags: VIEWPORT ? { skip: ['desktop-play'] } : {},
  setup() {
    if (VISUAL) expect.extend({ toMatchImageSnapshot });
  },
  async preVisit(page) {
    // Run every story with prefers-reduced-motion. axe checks contrast on
    // whatever is on screen at that instant, so an open/fade-in animation
    // still in flight reads as low-contrast text and fails at random
    // (NavigationMenu/Open, 2026-09-29: 709/710 with the flyout mid-fade).
    // Components already honour motion-reduce, so this checks their final
    // resting state, which is what the a11y audit is about.
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: FORCED ? 'active' : 'none' });
    if (VIEWPORT) await page.setViewportSize({ width: VIEWPORT, height: 800 });
    // THEYA_THEME=dark runs the whole suite (play + axe) in the dark theme
    // by setting the same `theme` global as the toolbar switch. Globals
    // outlive story changes, so this happens once per page load; preview.ts
    // then applies it before every story renders, portals included.
    if (process.env.THEYA_THEME === 'dark') {
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            const w = window as typeof window & {
              __theyaDarkGlobals?: boolean;
              __STORYBOOK_ADDONS_CHANNEL__: { once(event: string, fn: () => void): void; emit(event: string, payload: unknown): void };
            };
            if (w.__theyaDarkGlobals) return resolve();
            const channel = w.__STORYBOOK_ADDONS_CHANNEL__;
            channel.once('globalsUpdated', () => {
              w.__theyaDarkGlobals = true;
              resolve();
            });
            channel.emit('updateGlobals', { globals: { theme: 'dark' } });
          }),
      );
    }
    if (VISUAL) {
      // Same "random" data on every run (generated keys, ids, shuffles):
      // a seeded generator behind Math.random and crypto.getRandomValues,
      // reset before each story.
      await page.evaluate(() => {
        let seed = 0x2f6b9a1d;
        const next = () => {
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        Math.random = next;
        // Count image loads in flight, including ones started with
        // new Image() before anything is in the DOM (Avatar preloads that
        // way and shows initials until it lands), so the screenshot can wait.
        const w = window as typeof window & { __theyaPendingImages?: number };
        if (w.__theyaPendingImages === undefined) {
          w.__theyaPendingImages = 0;
          const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
          Object.defineProperty(HTMLImageElement.prototype, 'src', {
            ...desc,
            set(this: HTMLImageElement, value: string) {
              w.__theyaPendingImages! += 1;
              const done = () => {
                w.__theyaPendingImages! -= 1;
                this.removeEventListener('load', done);
                this.removeEventListener('error', done);
              };
              this.addEventListener('load', done);
              this.addEventListener('error', done);
              desc.set!.call(this, value);
            },
          });
        }
        crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
          if (array) {
            const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
            for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(next() * 256);
          }
          return array;
        };
      });
    } else {
      await injectAxe(page);
    }
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    if (VIEWPORT && !storyContext.parameters?.mobile?.skipOverflow) {
      // Elements reaching past the right edge, ignoring anything inside a
      // container that scrolls or clips horizontally on purpose (a wide
      // table in its scroll box, a carousel track).
      const offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth <= vw + 1) return [];
        const clipped = (el: Element) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox !== 'visible') return true;
          }
          return false;
        };
        const out: string[] = [];
        for (const el of Array.from(document.body.querySelectorAll('*'))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.right <= vw + 1 || clipped(el)) continue;
          // Report the outermost offender only.
          if (el.parentElement && el.parentElement.getBoundingClientRect().right > vw + 1 && !clipped(el.parentElement) && el.parentElement !== document.body) continue;
          const slot = el.getAttribute('data-slot');
          const cls = (el.getAttribute('class') ?? '').split(/\s+/).slice(0, 3).join('.');
          const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
          out.push(`<${el.tagName.toLowerCase()}${slot ? ` data-slot=${slot}` : ''}${cls ? ` .${cls}` : ''}> right=${Math.round(r.right)}px "${text}"`);
          if (out.length >= 5) break;
        }
        if (out.length) return out;
        // Nothing sticks out on its own: the page is widened by something
        // inside a clipping box (or a positioned element). Name the widest
        // elements past the edge with a short ancestor path to find it.
        const path = (el: Element) => {
          const parts: string[] = [];
          for (let p: Element | null = el; p && p !== document.body && parts.length < 4; p = p.parentElement) {
            const c = (p.getAttribute('class') ?? '').split(/\s+/).slice(0, 2).join('.');
            parts.unshift(`${p.tagName.toLowerCase()}${c ? `.${c}` : ''}`);
          }
          return parts.join(' > ');
        };
        // The element whose right edge sets the page's scroll width is the
        // one to fix; list those first, then the widest past the edge.
        const sw = document.documentElement.scrollWidth;
        const all = Array.from(document.body.querySelectorAll('*')).map((el) => ({ el, right: el.getBoundingClientRect().right + window.scrollX }));
        const atEdge = all.filter((x) => Math.abs(x.right - sw) <= 1);
        const wide = (atEdge.length ? atEdge : all.filter((x) => x.right > vw + 1).sort((a, b) => b.right - a.right))
          .slice(0, 3)
          .map((x) => `${path(x.el)} right=${Math.round(x.right)}px pos=${getComputedStyle(x.el).position}`);
        return [`page is ${document.documentElement.scrollWidth}px wide`, ...wide];
      });
      if (offenders.length) {
        throw new Error(`Horizontal overflow at ${VIEWPORT}px:\n  ${offenders.join('\n  ')}`);
      }
    }

    if (VISUAL) {
      if (storyContext.parameters?.visual?.disable) return;
      // Settle: web fonts and images loaded, then two frames for layout
      // after the play function. CSS animations are finished and the caret hidden by
      // the screenshot itself.
      await page.evaluate(() => document.fonts.ready);
      // Images: wait until every started load has finished (max 5 s), then
      // until every <img> in the page is complete.
      await page
        .waitForFunction(
          () =>
            ((window as typeof window & { __theyaPendingImages?: number }).__theyaPendingImages ?? 0) <= 0 &&
            Array.from(document.images).every((img) => img.complete),
          undefined,
          { timeout: 5000 },
        )
        .catch(() => {});
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      // parameters.visual.mask: selectors for content that changes on its
      // own (a live timer) — covered with a solid box, layout still checked.
      const mask = ((storyContext.parameters?.visual?.mask ?? []) as string[]).map((selector) => page.locator(selector));
      const image = await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide', mask });
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: VISUAL_DIR,
        customDiffDir: path.join(VISUAL_DIR, '__diff__'),
        customSnapshotIdentifier: context.id,
        // Same machine renders identically, so allow only stray
        // anti-aliasing pixels: a recolored 1px border on a small
        // button is already well over 50.
        failureThreshold: 50,
        failureThresholdType: 'pixel',
      });
      return;
    }

    // Skip a11y checks for stories that opt out (e.g. deliberately incomplete states)
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      // target-size (WCAG 2.5.8, 24×24 px minimum) is off in axe by default;
      // on here so the criterion has automated evidence. A story can still
      // switch it off with a reason in parameters.a11y.config.rules.
      rules: [{ id: 'target-size', enabled: true }, ...(storyContext.parameters?.a11y?.config?.rules ?? [])],
    });

    // The a11y addon in the preview runs its own axe after a play function
    // finishes; when ours starts in the same moment axe throws "Axe is already
    // running". Retry briefly instead of failing a story that passed.
    for (let attempt = 0; ; attempt++) {
      try {
        await checkA11y(page, '#storybook-root', {
          axeOptions: storyContext.parameters?.a11y?.options,
          detailedReport: true,
          detailedReportOptions: { html: true },
        });
        break;
      } catch (error) {
        if (attempt >= 10 || !String(error).includes('Axe is already running')) throw error;
        await page.waitForTimeout(200);
      }
    }
  },
};

export default config;
