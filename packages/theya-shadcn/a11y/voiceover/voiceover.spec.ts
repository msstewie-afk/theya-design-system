import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test as base, type Page } from '@playwright/test';
import { voiceOver } from '@guidepup/guidepup';
import { SCENARIOS, pace } from './scenarios';

/**
 * For each scenario: open the story, move VoiceOver into the page, do the
 * action, and record two timelines side by side:
 *   heard     — every phrase VoiceOver spoke (polled ~20×/s);
 *   published — every text the page put into a live region (and focus moves).
 * A scenario passes when every expected text was heard. When it fails, the
 * `published` timeline tells whether the page never said it (component bug)
 * or said it and VoiceOver dropped it (timing / screen reader behaviour).
 * All tests of one run write into one file: results/<browser>-<run>.json.
 *
 * VoiceOver and the browser window live for the whole worker, not per test:
 * Guidepup's voiceOverTest restarts VoiceOver for every test, and VoiceOver
 * then spends the first seconds announcing the new window, dropping the
 * announcements the scenario is about. Before and after each action the
 * runner waits until VoiceOver has finished speaking.
 */
interface Line {
  /** ms since the action started (negative = before it). */
  t: number;
  text: string;
}
interface Result {
  id: string;
  component: string;
  story: string;
  browser: string;
  pass: boolean;
  missing: string[];
  /** For each missing text: whether the page published it at all. */
  diagnosis: Record<string, 'published, not spoken' | 'never published'>;
  heard: Line[];
  published: Line[];
  pollerErrors: string[];
}

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

/**
 * One long-running osascript that polls VoiceOver's last phrase every 50 ms and
 * logs each new one to stderr. Spawning osascript per poll takes ~100–200 ms,
 * long enough to miss a short announcement that is replaced right away.
 * (Guidepup 0.36 `voiceOver.lastSpokenPhrase()` only returns its own capture
 * log, which stays empty when Playwright drives the page.)
 */
/** VO_POLL_MS: how often to ask VoiceOver for its last phrase (default 50). */
const POLL_SECONDS = Math.max(20, Number(process.env.VO_POLL_MS ?? 50)) / 1000;
const POLLER = [
  'set lastPhrase to ""',
  'repeat',
  'set p to ""',
  'try',
  'tell application "VoiceOver" to set p to content of last phrase',
  'end try',
  'if p is missing value then set p to ""',
  'if p is not "" and p is not lastPhrase then',
  'set lastPhrase to p',
  'log "§VO§" & p',
  'end if',
  `delay ${POLL_SECONDS}`,
  'end repeat',
];
function startPoller(onPhrase: (text: string) => void, onError: (text: string) => void): ChildProcess {
  const child = spawn('osascript', POLLER.flatMap((line) => ['-e', line]));
  let buffer = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => {
    buffer += chunk;
    const parts = buffer.split('§VO§');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const text = part.replace(/\s+/g, ' ').trim();
      if (text) onPhrase(text);
    }
  });
  child.on('error', (error) => onError(String(error)));
  child.on('exit', (code) => {
    const rest = buffer.replace(/\s+/g, ' ').trim();
    if (rest) onPhrase(rest);
    if (code && code !== 143 && code !== 0) onError(`poller exited with ${code}`);
  });
  return child;
}

/** Records live-region text and focus moves in the page, with Date.now() stamps. */
async function watchPage(page: Page) {
  await page.evaluate(() => {
    const log: { at: number; text: string }[] = [];
    const live = '[aria-live]:not([aria-live="off"]),[role=status],[role=alert],[role=log],[role=alertdialog]';
    const push = (raw: string | null | undefined) => {
      const text = (raw ?? '').replace(/\s+/g, ' ').trim();
      if (text && log[log.length - 1]?.text !== text) log.push({ at: Date.now(), text });
    };
    new MutationObserver((list) => {
      for (const m of list) {
        const node = m.target.nodeType === 1 ? (m.target as Element) : m.target.parentElement;
        const region = node?.closest(live);
        if (region) push(region.textContent);
        for (const added of m.addedNodes) if (added.nodeType === 1 && (added as Element).matches?.(live)) push(added.textContent);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
    document.addEventListener('focusin', (e) => {
      const el = e.target as HTMLElement;
      push('focus: ' + (el.getAttribute?.('aria-label') || el.innerText || el.getAttribute?.('placeholder') || el.tagName));
    });
    (window as unknown as { __published: typeof log }).__published = log;
  });
}

const RUN = process.env.VO_RUN_ID ?? new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

/** Playwright restarts the worker after a failure, so results are merged in the file per test. */
function saveResult(result: Result) {
  const dir = join(__dirname, 'results');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${result.browser}-${RUN}.json`);
  const data = existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as { results: Result[] })
    : { at: 'VoiceOver', browser: result.browser, date: new Date().toISOString().slice(0, 10), results: [] as Result[] };
  data.results = [...data.results.filter((r) => r.id !== result.id), result];
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  const passed = data.results.filter((r) => r.pass).length;
  console.log(`VoiceOver: ${passed}/${data.results.length} passed so far → ${file}`);
}

type Spoken = { at: number; text: string };

/** Rough speaking time of a phrase at VoiceOver's default rate (~15 characters per second). */
const speakingTime = (text: string) => text.length * 65;

/** Resolves once VoiceOver has been silent for `quietMs` after its last phrase, or after `maxMs`. */
async function waitForQuiet(page: Page, spoken: Spoken[], { quietMs = 700, maxMs = 10_000 } = {}) {
  const from = Date.now();
  while (Date.now() - from < maxMs) {
    const last = spoken[spoken.length - 1];
    const doneAt = last ? last.at + speakingTime(last.text) : from;
    if (Date.now() - doneAt > quietMs) return;
    await page.waitForTimeout(100);
  }
}

const STORYBOOK = process.env.STORYBOOK_URL ?? 'http://localhost:6008';

const test = base.extend<object, { vo: { page: Page; spoken: Spoken[]; pollerErrors: string[] } }>({
  vo: [
    async ({ browser, browserName }, use) => {
      const context = await browser.newContext({ baseURL: STORYBOOK, viewport: { width: 1200, height: 800 } });
      const page = await context.newPage();
      await page.goto('/iframe.html?id=actions-button--interactive-loading&viewMode=story', { waitUntil: 'networkidle' });
      // Hints ("You are currently on…, to click press…") are spoken after this
      // delay and talk over the announcements under test; push it out of the
      // run. This is Guidepup's own VoiceOver preference set, not the user's.
      await voiceOver.start({ capture: false, settings: { SCRContextualHelpDelayInSeconds: 3600 } });
      bringBrowserToFront(browserName);
      await page.bringToFront();
      const spoken: Spoken[] = [];
      const pollerErrors: string[] = [];
      const poller = startPoller(
        (text) => spoken.push({ at: Date.now(), text }),
        (text) => { if (!pollerErrors.includes(text)) pollerErrors.push(text); },
      );
      await page.waitForTimeout(1000);
      await waitForQuiet(page, spoken, { maxMs: 15_000 });
      // Before each key: wait until VoiceOver has said something since the last
      // key (the focus move), then until it is quiet — as a person would.
      pace.beforeKey = async (p) => {
        const from = Date.now();
        while (spoken.length <= pace.mark && Date.now() - from < 3_000) await p.waitForTimeout(100);
        await waitForQuiet(p, spoken, { quietMs: 400, maxMs: 6_000 });
        pace.mark = spoken.length;
      };
      // Real key presses go to the frontmost app: make sure it is the browser,
      // so a stray window never receives the scenario's keys.
      const names = BROWSER_PROCESSES[browserName] ?? [];
      const frontmost = () => execFileSync('osascript', ['-e', 'tell application "System Events" to get name of first process whose frontmost is true'], { encoding: 'utf8', timeout: 10_000 }).trim();
      const ensureFront = () => {
        if (names.includes(frontmost())) return;
        bringBrowserToFront(browserName);
        const front = frontmost();
        if (!names.includes(front)) throw new Error(`"${front}" is in front, not the browser; not sending keys.`);
      };
      pace.key = async (_p, key) => { ensureFront(); await voiceOver.press(key); };
      // Text stays with Playwright: OS keystrokes follow the active keyboard
      // layout (a Russian layout types "ф" for "a"), and typing echo is not
      // what the scenarios test.
      try {
        await use({ page, spoken, pollerErrors });
      } finally {
        poller.kill();
        await voiceOver.stop().catch(() => {});
        await context.close();
      }
    },
    { scope: 'worker', timeout: 120_000 },
  ],
});

for (const s of SCENARIOS) {
  test(s.id, async ({ vo, browserName }) => {
    test.skip(Boolean(s.manual), s.manual);
    const { page, spoken, pollerErrors } = vo;
    await page.goto(`/iframe.html?id=${s.story}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // the story's own play test runs on load
    await waitForQuiet(page, spoken);
    await watchPage(page);

    const start = Date.now();
    pace.mark = spoken.length;
    await s.act(page);
    await page.waitForTimeout(s.listen ?? 2500);
    await waitForQuiet(page, spoken, { maxMs: 8_000 });

    const published = await page.evaluate(() => (window as unknown as { __published: Spoken[] }).__published ?? []);
    const rel = (lines: Spoken[]) => lines.map((l) => ({ t: l.at - start, text: l.text }));
    const heard = rel(spoken.filter((l) => l.at >= start));
    const text = heard.map((l) => l.text).join(' | ').toLowerCase();
    const missing = s.expect.filter((e) => !text.includes(e.toLowerCase()));
    const publishedText = published.map((l) => l.text).join(' | ').toLowerCase();
    const diagnosis = Object.fromEntries(
      missing.map((m) => [m, publishedText.includes(m.toLowerCase()) ? 'published, not spoken' : 'never published'] as const),
    );
    saveResult({ id: s.id, component: s.component, story: s.story, browser: browserName, pass: missing.length === 0, missing, diagnosis, heard, published: rel(published), pollerErrors: [...pollerErrors] });
    if (pollerErrors.length) console.log(`[${s.id}] VoiceOver poller: ${pollerErrors.join(' || ')}`);
    expect.soft(missing, `Not spoken (${JSON.stringify(diagnosis)}). Heard: ${heard.map((l) => l.text).join(' | ') || '(nothing)'}`).toEqual([]);
  });
}
