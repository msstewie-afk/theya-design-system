# @theya/tokens

## 0.3.7

### Patch Changes

- 9ab81a3: Profiles can set the type step of a component part (`componentText`), through `--theme-text-<part>`. Ember sets Drawer descriptions to body M (T19: body S under a sheet title read too small); the default theme keeps body S.

## 0.3.6

### Patch Changes

- ee327e0: Tabs (chips): a clearer scroll button (48px fade, solid for 24px at the edge; 20px chevron, stroke 2, icon colour, 8px from the track's end), and the active tab scrolls into view, centred, on mount and when the value changes, without moving the page; reduced motion respected (T15).

  Ember radius: steps picked by eye instead of ×1.8 (sm 3, md 5, lg 6, xl 8, 2xl–4xl 12, 5xl 24) through the new profile option `radius.steps`; fields use the default lg (no longer xl). Field 6 < button 8 < card, drawer, dialog, media 12. The nested-corners rule is spelled out in Foundations (T16).

  Drawer: 16px from the header to the first field (body has no top padding right under a header), only the title makes room for the ×, data-slot on content, header, body, footer, title and description, and the first field is focused on open without scrolling the page (T17).

  TextArea: resizes by height only and never grows past its container; `resize` prop ('vertical' | 'none') (T18).

## 0.3.5

### Patch Changes

- 26a1b1d: Ember: the page surface is a step warmer, chosen in PlateCovery (light `bg-surface-page` #f8f4f0, fills on it #e3deda instead of the grey #e4e2e1).

## 0.3.4

### Patch Changes

- 36b347a: Page surface (T14). New tokens `bg-surface-page`, `bg-surface-sunken-on-page` and `bg-neutral-subtle-on-page`; `bg-surface-page` follows a theme's `bg-surface-base` unless the theme sets it. Ember tints it warm (light #f7f4f1, dark #191512). `data-surface="page"` on a page wrapper paints it and moves the fills lying on it (Tabs chips track; Progress track, Skeleton) a step off the page; inside a Card, which now sets `data-surface="card"`, they are the theme's own. Muted chip text on a page track goes to text-subtle for contrast.

## 0.3.3

### Patch Changes

- 07c7866: Ember: `text-display-s` letter-spacing is +0.4px (was Theya's −1px), so Playfair Display at 40px extrabold no longer touches its letters ("Ricotta", "Soufflé"). New profile option `typography` sets a theme's own typography token values after the fonts. Ember's heading-* steps keep 0px: checked at 24–32px, nothing touches.

## 0.3.2

### Patch Changes

- 2fc1be3: Editorial type styles and warm Ember shadows. New tokens `typography.display.display-s` (40/44, extrabold, −1px) and `typography.eyebrow.eyebrow-m` (15/20, semibold, 2px) / `eyebrow-s` (13/16, regular, 2px), set in the heading face (Playfair Display in Ember). Utilities: `text-display-s` (with `font-heading`), `text-eyebrow-m`, `text-eyebrow-s` (heading face, uppercase, lining figures included). New profile option `shadow` re-hues the light shadow tint; Ember uses it, so its shadows are warm instead of indigo. New primitive `size.size-minus1`.

## 0.3.1

### Patch Changes

- 8777515: Ember's heading face is Playfair Display (was EB Garamond), self-hosted in `@theya/tokens/fonts` (variable 400–900, normal + italic; Latin, Cyrillic, Vietnamese). `.font-heading` sets lining figures, so a serif heading face's old-style figures don't bob along the line ("10 weeks", "115 kcal"); Geologica's figures are lining already. EB Garamond stays the landing display serif.

## 0.3.0

### Minor Changes

- d5788c2: Primitives: the azure ramp is back (its 26.10 values) and red and orange get an 850 step again, between 800 and 900 so the ramps keep getting darker in order (red-850 #52041f, orange-850 #4d250c). Primitives stay in the palette whether or not a token uses them now.

### Patch Changes

- 4a4b822: CI check: no primitive step can disappear from the palette without editing primitives.lock.json on purpose (`node scripts/check-primitives.mjs`, `--update` to add new steps).
- 70cc203: Profiles with `headingFont`: heading weights stay inside the face's loaded range (EB Garamond 400–800). Ember's 3xl heading now says 400 instead of inheriting Geologica's 100, which the browser already rendered as 400.

## 0.2.0

### Minor Changes

- abd92ae: Border tokens are now one scale, named by strength. **Breaking rename:**

  | Token                           | Role                                      | Light / dark          |
  | ------------------------------- | ----------------------------------------- | --------------------- |
  | `--color-border-border`         | fields and controls (was `border-subtle`) | slate-350 / slate-400 |
  | `--color-border-border-subtle`  | cards, tables, bordered surfaces (new)    | slate-200 / slate-450 |
  | `--color-border-border-subtler` | dividers (unchanged)                      | slate-050 / slate-500 |
  | `--color-border-border-strong`  | the darkest neutral line (was `border`)   | slate-600 / slate-300 |

  Migrate in this order: `border-border` → `border-border-strong`, then `border-border-subtle` → `border-border`. `--color-border-border-default` stays as an alias of `--color-border-border`.

  Card, Table, DataTable (frame, rows, toolbar), Stat, Alert, CodeBlock, DiffViewer, Terminal, Scheduler, Kanban, Resizable, StickyActionBar, Attachment, prose tables and the card surfaces in blocks move to the new `border-subtle`, so a table no longer blends with the filter inputs above it and rows of cards stop reading as solid bands. Themes that set `border` or `border-subtler` by hand get the OKLab midpoint of their own values for `border-subtle`.

- 91fb7b9: Charts readable without relying on color, and in dark:
  - `chart-01`…`chart-07` now have dark values: all seven series share one lightness, 3.6:1 on the page and 3.2:1 on cards (in dark they reused the light colors, 1.5–3:1). New primitives for them: `blue-450`, `magenta-350`, `teal-350`, `slate-375`, `red-250`, `green-450`, `purple-350`. The tokens moved from the theme-independent set to the light and dark semantic sets; their names don't change.
  - `chart-07` is purple (`purple-500` light) instead of azure: at equal lightness azure was hard to tell from blue.
  - **Breaking (primitives):** the `azure` ramp is removed; nothing else used it. Use `cyan` (the info color) or `blue` instead.
  - LineChart and AreaChart (with `series`) give every series after the first its own dash, shown in the legend and tooltip too (`seriesPatterns`, default true).
  - DonutChart: `slicePatterns` fills slices after the first with a pattern (lines, dots, grid), legend included. Off by default.
- abd92ae: The code syntax palette (Luna Pro) is now tokens instead of hand-written CSS in globals.css: `color.code.{bg,text,tag,attribute,string,number,selector,comment,invalid}` (Light in the default theme, Midnight in dark) and the fixed `color.code.*-inverse` set plus `code.border-inverse` in `src/code/color.json`. CSS variable names and values are unchanged (`--color-code-*`); the palette now also reaches the DTCG export and Figma (`code/…` in the semantic collection).
- a6e80b2: Dark theme, second round:
  - Popovers, menus, Command, HoverCard and other `bg-surface-overlay` surfaces are now a step lighter than the page (new `slate-650`, #303150) instead of darker (slate-900), so they read as raised. Toasts use the same surface; the `dark` Toaster and tooltips (`bg-surface-overlay-dark`) stay dark.
  - Field fill (`bg-input`) is `slate-900` instead of pure black.
  - Text hierarchy is spread a little wider: `text-subtle` slate-050 → new `slate-030` (lighter), `text-subtler` slate-100 → new `slate-150` (dimmer), still at least 4.5:1 on hover fills and in menus.
  - Filled buttons no longer sink into the page when pressed: each pressed step (and success hover) is half a ramp step instead of a full one. New primitives `blue-650`, `green-650`, `green-675`, `cyan-650`, `graphite-650`, `slate-475`; danger and warning pressed take the new `red-700` and `orange-700` (see the red/orange ramp renumbering). White text contrast only goes up. Light theme unchanged.
- a3fb19f: Dark theme visual pass (hierarchy that axe can't check):
  - `bg-primary-subtle` (dark): 50% → 30% blue, hover 40%, pressed 50% — the same steps the iris and lime themes already use. Tonal primary buttons, selected table and tree rows, the active Sidebar item and primary avatars no longer look almost like filled primary.
  - `bg-secondary-hover` / `-pressed` (dark): gray-a300 / gray-a400. The unchecked Switch track now changes on hover in dark (it didn't change before).
  - New `bg-surface-sunken` (gray-010 light, slate-800 dark): a recessed track or well for raised items. The Tabs chips track, WheelPicker and Kanban columns use it, so the active chip, the WheelPicker selection and Kanban cards look raised in dark instead of sunk. In light, WheelPicker and Kanban columns go from gray-005 to gray-010 (cards stand out a little more); Tabs chips are unchanged.
  - New `text-placeholder` (slate-450 light, slate-200 dark): field placeholders. In dark they were slate-100, hard to tell from typed values. Light is unchanged.
  - New `bg-input-disabled` (gray-005 light, slate-800 dark): the fill of disabled and read-only fields. In dark a disabled field was lighter than an enabled (black) one. Light is unchanged.
  - Things that float or stick over content no longer let it show through in dark (tonal fills are translucent there): the tonal FAB (and FabSpeedDial actions), TableHead (sticky DataTable header, frozen first column) and the hover / selected fill of pinned DataTable cells now paint their tint over the opaque surface. They look the same as before.
- abd92ae: Density now scales spacing. In compact and comfortable, padding, gap and margin above 8px shrink or grow by 40% of the excess, rounded to 2px (16 → 12 / 20, 24 → 18 / 30); 8px and below stay put. Covers numeric Tailwind `p-*`, `m-*`, `gap-*` utilities (incl. logical sides) and the `--size-padding-*`, `--size-gap-*`, `--size-margin-*` tokens. Default is unchanged. New token: `--size-density-density-space-delta`.
- abd92ae: Density modes: `data-density="compact" | "comfortable"` on `<html>` or on any container resizes controls one step along the size-control ramp (md…4xl), Table / DataTable rows (36/44/52px, two-line 48/56/64px) and menu, Select and Command items (4/8/12px vertical padding). Defined in `packages/tokens/src/density/*.json`, built into `build/css/density.css` and imported by `globals.css`. New `DensityToggle` (localized compact / default / comfortable switch, page-wide or controlled for one region) and `useDensity()`. Storybook has a Density toolbar switch. Default sizes are unchanged.
- 21e6e67: New `border-subtler-on-primary`: the divider inside a primary-filled surface. Theya keeps white at 30%; a theme with a light fill and dark text on it (lime) gets white at 60%, a light line without a darker green tint. The filled Card's divider uses it: in lime it was almost invisible.
- de0f66e: Removed `bg-surface-backdrop` (`--color-bg-surface-bg-surface-backdrop`). Nothing used it, and its values disagreed between themes (70% light, 10% dark). For a dimmed backdrop behind a dialog or drawer use `bg-scrim`, as the components do.
- 96de15a: Removed two unused surface tokens: `bg-surface-overlay-dark-pressed` (`--color-bg-surface-bg-surface-overlay-dark-pressed`) and `surface-overhead-dark-subtle` (`--color-bg-surface-surface-overhead-dark-subtle`). No component used them; the Toaster uses `bg-surface-overlay` (default) and `bg-surface-overlay-dark` (`dark`), which stay.
- 5c7a4ec: Elevation, reworked with Maria (2.11): the scale is layered "contact + ambient" — a tight shadow at the edge, then soft wide layers, each lighter as it spreads (light: slate-tinted; dark: black with a faint light rim on md, lg, xl). Components use two steps only: `shadow-elevation-sm` for what sits in the page (cards, raised details) and `shadow-elevation-md` for what floats (tooltips, menus, popovers, dialogs, sheets, toasts, cards in motion); xs, lg and xl stay as options. New alternative scale `shadow-elevation-smooth-xs…xl` (layers doubling 1→32px at one low alpha), not used by components yet. `shadow-card` = sm, `shadow-card-hover` = md. Landing photo cards: the gradient sits only under the text; the BookmarksPreview search key lines up with the row chips.
- abd92ae: Elevation tuned (from the light-and-shadow study): light shadows are tinted toward slate-900 instead of neutral ink, and lg / xl get a 1px ambient layer because they float. Dark theme gets its own set — black at 0.32–0.6 with a faint light rim on lg / xl — where it used to reuse the light values and the shadows all but disappeared. New `--elevation-edge-up` / `shadow-elevation-edge-up` for panels pinned to the bottom edge; the bottom Drawer uses it, so its shadow falls on the page instead of past the screen edge. Values moved to `src/code/elevation.json` and `elevation.dark.json`; the DTCG export carries them in the color-light / color-dark sets.
- abd92ae: - Iris radii: profiles can pin one radius step with `radius.anchor` and scale the rest from it. Iris sets fields (`lg`) to 2px: sm 1, md 1, lg 2, xl 3, 2xl 3, 3xl 4, 4xl 5, 5xl 11px (was ×0.75), so Iris reads clearly sharper than Theya and Lime.
  - Sidebar and Topbar edges use `border-subtle`, like cards.
- abd92ae: Motion presets for landing pages (new Storybook category "Motion"), ported from Kinetics (MIT, kinetics.colorion.co) onto Theya's motion tokens, no animation library:
  - `Reveal` / `RevealGroup` — content eases in when it scrolls into view (`rise`, `fade`, `scale`, `blur`), groups one child after another.
  - `CountUp` — a headline number counts up in view; screen readers get the final value.
  - `Marquee` — an endless logo / quote strip; pauses on hover, focus and its own pause button (WCAG 2.2.2); the duplicate copy is hidden and inert.
  - `TextEffect` — `split`, `scramble`, `shimmer`, `typewriter` headline effects; the plain text is always there for screen readers.
  - `SurfaceEffect` — `spotlight`, `beam`, `tilt`, `shine`, `lift` on cards; `Aurora` — a drifting brand-color field behind a hero.
  - `useInView` / `useReducedMotion` hooks. Everything is still under prefers-reduced-motion.
  - Tokens: `motion.duration.slower` (450ms, `duration-slower`) and `motion.easing.glide` (`cubic-bezier(0.16, 1, 0.3, 1)`, `ease-glide`) — for landing entrances only.
  - New strings in every locale: `marquee.pause`, `marquee.play`.
- abd92ae: Product profiles: `<html data-brand="<name>">` recolors the primary (blue) ramp for a product without touching components. Profiles are `src/profiles/<name>.json` (`{ hue, chroma? }`); the build re-hues every blue step in OKLCH keeping its lightness, so contrast stays where it was, and fails if a step drops under 4.5:1 / 3:1 or the hue sits within 20° of a status color. Generated into `build/css/profiles.css`, imported by `globals.css`. Two demo profiles: `violet`, `magenta`; Storybook has a Brand toolbar switch.
- abd92ae: Full product themes: a profile in `src/profiles/<name>.json` can now set the primary fill and the text on it (`primary`, `onPrimary`), re-hue the neutral ramps (`neutral`), pin any semantic token per mode (`light.tokens`, `dark.tokens`), swap the typeface (`font`) and reshape radii (`radius`: ramp scale, one radius for all buttons / fields), with contrast and status-hue checks and an `accept` list for deliberate deviations. Two themes: `iris` (violet, Onest, tighter radii) and `lime` (lime with dark text, Manrope, pill buttons), light and dark. Manrope and Onest are self-hosted in `@theya/tokens/fonts` (loaded only where a theme uses them). Text and icons on the primary fill (Button, Chip, Avatar, Checkbox, Timeline, Sidebar mark, shadcn `--primary-foreground`) now use the on-primary token, and Button / TextField / Select read `--theme-radius-button` / `--theme-radius-field`; Theya's own look is unchanged.
- 84806cf: Profiles: `headingFont` sets a second typeface for headings only (EB Garamond available), and `light.status` / `dark.status` re-hue one status family in one theme, keeping each token's lightness. The primary-vs-status hue check now reads each theme's final status colors. New theme `ember`: warm orange primary, warm off-white page, EB Garamond headings, radii ×1.8, and in dark an amber warning so it doesn't read as the primary.
- 12bad30: Motion and color from tokens instead of raw values.
  - New tokens: `black-a600` and `bg-scrim-strong` (black 60%), used by ImageCropper around the crop frame (was a raw 55%).
  - ProductTour dims the page with the shared scrim token (black 40%, was a raw 50%), like Dialog.
  - Off-scale animation durations moved to the nearest motion step: Chip and BadgeIndicator pop 320 → 300ms, TagInput add 400 → 450ms and remove 180 → 200ms, Stepper pop 400 → 450ms after 300ms, NumberField pulse 350 → 300ms, Rating stars 420 → 450ms, Kanban drop 180 → 200ms (enter curve), menu Bloom 360 → 300ms, SuccessCheck tick delay = the slow step. Form's shake reads its duration from the token. Script animations read the tokens at run time, so a theme's motion reaches them.
  - `pnpm api:check` now fails on a raw ms duration, cubic-bezier, rgb/rgba color or numeric `duration:` in a component (`scripts/check-raw-values.mjs`); a deliberate exception carries `raw-ok: <reason>`. Kept on purpose: Button and Fab's 220ms press spring, stagger steps (CardFan, FabSpeedDial), Rating's 700ms spark burst, WheelPicker's 580ms drum settle, SecretField's 6s toast.
- 52dd340: **Breaking (primitives):** the `red` and `orange` ramps now get darker step by step, like every other ramp. Before, 700–900 were a separate, later set: `red-700` was lighter than `red-500` and `red-600`, `orange-700` lighter than `orange-600`. Semantic tokens point at the new steps, and every semantic token keeps its color, except `red-500` (#82052f) and the old `red-800` (#8A0B32) are merged into the new `red-600` (#8A0B32, ΔE 2), so the light `text-danger`, `bg-danger-hover`, `border-danger-hover` and `chart-05` are a hair lighter.

  If you use red or orange primitives directly, rename them:

  | Was                                            | Now                                       |
  | ---------------------------------------------- | ----------------------------------------- |
  | `red-500` (#82052f)                            | `red-600` (#8A0B32)                       |
  | `red-600`                                      | `red-800`                                 |
  | `red-700`                                      | `red-500`                                 |
  | `red-800`                                      | `red-600`                                 |
  | `red-850`                                      | `red-700`                                 |
  | `red-900` (#5C0F27)                            | removed; `red-900` is now #400216         |
  | `orange-500` (#b44b00), `orange-600` (#8e2f00) | removed (unused)                          |
  | `orange-700`                                   | `orange-500`                              |
  | `orange-800`                                   | `orange-600`                              |
  | `orange-850`                                   | `orange-700`                              |
  | `orange-900`                                   | `orange-800`; `orange-900` is now #3e1c06 |

- fd20fbf: Spacing tokens off the 4px grid, cleaned up. Removed, unused since the spacing pass: `size.margin.margin-3xs` (3px), `size.padding.padding-15xs` (6px), `size.padding.padding-s` (10px), `size.gap.gap-3xs` (3px), `size.gap.gap-s` (10px). Renamed `size.padding.padding2xl` to `size.padding.padding-2xl` (CSS `--size-padding-padding-2xl`), like every other step. `size.margin.margin-s` (10px) stays, documented as the one deliberate off-grid value: a field's chevron inset and a multiline field's vertical padding.
- 3b8d06b: State shadow tokens (preparation for a Neumorphism theme). New semantic tokens `--shadow-control`, `--shadow-control-hover`, `--shadow-control-pressed`, `--shadow-field`, `--shadow-track`, `--shadow-thumb`, `--shadow-thumb-hover`, `--shadow-raised`, `--shadow-card`, `--shadow-card-hover`, with matching utilities (`shadow-control`, `shadow-field`, …). In the default theme they keep today's look: none for controls, fields and tracks; the same elevation step for thumbs, the Tabs chip pill and Card.

  Button, Toggle, ToggleGroup, pressable Chip, Tabs, every text field and picker trigger, Checkbox, Radio, OptionCard, Switch, Slider and Card now take their shadows from these tokens. A state shadow is drawn in its own box-shadow slot, so it stacks with the focus ring instead of being replaced by it: a focused Slider thumb keeps its shadow, and a focused interactive Card still lifts on hover (the `not-focus-within` guard is gone). Documented on Foundations → Elevation.

- abd92ae: Removed the `violet` and `magenta` demo profiles; the shipped themes are `iris` and `lime`. The simple `{ hue, chroma }` profile format still works for quick trials.
- abd92ae: DTCG / Tokens Studio export now includes the themes and density spacing. New sets `brand-iris`, `brand-iris-light`, `brand-iris-dark` (and the same for `lime`) carry the re-hued ramps, typeface, weights, radii and the semantic colors that differ from the aliases; the Tokens Studio "theme" group gains `iris-light`, `iris-dark`, `lime-light`, `lime-dark`. `density-compact` / `density-comfortable` now carry padding, gap and margin too (same rule as the CSS, shared in `scripts/lib/density-spacing.mjs`). `scripts/check-dtcg.mjs` runs after the export and fails if any value resolved through the sets differs from the CSS build. Also fixes theme CSS: headings built from the extralight weight (heading-3xl) now get 200 in Iris and Lime, like the extralight token itself. See TOKENS-EXPORT.md.
- abd92ae: W3C Design Tokens (DTCG 2025.10) export: `npm run build` now also writes `build/dtcg/*.tokens.json` (primitive, base, shared / light / dark colors, density modes, with aliases kept and `$type` on every token) and `build/tokens-studio/` (the same sets with string values plus `$metadata.json` and `$themes.json`), so Figma Variables, Tokens Studio and other platforms read the same source as the CSS. The build fails on an alias that does not resolve, points at another type, or loops. `--color-brand-brand` was emitted as `[object Object]`; it is now `#384859`.
- abd92ae: Darker yellow primitives lean toward orange so they don't go muddy: yellow-400 `#c7860d`, 500 `#b36d00`, 600 `#8e4e00`, 700 `#582800`, 800 `#3b1700`, 900 `#1e0800` (005–300 unchanged). Every light-theme warning pair stays AA: text-warning on bg-warning / hover / pressed 10.2 / 6.3 / 4.7:1, icon-warning on white and on the subtle fill 6.5 / 5.2:1, border-warning 6.5:1, border-rating 4.1:1. yellow-500 is a step lighter than first drafted (`#a96300`) so text on the pressed warning fill keeps 4.5:1. 800 and 900 keep an OKLCH hue near 50° so the darkest steps stay brown-orange instead of drifting back to olive.

### Patch Changes

- 0122931: Three accessibility decisions (Maria, 2026-10-24):

  - Current item by more than color (WCAG 1.4.1): the active SidebarItem and the current section in Preferences' nav are semibold with a 2px bar at the start edge, in the text color, besides the tinted fill.
  - Dark danger status (1.4.11): `color.bg-danger-status` in the dark theme is red-200 (#f05a7e), 4.3:1 on `bg-surface` like the other status tones; it was red-400 at 2.08:1. StatusDot, Timeline dots, BadgeIndicator and AccountMenu's attention dot use it. BadgeIndicator's danger count is dark ink on it in the dark theme (5.5:1).
  - Visible filter labels (3.3.2): AuditLog's category and date filters, OrderHistory's status select and the sort selects in Reviews and SavedItems have an inline label (Category, Date, Status, Sort by) instead of a placeholder or an aria-label only.

- b1cc467: Text contrast fixes found by `pnpm a11y:contrast` (WCAG 1.4.3):

  - Light code palette: `color.code.comment` #a0aab4 → #63717e (2.18:1 → 4.63:1 on `code.bg`; also the line-number gutter) and `color.code.number` #b66a1a → #a25e17 (3.83:1 → 4.68:1), darkened in-hue like `code.tag` before. The dark palette already passed.
  - WheelPicker: the dimmed rows are at 80% opacity (5.4:1), were 60% (3.25:1); the scale-down still sets them back.

- f182269: Light shadows take the page's hue (a desaturated indigo, rgba(61, 72, 143)) and are lighter, so they no longer read as grey dirt on the lavender-white surfaces. OrbitCarousel: cards away from the front fade into the page instead of being darkened with a brightness filter (fan, stack and cascade rely on scale and stacking order only).
- abd92ae: `typography.font-family.code` is now `'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace` (was `Inconsolata`, which nothing rendered: globals.css put Fira Code in front of it). `--font-code` and `--font-mono` read the token directly, so code, Figma's `font-family/code` variable and the DTCG export name the same family.
- 5cb3e35: Text contrast in hover states, dark theme (WCAG 1.4.3). Checked by hovering every interactive element in every story:
  - Badge `neutral` and the Sidebar count badge use `text-subtle` instead of `text-subtler`; on a hovered row the stacked fills put them at 3.5–4.0:1. Light is a shade darker too, like Chip `neutral`.
  - Card with a `tone`, or selected: the description uses `text-subtle` in dark (was 3.9:1 under a hovered child). Light unchanged.
  - `text-link-on-tonal` (dark) blue-100 → blue-050: a primary Badge on a selected (primary-tinted) Card was 4.46:1, now 4.93:1.
- b656d36: Lime theme, found by the new per-theme axe run:
  - Text and borders on the lime fill (a filled Card, the DataTable bulk bar) now come from the dark ink, not white: `text-subtle-on-primary`, `border-on-primary` and `focus-ring-on-primary` are the ink at 80%, 60% and 30% over the fill, the same weights as Theya's white ones. The card description was 1.4:1, now 5.7:1. Every theme with dark text on its primary fill gets the same, and the build checks `text-subtle-on-primary` at 4.5:1.
  - Dark `text-subtler`: #a0a3a0 → #acafac. Secondary text on a highlighted Command item was 4.0:1, now 4.6:1.

## 0.1.0

### Minor Changes

- First versioned release. Primitive and semantic layers in Style Dictionary, light and dark themes, cyan info ramp, Geologica as the system typeface, motion, elevation and z-index scales.
