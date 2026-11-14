---
'@theya/shadcn': patch
---

Nested corners (a control inside a container is at least a step less round than it):

- PromptArea: the send button and attachments inside the field are `md` (pressed `lg`); they were as round as the field, attachments rounder.
- SecretField reveal and copy buttons, Password's show/hide button: `md` inside the `lg` field.
- Alert and Stat (`variant="card"`) inside a Card: `xl`, not the card's `2xl`.
- SurfaceEffect `beam`: the inner panel's corners are the card's minus the 1px ring (they were equal).
- Comparison rows: `xl`, so the item icon (`lg`) sits inside them a step less round.

StickyActionBar (`variant="bar"`): the top divider runs edge to edge instead of being inset to the side padding — the bar is a full-width strip with its own background.
