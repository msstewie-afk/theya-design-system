'use client';

/**
 * Storybook: run a story's play only in the automated runs (test-runner,
 * Playwright, CI), where navigator.webdriver is true — not when a person
 * opens the story. A play that clicks or types left the story changed
 * (a value typed into a field, a dialog opened and filled) for anyone
 * reviewing it or reading it with VoiceOver (Maria, 2026-11-08).
 * "Test: …" stories keep their play unwrapped, to watch it run.
 */
export function testOnly<A extends unknown[]>(play: (...args: A) => Promise<void> | void) {
  return async (...args: A) => {
    if (typeof navigator !== 'undefined' && !navigator.webdriver) return;
    await play(...args);
  };
}
