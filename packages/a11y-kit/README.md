# a11y-kit

Accessibility checks for a design system and the products built on it, from one registry: every check from every layer (code, components in Storybook, a product's pages, the review agent, people), the WCAG 2.2 criteria each one gives evidence for, how deep it goes and what it is calibrated on.

Russian: [README.ru.md](./README.ru.md).

**Status (2026-11-19): steps 1–3 of the plan done** — the registry, the axe calibration, the engine (`a11y-kit tree|auto|states|forced`) — and the change review (below) from step 4. The matrix (`build-a11y`) and the screen-reader queue still live in Theya.

## Principle: nothing on trust

A verdict comes from a deterministic script, never from a model: the same input gives the same JSON. Every check is calibrated on known defects and clean cases (the design system's calibration stories, the W3C ACT test cases, one known violation per axe rule), and a person runs the calibration in their own terminal. A sample of findings from each run goes to a person, who marks it confirmed or false, so each check's precision shows in the report. The only layer with a model, the change review, is labelled an opinion and never fails a build; its own precision is counted from the issues it opens.

## Commands

Run from the design system's package (where `a11y-kit.config.mjs` is):

```bash
node ../a11y-kit/bin/a11y-kit.mjs registry          # write the registry and the list of checks (EN + RU)
node ../a11y-kit/bin/a11y-kit.mjs registry --check  # fail if they are stale (in Theya: pnpm api:check)
node ../a11y-kit/bin/a11y-kit.mjs compare list.json # another team's checklist against the registry
node ../a11y-kit/bin/a11y-kit.mjs calibrate-axe     # one known violation per axe rule, the way CI runs axe (config `axe`)
node ../a11y-kit/bin/a11y-kit.mjs contrast border background  # WCAG contrast of two tokens or colours, both themes (config `review.tokens`; --brand all for product themes)
node ../a11y-kit/bin/a11y-kit.mjs tokens [--ci]     # every token pair in review.tokens.pairs, in every theme and product theme (known pairs warn)
node ../a11y-kit/bin/a11y-kit.mjs review-precision  # how often the change review was right, from its closed issues (needs gh)
```

`compare` takes `[{ "id": "1.4.3-color-contrast", "sc": ["1.4.3"], "where": "ds" }, …]` (the criterion prefix and `sc` are optional; an axe rule id is matched after the prefix) and reports: rows that are not an axe rule or a registry check (with what the registry has for their criterion), axe rules that only run when switched on by name (experimental, deprecated, off by default), criteria a row leaves out though axe maps the rule to them, WCAG 2.2 A/AA criteria with no row, and registry checks the list has no row for.

## Config

```js
// a11y-kit.config.mjs
export default {
  calibrationStories: ['src/test/a11y-fixtures.stories.tsx', 'src/test/a11y-act.stories.tsx'],
  registryOut: 'a11y/registry.json',
  listOut: '../../docs/a11y-checks', // + .md and .ru.md
  review: {
    paths: ['src/components', 'src/styles', ':(exclude,glob)**/*.stories.tsx'], // git pathspecs
    read: ['../../CONTRIBUTING.md'],
    notes: (root) => '- Focus ring: accepted under 3:1 …', // markdown
    tokens: { files: ['…/variables.css', '…/variables-dark.css'], light: [':root'], dark: [':root', '[data-theme="dark"]'], page: 'background' },
  },
};
```

axe-core is resolved from the design system (the copy its test runner uses), so the registry describes the rules it actually runs.

## Change review

An agent (Claude) reads each change against WCAG 2.2 A/AA and reports what the scripts can't see: an ARIA value that is valid but false, a "fix" that improves a contrast without reaching it, a keyboard path a pointer handler forgot, a style combination whose result only a render can tell. Its method is [`review/agent.md`](./review/agent.md). Everything around it is deterministic:

- `review-diff <from> <to> --out f` — the change, limited to `review.paths`.
- `review-context --out f` — generated from the registry: criteria the scripts prove (not reviewed), the rest with what the scripts already see, the design system's accepted deviations (`review.notes`), documents to read (`review.read`), the `contrast` command.
- `contrast <fg> <bg>` — the agent may only state a ratio it computed here, from the design system's own CSS.
- `review-post` — checks the agent's findings.json before anything is filed: AAA criteria, criteria the scripts prove and product-level criteria are dropped. A violation not checked against the code, or a contrast claim without a recomputed ratio, is downgraded to "needs a run". Then it opens one issue per violation or design decision (label `a11y-review`, the same finding never twice) and posts one comment on the commit or PR.
- `review-precision` — closed as completed = right, closed as not planned = wrong.
- `review-case`, `review-score`, `review-report` — calibration of the review itself: each case in `review.cases` is a known change (a planted defect per reviewable criterion, or a change that must report nothing) with the expected answer. Theya's 36 cases run with `.github/workflows/a11y-review-calibrate.yml`, by hand; the agent never sees the answers.

In Theya it runs on every push to main that touches components, styles or tokens (`.github/workflows/a11y-review.yml`), on the repository owner's Claude subscription (secret `CLAUDE_CODE_OAUTH_TOKEN`, made with `claude setup-token`). The agent's job can only read the repository; issues and the comment are written by a separate job without the agent.

## Audit

A second agent, the auditor ([`review/auditor.md`](./review/auditor.md)), re-checks what the matrix takes on trust and never changes code. `audit-queue` finds the work deterministically: hand-kept reviews older than the last change to their component (with the diff since), and cells marked untested or partial. The agent answers each item (holds / broken for a stale review, pass / fail for an open cell, unsure when a run or a person must decide). `audit-post` drops answers to items it wasn't given, unknown verdicts and claims without evidence, and opens issues (label `a11y-audit`) for broken, fail and unsure. The rest become dated records signed "Claude (audit)" that `audit-apply` writes back (config `audit.apply`). `audit-sample` picks applied records for a person to re-check: the auditor's precision. In Theya: `.github/workflows/a11y-audit.yml`, by hand, in waves of a few batches.

## Registry

- `registry/wcag22.json` — the 55 WCAG 2.2 A/AA criteria; `where`: `ds` (per component), `library`, `product`.
- `registry/checks.json` — the kit's own checks. `stage`: code, component, page, manual, pr. `depth`: `full` (a clean result verifies the criterion for what is rendered), `part`, `gate` (a finding fails, a clean result proves nothing alone), `advisory`. `calibration`: name prefixes of the stories it must catch and pass; the build fails on a name that doesn't exist.
- axe rules come from axe-core's metadata: every WCAG criterion tag (not just the first), whether the rule runs by default, its ACT ids.

## Plan

1. Registry and list of checks, comparison with other checklists. **Done.**
2. axe calibration: one known violation per rule, run the way CI runs it (tags, impact threshold, scan root) → caught / below threshold / review only / not caught / not run / page level, into the registry. **Done** (`a11y-kit calibrate-axe`).
3. The engine: tree, auto, states, forced move here behind a design-system adapter (config: title → component, where results go). **Done:** `src/engine/`; Theya's `scripts/a11y-*.mjs` are wrappers. Proven identical: the old scripts and the kit on the same Storybook gave byte-identical results for Combobox, Rating, SecretField and Tooltip in all four checks, and the kit passes all 60 calibration stories in each.
4. Code reader (2.1.4, 2.3.1, 2.5.1, 2.5.2, 2.5.7, 3.3.8), coverage of what a run renders (components, error, loading, disabled, expanded), page mode for products (URLs, page-level checks, findings tied to design-system components by `data-slot`), review sampling (precision per check), the change review (**done**, see above), and depth the lists lack: 2.2.1 timeouts, 2.2.2 pause, 1.3.5 missing `autocomplete`, 1.4.1 state by color only, 3.3.2 instructions, pixel focus visibility in normal colors, non-text contrast, text contrast axe can't tell.
