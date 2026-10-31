#!/usr/bin/env node
/**
 * Dry run of the VoiceOver scenarios without a screen reader: performs each
 * scenario's action in Chromium and lists the text that reaches live regions
 * (and focus moves) afterwards, so a scenario can be checked in CI or on
 * Linux before a real VoiceOver run. Needs Storybook running (STORYBOOK_URL,
 * default http://localhost:6008).
 *
 *   node a11y/voiceover/dry-run.mjs            # all scenarios
 *   node a11y/voiceover/dry-run.mjs button     # ids containing "button"
 */
import { chromium } from '@playwright/test';
import { SCENARIOS } from './scenarios.ts';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6008';
const filter = process.argv[2];

const watch = () => {
  const heard = [];
  const live = '[aria-live]:not([aria-live="off"]),[role=status],[role=alert],[role=log],[role=alertdialog]';
  const push = (t) => {
    t = (t ?? '').replace(/\s+/g, ' ').trim();
    if (t && heard[heard.length - 1] !== t) heard.push(t);
  };
  new MutationObserver((list) => {
    for (const m of list) {
      const node = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      const region = node?.closest(live);
      if (region) push(region.textContent);
      for (const added of m.addedNodes) if (added.nodeType === 1 && added.matches?.(live)) push(added.textContent);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    push('focus: ' + (el.getAttribute?.('aria-label') || el.innerText || el.getAttribute?.('placeholder') || el.tagName));
  });
  window.__heard = heard;
};

const browser = await chromium.launch();
let failed = 0;
for (const s of SCENARIOS.filter((x) => !filter || x.id.includes(filter))) {
  if (s.manual) { console.log(`skip ${s.id}: ${s.manual}`); continue; }
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  try {
    await page.goto(`${BASE}/iframe.html?id=${s.story}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // let the story's own play function finish
    await page.evaluate(watch);
    await s.act(page);
    await page.waitForTimeout(s.listen ?? 2500);
    const heard = await page.evaluate(() => window.__heard);
    const text = heard.join(' | ').toLowerCase();
    const missing = s.expect.filter((e) => !text.includes(e.toLowerCase()));
    if (missing.length) failed++;
    console.log(`${missing.length ? 'MISS' : 'ok  '} ${s.id}\n      heard: ${heard.join(' | ').slice(0, 1500)}${missing.length ? `\n      missing: ${missing.join(', ')}` : ''}`);
  } catch (error) {
    failed++;
    console.log(`ERR  ${s.id}: ${String(error).split('\n')[0]}`);
  }
  await page.close();
}
await browser.close();
process.exitCode = failed ? 1 : 0;
