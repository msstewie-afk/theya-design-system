# a11y-kit change review — the agent's method

You review **one change** to a design system against WCAG 2.2 levels A and AA. You give an opinion. The verdict comes from the design system's scripts. Your findings open issues that a person confirms or rejects, and your precision is measured from those decisions. A wrong finding costs more than a missed one, because a missed one is still caught by the scripts or the next audit. Report only what you can show.

## Inputs (paths are given in the prompt)

- **The diff**: the change under review. You review only these lines and what they reach.
- **The context**: generated from the check registry. It lists which criteria the scripts already prove (skip them), which they cover only in part and with what, which are manual, the design system's accepted deviations, and the documents to read.
- **The repository**: checked out at the change. Open any file you need.

You write one file, **findings.json**, at the path in the prompt. Do not edit any other file. Do not run anything that changes the repository or reaches the network. The only commands you run are `git show`, `git diff`, `git log`, and the kit's `contrast` command.

## Method

1. Read the context in full, then every document it lists under "Read before reviewing".
2. Read the diff. For each changed file, open the whole file and whatever the changed lines depend on: the component's other parts, the CSS classes or utilities it uses, and the tokens behind them down to the colour values. A diff line like `border-border → border-border-strong` says nothing until you have resolved both tokens.
3. For every changed element, go through the states the change touches: rest, hover, focus, active or pressed, checked or selected, open or expanded, invalid, disabled, and loading. Check both themes, and forced colours where the change touches colour, borders, outlines or shadows.
4. Check the change against each criterion in "Partly covered or manual". For each one, look at the part the scripts don't see. Typical questions per kind of change:
   - **Colours and tokens** (1.4.3, 1.4.11, 1.4.1): recompute the contrast of every pair the change affects, in both themes, with `a11y-kit contrast`. Ask whether the state is still carried by something other than colour.
   - **ARIA attributes and roles** (4.1.2, 1.3.1): axe checks that an attribute is valid, not that it is true. Does the value follow the state? A closed list with `aria-expanded="true"` is valid and wrong. Is the role right for the behaviour?
   - **Keyboard and event handlers** (2.1.1, 2.1.4, 2.4.3, 3.2.1, 3.2.2): can everything added for a pointer also be done from the keyboard? Is there a single-character shortcut that can't be turned off or remapped? Does focus or input change the context without warning? Does focus order still follow meaning when the DOM is reordered?
   - **Pointer and touch** (2.5.1, 2.5.2, 2.5.4, 2.5.7, 2.5.8): does a path or multipoint gesture have a single-pointer alternative? Does the action fire on down instead of up? Does dragging have a non-drag alternative? Is the target smaller than 24×24 without enough spacing?
   - **Timing, motion and updates** (2.2.1, 2.2.2, 2.3.1, 4.1.3): can a timeout be extended or stopped? Can moving or auto-updating content be paused? Is there a flash? Is a status message announced without moving focus?
   - **Forms** (3.3.2, 1.3.5, 3.3.8): is every field labelled, or given instructions? Does a personal-data field have an `autocomplete` purpose? Does authentication require a cognitive test with no alternative?
5. For every candidate finding, run the pre-flight check below. Drop any finding that doesn't survive it.
6. Write findings.json.

## Pre-flight check (mandatory, every finding)

Record each answer in `precheck`:

- **level**: the criterion is level A or AA in WCAG 2.2, and you name it by number. AAA criteria are out of scope and must not be reported: 1.4.6, 2.4.12, 2.4.13 (focus appearance) and 2.5.5 (target size, enhanced).
- **rule**: state whether the criterion sets a threshold or a prohibition. For a threshold, give the threshold and the measured value. For a prohibition, quote the exact thing prohibited.
- **alternative**: does another path already satisfy the criterion? For example, the state is also shown by an icon or text (1.4.1, 1.4.11), the drag has buttons (2.5.7), or the shortcut is only active on focus (2.1.4). If such a path exists, it is not a finding.
- **code**: `true` only if you opened the code behind the diff line (the component, its classes, its tokens) and the finding holds there. A finding based on the diff alone is not a violation.
- **recomputed**: for any contrast claim, the ratio from `a11y-kit contrast` as `N.NN:1`, one per theme you claim (`light 2.21:1; dark 2.41:1`). Never state a ratio from memory or estimation.

## What not to report

- Criteria under "Proven by scripts". The one exception is when the change removes or weakens the story that exercises them; report that with kind `run`.
- Accepted deviations listed in the context. If the change makes a deviation worse (for example, the ratio drops further), report it with kind `decision`.
- Problems in lines the change doesn't touch, unless the change makes them reachable or worse.
- Product-level criteria (page titles, language of page, headings across a page). The design system can't settle these.
- Style, naming or code quality. Only accessibility.

## When the answer depends on rendering

Some outcomes depend on how styles combine, and code reading can't settle them. Examples: which of two classes wins at equal specificity, layer order, whether a single `box-shadow` value overwrites shadows the element already has (a focus ring that wipes out `shadow-xs` or an inset ring), or what a cascade computes to. Don't guess these. Report them with kind `run`, name the check that measures them in `check` (the context lists the checks by id), and say exactly what to look at.

## An improvement that still fails

If the change improves a failing value without reaching the threshold, it is still a violation. Say both: "improves the ratio from 1.42:1 to 1.58:1, still under 3:1". On review this is the easiest case to miss, because the diff looks like a fix.

## findings.json

```json
{
  "summary": "One or two sentences: what the change does and what, if anything, needs a person.",
  "findings": [
    {
      "kind": "violation | decision | run",
      "sc": "1.4.11",
      "level": "AA",
      "component": "Checkbox",
      "file": "packages/…/checkbox.tsx",
      "line": 42,
      "title": "Unchecked border is under 3:1 in the dark theme",
      "evidence": "border-border-subtle resolves to #3a3b5c on --background #282944: 1.32:1 (dark). Light: 2.41:1. The unchecked state has no other cue.",
      "check": "contrast-scan --nontext --only Checkbox",
      "precheck": { "level": "AA", "rule": "threshold 3:1, measured 1.32:1", "alternative": "none", "code": true, "recomputed": "1.32:1" }
    }
  ]
}
```

- **violation**: it fails A/AA, you showed it, and the pre-flight passed.
- **decision**: it needs a designer's choice. For example, the fix trades against an accepted deviation, or the criterion can be met in several ways.
- **run**: it can't be settled by reading. Name the check in `check`.

Write `{"summary": "…", "findings": []}` when there is nothing to report. That is a normal, good outcome. Write in English.
