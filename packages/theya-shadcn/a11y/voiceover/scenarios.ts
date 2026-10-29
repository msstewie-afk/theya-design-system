import type { Page } from '@playwright/test';

/**
 * Part A of the screen-reader checklist (WCAG 4.1.3): one status message per
 * scenario. `act` performs the action with the keyboard where it can; `expect`
 * lists text that must be heard (case-insensitive, substring). The texts are
 * what the page publishes for assistive tech; the VoiceOver run checks that
 * VoiceOver actually speaks them.
 */
export interface Scenario {
  id: string;
  component: string;
  story: string;
  act: (page: Page) => Promise<void>;
  expect: string[];
  /** How long to listen after the action, ms. Default 2500. */
  listen?: number;
  /** Not automated: why, and what covers it instead. The runner lists it and skips it. */
  manual?: string;
}

/** Clipboard writes need a permission Playwright's WebKit can't grant: stub it. */
async function stubClipboard(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {}, readText: async () => '' } });
  });
}

/**
 * Pacing between moving focus and pressing a key. A person hears the focused
 * control before acting on it; a script that focuses and presses within a few
 * ms makes VoiceOver speak the focus move over (and drop) the announcement
 * being tested. The VoiceOver runner replaces `beforeKey` with "wait until
 * VoiceOver has gone quiet"; the dry run only pauses briefly.
 */
export const pace = {
  /** Number of phrases VoiceOver had spoken at the last key (runner bookkeeping). */
  mark: 0,
  beforeKey: async (page: Page) => { await page.waitForTimeout(50); },
  /**
   * Sends one key or chord ("Shift+ArrowRight"). The dry run uses Playwright's
   * synthetic events; the VoiceOver runner sends real OS key presses, because
   * VoiceOver reacts to synthetic ones differently (it drops announcements a
   * person hears).
   */
  key: async (page: Page, key: string) => { await page.keyboard.press(key); },
  /** Types text into the focused field, one key per 120 ms. */
  type: async (_page: Page, target: ReturnType<Page['locator']>, text: string) => { await target.pressSequentially(text, { delay: 120 }); },
};

const press = async (page: Page, key: string) => { await pace.beforeKey(page); await pace.key(page, key); };
/** Types like a person (one key every 120 ms), after the focus move has been heard. */
const typeText = async (page: Page, target: ReturnType<Page['locator']>, text: string) => { await pace.beforeKey(page); await target.focus(); await pace.type(page, target, text); };

export const SCENARIOS: Scenario[] = [
  {
    id: 'button-loading', component: 'Button', story: 'actions-button--interactive-loading', expect: ["Saving", "Saved"], listen: 3500,
    act: async (page) => { await page.getByRole('button', { name: 'Save changes' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'copybutton', component: 'CopyButton', story: 'actions-copybutton--sizes', expect: ["Copied"],
    act: async (page) => { await stubClipboard(page); await page.locator('[data-slot=button]').first().focus(); await press(page, 'Enter'); },
  },
  {
    id: 'copybutton-icon', component: 'CopyButton', story: 'actions-copybutton--icon-only', expect: ["Copied to clipboard"],
    act: async (page) => { await stubClipboard(page); await page.getByRole('button', { name: /^Copy/ }).first().focus(); await press(page, 'Enter'); },
  },
  {
    id: 'stickyactionbar', component: 'StickyActionBar', story: 'actions-stickyactionbar--bulk-selection', expect: ["1 selected", "2 selected"],
    act: async (page) => { const boxes = page.getByRole('checkbox'); await boxes.nth(1).focus(); await press(page, 'Space'); await page.waitForTimeout(1200); await boxes.nth(2).focus(); await press(page, 'Space'); },
  },
  {
    id: 'toaster-success', component: 'Toaster', story: 'status-feedback-toaster--success', expect: ["Certificate issued"],
    act: async (page) => { await page.getByRole('button', { name: 'Issue certificate' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'toaster-error', component: 'Toaster', story: 'status-feedback-toaster--error-with-retry', expect: ["Couldn't reissue certificate"], listen: 3500,
    act: async (page) => { await page.getByRole('button', { name: /Reissue/ }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'undotoast', component: 'UndoToast', story: 'status-feedback-undotoast--default', expect: ["Site deleted"],
    act: async (page) => { await page.getByRole('button', { name: 'Delete site' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'feedbackwidget', component: 'FeedbackWidget', story: 'status-feedback-feedbackwidget--default', expect: ["Thanks for your feedback"],
    act: async (page) => {
      await page.getByRole('button', { name: 'No' }).focus(); await press(page, 'Enter');
      await page.locator('fieldset button').first().click();
      await page.getByRole('button', { name: /send/i }).focus(); await press(page, 'Enter');
    },
  },
  {
    id: 'field', component: 'Field', story: 'form-structure-form--default', expect: ["Enter a valid domain"],
    act: async (page) => { const f = page.getByRole('textbox').first(); await f.focus(); await f.fill(''); await typeText(page, f, 'x'); await press(page, 'Tab'); },
  },
  {
    id: 'timefield', component: 'TimeField', story: 'date-time-timefield--min-max', expect: ["Choose a time from 9:00 AM to 5:00 PM"],
    act: async (page) => { const f = page.getByRole('combobox', { name: 'Business hours' }); await f.focus(); await f.fill('23:00'); await press(page, 'Enter'); await press(page, 'Tab'); },
  },
  {
    id: 'taginput', component: 'TagInput', story: 'text-input-taginput--default', expect: ["Added backups", "Removed backups"],
    act: async (page) => { const f = page.getByRole('textbox', { name: 'Tags' }); await f.focus(); await typeText(page, f, 'backups'); await press(page, 'Enter'); await page.waitForTimeout(1200); await press(page, 'Backspace'); await press(page, 'Backspace'); },
  },
  {
    id: 'secretfield', component: 'SecretField', story: 'text-input-secretfield--revealed-by-default', expect: ["Copied"],
    act: async (page) => { await stubClipboard(page); await page.getByRole('button', { name: /^Copy/ }).first().focus(); await press(page, 'Enter'); },
  },
  {
    id: 'promptarea', component: 'PromptArea', story: 'ai-chat-promptarea--busy', expect: [], act: async () => {},
    manual: "The Busy story's own play test presses Stop on load, so the busy -> finished change is over before anyone listens. Covered by code review (always-mounted role=status).",
  },
  {
    id: 'promptarea-limit', component: 'PromptArea', story: 'ai-chat-promptarea--with-character-limit', expect: ["exceeds the 120-character limit"],
    act: async (page) => { const f = page.getByRole('textbox', { name: 'Message' }); await f.focus(); await f.fill('x'.repeat(400)); },
  },
  {
    id: 'holdtotalk', component: 'HoldToTalk', story: 'ai-chat-holdtotalk--default', expect: ["Release to send"],
    act: async (page) => { await page.getByRole('button', { name: 'Hold to talk' }).focus(); await pace.beforeKey(page); await page.keyboard.down('Space'); await page.waitForTimeout(1500); await page.keyboard.up('Space'); },
  },
  {
    id: 'chat', component: 'Chat', story: 'ai-chat-chat--typing', expect: [], act: async () => {},
    manual: 'The story renders ChatTyping already in place; the announcement happens when it is inserted into the log. Covered by code review (role=log + role=status).',
  },
  {
    id: 'command', component: 'Command', story: 'search-filter-command--inline', expect: ["No results found"],
    act: async (page) => { const f = page.getByRole('combobox', { name: 'Command menu' }); await f.focus(); await typeText(page, f, 'zzqx'); },
  },
  {
    id: 'filterfield', component: 'FilterField', story: 'search-filter-filterfield--default', expect: ["No attributes"],
    act: async (page) => { const f = page.getByRole('combobox', { name: 'Filter servers' }); await f.click(); await typeText(page, f, 'zzqx'); },
  },
  {
    id: 'datatabletoolbar', component: 'DataTableToolbar', story: 'data-datatabletoolbar--default', expect: ["1 selected"],
    act: async (page) => { await page.getByRole('checkbox', { name: 'Select row', exact: true }).first().focus(); await press(page, 'Space'); await page.waitForTimeout(1200); await page.getByRole('checkbox', { name: 'Select all' }).focus(); await press(page, 'Space'); },
  },
  {
    id: 'kanban', component: 'Kanban', story: 'data-kanban--default', expect: ["Picked up", "moved to", "Dropped"],
    act: async (page) => { await page.getByRole('button').first().focus(); await press(page, 'Space'); await page.waitForTimeout(600); await press(page, 'ArrowRight'); await page.waitForTimeout(600); await press(page, 'Space'); },
  },
  {
    id: 'scheduler', component: 'Scheduler', story: 'data-scheduler--week', expect: ["Oct 12"],
    act: async (page) => { await page.getByRole('button', { name: 'Next week' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'chartrangeselection', component: 'ChartRangeSelection', story: 'charts-chartrangeselection--line', expect: ["Aug 1", "Selected Aug 1 to Aug 3", "Selection cleared"],
    act: async (page) => { await page.getByRole('group', { name: 'Select a date range' }).focus(); await press(page, 'ArrowRight'); await press(page, 'Shift+ArrowRight'); await press(page, 'Shift+ArrowRight'); await page.waitForTimeout(800); await press(page, 'Escape'); },
  },
  {
    id: 'dropzone', component: 'Dropzone', story: 'files-dropzone--empty', expect: [], act: async () => {},
    manual: 'No story switches loading -> done on its own (the consumer drives it). Covered by code review: announce() on status change.',
  },
  {
    id: 'lightbox', component: 'Lightbox', story: 'overlays-lightbox--gallery', expect: ["Image 2 of 5"],
    act: async (page) => { await page.getByRole('button', { name: /^Open image 1/ }).focus(); await press(page, 'Enter'); await page.waitForTimeout(800); await press(page, 'ArrowRight'); },
  },
  {
    id: 'swipedeck', component: 'SwipeDeck', story: 'motion-swipedeck--default', expect: ["1 card left"],
    act: async (page) => { await page.getByRole('button', { name: 'Keep' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'alert', component: 'Alert', story: 'status-feedback-alert--default', expect: [], act: async () => {},
    manual: 'Stories show static banners (no role, by design). A live alert is role=alert/status on mount; covered by code review.',
  },
  {
    id: 'terminal', component: 'Terminal', story: 'code-terminal--connection-states', expect: [], act: async () => {},
    manual: 'The story shows each connection state side by side; nothing changes. Covered by code review (role=status on the header line).',
  },
  {
    id: 'countdown', component: 'Countdown', story: 'data-countdown--resend-code', expect: ["Resend code"], listen: 32000,
    act: async () => {},
  },
  // Patterns
  {
    id: 'accesstokens', component: 'AccessTokens', story: 'patterns-accesstokens--default', expect: ["Key revoked"],
    act: async (page) => { await page.getByRole('button', { name: 'Revoke Staging' }).focus(); await press(page, 'Enter'); await page.getByRole('alertdialog').getByRole('button', { name: 'Revoke' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'auditlog', component: 'AuditLog', story: 'patterns-auditlog--default', expect: ["0 events match your filters"],
    act: async (page) => { const f = page.getByRole('searchbox', { name: /Search events/ }); await f.focus(); await typeText(page, f, 'zzqx'); },
  },
  {
    id: 'cart', component: 'Cart', story: 'patterns-commerce-cart--default', expect: ["Enter a promo code", "isn't a valid code"],
    act: async (page) => {
      await page.getByRole('button', { name: 'Have a promo code?' }).focus(); await press(page, 'Enter');
      const f = page.getByRole('textbox', { name: 'Promo code' }); await f.fill('');
      await page.getByRole('button', { name: 'Apply' }).focus(); await press(page, 'Enter');
      await page.waitForTimeout(1200);
      await f.fill('NOPE'); await page.getByRole('button', { name: 'Apply' }).focus(); await press(page, 'Enter');
    },
  },
  {
    id: 'comparison', component: 'Comparison', story: 'patterns-catalog-comparison--default', expect: ["1 of 4 selected for comparison", "2 of 4 selected for comparison"],
    act: async (page) => { await page.getByRole('checkbox', { name: 'Compare Shieldwall' }).focus(); await press(page, 'Space'); await page.waitForTimeout(1200); await page.getByRole('checkbox', { name: 'Compare Secret Scanner' }).focus(); await press(page, 'Space'); },
  },
  {
    id: 'facetedlist', component: 'FacetedList', story: 'patterns-catalog-facetedlist--default', expect: ["6 extensions"],
    act: async (page) => { await page.getByRole('checkbox').first().focus(); await press(page, 'Space'); },
  },
  {
    id: 'itempage', component: 'ItemPage', story: 'patterns-catalog-itempage--default', expect: ["of 4"],
    act: async (page) => { await page.getByRole('button', { name: 'Next screenshot' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'reviews', component: 'Reviews', story: 'patterns-catalog-reviews--default', expect: ["3 reviews with 5"],
    act: async (page) => { await page.getByRole('button', { name: '5 stars 3 reviews' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'listview', component: 'ListView', story: 'patterns-listview--with-bulk-and-row-actions', expect: ["1 user"],
    act: async (page) => { const f = page.getByRole('combobox', { name: /Search users/ }); await f.focus(); await typeText(page, f, 'Alex'); },
  },
  {
    id: 'notificationsinbox', component: 'NotificationsInbox', story: 'patterns-notificationsinbox--default', expect: ["No notifications match"],
    act: async (page) => { await page.getByRole('radio', { name: 'Unread' }).focus(); await press(page, 'Space'); },
  },
  {
    id: 'onboardingwizard', component: 'OnboardingWizard', story: 'patterns-onboardingwizard--default', expect: ["Step 1 of 3: Domain"],
    act: async (page) => { await page.getByRole('button', { name: 'Back' }).first().focus(); await press(page, 'Enter'); },
  },
  {
    id: 'orderhistory', component: 'OrderHistory', story: 'patterns-account-orderhistory--default', expect: ["1 order"],
    act: async (page) => { const f = page.getByRole('searchbox', { name: 'Search orders' }); await f.focus(); await typeText(page, f, 'TH-24'); },
  },
  {
    id: 'passwordreset', component: 'PasswordReset', story: 'patterns-account-passwordreset--request', expect: ["Link sent again to"], listen: 3500,
    act: async (page) => {
      await page.getByRole('button', { name: 'Send reset link' }).focus(); await press(page, 'Enter');
      await page.waitForTimeout(31000); // "Resend" is offered after 30 s
      await page.getByRole('button', { name: /Resend/ }).focus(); await press(page, 'Enter');
    },
  },
  {
    id: 'preferences', component: 'Preferences', story: 'patterns-preferences--default', expect: ["Saved"],
    act: async (page) => { await page.getByRole('switch').first().focus(); await press(page, 'Space'); },
  },
  {
    id: 'saveditems', component: 'SavedItems', story: 'patterns-account-saveditems--default', expect: ["Removed", "Hardware security key"],
    act: async (page) => { await page.getByRole('button', { name: 'Remove Hardware security key' }).focus(); await press(page, 'Enter'); },
  },
  {
    id: 'searchbox', component: 'SearchBox', story: 'patterns-search-searchbox--default', expect: ["1 option"],
    act: async (page) => { const f = page.getByRole('combobox', { name: 'Search' }); await f.focus(); await typeText(page, f, 'ce'); },
  },
  {
    id: 'statustracker', component: 'StatusTracker', story: 'patterns-account-statustracker--live', expect: ["of 5"], listen: 9000,
    act: async () => {},
  },
  {
    id: 'teammembers', component: 'TeamMembers', story: 'patterns-teammembers--default', expect: ["needs an @", "Invite sent"], listen: 3500,
    act: async (page) => {
      const f = page.getByRole('textbox').first(); await f.focus(); await typeText(page, f, 'nope');
      await page.getByRole('button', { name: 'Send invite' }).first().focus(); await press(page, 'Enter');
      await page.waitForTimeout(1200);
      await f.fill('jamie@seashell.dev'); await page.getByRole('button', { name: 'Send invite' }).first().focus(); await press(page, 'Enter');
    },
  },
];
