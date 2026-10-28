import { devices } from '@playwright/test';
import { withGuidepup } from '@guidepup/playwright';

/**
 * Real VoiceOver run of the screen-reader checklist, part A (WCAG 4.1.3).
 * macOS only, with Storybook running. See README.md in this folder.
 *
 *   pnpm a11y:voiceover                          # WebKit (Safari's engine)
 *   VO_BROWSER=chromium pnpm a11y:voiceover      # Chrome's engine
 *   pnpm a11y:voiceover -g kanban                # one scenario
 */
export default withGuidepup({
  testDir: '.',
  testMatch: 'voiceover.spec.ts',
  outputDir: 'test-results',
  timeout: 120_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.STORYBOOK_URL ?? 'http://localhost:6008',
    viewport: { width: 1200, height: 800 },
  },
  projects:
    process.env.VO_BROWSER === 'chromium'
      ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1200, height: 800 } } }]
      : [{ name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1200, height: 800 } } }],
});
