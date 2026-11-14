# Pipeline: product request

A product built on Theya (PlateCovery today) needs something Theya doesn't do yet, or does wrong. Until Theya ships it, the product carries a workaround (CSS or code). The request is done when Theya does it **and the workaround is gone**.

Russian version: [product-request.ru.md](./product-request.ru.md).

## Trigger

A T-card from the product's team (the product's agent writes it, Мария sends it). One card per need, numbered T1, T2…, with:

- **Context** — what's wrong, where, on which screen and device (the founder looks in Safari, a 390px phone frame inside a wide window).
- **In the product now** — the workaround: files and what they override.
- **Request** — what Theya should do.
- **Done when** — the check, in the product's terms ("without CSS in the app, the field and the button are 6 / 8px").

A card without "In the product now" or "Done when" goes back for them: without the first nobody removes the workaround; without the second nobody knows when to stop.

## Steps

| # | Step | Who | Status after |
|---|---|---|---|
| 1 | **Triage.** Is it Theya's job? Theya isn't tied to one product: the change is made as a general rule or prop, not a PlateCovery special case. Which components, which agent owns their files. Any design choice that isn't obvious goes to Мария as a question with a recommended option. | agent | `triaged` |
| 2 | **Build.** The change in Theya; a story that shows the product's case (a narrow container, a long label) with a play test where behaviour changed; a changeset; docs and guidelines if the rule is new; a line in the [code ↔ Figma queue](../figma-queue.md) if the change touches anything Figma draws (see [Figma sync](./figma-sync.md)). | agent | `in progress` |
| 3 | **Check.** Gates below. | agent | `ready` |
| 4 | **Release.** Push when CI on main is idle, CI green, version, publish. Мария gets the install command and the tag command. | agent | `released vX.Y.Z` |
| 5 | **Adopt.** Мария installs the version. The agent removes the workaround from the product (the files the card lists) and type-checks it. Мария looks at it in the product. | Мария, agent | `adopted` |
| 6 | **Close.** The card is marked done with the version. | agent | `closed` |

Several cards can share steps 4–6 (one release, one install).

## Gates

Before step 4, all of:

- `tsc --noEmit`; `pnpm api` and `pnpm api:check`.
- The touched stories in the test-runner in four modes: light, `THEYA_THEME=dark`, `THEYA_VIEWPORT=360`, `THEYA_BRAND=ember`.
- The accessibility scripts on the touched components: `a11y-tree`, `a11y-auto`, `a11y-states` with `--only "<title>"`; `pnpm a11y:calibrate` if a check changed.
- Every visual changeset in the release has its line in the code ↔ Figma queue ("Open"): the agent who releases checks.
- No CI run in progress on main when pushing (unless the push fixes a red main).

Before step 6: the card's "Done when" holds in the product without the workaround.

## Outputs

The commit and changeset (the card number in the message), the story for the case, the released version, the product's diff that removes the workaround.

## Done

"Done when" holds, the version is released and installed, the workaround is removed from the product, and a visual change has its line in the code ↔ Figma queue. A card that is released but not adopted is not done: that is where workarounds pile up.
