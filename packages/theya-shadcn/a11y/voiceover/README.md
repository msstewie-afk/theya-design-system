# VoiceOver run (screen-reader checklist, part A)

Plays part A of [the checklist](../screen-reader-checklist.md) (WCAG 4.1.3, status messages) with the real VoiceOver on a Mac, through [Guidepup](https://www.guidepup.dev/). Each scenario opens a story, does the action from the checklist, and listens to what VoiceOver says. Scenarios live in `scenarios.ts`.

Russian: [README.ru.md](./README.ru.md).

## Once per Mac

1. VoiceOver Utility → General → tick **Allow VoiceOver to be controlled with AppleScript**.
2. System Settings → Privacy & Security → Accessibility → turn on **Terminal** (or the terminal app you run commands from).
3. System Settings → Privacy & Security → Full Disk Access → turn on **Terminal**, then quit and reopen Terminal. Guidepup links its VoiceOver preferences into `~/Library/Group Containers/group.com.apple.VoiceOver`, which macOS otherwise refuses (`EPERM`). Turn it off again between runs if you prefer.
4. From the repo root, once per Mac:

```sh
npx @guidepup/setup setup --macos-ignore-tcc-db
```

5. In `packages/theya-shadcn`, once per Guidepup version (otherwise "Failed to mount Guidepup preferences"):

```sh
npx @guidepup/setup install voiceover
```

```sh
pnpm --filter @theya/shadcn exec playwright install webkit chromium
```

Accept any macOS dialog that asks to let Terminal control VoiceOver or System Events. No need to turn off System Integrity Protection.

## Run

Storybook must be running (`pnpm --filter @theya/shadcn storybook`). Don't touch the keyboard or mouse during the run: VoiceOver follows the active window. It takes about 10 minutes.

```sh
pnpm --filter @theya/shadcn a11y:voiceover
```

- `VO_BROWSER=chromium pnpm --filter @theya/shadcn a11y:voiceover` — Chrome's engine instead of WebKit.
- `pnpm --filter @theya/shadcn a11y:voiceover -g kanban` — one scenario.

Results: `a11y/voiceover/results/<browser>-<date>.json` (not committed). Each entry lists what VoiceOver said and which expected texts were missing. Passes and fails go into `a11y/manual.json` → `screenReader` with `"at": "VoiceOver (Guidepup)"`.

## Without VoiceOver

`pnpm --filter @theya/shadcn a11y:voiceover:dry` runs the same actions in Chromium and lists what reaches live regions, to check a scenario on any machine.

## Notes

- A story's own play test runs when it loads; the run waits for it and then acts.
- Scenarios marked `manual` are skipped, with the reason (a story that never changes on its own, for example).
- Playwright's WebKit is Safari's engine, not Safari itself; a result can still differ in Safari. Spot-check fails by hand.
