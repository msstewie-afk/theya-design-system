# a11y-kit

Accessibility checks for a design system and the products built on it, from one registry: every check from every layer (code, components in Storybook, a product's pages, the review agent, people), the WCAG 2.2 criteria each one gives evidence for, how deep it goes and what it is calibrated on.

Russian: [README.ru.md](./README.ru.md).

**Status (2026-11-19): step 1 of the plan, the registry.** Theya's scripts (`a11y-tree`, `a11y-auto`, `a11y-states`, `a11y-forced`, the matrix) still live in `packages/theya-shadcn/scripts` and move here in step 3.

## Principle: nothing on trust

A verdict comes from a deterministic script, never from a model: the same input gives the same JSON. Every check is calibrated on known defects and clean cases (the design system's calibration stories, the W3C ACT test cases, one known violation per axe rule), and a person runs the calibration in their own terminal. A sample of findings from each run goes to a person, who marks it confirmed or false, so each check's precision shows in the report. The only layer with a model, the PR review, is labelled an opinion and never fails a build.

## Commands

Run from the design system's package (where `a11y-kit.config.mjs` is):

```bash
node ../a11y-kit/bin/a11y-kit.mjs registry          # write the registry and the list of checks (EN + RU)
node ../a11y-kit/bin/a11y-kit.mjs registry --check  # fail if they are stale (in Theya: pnpm api:check)
node ../a11y-kit/bin/a11y-kit.mjs compare list.json # another team's checklist against the registry
node ../a11y-kit/bin/a11y-kit.mjs calibrate-axe     # one known violation per axe rule, the way CI runs axe (config `axe`)
```

`compare` takes `[{ "id": "1.4.3-color-contrast", "sc": ["1.4.3"], "where": "ds" }, …]` (the criterion prefix and `sc` are optional; an axe rule id is matched after the prefix) and reports: rows that are not an axe rule or a registry check (with what the registry has for their criterion), axe rules that only run when switched on by name (experimental, deprecated, off by default), criteria a row leaves out though axe maps the rule to them, WCAG 2.2 A/AA criteria with no row, and registry checks the list has no row for.

## Config

```js
// a11y-kit.config.mjs
export default {
  calibrationStories: ['src/test/a11y-fixtures.stories.tsx', 'src/test/a11y-act.stories.tsx'],
  registryOut: 'a11y/registry.json',
  listOut: '../../docs/a11y-checks', // + .md and .ru.md
};
```

axe-core is resolved from the design system (the copy its test runner uses), so the registry describes the rules it actually runs.

## Registry

- `registry/wcag22.json` — the 55 WCAG 2.2 A/AA criteria; `where`: `ds` (per component), `library`, `product`.
- `registry/checks.json` — the kit's own checks. `stage`: code, component, page, manual, pr. `depth`: `full` (a clean result verifies the criterion for what is rendered), `part`, `gate` (a finding fails, a clean result proves nothing alone), `advisory`. `calibration`: name prefixes of the stories it must catch and pass; the build fails on a name that doesn't exist.
- axe rules come from axe-core's metadata: every WCAG criterion tag (not just the first), whether the rule runs by default, its ACT ids.

## Plan

1. Registry and list of checks, comparison with other checklists. **Done.**
2. axe calibration: one known violation per rule, run the way CI runs it (tags, impact threshold, scan root) → caught / below threshold / review only / not caught / not run / page level, into the registry. **Done** (`a11y-kit calibrate-axe`).
3. The engine: tree, auto, states, forced move here behind a design-system adapter (story → component, source folders, themes); Theya's output must stay identical.
4. Code reader (2.1.4, 2.3.1, 2.5.1, 2.5.2, 2.5.7, 3.3.8), coverage of what a run renders (components, error, loading, disabled, expanded), page mode for products (URLs, page-level checks, findings tied to design-system components by `data-slot`), review sampling (precision per check), the PR review prompt from the registry, and depth the lists lack: 2.2.1 timeouts, 2.2.2 pause, 1.3.5 missing `autocomplete`, 1.4.1 state by color only, 3.3.2 instructions, pixel focus visibility in normal colors, non-text contrast, text contrast axe can't tell.
