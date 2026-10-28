import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect } from '@playwright/test';
import { voiceOverTest as test } from '@guidepup/playwright';
import { SCENARIOS } from './scenarios';

/**
 * For each scenario: open the story, move VoiceOver into the page, do the
 * action, and keep reading VoiceOver's last spoken phrase while it talks.
 * A scenario passes when every expected text was among the phrases heard.
 * Results go to results/<browser>-<date>.json for the a11y matrix.
 */
interface Result {
  id: string;
  component: string;
  story: string;
  browser: string;
  pass: boolean;
  missing: string[];
  heard: string[];
}

const results: Result[] = [];

/**
 * Brings the browser Playwright already launched to the front.
 * Guidepup's navigateToWebContent() does this with `tell application id … to
 * activate`, and on macOS 26 that tries to launch a second copy of Playwright's
 * WebKit / Chrome for Testing instead (the AppleEvent times out). System Events
 * only touches the running process. VoiceOver then follows keyboard focus, which
 * the scenarios set with Playwright.
 */
const BROWSER_PROCESSES: Record<string, string[]> = {
  webkit: ['Playwright', 'MiniBrowser'],
  chromium: ['Google Chrome for Testing', 'Chromium'],
};
function bringBrowserToFront(browserName: string) {
  for (const name of BROWSER_PROCESSES[browserName] ?? []) {
    try {
      execFileSync('osascript', ['-e', `tell application "System Events" to if exists process "${name}" then set frontmost of process "${name}" to true`], { timeout: 10_000 });
    } catch {
      // Not this process name; try the next one.
    }
  }
}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Our own listener reads the phrases, so Guidepup's per-command capture is off.
test.use({ voiceOverStartOptions: { capture: false } });

for (const s of SCENARIOS) {
  test(s.id, async ({ page, voiceOver, browserName }) => {
    test.skip(Boolean(s.manual), s.manual);
    await page.goto(`/iframe.html?id=${s.story}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // the story's own play test runs on load
    bringBrowserToFront(browserName);
    await page.bringToFront();
    await page.waitForTimeout(500);

    const heard: string[] = [];
    let listening = true;
    const listener = (async () => {
      while (listening) {
        const phrase = (await voiceOver.lastSpokenPhrase().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (phrase && heard[heard.length - 1] !== phrase) heard.push(phrase);
        await sleep(150);
      }
    })();

    await s.act(page);
    await page.waitForTimeout(s.listen ?? 2500);
    listening = false;
    await listener;

    const text = heard.join(' | ').toLowerCase();
    const missing = s.expect.filter((e) => !text.includes(e.toLowerCase()));
    results.push({ id: s.id, component: s.component, story: s.story, browser: browserName, pass: missing.length === 0, missing, heard });
    expect.soft(missing, `Not spoken. Heard: ${heard.join(' | ')}`).toEqual([]);
  });
}

test.afterAll(({ browserName }) => {
  if (!results.length) return;
  const dir = join(__dirname, 'results');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${browserName}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  writeFileSync(file, JSON.stringify({ at: 'VoiceOver', browser: browserName, date: new Date().toISOString().slice(0, 10), results }, null, 2) + '\n');
  console.log(`\nVoiceOver: ${results.filter((r) => r.pass).length}/${results.length} passed → ${file}`);
});
