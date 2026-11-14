# Code ↔ Figma queue

The standing list of places where the THEIA Figma file (`LPj5ZGhCmC2OEwXJPF7isw`) and the code disagree. Code is the source of truth unless an item says otherwise. This file is the input of the future "Figma sync" pipeline (`docs/pipelines/`); until that pipeline is written, whoever changes a component or a token in code adds a line here, and whoever syncs Figma moves it to "Done".

Russian version: [figma-queue.ru.md](./figma-queue.ru.md).

## How to use it

- **Add** an item when a code change touches anything Figma draws: a token, a text style, a component's size, padding, slot, variant or reference story. One line: version or commit, component, what changed in code.
- **Sync**: tokens with `node packages/tokens/scripts/figma-run.mjs check|sync` (see `packages/tokens/scripts/figma/README.md`); components by hand or with `use_figma`.
- **Close**: move the line to "Done" with the date and the Figma node id. If Figma deliberately differs, move it to "Accepted differences" with the reason.
- Verify by reading node properties when screenshots are not available to the agent (the agent proxy blocks Figma asset downloads), and leave the visual look to the review.

## Open

| Since | Area | What | Needs |
|---|---|---|---|
| 0.3.15 | StickyActionBar | The top divider runs edge to edge in both widths (was inset to the side padding; Мария, 14.11). Node 32677:510 still draws it inset 16 / 24. | Divider full width in every variant. |
| 0.3.15 | Nested corners | A control inside a field or card is a step less round than it: PromptArea send button md (pressed lg) and attachments md inside the lg field; SecretField reveal / copy and Password show / hide buttons md; Alert and Stat (card) inside a Card xl; Comparison rows xl around the lg item icon. | Same radii on the Figma components and examples. |
| 0.3.15 | Drawer (Ember) | The description is body M in Ember (15/20), body S elsewhere (T19), through the profile key `componentText`. | Ember mode of the description text style, or a note on the Drawer. |
| 0.3.14 | Text styles | Display/S, Eyebrow/M, Eyebrow/S: lining figures (`lnum`) are set in code; the Plugin API cannot set OpenType features. | Set by hand in Figma: Type settings → Numbers → Lining. Same check for Headline/*. |
| 0.3.14 | Review | Nodes added or changed 13.11 were checked by properties only, not by eye: Drawer, StickyActionBar width=phone, TabsList (chips), OptionCard, DropdownMenu / With Trailing, ContextMenu / With Trailing, Ember radius bindings, Elevation styles in each mode (14.11). | A visual pass in Figma. |
| earlier | Kbd | Border 1px and the size of the ⌘ glyph. | Compare with code at review. |
| earlier | Reference stories | PushSheet, Dialog (full) and the menu "Figma reference" stories against the Figma examples (pp-01, agent 3). | Run `scripts/figma-visual-diff.mjs` on them. |
| earlier | Separator and other props | Figma component properties still use the old names (prop vocabulary of 27.09, e.g. Separator `emphasis`). | A rename pass in Figma. |

## Done

| Date | Version | Area | Figma |
|---|---|---|---|
| 2026-11-13 | 0.3.7–0.3.14 | Tokens: bg-surface-page, bg-surface-sunken-on-page, bg-neutral-subtle-on-page (8 modes); Ember radius steps sm 3, md 5, lg 6, xl 8, 2xl–4xl 12, 5xl 24, theme-radius field and field-sm; size-minus1; display-s and eyebrow-m/s brand variables, Ember display-s letter spacing 0.4 | collections 2, 3, 6, 9 (delta sync from 8bb3c27) |
| 2026-11-13 | 0.3.14 | Text styles Display/S (40/44, −1), Eyebrow/M (15/20, +2, upper case), Eyebrow/S (13/16, +2, upper case), bound to "6. Semantic Typography" | text styles |
| 2026-11-13 | 0.3.14 | Drawer: header pr 24 (title-row pr 32 keeps room for × at the title only), pb 4; body pt 8, so 12 from the description to the first field; description full width | 32597:15565 |
| 2026-11-13 | 0.3.14 | StickyActionBar: width=phone variants (padding 16, divider inset 16); width=wide keeps 24 (from 30rem of the bar's width) | 32677:510 |
| 2026-11-13 | 0.3.14 | TabsList (chips), overflow=false/true: opaque track bound to bg-surface-sunken, active chip bg-surface + Elevation/sm; 48px scroll button, fade solid for 24px at the edge (stops bound to the track colour), chevron 20px in icon colour, 8px from the edge | 32889:57 |
| 2026-11-13 | 0.3.14 | OptionCard: icon and indicator centred on the first title line (box one line high); the two-column rule (≥16rem) written in the description | 32656:121 |
| 2026-11-13 | 0.3.14 | TextArea: vertical-only resize written in the description | 32602:15695 |
| 2026-11-13 | 0.3.14 | DropdownMenu / With Trailing and ContextMenu / With Trailing: non-interactive trailing "5/5", separate "Remove watermark" item, tone=danger | 32889:198, 32889:229 |
| 2026-11-14 | 0.3.14 | Shadows: one colour variable per layer, `elevation/<step>/layer-<n>` in "2." (22, scope effect colour), values per mode; Elevation/xs…xl and edge-up rebuilt to the code geometry (they held an older scale) with each layer bound. Warm in Ember, black with the white ring in dark; a layer one theme lacks is transparent there. Synced by `figma-run sync` from now on | effect styles, "2." |
| 2026-11-13 | 0.3.14 | Combobox / Autocomplete Loading and No results: no visual change, nothing to sync | — |

## Accepted differences

- Motion components (CountUp, Marquee, Reveal, SurfaceEffect, TextEffect) are not drawn (Мария's decision, 06.10).
- UrlTabs is not a separate Figma component: it looks like TabsList / TabsTrigger.
