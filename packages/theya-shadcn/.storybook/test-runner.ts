import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';

/**
 * Wires axe-core's full violation output (rule id, impact, affected DOM node,
 * and a "how to fix" summary) into the test-runner's console output — without
 * this, a11y issues only show up as a bare count ("Found N a11y violations").
 *
 * Mirrors packages/components/.storybook/test-runner.ts (the corporate DS's
 * existing axe setup) so both packages report violations the same way.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Run every story with prefers-reduced-motion. axe checks contrast on
    // whatever is on screen at that instant, so an open/fade-in animation
    // still in flight reads as low-contrast text and fails at random
    // (NavigationMenu/Open, 2026-09-29: 709/710 with the flyout mid-fade).
    // Components already honour motion-reduce, so this checks their final
    // resting state, which is what the a11y audit is about.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // THEYA_THEME=dark runs the whole suite (play + axe) in the dark theme:
    // same data-theme switch preview.ts applies from the toolbar toggle,
    // set before the story renders so portals and mount-time reads see it.
    if (process.env.THEYA_THEME === 'dark') {
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    }
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Skip a11y checks for stories that opt out (e.g. deliberately incomplete states)
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules ?? [],
    });

    await checkA11y(page, '#storybook-root', {
      axeOptions: storyContext.parameters?.a11y?.options,
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
