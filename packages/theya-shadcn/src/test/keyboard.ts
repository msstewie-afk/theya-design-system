import { expect, userEvent } from '@storybook/test';

/**
 * Press Tab (or Shift+Tab) until `target` has focus, at most `max` times.
 * Proves the element is reachable in the tab order, which a `.focus()` call
 * would not. Fails with the usual toHaveFocus message if it never gets there.
 */
export async function tabTo(target: HTMLElement, { max = 25, shift = false }: { max?: number; shift?: boolean } = {}) {
  for (let i = 0; i < max && document.activeElement !== target; i++) await userEvent.tab({ shift });
  await expect(target).toHaveFocus();
}

/** Start the tab sequence from the top of the story, as a keyboard user arriving on the page. */
export function resetFocus() {
  (document.activeElement as HTMLElement | null)?.blur?.();
  document.body.focus();
}
