# Pipeline: screen-reader pass

A person listens to components with VoiceOver and records what they heard. The scripts (`a11y-tree`, `a11y-states`) already check names, roles and states, and write what a screen reader should announce; the pass confirms that the announcements are accurate and make sense to a listener, and closes 4.1.3 Status Messages, which only a pass can verify.

Russian version: [screen-reader-pass.ru.md](./screen-reader-pass.ru.md).

## Trigger

The queue, from the matrix and git history:

```bash
pnpm --filter @theya/shadcn a11y:sr-queue
```

It prints three lists, in the order to take them:

1. **Required** — a matrix cell only a pass can verify (4.1.3) is untested. Keeps the matrix from going green without it.
2. **Stale** — the component has a pass, but lines of its accessibility tree (`a11y/tree/<Component>.yml`) changed after it. What VoiceOver says may have changed too.
3. **Recommended** — composite widgets, overlays and status messages with no pass at all (menus, date pickers, trees, sliders): where a screen reader most often says something other than what you expect.

A session takes the required list, then a few from stale or recommended: about 30–60 minutes.

## Steps

| # | Step | Who |
|---|---|---|
| 1 | **Pick.** Run the queue, choose the components for the session. | Мария, or the agent proposes |
| 2 | **Prepare.** Storybook from the main checkout: `pnpm --filter @theya/shadcn storybook` (port 6008). Open `a11y/checklist/<Component>.md`: for every story and every step (as rendered, after ArrowDown, after Enter, after typing with no match) it lists what should be announced. Setup and keys: `a11y/screen-reader-checklist.md`. | Мария |
| 3 | **Listen.** VoiceOver + Safari, each story as a bare page (`iframe.html?id=<story-id>&viewMode=story`). Do the checklist's steps with the keyboard and compare. Note for each story: pass, or fail and what was heard. | Мария |
| 4 | **Record.** The agent turns the notes into `screenReader` entries in `a11y/manual.json` (`at`, `browser`, `date`, `result`, `notes` with the story id and what was heard), runs `node scripts/build-a11y.mjs`, commits. | agent |
| 5 | **Fix fails.** Each fail becomes an accessibility defect: a fixture in `src/test/a11y-fixtures.stories.tsx` if a script could catch it, the fix, then the story is listened to again. | agent, then Мария |

## Gates

- A pass counts only for the stories listened to: the notes name them.
- A fail is recorded as a fail (with what was heard), not left out: the matrix shows it until the fix and the re-listen.
- `node scripts/build-a11y.mjs --check` passes after recording (it's in `pnpm api:check`).

## Outputs

Entries in `a11y/manual.json`, the updated matrix (`spec/a11y.json`), fixes for the fails.

## Done

The session's components are recorded, the required list is empty or each item has a fix in progress, and every fail has a fix or a recorded decision.
