---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Border tokens are now one scale, named by strength. **Breaking rename:**

| Token | Role | Light / dark |
|---|---|---|
| `--color-border-border` | fields and controls (was `border-subtle`) | slate-350 / slate-400 |
| `--color-border-border-subtle` | cards, tables, bordered surfaces (new) | slate-200 / slate-450 |
| `--color-border-border-subtler` | dividers (unchanged) | slate-050 / slate-500 |
| `--color-border-border-strong` | the darkest neutral line (was `border`) | slate-600 / slate-300 |

Migrate in this order: `border-border` → `border-border-strong`, then `border-border-subtle` → `border-border`. `--color-border-border-default` stays as an alias of `--color-border-border`.

Card, Table, DataTable (frame, rows, toolbar), Stat, Alert, CodeBlock, DiffViewer, Terminal, Scheduler, Kanban, Resizable, StickyActionBar, Attachment, prose tables and the card surfaces in blocks move to the new `border-subtle`, so a table no longer blends with the filter inputs above it and rows of cards stop reading as solid bands. Themes that set `border` or `border-subtler` by hand get the OKLab midpoint of their own values for `border-subtle`.
