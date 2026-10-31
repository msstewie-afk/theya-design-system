# Screen-reader checklist

A manual pass with a real screen reader. It closes two WCAG criteria that code review and axe can't: **1.3.2 Meaningful sequence** (the reading order makes sense) and **4.1.3 Status messages** (messages are spoken without moving focus). In the accessibility matrix both stay "untested" until a pass is recorded for the component.

Russian version: [screen-reader-checklist.ru.md](./screen-reader-checklist.ru.md).

## Setup

- **VoiceOver + Safari** on the Mac (first pass). NVDA + Firefox on Windows later, or VoiceOver on iPhone as a stand-in.
- Start Storybook from the main checkout: `pnpm --filter @theya/shadcn storybook` (port 6008).
- Open each story **as a bare page**, not inside the Storybook UI, so VoiceOver reads only the component:
  `http://localhost:6008/iframe.html?id=<story-id>&viewMode=story`
- VoiceOver keys (VO = Control + Option):
  - VO + Right / Left: next / previous item (reading order).
  - VO + A: read from here to the end.
  - Tab / Shift + Tab: move focus, as a keyboard user does.
  - VO + U: rotor (headings, links, form controls).
  - VO + Space: press the current control.
- Turn on the caption panel (VoiceOver Utility → Visuals → Caption panel) so you can read back what was said.

## How to record

Tick the box and write what happened after the arrow:

```
- [x] **Button** … → pass
- [x] **Countdown** … → fail: nothing was said at zero
- [x] **Kanban** … → pass, but the column name is read twice
```

When a section is done, hand the file to an agent. It turns every line into a `screenReader` entry in `a11y/manual.json` (`{ "at": "VoiceOver", "browser": "Safari <version>", "date": "…", "result": "pass" | "fail", "notes": "…" }`), runs `pnpm a11y`, and opens a fix for each fail.

What counts as a pass:
- **4.1.3:** the message is spoken **once**, **without** focus moving, and soon after the action (within about a second). Exact wording may differ from the "Expect" line; the meaning must match.
- **1.3.2:** reading the story top to bottom with VO + Right gives the content in an order that makes sense: labels before their values, a heading before its section, a dialog's title before its body. Decorative pieces (dots, rings, drag ghosts) are not read.

---

## Part A — Status messages (4.1.3) · 43 items · about 60 min

Each item checks one message. Keep focus where it is; listen.

### Components

- [ ] **Button** · `actions-button--interactive-loading` · Tab to the button, press it. Expect: "Saving…" and then "Saved" (or the story's success text), focus stays on the button. →
- [ ] **CopyButton** · `actions-copybutton--icon-only` · Tab to it, press. Expect: "Copied". Press again: "Copied" again. →
- [ ] **StickyActionBar** · `actions-stickyactionbar--bulk-selection` · Select a row, then another. Expect: the bar's message ("1 selected", "2 selected") each time. →
- [ ] **Alert** · `status-feedback-alert--default` · Load the page. Expect: a live alert is read on its own; a static banner is only read when you reach it. (If the story has no live variant, note "static only".) →
- [ ] **Toaster** · `status-feedback-toaster--success` · Trigger the toast. Expect: the toast title and description, focus unchanged. Also `status-feedback-toaster--error-with-retry`. →
- [ ] **UndoToast** · `status-feedback-undotoast--default` · Press "Delete site". Expect: "Site deleted…" and the Undo button is reachable with Tab. →
- [ ] **FeedbackWidget** · `status-feedback-feedbackwidget--default` · Vote No, pick a reason, send. Expect: the thank-you message. →
- [ ] **Field** · `form-structure-field--invalid` · Type an invalid value and leave the field. Expect: the error text is spoken. →
- [ ] **TimeField** · `date-time-timefield--min-max` · Type a time outside the range. Expect: the error message, spoken right away (assertive). →
- [ ] **PasswordStrengthMeter** · `text-input-passwordstrengthmeter--playground` · Type a weak password, then a strong one. Expect: "Weak" … "Strong" as the band changes, not on every key. →
- [ ] **TagInput** · `text-input-taginput--default` · Add a tag (Enter), remove one (Backspace). Expect: "… added", "… removed". →
- [ ] **SecretField** · `text-input-secretfield--playground` · Press Copy. Expect: the copy toast ("Copied"). →
- [ ] **PromptArea** · `ai-chat-promptarea--default` · Send a message. Expect: a busy message, then a finished one. Also `ai-chat-promptarea--with-character-limit`: type past the limit → the error. →
- [ ] **HoldToTalk** · `ai-chat-holdtotalk--default` · Hold the button (VO + Space and hold, or the mouse). Expect: "Release to send". →
- [ ] **Chat** · `ai-chat-chat--typing` · Wait for the reply. Expect: the typing indicator, then the new message. →
- [ ] **Command** · `search-filter-command--inline` · Type text that matches nothing. Expect: "No results found." →
- [ ] **FilterField** · `search-filter-filterfield--default` · Apply a filter, then select options. Expect: the applied / selected count. Type a nonsense attribute: "No matching attributes". →
- [ ] **DataTableToolbar** · `data-datatabletoolbar--default` · Select one row, then another. Expect: "1 selected", "2 selected". →
- [ ] **Countdown** · `data-countdown--inline` · Wait for zero (or pick the story with the shortest time). Expect: the completed text or "Time's up", once. →
- [ ] **Kanban** · `data-kanban--default` · Focus a card, Space to pick up, arrows to move, Space to drop. Expect: picked up / moved to column X, position N / dropped. Escape while dragging: cancelled. →
- [ ] **Scheduler** · `data-scheduler--week` · Press Next, Previous, Today; switch view. Expect: the new date range each time. →
- [ ] **ChartRangeSelection** · `charts-chartrangeselection--area` · Focus the chart, Shift + Right a few times, Escape. Expect: the cursor value, the selected range, "cleared". →
- [ ] **Dropzone** · `files-dropzone--playground` · Choose a file. Expect: "Uploading…" and then the done message with the file name. →
- [ ] **Lightbox** · `overlays-lightbox--gallery` · Open, press Right. Expect: "Image 2 of N: …". →
- [ ] **SwipeDeck** · `motion-swipedeck--default` · Press Keep. Expect: "Keep. N left". →
- [ ] **Terminal** · `code-terminal--connection-states` · Switch the connection state. Expect: the new status ("Connecting…", "Connected"). →

### Patterns

- [ ] **AccessTokens** · `patterns-accesstokens--default` · Revoke a token. Expect: the undo toast. →
- [ ] **AuditLog** · `patterns-auditlog--default` · Change a filter. Expect: the new result count. →
- [ ] **Cart** · `patterns-commerce-cart--default` · Apply an empty promo code, then a wrong one. Expect: "Enter a promo code.", then the error; focus stays on Apply. →
- [ ] **Comparison** · `patterns-catalog-comparison--default` · Add items to compare. Expect: "N of M selected for comparison". →
- [ ] **FacetedList** · `patterns-catalog-facetedlist--default` · Tick a facet. Expect: the result count. Untick everything that matches: "No matches." →
- [ ] **ItemPage** · `patterns-catalog-itempage--default` · Next image in the gallery. Expect: the new image position. →
- [ ] **Reviews** · `patterns-catalog-reviews--default` · Filter by stars. Expect: the filtered count. →
- [ ] **ListView** · `patterns-listview--with-bulk-and-row-actions` · Search, then run a row action. Expect: the result count, then the undo toast. →
- [ ] **NotificationsInbox** · `patterns-notificationsinbox--default` · Change the filter. Expect: the result text. →
- [ ] **OnboardingWizard** · `patterns-onboardingwizard--default` · Go to the next step. Expect: the step name. Leave a required field empty and continue: focus moves to the field. →
- [ ] **OrderHistory** · `patterns-account-orderhistory--default` · Press Show more. Expect: "Showing X of Y". →
- [ ] **PasswordReset** · `patterns-account-passwordreset--request` · Send the link, then Resend. Expect: "Link sent again to …". →
- [ ] **Preferences** · `patterns-preferences--default` · Flip a notification switch. Expect: "Saved". →
- [ ] **SavedItems** · `patterns-account-saveditems--default` · Remove an item. Expect: the undo toast. →
- [ ] **SearchBox** · `patterns-search-searchbox--default` · Type a query. Expect: the number of suggestions. →
- [ ] **StatusTracker** · `patterns-account-statustracker--live` · Wait. Expect: each step change, then the final result. →
- [ ] **TeamMembers** · `patterns-teammembers--default` · Invite with an invalid email, then a valid one. Expect: the email error, then the success toast. →

---

## Part B — Reading order where DOM and screen differ (1.3.2) · 17 items · about 30 min

These components position things with CSS, so the order you hear can differ from what you see. Read each story with VO + A, then step with VO + Right.

- [ ] **Dialog** · `overlays-dialog--default` (open it from its button: VoiceOver doesn't announce a dialog that is already open on load) · Title, then body, then buttons. If VO + arrows don't move from the first field, press Tab once (WebKit bug 311125). Close (top-end) is read last and is named "Close". →
- [ ] **AlertDialog** · `overlays-alertdialog--default` (open it from its button) · Title, description, then Cancel and the action. Also at phone width (the buttons swap visually). →
- [ ] **ConfirmDialog** · `overlays-confirmdialog--with-consequences` (open it from its button) · Title, consequences list, confirm field, buttons. →
- [ ] **Drawer** · `overlays-drawer--default` (open it) · Content first, Close last; the drag handle is not read. →
- [ ] **ProductTour** · `overlays-producttour--on-step` · Step counter, title, text, actions, then Close. →
- [ ] **Message** · `ai-chat-chat--default` · In sent messages (avatar on the other side): author, time, text, in that order. →
- [ ] **Countdown** · `data-countdown--blocks` · One sentence first ("2 days 4 hours…"), the tiles are not read digit by digit. →
- [ ] **TextEffect** · `motion-texteffect--scramble` · The text is read once, in plain form. →
- [ ] **CardStack** · `motion-cardstack--default` · Only the front card is read, then the controls. →
- [ ] **SwipeDeck** · `motion-swipedeck--default` · Top card, then Skip / Keep, then the status. →
- [ ] **Marquee** · `motion-marquee--default` · Each item is read once (the duplicate copy is skipped). →
- [ ] **Calendar** · `date-time-calendar--single` · Previous / Next month, the month name, then the grid. →
- [ ] **Scheduler** · `data-scheduler--week` at phone width · The range heading, buttons and the day list read in a sensible order. →
- [ ] **Table** · `data-table--default` at phone width (stacked rows) · Each row reads label: value pairs; the row action comes with its row. →
- [ ] **DataTable** · `data-datatable--basic` · Right-aligned headers read the title (the sort icon sits before it visually). →
- [ ] **AuditLog** · `patterns-auditlog--default` at phone width · Time and event stay together in each row. →
- [ ] **LoginFormSplit** · `patterns-loginformsplit--default` · The image side (if read) comes before the form and does not interrupt it. →

To check at phone width: VoiceOver → Safari → Develop → Responsive Design Mode, iPhone size.

---

## Part C — Key flows end to end · about 30 min

The same checks in real sequences. Record each flow and add the components it covers.

- [ ] **Sign in** · `patterns-loginform--sign-in-error` · Tab through: labels with fields, error is spoken, the error is tied to its field (VO reads it when you return to the field). Covers LoginForm, TextField, Field, Button. →
- [ ] **Create resource with errors** · `patterns-resourceform--create-database` · Submit empty: focus goes to the first error, each field reads its error. Covers ResourceForm, Select, Switch, NumberField. →
- [ ] **Confirm a destructive action** · `overlays-confirmdialog--typed-confirm` · Open, type the name, confirm; focus returns to the trigger. Covers ConfirmDialog, AlertDialog. →
- [ ] **Pick from a list** · `selection-combobox--keyboard-navigation` and `selection-select--playground` · The active option is spoken while you arrow through; the chosen value is read on the closed control. Covers Combobox, Select. →
- [ ] **Table work** · `patterns-listview--with-bulk-and-row-actions` · Select rows (count spoken), sort a column (state spoken), run a row action (toast). Covers ListView, DataTable, DataTableToolbar, Toaster. →
- [ ] **Tabs** · `navigation-tabs--default` · "Tab, 1 of 3, selected"; arrows move between tabs; Tab goes into the panel. Covers Tabs. →

---

## Part D — Everything else

The other components are simple: their reading order was confirmed in code review (see each component's 1.3.2 note on its Docs page) and they show no status messages. Record them in a later pass with VO + A on any one story each; a short note like "Accordion → pass" is enough.

Not needed: page-level criteria (titles, landmarks across a page, skip links in a real app) — they belong to the product, not the library.
