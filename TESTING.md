**English** · [Русский](TESTING.ru.md)

# Tests

Run all commands from `packages/theya-shadcn`, with Storybook running (`pnpm storybook`, port 6008).

## Behavior and accessibility

```
pnpm test-storybook        # light theme
pnpm test-storybook:dark   # dark theme
```

Each story: render, play test (if any), axe check. A single file: `pnpm test-storybook src/components/ui/button.stories.tsx`.

## Visual regression

A screenshot of each story, taken after its play test, is compared with a baseline.

```
pnpm test-visual           # light theme
pnpm test-visual:dark      # dark theme
```

- Baselines live in `packages/theya-shadcn/__visual__/<theme>/` and are not committed to git: font rendering differs between machines, so you can only compare on the machine where the baselines were taken.
- The first run on a new machine takes the baselines; later runs compare against them.
- A failed snapshot: the image in `__visual__/<theme>/__diff__/` — baseline on the left, new snapshot on the right, changes in red in the middle.
- If the change is intended, update the baselines for those stories with the `-u` flag:
  ```
  pnpm test-visual src/components/ui/button.stories.tsx -u
  pnpm test-visual:dark src/components/ui/button.stories.tsx -u
  ```
- The threshold is 50 pixels: anti-aliasing noise passes, a recolored border on a small button does not.

What the test does on its own so snapshots do not "drift":
- `prefers-reduced-motion`, CSS animations are stopped, the caret in fields is hidden;
- it waits for fonts and for all started image loads (including the Avatar preload);
- `Math.random` and `crypto.getRandomValues` return the same sequence before each story.

If a story has something that changes by itself (a live timer), cover it with a mask — the layout is checked, the content is not:

```ts
parameters: { visual: { mask: ['[role="timer"]'] } }
```

To exclude a story from the visual check entirely: `parameters: { visual: { disable: true } }`.

## High contrast mode (forced colors)

In Windows High Contrast, the browser replaces all colors with a few system colors and removes shadows and fills. The rules for this mode live in `src/styles/forced-colors.css` and in the `forced-colors:` classes on Switch, Slider, Progress, Meter and Radio. It has a separate set of baselines (`__visual__/light-forced/`):

```
pnpm test-visual:forced
```

To check by eye — in Chrome DevTools: Rendering → Emulate CSS media feature forced-colors → active.

## CI (GitHub Actions)

The `.github/workflows/ci.yml` workflow runs on every push to `main` and on every pull request. If you push again while a run is in progress, the old run is cancelled.

1. **checks** (a few minutes):
   - types;
   - `pnpm api:check`: the API spec and report are up to date, and client modules have `'use client'`;
   - a build of the `apps/sandbox` sandbox against the package.
2. **storybook** (runs after checks): a static Storybook, and on it
   - play tests and axe in the light and dark theme;
   - visual regression in both themes.
3. **react-19** (after checks, in parallel with storybook): the same code, but React 19 is forced across the whole repository (the package supports 18 and 19; development and the other checks run on 18). It checks that no React 18 is left, then runs types, play tests and axe in the light theme. Visual regression is not needed here — the look does not depend on the React version.

CI has its own visual regression baselines. A Linux runner takes them, they are stored in the Actions cache, and they are not in git. Each green run becomes the baseline for the next one. The first run, and a run after the cache has expired (7 days without runs), only take baselines and compare nothing. New stories get a baseline on their first run.

**A visual test failed.** The run page in Actions has a `visual-diffs` archive: it contains "baseline | diff | new snapshot" images.

**The change is intended.** Actions → CI → Run workflow → enable "Accept visual changes" → Run. The run rebuilds all baselines.

**`api:check` failed.** The public API changed. Locally:

```
cd packages/theya-shadcn && pnpm api
```

Then commit `api/` together with a changeset entry (see RELEASING.md).

