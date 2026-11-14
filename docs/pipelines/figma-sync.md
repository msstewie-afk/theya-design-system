# Pipeline: Figma sync

Code is the source of truth; the THEIA Figma file (`LPj5ZGhCmC2OEwXJPF7isw`) follows it. A code change that touches something Figma draws is not finished until Figma shows it too, or the difference is written down as accepted.

Russian version: [figma-sync.ru.md](./figma-sync.ru.md).

## Trigger

A line in the queue, [`docs/figma-queue.md`](../figma-queue.md) (and `.ru.md`), under "Open". Whoever changes in code a token, a profile key, a text style, or a component's size, padding, radius, slot, variant or reference story adds the line in the same commit: version or commit, area, what changed in code, what Figma needs. A release with a visual changeset and no queue line is a gap: the agent who releases checks the changesets against the queue.

## Steps

| # | Step | Who | Status after |
|---|---|---|---|
| 1 | **Queue.** The line is in "Open", with the node id when it is known. | the agent who changed code | `queued` |
| 2 | **Tokens.** After the release: build tokens, then the two-part check: `pnpm --filter @theya/tokens build && pnpm --filter @theya/tokens figma:parts`, then `build/figma/check-*.js` through `use_figma`. If it is not ok, `sync-*.js` (`-9-…` before `-2.` on a first sync), then check again until it is ok. This covers variables, brand modes ("9. Brand"), shadow layers and the Elevation styles. A script over 50 000 characters is cut into a delta (only the changed variables), as on 13–14.11. | agent 2 | `tokens synced` |
| 3 | **Components.** Each component line by hand or with `use_figma`: sizes, padding, radii bound to variables (never raw numbers), descriptions that say the rule. What Figma cannot hold (an OpenType feature, a CSS-only behaviour) goes in the component description and stays open for Мария if it needs a hand in Figma. | agent 2 | `drawn` |
| 4 | **Verify.** Read the changed nodes back (properties, bindings) in the same run. Where a reference story exists, `scripts/figma-visual-diff.mjs` against it. The agent cannot download Figma screenshots (the proxy blocks Figma assets), so the look is checked in step 5. | agent 2 | `verified` |
| 5 | **Review.** Мария looks at the nodes in Figma, in the modes that matter (ember, dark). | Мария | `reviewed` |
| 6 | **Close.** The line moves to "Done" with the date and node ids, or to "Accepted differences" with the reason. | agent 2 | `closed` |

Several lines share steps 2, 4 and 5 (one token sync, one review).

## Gates

Before step 3:

- `pnpm --filter @theya/tokens figma:test` passes (the mock run of check and sync) when the token scripts changed.
- The token check returns `ok: true` in both parts, `effects` included.

Before step 6:

- Every changed node is read back with the expected value or binding.
- Мария has looked at it (step 5), or the line stays open as "review".

## Outputs

The updated Figma file; the queue lines moved; a commit with the queue (and the token scripts, if they changed). The push follows the usual rule: one batch, when CI on main is idle.

## Done

The queue has no line for the change in "Open": it is in "Done" with node ids, or in "Accepted differences" with a reason. A change drawn but not reviewed is not done.

## Not in Figma

A component that has no Figma counterpart (Password, Comparison, LoginForm today) gets no drawing from this pipeline: its queue line says so and goes to "Done" with "not drawn". Drawing a new component is the "new component" pipeline.
