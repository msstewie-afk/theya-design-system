**English** · [Русский](CONTRIBUTING.ru.md)

# Contributing

How to change Theya itself: add a component, fix one, change a token. To use Theya in an app, see [GETTING-STARTED.md](GETTING-STARTED.md).

## Setup

```bash
pnpm install
pnpm build:tokens
git config core.hooksPath .githooks   # the quality gate on every commit

cd packages/theya-shadcn
pnpm storybook                        # http://localhost:6008
```

Node 22, pnpm 11. Run `pnpm build:tokens` again after any change in `packages/tokens/src`.

## Where things are

| Path | What |
|---|---|
| `packages/tokens/src/primitive` | palette and scales: the only place with raw values |
| `packages/tokens/src/semantic` | semantic tokens (`color.default.json`, `color.dark.json`, sizes…): references to primitives |
| `packages/tokens/src/profiles`, `src/density` | product themes ([PROFILES.md](PROFILES.md)), density modes ([DENSITY.md](DENSITY.md)) |
| `packages/theya-shadcn/src/components/ui` | components: `<name>.tsx`, `<name>.stories.tsx`, `<name>.guidelines.tsx` |
| `packages/theya-shadcn/src/components/blocks` | page patterns, same three files |
| `packages/theya-shadcn/src/lib` | helpers and dictionaries (`locale-*.ts`) |
| `packages/theya-shadcn/spec`, `api`, `public/llms*.txt` | **generated**, never edited by hand |
| `packages/theya-shadcn/a11y/manual.json` | the hand-kept part of the accessibility matrix: screen-reader passes, accepted exceptions |

## A component is three files

1. **`<name>.tsx`** — the component.
   - `'use client'` at the top if it uses state, effects or event handlers (`pnpm api:check` checks it).
   - Colors, sizes, radii, shadows only from tokens: `bg-[var(--color-…)]`, `p-[var(--size-…)]` or the Tailwind spacing scale. No hex: the gate blocks it (a deliberate exception: `gate-allow-hex` on the same line, with a reason).
   - Logical sides: `ms/me`, `ps/pe`, `start/end`, `text-start` — not `ml/mr`, `left/right` (`check-rtl.mjs` fails on them; `--fix` converts them).
   - Built-in text (screen-reader labels, placeholders, announcements) from the dictionary, never hardcoded ([LOCALIZATION.md](LOCALIZATION.md#how-to-add-a-string)).
   - Prop names from the shared vocabulary: `appearance`, `tone`, `size`, `widthSize`… — look at a similar component first.
2. **`<name>.guidelines.tsx`** — the Docs page content: status, when to use it, when to use something else, anatomy, accessibility notes, do / don't pairs. Patterns get no do / don't pairs.
3. **`<name>.stories.tsx`** — `tags: ['autodocs']`, `parameters.guidelines`, and stories for every variant and state. Interactive components get a play test for the keyboard path (Tab, arrows, Enter, Escape) and focus management.

After adding or renaming a story, run **`pnpm api`**: the spec and the accessibility matrix are built from the stories.

## Design rules

The ones that come up most:

- **4px grid** for spacing and sizes. 2px is allowed as a half step (title → description, neighbouring toolbar buttons).
- **Padding is larger than the inner gap**: in a button the side padding is always larger than the icon–label gap; in a popover the gap between fields is smaller than its padding.
- **Icon–text gap:** 4px next to a 12px icon or small text, 8px next to a 16px+ icon.
- **Field insets:** 12px on 32 and 40px fields, 16px on 48px fields.
- **Separators** inside cards, dialogs and panels are inset to the content padding; table and list row separators run edge to edge.
- **Borders:** `border` for inputs and controls, `border-subtle` for cards and tables, `border-subtler` for dividers and row separators.
- **Links in running text** are underlined or one font weight heavier than the text around them.
- **The current item** (navigation, sections) is marked by more than color: semibold label and a 2px bar at the start edge.
- **Fewer than 5 options** — radio buttons, not a Select.
- **Field text is 16px on phones**, so iOS doesn’t zoom on focus.
- **Text** follows [WRITING.md](WRITING.md).

## Accessibility

Target: WCAG 2.2 AA, in light and dark.

- Every story runs axe in both themes in CI; a violation fails the build. Check locally: `pnpm test-storybook <file>` and `pnpm test-storybook:dark <file>`.
- A rule switched off for a story needs a reason in a comment next to it; it shows up in the matrix.
- Contrast: 4.5:1 for text, 3:1 for icons, borders of controls, focus rings and status dots — in dark too.
- Targets at least 24×24px; motion behind `motion-safe:` / `motion-reduce:`; `forced-colors` styles where a state is shown only by color or background.
- Screen-reader passes go into `a11y/manual.json` by hand.

## Tokens

- A new color is a semantic token that references a primitive (`{color.blue.blue-500}`), with a value for both `color.default.json` and `color.dark.json`. Not a primitive used directly in a component.
- Before adding a token, look for an existing one: Storybook → Design System / Foundations.
- Renaming or removing a token is a breaking change: a changeset with a rename table.
- The Figma variables are synced from the same source ([TOKENS-EXPORT.md](TOKENS-EXPORT.md)).

## Before a commit

The pre-commit gate checks types, hex colors in components, and that `spec/` and `llms*.txt` are up to date. It doesn’t replace the tests:

- [ ] `pnpm exec tsc --noEmit -p .`
- [ ] `pnpm api` after changing stories, props or guidelines; `pnpm api:check` passes
- [ ] play + axe for the changed stories, light and dark
- [ ] a look in Storybook in both themes, at a phone width too
- [ ] a changeset for anything an app would notice: `pnpm changeset` ([RELEASING.md](RELEASING.md)); none for stories, tests and docs only. Pending changesets show up on Design System / Changelog in Storybook
- [ ] guides in both languages: every root guide `X.md` has an `X.ru.md` pair

Never use `--no-verify`. If the gate is wrong, fix the gate.

## Pull requests

CI runs types, `api:check`, the sandbox build, play + axe and visual regression in both themes, React 19 and the product themes ([TESTING.md](TESTING.md#ci-github-actions)). A pull request fails on a visual change: look at the `visual-diffs` archive, and if the change is intended, say so in the description.
