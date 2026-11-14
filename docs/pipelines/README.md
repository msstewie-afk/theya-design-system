# Work pipelines

How a piece of work goes from "it's in the backlog" to "done and checked". The CI checks (TESTING.md) say whether something broke; a pipeline says which steps a kind of work goes through, who does each, which checks gate it and when it counts as closed — so the path doesn't have to be rebuilt from chat each time.

Russian version: [README.ru.md](./README.ru.md).

Each pipeline has the same parts: **trigger** (what starts the work), **steps** with who does them, **gates** (checks that must pass before the next step), **outputs** (what's left behind) and **done** (when the item closes). Item statuses follow the steps, so the backlog shows where each item stands, not just "in progress".

| Pipeline | Starts with | Ends with |
|---|---|---|
| [Product request](./product-request.md) | a T-card from a product (PlateCovery) | the change released, installed, the product's workaround removed |
| [Screen-reader pass](./screen-reader-pass.md) | the screen-reader queue (`pnpm a11y:sr-queue`) | passes recorded in `a11y/manual.json`, fails turned into fixes |
| [Figma sync](./figma-sync.md) | a line in [the code ↔ Figma queue](../figma-queue.md) | the line in "Done" with node ids, reviewed by Мария |

To come, same shape: new component, accessibility defect, token or theme change, release.
