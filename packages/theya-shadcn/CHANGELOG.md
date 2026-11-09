# @theya/shadcn

## 0.3.4

### Patch Changes

- d1e4fbb: Button: new `opticalIcon` prop. A `leftIcon` / `rightIcon` is pulled toward the button's edge by the empty space around its drawing (measured per icon, stroke included), so a chevron or arrow no longer makes one side look more padded: NavArrowRight in a 24px box moves 8.5px, ArrowRight 1.5px. Icon-only buttons stay centred. Replaces app-side `-me-2` / `-ms-2` on the icon.

## 0.3.3

### Patch Changes

- dca99f4: Tabs: the trigger is a `<button type="button">` again (was `<div role="tab">`), so clicking or tapping a tab no longer shows the focus ring; Tab and arrow keys still do. Chrome matched `:focus-visible` on the focusable div after a pointer click. A disabled tab is natively `disabled` as well as `aria-disabled`.

## 0.3.2

### Patch Changes

- 2fc1be3: Editorial type styles and warm Ember shadows. New tokens `typography.display.display-s` (40/44, extrabold, −1px) and `typography.eyebrow.eyebrow-m` (15/20, semibold, 2px) / `eyebrow-s` (13/16, regular, 2px), set in the heading face (Playfair Display in Ember). Utilities: `text-display-s` (with `font-heading`), `text-eyebrow-m`, `text-eyebrow-s` (heading face, uppercase, lining figures included). New profile option `shadow` re-hues the light shadow tint; Ember uses it, so its shadows are warm instead of indigo. New primitive `size.size-minus1`.

## 0.3.1

### Patch Changes

- d30dd9d: Dialog and Drawer headers keep the title clear of the close button: with the × shown, DialogContent gives its header 56 px of end padding (like AlertDialog), and DrawerHeader has 56 px on the right. A left or right Drawer starts its header 24 px from the top (it has no drag handle); top and bottom drawers keep 12 under the handle. Stories no longer add `pt-7 pb-0` to side drawers.
- 8777515: Ember's heading face is Playfair Display (was EB Garamond), self-hosted in `@theya/tokens/fonts` (variable 400–900, normal + italic; Latin, Cyrillic, Vietnamese). `.font-heading` sets lining figures, so a serif heading face's old-style figures don't bob along the line ("10 weeks", "115 kcal"); Geologica's figures are lining already. EB Garamond stays the landing display serif.

## 0.3.0

### Minor Changes

- 1d0287e: PropertyGrid: when the grid itself is under 24rem (a phone, a slim side panel) each label sits above its control in one column; a switch keeps its label beside it.

### Patch Changes

- b4a2555: AccordionContent no longer has `role="region"` by default. In Safari, VoiceOver stopped on the region and spoke its label (the question again), so VO + Right never reached the answer. Pass `role="region"` to get it back, labelled by its trigger.
- f1c3341: ChipRemove is a 24px target around a 14px icon, as its docs say (it was the Button's 28px square with a 12px icon). A removable chip is 6px narrower and matches Figma: label, 4px gap, icon, padding. An interactive chip's own target now covers its border too, so it keeps the full 24px height next to the remove button.
- a4c69bd: Icons inside controls are hidden from screen readers (`aria-hidden`), so Safari no longer exposes a button with an icon as a group of text and image that VoiceOver steps into (VO + Space then didn't press it or speak its state). Covers the Accordion chevron, icons passed as children to Toggle, ToggleGroupItem, ToolbarButton, TabsTrigger (and its `icon`), DropdownMenu / ContextMenu / Menubar items, CommandItem and TopbarAction, the `icon` of HelpIcon and SidebarItem, and the built-in icons of Select, Filter, FilterField, NumberField, DatePicker, DateRangePicker, Calendar, DataTable sort headers and pagination, ThemeToggle and the Topbar search and menu buttons. An icon that sets its own `aria-label` or `aria-hidden` is left as it is; with `asChild` the child is the control and is never hidden.
- bcff6b3: Every field follows a profile's field radius (`--theme-radius-field`): NumberField, DatePicker / DateRangePicker, Autocomplete, TagInput, Combobox, InputOTP, TextArea, InputGroup (PhoneField), SecretField and FilterField did not, so in Ember or Lime they kept Theya's 6px next to 14px TextFields. Theya itself is unchanged.
- d503bcb: Metric: a label that starts with a space (" shared galleries") keeps it, so the value and the label no longer run together ("8shared galleries"). A flex item dropped the leading space.
- 965929f: SiteFooter: social icons are aria-hidden; the link's name comes from its aria-label ("<app> on GitHub").
- 2da2ad7: AlertDialog: the close button closes like Esc instead of being a second Cancel, so Radix focuses the footer's Cancel on open by itself again (VoiceOver in Safari read neither the dialog nor the focused button). ConfirmDialog: the type-to-confirm label keeps its original element and wraps through one inner span. Storybook: a play that clicks or types runs only in automated runs (`testOnly`), so stories open untouched for people.
- 4612370: Toggle and ToggleGroup follow a profile's field radius (`--theme-radius-field`), so in Ember a units switch under a NumberField has the same 14px corners. Theya itself is unchanged (md).
- f25c558: ToggleGroup: outlined items keep a standalone Toggle's width and label inset. The item's border is drawn as an inset shadow, and the 1px it took out of the box now comes back as padding.

## 0.2.0

### Minor Changes

- abd92ae: New `AnimatedIcon` (and named `CopyAnimated`, `BellAnimated`, `MenuAnimated`, … — 13 icons): iconoir geometry with CSS-only motion from the motion tokens. `trigger="hover"` plays when a button or link around it is hovered or keyboard-focused, `trigger="active"` switches to a second state (Copy → tick, Plus/Menu → ×, Eye → closed, Heart → filled), `trigger="loop"` for busy. prefers-reduced-motion: no motion, states still switch. CopyButton now uses `CopyAnimated`; DataTable's "loading more" uses `RefreshAnimated`.
- ee02861: Attachment and File: `upload` ('uploading' | 'paused' | 'done') and `progress` (0–100). A progress bar with "3.2 MB of 12 MB · 26%" while uploading or paused, "Completed" with a check when done; a failed upload stays `error`. Screen readers hear changes of state only (started, paused, uploaded, failed). The row keeps its height when the bar goes. A File still uploading can't be replaced by clicking it. New locale strings under `upload`.
- abd92ae: Border tokens are now one scale, named by strength. **Breaking rename:**

  | Token                           | Role                                      | Light / dark          |
  | ------------------------------- | ----------------------------------------- | --------------------- |
  | `--color-border-border`         | fields and controls (was `border-subtle`) | slate-350 / slate-400 |
  | `--color-border-border-subtle`  | cards, tables, bordered surfaces (new)    | slate-200 / slate-450 |
  | `--color-border-border-subtler` | dividers (unchanged)                      | slate-050 / slate-500 |
  | `--color-border-border-strong`  | the darkest neutral line (was `border`)   | slate-600 / slate-300 |

  Migrate in this order: `border-border` → `border-border-strong`, then `border-border-subtle` → `border-border`. `--color-border-border-default` stays as an alias of `--color-border-border`.

  Card, Table, DataTable (frame, rows, toolbar), Stat, Alert, CodeBlock, DiffViewer, Terminal, Scheduler, Kanban, Resizable, StickyActionBar, Attachment, prose tables and the card surfaces in blocks move to the new `border-subtle`, so a table no longer blends with the filter inputs above it and rows of cards stop reading as solid bands. Themes that set `border` or `border-subtler` by hand get the OKLab midpoint of their own values for `border-subtle`.

- 0cee12a: New `BottomNav` and `BottomNavItem`: the tab bar of a phone screen, 3–5 destinations, each an icon with a label (no icon-only variant). The current item gets `aria-current="page"`, a semibold label and a tonal pill behind the icon; `badge` puts a count ("99+" over 99) or a dot on the icon and adds it to the item's name ("Inbox, 3 new"). Pads for `safe-area-inset-bottom`, reserves its height as scroll padding, takes `href` or a router link via `asChild`. Strings are localized (en, ru, de, ar, zh).
- abd92ae: More card motion:
  - `CardStack` takes `layout="fan"`; `Carousel` takes `peek` (neighbours smaller, dimmer and turned at the sides, following the drag).
  - New Motion components: `OrbitCarousel` (`drum` / `wheel`), `MarqueeColumns` (vertical parallax card wall), `ProgressRing` (fills when it comes into view) and `TickerList` (rows take turns inside a card).
- abd92ae: Card motion:
  - `Card` takes `effect`: `tilt` (turns toward the cursor with a glare), `spotlight` (a primary glow follows the cursor) or `lift`. Mouse only; off with reduced motion and on disabled cards.
  - New Motion components: `SwipeDeck` (swipe cards away, with Skip / Keep buttons and arrow keys), `CardStack` (cycles cards on a timer, with Pause and Next) and `CardFan` (fans out on hover or focus).
- abd92ae: Charts: accessibility basics.

  - LineChart and AreaChart without an `ariaLabel` now announce each series' first value, last value and peak (new locale key `chart.range`, in all five locales), not only the number of points.
  - LineChart, AreaChart, BarChart and Sparkline no longer add an empty Tab stop: recharts' focusable `svg[role=application]` sat inside the chart's `role="img"`, where screen readers announce nothing. Same as DonutChart already did.
  - In Windows High Contrast the legend and tooltip color keys of LineChart, AreaChart and DonutChart stay visible (`forced-color-adjust: none`); before, they were wiped while the lines kept their colors, so series couldn't be matched to names.

- 91fb7b9: Charts readable without relying on color, and in dark:
  - `chart-01`…`chart-07` now have dark values: all seven series share one lightness, 3.6:1 on the page and 3.2:1 on cards (in dark they reused the light colors, 1.5–3:1). New primitives for them: `blue-450`, `magenta-350`, `teal-350`, `slate-375`, `red-250`, `green-450`, `purple-350`. The tokens moved from the theme-independent set to the light and dark semantic sets; their names don't change.
  - `chart-07` is purple (`purple-500` light) instead of azure: at equal lightness azure was hard to tell from blue.
  - **Breaking (primitives):** the `azure` ramp is removed; nothing else used it. Use `cyan` (the info color) or `blue` instead.
  - LineChart and AreaChart (with `series`) give every series after the first its own dash, shown in the legend and tooltip too (`seriesPatterns`, default true).
  - DonutChart: `slicePatterns` fills slices after the first with a pattern (lines, dots, grid), legend included. Off by default.
- 1d71244: CheckboxGroup: new `error` prop for group rules such as "Choose at least one" (WCAG 3.3.1). The message shows under the items with the error icon, the fieldset is described by it, and every box is marked invalid; an item's own `error` still wins.
- 6eb5b72: CompletionBurst (Motion): a "working on it" state that ends in a small celebration — the Spinner arc runs round an icon ("Preparing your plan"), then SuccessCheck draws itself while twelve short strokes burst out once ("Your plan is ready"). Driven by `status`, the label is a role="status" line; no burst or drawing with reduced motion.
- 545a0a9: DataTable: row selection works on phones too. Each stacked item gets its checkbox before the title; select-all stays above the list or in DataTableToolbar, and bulk actions that don't fit move into the overflow menu.
- abd92ae: Density and divider fixes:
  - Offset utilities (`top-*`, `bottom-*`, `start-*`, `end-*`, `left-*`, `right-*`, `inset-*`, `inset-x-*`, `inset-y-*`) follow `data-density` like padding and gap do (up to 8px unchanged). In compact / comfortable a selectable Card's checkbox or radio no longer floats off its title, and inset dividers (Card, Dialog, Drawer, StickyActionBar) keep lining up with the content padding. Default density is unchanged.
  - Lists in a bordered box (NotificationsInbox, OrderHistory, SavedItems) divide their rows with the divider level, `border-subtler`, edge to edge like table rows.
  - Pattern borders follow the border levels: dividers `border-subtler`, totals and page bands `border-subtle` (were the field border in CatalogItemPage, SiteFooter, OrderHistory, Checkout and order summaries); a CatalogFacetedList drawer footer no longer draws a second, edge-to-edge line.
  - ResourceForm renders a `select` field with up to 5 options as radios (Select's own guideline); TeamMembers' invite form does the same for up to 5 roles.
- abd92ae: Density now scales spacing. In compact and comfortable, padding, gap and margin above 8px shrink or grow by 40% of the excess, rounded to 2px (16 → 12 / 20, 24 → 18 / 30); 8px and below stay put. Covers numeric Tailwind `p-*`, `m-*`, `gap-*` utilities (incl. logical sides) and the `--size-padding-*`, `--size-gap-*`, `--size-margin-*` tokens. Default is unchanged. New token: `--size-density-density-space-delta`.
- abd92ae: Density modes: `data-density="compact" | "comfortable"` on `<html>` or on any container resizes controls one step along the size-control ramp (md…4xl), Table / DataTable rows (36/44/52px, two-line 48/56/64px) and menu, Select and Command items (4/8/12px vertical padding). Defined in `packages/tokens/src/density/*.json`, built into `build/css/density.css` and imported by `globals.css`. New `DensityToggle` (localized compact / default / comfortable switch, page-wide or controlled for one region) and `useDensity()`. Storybook has a Density toolbar switch. Default sizes are unchanged.
- af51b9e: Display scale for landing pages: `data-scale="display"` on a section makes heading-3xl / 2xl / xl and body-l fluid between a 360 px and a 1440 px window; new `text-display-xl` (56 → 128 px) and the `section-display` / `container-display` (`-narrow`, `-wide`) utilities. Outside `data-scale="display"` nothing changes. Foundations → Display scale.
- 5c7a4ec: Elevation, reworked with Maria (2.11): the scale is layered "contact + ambient" — a tight shadow at the edge, then soft wide layers, each lighter as it spreads (light: slate-tinted; dark: black with a faint light rim on md, lg, xl). Components use two steps only: `shadow-elevation-sm` for what sits in the page (cards, raised details) and `shadow-elevation-md` for what floats (tooltips, menus, popovers, dialogs, sheets, toasts, cards in motion); xs, lg and xl stay as options. New alternative scale `shadow-elevation-smooth-xs…xl` (layers doubling 1→32px at one low alpha), not used by components yet. `shadow-card` = sm, `shadow-card-hover` = md. Landing photo cards: the gradient sits only under the text; the BookmarksPreview search key lines up with the row chips.
- abd92ae: Elevation tuned (from the light-and-shadow study): light shadows are tinted toward slate-900 instead of neutral ink, and lg / xl get a 1px ambient layer because they float. Dark theme gets its own set — black at 0.32–0.6 with a faint light rim on lg / xl — where it used to reuse the light values and the shadows all but disappeared. New `--elevation-edge-up` / `shadow-elevation-edge-up` for panels pinned to the bottom edge; the bottom Drawer uses it, so its shadow falls on the page instead of past the screen edge. Values moved to `src/code/elevation.json` and `elevation.dark.json`; the DTCG export carries them in the color-light / color-dark sets.
- 5e5bd67: Input errors are identified and described in text (WCAG 3.3.1).

  - TimeField: typed text that isn't a time, or is outside `min`–`max`, used to be dropped without a word. The field now turns `aria-invalid` until a valid time is picked. New `onInvalidInput(text, message)` hands over the reason in the current locale, so it can be shown under the field. Without it the field announces the reason itself. DateTimePicker gets this through its TimeField.
  - TimeRangePicker: new `aria-invalid`, `aria-describedby` and `onInvalidInput` props, passed to both fields.
  - ColorPicker: a hex or channel value it can't read still goes back to the last good value, but a message under the fields now says what was expected. ColorField keeps the typed text, marks the field invalid and shows the reason under it. Esc or a valid color clears it.
  - DataTableCell: `errorMessage` is shown and linked by `aria-describedby` for every editable kind. Before, only `input` and `textarea` showed it, and `select` kept it off screen. A cell with a shown message grows to fit it.
  - FilterField: Apply on an empty number range marks both fields invalid and says to enter a minimum, a maximum or both. Before, nothing happened.
  - PropertyGrid: new per-row `error`. It shows under the control, marks the control `aria-invalid` and is linked by `aria-describedby`, together with the row description, which now has an id. `custom` renders receive `invalid` and `describedBy`.
  - Checkbox: `error` sets `aria-invalid`, and the description turns into danger text with the error icon.
  - FieldError: shows the error icon before the text, so the error doesn't rest on red alone.
  - New locale keys in all five locales: `timeField.invalid`, `timeField.outOfRange`, `colorPicker.invalidHex`, `colorPicker.invalidNumber`, `filterField.rangeEmpty`.

- e691c5f: Motion: ExpandingPanels — a row of tall picture panels, one open (a flex accordion). The open panel takes most of the width and shows its text; the others are strips with the title running up the side. Hover or keyboard focus opens a strip; nothing closes on leave. An accordion underneath (buttons with aria-expanded in headings, inert closed text); the row keeps its height; panels stack below 768px.
- 54aaec0: Fields share one inset, and FAB gets a square shape.

  - Fields: text, or a leading icon, starts 12px from the border on 32px and 40px fields and 16px on 48px ones; a leading icon is followed by an 8px gap. Without a trailing chevron or button the end inset equals the start one. Trailing chevrons and clear buttons stay where they were. Applies to TextField (and Password, MaskedInput, SearchBox), Select, InputGroup, Combobox, Autocomplete, TagInput, DatePicker, DateRangePicker, Filter, PhoneField and SecretField.
  - InputGroup: an addon with `divider={false}` sits on the field's background as the field's own icon, 8px before the text.
  - Fab and FabSpeedDial: new `shape="square"` — rounded corners (12px on sm, 16px on md and lg) instead of a circle.

- abd92ae: High contrast (Windows forced colors) support. The focus ring stays visible (it's an outline there, not a shadow), buttons, tabs, toggles and other fill-only controls get edges, selected / pressed / current states use the system highlight, and Switch, Slider, Progress, Meter and Radio draw their tracks, fills and dots with system colors. New `pnpm test-visual:forced` keeps visual baselines for this mode.
- 10b140a: OrbitCarousel and CardStack: the cards behind the front one are inert on React 19 too. React 19 treats `inert` as a boolean and dropped the `inert=""` these components set, so the back cards stayed focusable and were checked by axe (the cause of the failing React 19 CI job). New `lib/inert` helper (`inertProps`) sets the right value for React 18 and 19.
- e2124e1: Landing patterns (beta): DepthTunnel (saved-link cards fly toward the viewer out of the depth while the message stays in the middle) and card motion — RingCarousel (a 3D ring of cards turned by drag, arrows or keys; optional centre content for a ring around a word), FanCarousel (cards on an arc, middle one in focus, spring settle), FolderReveal (a folder link whose cards drop in on view and fan out on hover or focus) and FlipCard (turns from the edge the pointer enters, glass back, pin button for keyboard and touch). Reader-driven only; reduced motion switches states without travelling.
- a25d99e: Landing patterns (beta): landing cards — LandingCard (base: outlined / sunken / tonal pastel / inverse / primary surfaces; lift / spotlight / beam / shine / tilt hover), FeatureCard (with monday-style `expand`), MediaCard, StatCard, StoryCard, QuoteCard, LinkCard, and BentoGrid + BentoItem for mixed sizes. Whole-card links are one real link on the title.
- d7d16f5: Landing patterns (beta): FeatureSplit — one feature per section (`stacked`: title and text side by side, the visual full width below; `side`: text beside the visual, `reverse` to alternate) — and FeatureShowcase — several features in one section, picked with an Accordion that keeps one item open (its visual beside the list, inside the item on phones) or with chip tabs above one panel.
- d65c2ad: Demo cards in Motion and Landing examples no longer use photos. Cards in motion take soft tonal fills (new `lib/tonal-fills`: `TONAL_ORDER`, `tonalFill`, `tonalFillAt`), the tints LandingCard already used, now with a translucent border in their own hue instead of a shadow; Mask reveal and Masonry examples use soft gradient images (`public/asset-examples/gradients`). ExpandingPanels gains `tone` (a tonal hue) for a panel without a picture.
- 91f2d02: Landing patterns (beta): Hero (centered / split / inset, HeroAccent in another weight or the display serif, chips slot above the actions) and SectionPanel (rounded colored sheets that overlap). Display scale retuned to the references: medium weight, negative tracking, heading-3xl 44 → 96, heading-2xl 36 → 64. EB Garamond self-hosted as the landing display serif (--font-display-serif).
- c6aec9e: Landing: live charts for cards and bento tiles — GrowBars and TrendChart (scrub with the mouse), with ui ProgressRing in the bento — and MasonryDrift, a Pinterest-like wall whose columns slide past each other on scroll. FolderReveal brings a hovered card to the front; the Flip story no longer leaves its first card pinned.
- 44a8030: Landing patterns (beta): LogoStrip — a caption and a row of customer logos, as a Marquee (pause button, still under reduced motion) or a static row; logos follow the text color, so the strip works in a SectionPanel tone="inverse" band. SectionPanel gains `padding="none"` for content that brings its own spacing.
- a136b5b: Landing patterns (beta): scroll effects tied to the scroll position (scrolling back plays them backwards, nothing on a timer, plain layout under reduced motion) — CardDeck (a pinned deck: the front card falls toward the viewer, the next comes forward out of the depth, progress dots; only the front card is reachable), TiltIn (the product stands up from a 3D tilt as it scrolls in), ScrollHighlight (a statement whose words light up as it is read; dim words stay readable) and FanOut (a pile of cards deals itself out into the grid, lg and up).
- 1b685aa: Landing: ScrollMaskReveal (a capsule that opens to the full screen), HorizontalScroll (vertical scroll moves a pinned row sideways), RingCarousel `shape="wall"` (concave card wall), ParallaxLayers / ParallaxLayer (pointer parallax), and FanCarousel deals itself out the first time it scrolls in. Fix: RingCarousel and FanCarousel take the full width of a centred parent.

  FlipCard: a tinted reverse side (it read as a blank white card), and a min width so it never collapses inside a centred parent.

- 268e29c: Landing patterns (beta): scroll behaviours for cards — StickyStack (cards pile up as the page scrolls, plain position: sticky), CardRail (a Carousel row of cards with the next one peeking in, arrows at the top end) and StickySteps (a sticky heading and numbered step links beside scrolling steps, the step in view marked with aria-current="step"). Plus a RevealGroup story for cards that ease in. No scroll hijacking, nothing on a timer. StoryCard's media area gets one height so neighbouring cards line up.
- 28a46c2: Landing: closing sections — TestimonialCase (a quote in the display serif with the person, a photo and one or two results), FaqSection (`accordion`, or `chat`: a vertical tab list of questions answered as Messages after a short typing indicator; the accordion below 1024px) and CtaBand (one big line, the main action, a quiet note). Stories in Patterns: Landing/Sections; the full Landing page story now ends with stats, a customer case, the FAQ and the CTA band.
- 1ec279d: Landing patterns (beta): SiteHeader — the top bar of a landing page (logo, MegaMenu, actions), sticky, transparent over the hero and on the surface color with a hairline once the page scrolls; optional "Skip to content" link (new `siteHeader.skipToContent` string in every locale). MegaMenu gains `drawerTrigger="icon"` for an icon-only Menu button on tight phone bars.
- 5ec808e: Landing: Stats blocks — StatsRow (three or four big figures as a description list, a rule between them, two columns on a phone; values take CountUp), CompareBars (the old way and the product's way as bars as long as the amount; the figures are text, the bars aria-hidden), BeforeAfter (a real table, task by task, the "after" column on a tonal band). Stories in Patterns: Landing/Stats.
- abd92ae: New `Link` (`@theya/shadcn/ui/link`) for inline navigation text: text-link colors, underline on hover or always (`underline`, for links in running text), `size` xs–lg for a standalone link or inherited inside text, `inverse` for dark and primary surfaces, `asChild` for router links. Matches the Link component in Figma.
- abd92ae: `TheyaLocaleProvider` takes `syncDocument`: it sets `lang` (and `dir`, when given) on `<html>` and restores the previous values on unmount, so screen readers pick the right voice.
- abd92ae: Built-in strings are localizable: `TheyaLocaleProvider` (`@theya/shadcn/lib/i18n`) plus ready bundles for Russian, German, Arabic and Chinese (`lib/locale-ru`, `-de`, `-ar`, `-zh`). English stays the default and every label prop still overrides the dictionary. Dates and numbers in DatePicker, DateRangePicker, Scheduler, Meter, Price and PhoneField now follow the provider's `locale` (en-US without one) instead of the browser's; Calendar takes the provider's date-fns locale. See LOCALIZATION.md.
- e5eff93: The phone menu lives in the top end corner. SiteHeader takes a new `mobileNav` slot that renders after the actions (last in markup, so Tab order matches what you see). MegaMenu's narrow drawer and the Sidebar's phone drawer slide in from the end side. TopbarMenu goes last in the Topbar, after the actions; WorkspaceLayout and the docs follow.
- 0cee12a: Meter: `thresholds` prop. Each `{ value, label?, tone? }` draws a tick on the bar and a label under it; once the value reaches a threshold the fill takes its tone (warning by default), and the aria text names the range and the nearest thresholds ("1.1 g of 3 g, below the 2 g threshold"). Strings are localized (en, ru, de, ar, zh).
- abd92ae: Mobile (360px) fixes:
  - Opening a Select, menu or dialog no longer shifts the page: the scroll-lock compensation rule zeroed `<body>` padding (in Storybook, its 16px padded layout). Storybook now pads the story root instead; don't pad `<body>` itself in a product (see the note in globals.css).
  - Native scrollbars everywhere (tables, code, toolbars) look like ScrollArea's: thin, no track, translucent thumb — no white track under a table in the dark theme. The dark theme also sets `color-scheme: dark` for native controls.
  - DataTable: the primary column keeps at least 200px; on a narrow screen it collapsed to 0 and its avatar overlapped the next column.
  - DataTableToolbar wraps instead of scrolling sideways; ListView's filter field stays inside the bar.
  - DataTableCell badges: the measuring copy no longer widens the page.
  - ColorPicker, Card, Popover and Tooltip never exceed the screen width (Popover/Tooltip keep 8px from the edge).
  - StatusTracker failure actions stay inside the alert (long labels truncate, full text kept as the name); LoginFormSplit's form panel shrinks with the screen; NotificationsInbox keeps the unread dot on the title's line.
  - Stories: fixed-width wrappers (`w-[320px]`) and inline button rows fit a phone.
  - `PopoverContent` and `TooltipContent` default `collisionPadding` to 8.
- 8004b2f: Mobile review (Maria, 6.11):

  - Stepper and OnboardingWizard: new default `orientation="auto"` — horizontal, but vertical on phones (under 640px) with more than two steps, or whenever the steps don't fit. Pass `horizontal` for the old behaviour.
  - TabsList: when tabs don't fit, the list shows a chevron on the side that has more; it scrolls by most of a width.
  - SecretField grows when a long key wraps, with the reveal / copy buttons on the first line.
  - TagInput: danger text and placeholder color in the error state, like the other fields.
  - DashboardOverview: the attention count sits on the title line, warning icons on the reason's first line, and the healthy state is an Alert.
  - SearchNoResults / ResultList: titles centered on their icons; LoginForm: no hidden header above the fields; Comparison tray: one pick per row on phones.

- f28dc13: Mobile review 7.11: Popover / HoverCard align to the trigger's start edge and keep 16px from the screen edge, as do all menus; DropdownMenu submenus drill down in place on phones; AlertDialog and ConfirmDialog get a close button, one divider, tighter spacing without a body, and no horizontal scroll; a floating Popover inside a sheet no longer opens a second sheet (MessagePopup); Alert stacks title and description in one column; small-text links are marked by weight, never underlined; Topbar keeps its actions at full size on a phone; Dropzone tonal icon circles; Pagination fits nine items at 360px; Table captions span the width when rows stack.
- abd92ae: Phones:
  - `Popover` gets `sheet`: below 640px it opens as a bottom Drawer (`PopoverContent` takes `sheetTitle` and `sheetClassName`). Filter, DatePicker, DateRangePicker (one month), ColorField and MessagePopup use it.
  - Scheduler starts on the day view below 640px when `defaultView` isn't set.
  - Checkbox, Radio and Switch have a 24px invisible hit area; the close buttons of Alert, Attachment and Toast get a 44px tap area on phones.
- abd92ae: Tables on a phone no longer scroll sideways by default:
  - Table and DataTable take `mobileLayout`: `stack` (default) turns each row into an item below 640px — the first / primary column as its title, the other columns as label/value pairs; `paged` keeps the table but shows the first column plus `columnsPerPage` (2) others at a time, with dots and a swipe to page through (for comparisons); `scroll` keeps the old sideways scroll.
  - Table: labels come from the column headers by themselves; TableCell `label` rewords one, `label={false}` makes a full-width cell, `stackAction` pins a cell (a remove button) to the item's top end. New `stickyFirstColumn` freezes the first column while the table scrolls sideways. Stacked parts carry explicit table roles for screen readers. Layout lives in the new `styles/table.css`.
  - DataTable: labels from the new `meta.label`, else a string `header`, else the column id. With `mobileLayout="scroll"`, `meta.pin` columns stay frozen on a phone too. Virtualized and infinite tables always stay tables.
  - TeamMembers, AccessTokens, AuditLog and BillingUsage stack; BillingUsage's stats go one per row on a phone.
  - ColorPicker: opacity moved to its own row under the RGB/HSL fields, which were too narrow for three digits four to a row.
  - New strings in every locale: `table.columnPages`, `table.showColumns`.
- 8a897c9: Motion: one carousel and one card wall instead of landing copies.

  - OrbitCarousel gains `shape="wall"` (coverflow, stops at the ends) and `shape="fan"` (cards on an arc, deals itself out, a click on a side card brings it in), plus `lean`, `center` (a drum round a word), `height` and `defaultIndex`. Cards follow the finger while dragging; the carousel is described by an arrow-keys hint and announces the position with the slide name ("2 of 8: Research"), silent while autoplay runs; wall and fan show dots.
  - MarqueeColumns gains `drive="scroll"`: the columns slide through their length with the page scroll (a Pinterest-like board), open to full height on focus, one column below 640px.
  - New hook `useScrollFrame` (ui/use-scroll-frame).
  - Removed the landing-only RingCarousel, FanCarousel and MasonryDrift; the landing stories use OrbitCarousel and MarqueeColumns.

- abd92ae: Micro-interactions built into the components (from the Motion/Micro-interactions review; adapted from Kinetics, MIT). All of them are skipped with reduced motion.

  - Checkbox: the tick is drawn along its stroke.
  - Switch: the thumb stretches while pressed, then springs across.
  - Tabs: one underline glides to the active tab and takes its width.
  - CopyButton: the copy icon shrinks away as the check springs in.
  - Rating: on a pick the stars light up one after another and the picked star throws sparks.
  - SwatchPicker: the selected swatch grows a size.
  - Chip: a toggled chip pops as it switches on.
  - NumberField: the number pops on each step; the step buttons now step from a value being typed, like the arrow keys.
  - TagInput: a new tag pops in, a removed tag pops out.
  - BadgeIndicator: the count pops when it changes (the component is now a client component).
  - New SuccessCheck: a success icon that draws itself; the Toaster uses it for `toast.success`.
  - Stepper: a segment fills when its step completes and the new current step pops.
  - Skeleton: fully rounded by default with a soft sweep instead of a pulse; pass a block radius for images and cards.
  - undoToast: a bar drains over the grace window and pauses on hover.
  - Fab: lifts on hover.

- abd92ae: More motion from the Motion/Micro-interactions review (adapted from Kinetics and CSS Loaders, MIT). All of it is skipped or softened with reduced motion.

  System-wide:
  - Bloom: DropdownMenu, ContextMenu, Menubar, Select and Popover unfold from the edge next to their trigger, and their items slide in one after another (was a fade and zoom).
  - New Spinner (the CSS Loaders Meridian arc), used by Button `loading`, Combobox, Autocomplete, Command and Dropzone.
  - Form: a submit that fails validation shakes each invalid field once.

  New variants and props:
  - Tabs: `TabsList variant="chips"` — segmented tabs with a pill that springs to the hovered tab.
  - Progress: `indeterminate`, and `segments` for a known number of stages.
  - Countdown: `appearance="ring"` (with `from`), a draining ring with a check at zero.
  - Button: `success` — a tick draws itself in place of the icon.
  - BadgeIndicator: `pulse` / `pulseKey` — two rings spread three times, then rest.
  - New FabSpeedDial, HoldToTalk, WheelPicker and ChatTyping components.
  - Locales: `chat.typing`, `holdToTalk`, `speedDial` strings in all five languages.

- abd92ae: Motion presets for landing pages (new Storybook category "Motion"), ported from Kinetics (MIT, kinetics.colorion.co) onto Theya's motion tokens, no animation library:
  - `Reveal` / `RevealGroup` — content eases in when it scrolls into view (`rise`, `fade`, `scale`, `blur`), groups one child after another.
  - `CountUp` — a headline number counts up in view; screen readers get the final value.
  - `Marquee` — an endless logo / quote strip; pauses on hover, focus and its own pause button (WCAG 2.2.2); the duplicate copy is hidden and inert.
  - `TextEffect` — `split`, `scramble`, `shimmer`, `typewriter` headline effects; the plain text is always there for screen readers.
  - `SurfaceEffect` — `spotlight`, `beam`, `tilt`, `shine`, `lift` on cards; `Aurora` — a drifting brand-color field behind a hero.
  - `useInView` / `useReducedMotion` hooks. Everything is still under prefers-reduced-motion.
  - Tokens: `motion.duration.slower` (450ms, `duration-slower`) and `motion.easing.glide` (`cubic-bezier(0.16, 1, 0.3, 1)`, `ease-glide`) — for landing entrances only.
  - New strings in every locale: `marquee.pause`, `marquee.play`.
- abd92ae: Demo content reads as a generic cloud platform instead of a hosting control panel. `SearchType` in `blocks/search/types`: `'mailbox'` is replaced by `'project'` (demo index and group order follow). Catalog demo items list runtimes and frameworks as compatibility; "Malware Sweep" is now "Secret Scanner" (`secret-scanner`). Story and guideline examples no longer use WordPress, wp-cli or PHP; the fullscreen Dialog wizard moves a project to another region.
- 3e243e3: OrbitCarousel: three more shapes — `rolodex` (cards turning round a horizontal axis behind them, like a card file; ↑ / ↓), `stack` (a compact pile stepping diagonally, smaller and dimmer behind) and `cascade` (a tilted staircase in perspective). All three wrap round and share the carousel's keys, drag, announcements and reduced-motion behaviour.
- 5532488: The package can now be installed outside the monorepo. `pnpm pack` / `pnpm publish` build `dist/` (one JS + `.d.ts` file per module, each keeping its `'use client'`) and swap `exports` for `publishConfig.exports`, which point there. `@theya/shadcn/styles/globals.css` in the tarball carries the token CSS and fonts itself and tells the app's Tailwind to scan `dist/`. `tailwindcss ^4` is now a peer dependency. Inside the workspace nothing changes: `exports` still point at the sources.
- abd92ae: Product profiles: `<html data-brand="<name>">` recolors the primary (blue) ramp for a product without touching components. Profiles are `src/profiles/<name>.json` (`{ hue, chroma? }`); the build re-hues every blue step in OKLCH keeping its lightness, so contrast stays where it was, and fails if a step drops under 4.5:1 / 3:1 or the hue sits within 20° of a status color. Generated into `build/css/profiles.css`, imported by `globals.css`. Two demo profiles: `violet`, `magenta`; Storybook has a Brand toolbar switch.
- abd92ae: Full product themes: a profile in `src/profiles/<name>.json` can now set the primary fill and the text on it (`primary`, `onPrimary`), re-hue the neutral ramps (`neutral`), pin any semantic token per mode (`light.tokens`, `dark.tokens`), swap the typeface (`font`) and reshape radii (`radius`: ramp scale, one radius for all buttons / fields), with contrast and status-hue checks and an `accept` list for deliberate deviations. Two themes: `iris` (violet, Onest, tighter radii) and `lime` (lime with dark text, Manrope, pill buttons), light and dark. Manrope and Onest are self-hosted in `@theya/tokens/fonts` (loaded only where a theme uses them). Text and icons on the primary fill (Button, Chip, Avatar, Checkbox, Timeline, Sidebar mark, shadcn `--primary-foreground`) now use the on-primary token, and Button / TextField / Select read `--theme-radius-button` / `--theme-radius-field`; Theya's own look is unchanged.
- abd92ae: React 19 support: peer dependencies are now `react` / `react-dom` `^18.3.0 || ^19.0.0`. CI runs the types and every play + axe test on React 19 too (new `react-19` job), alongside the React 18 jobs.
- abd92ae: Remove props that were accepted but had no effect.

  - DataTableCell (`kind="number"`): `format` is removed; it was never applied to the field.
  - MaskedInput: `separate` is removed (also from `MaskedInputModifyResult`); it never changed how deleting works.

- abd92ae: Five patterns renamed, together with their entry points (`@theya/shadcn/blocks/…`), prop types and Storybook ids:

  - `AppShell` → `WorkspaceLayout` (`blocks/workspace-layout`; `AppShellNavItem`, `AppShellNavGroup`, `AppShellCrumb`, `AppShellProps` → `WorkspaceLayout…`)
  - `DetailScreen` → `Details` (`blocks/details`)
  - `SettingsScreen` → `Preferences` (`blocks/preferences`)
  - `ApiKeys` → `AccessTokens` (`blocks/access-tokens`; `ApiKey` type → `AccessToken`)
  - `ListScreen` → `ListView` (`blocks/list-view`)

  Behaviour, props and on-screen text are unchanged; update imports and component names.

- abd92ae: Right-to-left layouts. Components use logical utilities (ms/me, ps/pe, start/end, text-start/end, border-s/e, rounded-s/e) so they mirror under `dir="rtl"`, and `pnpm api:check` now rejects physical ones (`scripts/check-rtl.mjs`, with `--fix`). Directional icons flip; Switch, Progress and Stepper mirror; `TheyaLocaleProvider` passes `dir` to Radix (`DirectionProvider`, new dependency `@radix-ui/react-direction`), so Slider, Tabs, menus and submenus follow it; Carousel and ProductTour arrows follow the reading direction; Drawer accepts `direction="start" | "end"`. Code surfaces and Kbd stay left-to-right. Also: ProductTour no longer loses arrow keys while focus passes through `<body>` between steps, and `useRef` calls are React 19 compatible.
- abd92ae: Scheduler: below 640px the week view is a list — each day with its events as full-width rows (all-day first), "No events" on empty days, and the day heading opens the day view. The seven-column grid made events about 15px wide on a phone, under the 24px target size (WCAG 2.5.8). New locale key `scheduler.noEvents` in all five locales.

  On phones the visible range ("Oct 5 – 11, 2026") also gets its own row under the buttons instead of truncating to "Oct…".

- 152ee3b: SiteFooter: `logo` (the product mark instead of the initial-in-a-square) and `contentClassName` (e.g. `container-display`, to line the footer up with a landing page's sections). New story Patterns: Landing / Landing page — the landing blocks put together as one page template.
- 8375138: Built-in labels say what they act on (WCAG 2.4.6), so several of the same control on a page stay distinct:

  - NumberField steppers: "Decrease/Increase {label}" when the field has an aria-label.
  - TextField and Autocomplete clear buttons: "Clear {label}".
  - Sidebar item actions: "More actions for {item}"; new `actionsLabel` prop on SidebarItem.
  - DataTable row menu: "Actions for {row}" when `getRowLabel` is set.
  - CopyButton: new `subject` prop ("Copy API key" for assistive tech; the visible label stays "Copy").
  - ColorField: "Choose color for {label}", and the picker popover is named by the label.
  - Dropzone: the picker button is named "Choose files"; the status line describes it.
  - ConfirmDialog: a neutral confirm defaults to "Confirm"; "Delete" stays for `tone="danger"`.
  - Alert: "Dismiss alert". DataTableCell: "{n} items" instead of "{n} badges". Sparkline: the default name adds the range.

  New locale keys in all five languages: `numberField.decrementFor/incrementFor`, `textField.clearFor`, `sidebar.moreActionsFor`, `copyButton.copyFor`, `confirmDialog.confirmNeutral`, `dataTable.rowActionsFor`, `dropzone.choose`, `colorPicker.openFor`, `chart.spark`. The Storybook test scripts allow 30 s per story (the accessibility matrix needs more than 15 s under load).

- 3b8d06b: State shadow tokens (preparation for a Neumorphism theme). New semantic tokens `--shadow-control`, `--shadow-control-hover`, `--shadow-control-pressed`, `--shadow-field`, `--shadow-track`, `--shadow-thumb`, `--shadow-thumb-hover`, `--shadow-raised`, `--shadow-card`, `--shadow-card-hover`, with matching utilities (`shadow-control`, `shadow-field`, …). In the default theme they keep today's look: none for controls, fields and tracks; the same elevation step for thumbs, the Tabs chip pill and Card.

  Button, Toggle, ToggleGroup, pressable Chip, Tabs, every text field and picker trigger, Checkbox, Radio, OptionCard, Switch, Slider and Card now take their shadows from these tokens. A state shadow is drawn in its own box-shadow slot, so it stacks with the focus ring instead of being replaced by it: a focused Slider thumb keeps its shadow, and a focused interactive Card still lifts on hover (the `not-focus-within` guard is gone). Documented on Foundations → Elevation.

- 5e5bd67: Status messages reach screen readers without moving focus (WCAG 4.1.3).

  - New `announce(message, politeness?)` in `@theya/shadcn/lib/announce`: speaks a message through a shared, visually hidden live region. The region sits inside the top-most open dialog when there is one, so messages from inside a modal aren't hidden by it. Use it for messages whose own element mounts with the text already in it, or lives outside an open dialog.
  - Command: the `CommandEmpty` text is spoken through a status region on the menu ("No results found." used to appear silently).
  - Countdown: says when the time is up (the `completed` text, or the new `t.countdown.ended`).
  - Terminal: the connection status line is a `role="status"` region.
  - StickyActionBar: a changed `message` is announced while the bar is open (the bar mounts with it, so its own `aria-live` was never read).
  - DataTableToolbar: the selected count is announced when it changes.
  - Dropzone: upload status changes (uploading, done) are announced.
  - Patterns: NotificationsInbox (result text), PasswordReset (link sent again), OrderHistory ("Showing X of Y"), Comparison (item count, "These items match on every attribute."), FacetedList (result count, "No matches."), Cart (promo code errors).
  - New locale key `countdown.ended` in all five locales.

- e691c5f: SurfaceEffect: `effect="reveal"` (Hover Mask) — a second picture (`reveal`) shows through a circle that follows the pointer and opens to `revealSize` (default 8rem). Decorative: the revealed layer is aria-hidden; nothing on touch; no transition with reduced motion.
- abd92ae: Table and DataTable row-height custom properties renamed: `--wp-row-h` → `--dt-row-h`, `--wp-row-h-2` → `--dt-row-h-2`, `--wp-cell-h` → `--dt-cell-h`. Anything that sets or reads the old names needs the new ones. Also: code comments no longer describe components in terms of an outside reference implementation.
- daf25b2: New `ThemeScript` (`ui/theme-script`): an inline script for the document head that applies the remembered theme and density before the first paint, so a dark page no longer flashes light. `useTheme().setTheme` and `useDensity().setDensity` (ThemeToggle, DensityToggle) now remember the choice in localStorage. Avatar infers `type` from `src` / `initials` / `icon` when neither `type` nor children are given (`initials` alone used to render an empty circle), and an `iconOnly` Button renders an icon passed as children when there is no `leftIcon` (it used to render an empty button).
- abd92ae: Toggle and ToggleGroupItem: icon-only controls are now square at every size. The side padding used to win over `min-w`, so `sm` rendered 36×32 and outlined `md` 42×40. Icon-only content is detected automatically (a single icon child); the new `iconOnly` prop overrides the detection. Toggles with a text label are unchanged.
- ade9e6b: New `TruncatedText`: one line that ends in an ellipsis and shows the whole text in a tooltip while it is cut (on hover and on keyboard focus of its control; cut text with no focusable control becomes a tab stop). DataTableCell, ListItem, Select, DatePicker, DateRangePicker, Metric, Scheduler and InlineEdit use it for long user data. Short interface labels wrap instead of truncating: Table and DataTable headers, DataTableCell status and usage labels, Metric labels, Sidebar brand and section labels, Kanban column titles, Comparison item names. With text at 200% or WCAG text spacing nothing is lost any more (WCAG 1.4.4 / 1.4.12).
- b1235ea: UploadPanel (Files): files uploading in the background, in a panel in the corner — "Uploading 3 files · 45% · 7 seconds left", expand for each file with its bar, pause / resume, retry and cancel; "Uploaded 3 files" with a close button at the end. Holds no upload logic; a named region with state-only announcements. New locale strings under `uploadPanel`. Attachment's upload bar sits 8px under the meta line (4px grid).
- abd92ae: Works in React Server Components (Next.js App Router): every module that needs the browser — hooks, event handlers, context, Radix and other client libraries — now starts with `'use client'`, so server components can import Theya directly. `pnpm api:check` (and CI) fails when a client module is missing the directive.
- e56456c: Visible labels and instructions (WCAG 3.3.2):

  - New `label` prop (plus `description`, `required`, `optional` where they apply) on NumberField, Rating, WheelPicker, TagInput and DateTimePicker. DateTimePicker's label names the date field and, as "{label} time", the time field; NumberField's steppers take it ("Increase Replicas"); a click on WheelPicker's label focuses the wheel.
  - MaskedInput types `label`, `description`, `required` and `optional` (they always reached TextField).
  - ColorPicker: a visible letter before each channel field (R/G/B, H/S/L); channel names are localized (`colorPicker.channels`, `colorPicker.captions`).
  - FilterField: the number filter shows labelled Min and Max fields side by side, at the text filter's size and spacing.
  - SwatchPicker: `required` shows the red asterisk after the legend.

- abd92ae: Prop and type names now follow Theya's vocabulary (`tone` for color/meaning, `neutral` instead of `default`, size steps for spacing). Rendered output is unchanged, apart from Card's `data-tone` and DialogContent's `data-gap` values.

  - Card: `severity` → `tone`, value `default` → `neutral` (still the default)
  - Card: type `CardSeverity` → `CardTone`
  - Card: data attribute `data-severity` → `data-tone`
  - ListView: row action `destructive: true` → `tone: 'danger'` (`ListRowAction.tone` is `'neutral' | 'danger'`, default `neutral`)
  - AuditLog: category option `badge` → `tone` (`AuditCategoryMeta`)
  - BillingUsage: plan option `badge` → `tone` (`BillingPlan`)
  - TeamMembers: role option `badge` → `tone` (`TeamRoleOption`)
  - DataTableToolbar: bulk action `destructive: true` → `tone: 'danger'` (`DataTableBulkAction.tone` is now `'neutral' | 'danger'`, default `neutral`; the old `tone` field took any Button tone but never changed what was shown, so it is replaced)
  - SelectItem: status-dot prop `status` → `tone` (same values)
  - Combobox: `showTrigger` → `showChevron`
  - Combobox: `triggerLabel` → `chevronLabel`
  - FilterField: `searchTipLabel` → `searchLabel`
  - ToolbarGroup: `appearance` → `type` (`'single' | 'multiple'`, default `multiple`)
  - AlertDialog, AlertDialogHeader, AlertDialogFooter, ConfirmDialog: `gap` / `contentGap` value `default` → `md`
  - AlertDialog, AlertDialogHeader, AlertDialogFooter, ConfirmDialog: `gap` / `contentGap` value `compact` → `sm`
  - DialogContent: `gap` value `default` → `md` (still the default)
  - DialogContent: `gap` value `compact` → `sm`
  - DialogContent: data attribute `data-gap` now carries `md` / `sm` / `none`
  - MaskedInput: type `Track` → `MaskedInputTrack`
  - MaskedInput: type `Modify` → `MaskedInputModify`
  - MaskedInput: type `ModifyResult` → `MaskedInputModifyResult`

  Update the prop names and values where you use them; behaviour and on-screen text are unchanged.

- abd92ae: New `warnDeprecated(key, message)` in `@theya/shadcn/lib/deprecation`: a dev-only, once-per-key console warning for deprecated props and exports (see the deprecation policy in RELEASING.md).
- 11daeb8: WCAG 2.2 reviews of 1.3.5, 2.1.4, 2.2.1 and 3.2.2 for every component they apply to, recorded in `a11y/manual.json`, with these fixes:

  - Toasts (2.2.1): keyboard focus inside the toasts now pauses the timer, like hover (Sonner alone only paused on hover). A toast with an `action` or `cancel` stays until dismissed unless you pass a `duration`. SecretField's copy-failed toast stays when it is the only explanation.
  - Shortcuts (2.1.4): KeyboardShortcuts `hotkey` and the SearchBox block's `shortcut` accept a chord such as `"Mod+/"` (⌘ on Apple, Ctrl elsewhere), so apps can let users remap them; a bare character is still ignored while typing. New `lib/hotkey` helpers.
  - Autofill (1.3.5): Password defaults to `autoComplete="current-password"` (pass `"new-password"` when setting one). Autocomplete and Combobox take `autoComplete` (default `"off"`). PhoneField's `autoComplete` (default `"tel"`) can be overridden. InlineEdit passes `autoComplete` to its multiline field too.

### Patch Changes

- 0122931: Three accessibility decisions (Maria, 2026-10-24):

  - Current item by more than color (WCAG 1.4.1): the active SidebarItem and the current section in Preferences' nav are semibold with a 2px bar at the start edge, in the text color, besides the tinted fill.
  - Dark danger status (1.4.11): `color.bg-danger-status` in the dark theme is red-200 (#f05a7e), 4.3:1 on `bg-surface` like the other status tones; it was red-400 at 2.08:1. StatusDot, Timeline dots, BadgeIndicator and AccountMenu's attention dot use it. BadgeIndicator's danger count is dark ink on it in the dark theme (5.5:1).
  - Visible filter labels (3.3.2): AuditLog's category and date filters, OrderHistory's status select and the sort selects in Reviews and SavedItems have an inline label (Category, Date, Status, Sort by) instead of a placeholder or an aria-label only.

- abd92ae: Accessibility: browser checks for WCAG 2.5.3, 2.4.7, 1.4.12 and 1.4.4 (`pnpm a11y:auto` against a running Storybook) feed the criteria matrix. Fixes they found:
  - Toasts are Tab stops; they now show Theya's focus ring instead of Sonner's faint 2px one.
  - PromptArea scrolls instead of clipping when text spacing grows after it has sized itself (1.4.12).
- abd92ae: `spec/a11y.json` now crosses all 55 WCAG 2.2 A/AA criteria with every component: which criteria apply (read from the code), and whether each is verified, partly verified, not verified yet, or an accepted deviation. Shown on Design System / Accessibility (new "By criterion" table) and on each component's Docs page.
- 330e09f: Accessibility matrix covers the 42 patterns. `pnpm a11y` builds a row per pattern the same way as for components (axe on every story, keyboard play tests, the browser checks from `a11y-auto`, motion and forced colors), with each pattern's code-read notes from `a11y/patterns-notes.json` counted as a manual review. Design System/Accessibility shows a "By pattern" table and a Patterns column per criterion, and each pattern's Docs page shows its status.

  Found on the way:
  - Cart: "Save for later" and "Move to cart" are now named "Save for later: Pro plan" / "Move to cart: Pro plan", so the visible label starts the accessible name (WCAG 2.5.3, voice control).
  - Stepper: the step circle that repeats the step's label button for the mouse is marked `data-pointer-shortcut`, and `a11y-auto` no longer reports it as pointer-only. `a11y-auto` also skips a control that disabled itself while Tab moved through the page (Preferences' Scroll to bottom at the end of the page).

- abd92ae: Accessibility matrix: every component's Docs page now ends its Accessibility section with a WCAG 2.2 AA status (axe coverage in both themes, keyboard play tests, reduced motion, high contrast, screen-reader passes, accepted deviations), and Design System / Accessibility shows the whole table with filters. Generated into `spec/a11y.json` by `pnpm a11y` from the tests and the code plus `a11y/manual.json`; `pnpm api:check` fails when it is stale. Carousel indicators no longer animate their width under reduced motion.
- 52c9445: Contrast fixes: a paused upload's progress track (UploadPanel, Attachment) uses the subtle icon color instead of the strong neutral fill (1.6:1 → over 5:1 in both themes); SiteFooter's language Select takes the strong border on the tinted footer; DepthTunnel's avatar row is no longer faded.
- 191ee7d: Accessibility-tree fixes found by the new tree check (`pnpm a11y:tree`):

  - Decorative icons are hidden from assistive tech where the component takes consumer content: the icon in Alert, ListItem's `leading` and `trailing`, TextField's `rightIcon`, DataTableCell's primary `leading` (a bare SVG without a name gets `aria-hidden`; controls and named images are left alone). Attachment and File type icons, the Tooltip arrow and UndoToast's default trash icon are hidden too. Chrome exposed each as an unnamed image ("graphic" in NVDA).
  - ChartRangeSelection hides the Recharts plot from assistive tech; the group's name, help and live announcements carry the range.
  - Select's listbox is named after its trigger (its aria-label or Label); Combobox's listbox gets the same name as its popover.
  - TimeField without `onInvalidInput` keeps the reason it rejected a value attached to the field as its description while the field is invalid (it was only announced once).

- 1fcfe7b: Non-text contrast and state cues (WCAG 1.4.11 / 1.4.1):
  - Calendar (and DatePicker, DateRangePicker, DateTimePicker), Stepper, Scheduler: in dark theme the blue selected / current / today fill gets a 1px light primary edge, as Checkbox. Mid-range days in Calendar carry a primary line above and below.
  - Scheduler: the "now" line uses icon-danger; the phone week list shows "· Today" next to the current day.
  - Meter, ProgressRing, Sparkline (and DataTableCell kind="sparkline"): fills and strokes use icon-* tones. Meter's warning stays yellow in light theme (recorded deviation).
  - ChartRangeSelection: the selected range is outlined with border-primary at full opacity.
  - RangeField: histogram bars are border (out of range) and icon-primary (in range).
  - UsageBar: segments are separated by a 2px gap; purple 500 -> 400.
  - SwatchPicker: selection ring uses border-primary. ColorPicker / SwatchPicker: thumb and slash outline referenced a missing token (--black-a300), so it never rendered; now gray-400.
  - ProductTour: 2px primary outline around the spotlight.
  - UndoToast: drain bar at 60% of the text color (was 30%).
  - Tabs chips: the active chip is semibold.
  - RichTextEditor: a pressed format button looks like an on outlined Toggle (tonal fill, primary icon, primary outline).
  - FeedbackWidget: a picked reason chip shows a check icon.
- c05d67e: More block defaults follow the Aether demo instead of the hosting demo: AccessTokens, AuditLog (category `deploy` → `export`), ListView, TeamMembers, NotificationsInbox (object options), OnboardingWizard (creates a client portal; step id `portal`, plan id `free`), Preferences (switch ids `export-failures`, `license-expiry`), the account, catalog, commerce, search and navigation demo data, FacetedList / CategoryLanding noun ("product"), SearchBox placeholder and the Cart empty state. The search demo's `SearchType` keys are now `gallery | photo | client | license | setting | article`. Apps that pass their own data see no change.
- f67a86c: Demo defaults in blocks follow the new Aether demo (a platform for photographers) instead of the hosting demo: WorkspaceLayout (brand, menu, user), DashboardOverview (attention items, stats, storage, activity, chart title), BillingUsage, LoginForm and LoginFormSplit (app name, email placeholder), Checkout, CancellationFlow and SearchNoResults copy. Apps that pass their own data see no change.
- e36f96b: Attachment: the file-type icon now fills its box (16px in pill / row, 24px in card). The SVG kept iconoir's default 1.5em size, so in a pill it rendered 16×23 and overflowed its box, and in a card it was 22.5px instead of 24.
- 253a47a: Attachment (and File through it): a cut file name or meta line ("801 KB, PNG image") shows the whole text in a tooltip, via TruncatedText. The tooltip opens on keyboard focus of the row's link or click button; a static row with no control makes the cut text a tab stop. TruncatedText gains `side` and finds a control beside the text (`data-truncate-owner` inside a `data-truncate-scope`), not only one around it.
- 75a9429: BadgeIndicator counts reach 4.5:1 in both themes (WCAG 1.4.3). Filled success is dark ink (5.2:1, white was 3.45:1); filled warning is dark ink in the dark theme too (5.2:1, was 3.45:1). Outlined success and warning use the `-on-tonal` text, which was about 3.6:1 on the translucent tint in dark and is now 6:1 and 7:1.
- abd92ae: SurfaceEffect `beam`: the light now runs along the sides of a wide card too, not only its top and bottom edges.
- f67a86c: BottomNav: a label wraps to a second line (breaking inside a long word if needed) instead of being cut with an ellipsis, so it stays whole with 200% text or wider text spacing (WCAG 1.4.4, 1.4.12).
- 6222da8: Button: label changes ("Save changes" → "Saving…" → "Saved") are announced through the shared announcer (`announce()`), not an `aria-live` span inside the button. VoiceOver with Safari stayed silent when the live region sat in the focused button (found in the manual screen-reader pass). The first render is never announced. CopyButton's "Copied" uses the same path.
- abd92ae: Button labels now use the button typography weight token (`--typography-button-{s,m,l}-weight`, medium 375) instead of `font-normal` (275), matching the token and the Figma library. Labels render slightly bolder and up to 1px wider.
- abd92ae: CardMedia: default banner height is 180px (was 177px), on the 4px grid. Pass `height` to keep the old value.
- c41217c: Card: a selectable card with an explicit `size` now keeps the left inset for its checkbox/radio — the per-size padding used to override it, so the control overlapped the title.
- abd92ae: Catalog demo data: hardware items use the new abstract JPG pictures instead of the SVG drawings, and screenshot `alt` texts describe what the pictures actually show.
- 7240637: Catalog: an item can say what its usage count means with `usageNoun` ("38.8k subscribers", "320 renters"); the default stays "installs". Comparison names that row after the items' noun, and FacetedList's sort reads "Most popular" instead of "Most installed".
- ca1aaca: TagInput and multiple Combobox: with chips, the side padding now equals the gap above and below a chip (4px sm, 8px md from the outer edge), so chips sit evenly inside the field. Empty fields keep TextField's text inset.
- 3708e0a: Chip: the remove ✕ now takes the chip's text color (it rendered in the primary blue on every chip).
- abd92ae: CodeEditor: the editing area is an explicit tab stop (`tabindex="0"`), so accessibility checkers see its scroll box as keyboard-reachable. No change for users.
- 781b3e4: Code text renders one pixel smaller than the text around it (font-size-adjust on font-mono / font-code and Prose code): 14px in 15px body text, scaled the same way at every other size. Tune it with --font-code-adjust.
- abd92ae: The code syntax palette (Luna Pro) is now tokens instead of hand-written CSS in globals.css: `color.code.{bg,text,tag,attribute,string,number,selector,comment,invalid}` (Light in the default theme, Midnight in dark) and the fixed `color.code.*-inverse` set plus `code.border-inverse` in `src/code/color.json`. CSS variable names and values are unchanged (`--color-code-*`); the palette now also reaches the DTCG export and Figma (`code/…` in the semantic collection).
- b1cc467: Text contrast fixes found by `pnpm a11y:contrast` (WCAG 1.4.3):

  - Light code palette: `color.code.comment` #a0aab4 → #63717e (2.18:1 → 4.63:1 on `code.bg`; also the line-number gutter) and `color.code.number` #b66a1a → #a25e17 (3.83:1 → 4.68:1), darkened in-hue like `code.tag` before. The dark palette already passed.
  - WheelPicker: the dimmed rows are at 80% opacity (5.4:1), were 60% (3.25:1); the scale-down still sets them back.

- 9dd78d6: Comparison and FacetedList announce their counts 700 ms after a checkbox toggle, as DataTableToolbar does: VoiceOver in Safari dropped a count that arrived while it was still reading the checkbox.
- 2ad18f7: New `pnpm a11y:contrast` (scripts/contrast-scan.mjs): measures the contrast of every visible text run in every story, light and dark, including text axe skips (aria-hidden counts, translucent backgrounds composited down to an opaque layer). First run's fixes:

  - Card: a tone card's description is `text-subtle` in both themes (success was 4.39:1 in light).
  - Dropzone: the success state's "Uploaded on" line is `text-success-on-tonal` (was 3.59:1 in dark).

- 38f830a: CopyButton keeps one width ("Copy" and "Copied" share a grid cell), so nothing jumps and VoiceOver's cursor frame matches the button. Button no longer announces a return to its resting label ("Copied" → "Copy", "Saved" → "Save changes"), which cut off the message before it; text inside aria-hidden is left out of what Button announces.
- abd92ae: Countdown: `appearance="blocks"` at `size="lg"` uses slightly smaller tiles below the `sm` breakpoint, so four units fit a 360px phone.
- 3e9ddfb: Topbar: the search results panel now stops at the bottom of the viewport and scrolls. Its max height pointed at `--available-height`, which nothing sets, so the panel could run off-screen. `pnpm api:check` now fails on any `var(--…)` that nothing declares (`scripts/check-css-vars.mjs`).
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
- caba4b3: Storybook: Default stories open untouched — their interaction tests moved to "Test: interactions" stories (hidden from the Docs page). ItemPage demo gallery: distinct second image (cyan) so the thumbnails have distinct names.
- 21e6e67: New `border-subtler-on-primary`: the divider inside a primary-filled surface. Theya keeps white at 30%; a theme with a light fill and dark text on it (lime) gets white at 60%, a light line without a darker green tint. The filled Card's divider uses it: in lime it was almost invisible.
- bf7a942: Rating and NumberField read their spring easing from the `--motion-easing-spring` token instead of a copied cubic-bezier, so a theme that changes the spring now reaches them too. Docs brought in line with the code: Foundations / Focus ring (every ring is 4px; the inset ring is `focus-ring-inset`, used by Tree rows and underline Tabs), Foundations / Elevation (Card, Switch and Slider thumbs, the Tabs chip take their shadows through the state tokens), README component count, TESTING (what `pnpm api:check` checks).
- abd92ae: Closing a Drawer (and PushSheet's phone overlay) returns focus to whatever opened it. vaul keeps the panel mounted through its exit animation and then dropped focus on `<body>` (WCAG 2.4.3) — with a DrawerTrigger and without one. Found by the new mobile play tests.
- 8fb11d1: Removed demo pictures no story uses any more (the mesh and iridescent gradients, the cube renders, the product photos); the stories run on the shared silk set.
- abd92ae: Dropzone: fills its container up to 450px instead of a fixed 450px, so it fits phone screens.
- f182269: Light shadows take the page's hue (a desaturated indigo, rgba(61, 72, 143)) and are lighter, so they no longer read as grey dirt on the lavender-white surfaces. OrbitCarousel: cards away from the front fade into the page instead of being darkened with a brightness filter (fan, stack and cascade rely on scale and stacking order only).
- abd92ae: Phones: text in every editable field (input, textarea, select, contenteditable) is at least 16px below `sm`, so iOS Safari no longer zooms the page on focus. ColorPicker's "Change photo" button is visible on touch devices; the Preferences floating buttons clear the home indicator.
- abd92ae: TextField, TextArea, Select, NumberField: a fixed `widthSize` (md/lg/xl) no longer overflows a narrower container — the field shrinks to fit, e.g. on a phone.
- abd92ae: TextField, TextArea: with `labelPosition="left"` the label moves above the field below the `sm` breakpoint, where a 216px label column leaves no room for the field.
- c52d3c3: Attachment pill: the kind icon sits on the name's line, not centered on name + meta. OrbitCarousel wheel: the next cards wait above, so Next (↓), ArrowDown and a downward drag all roll the rim down. Small-text links follow the rule (no underline, even on hover; medium weight, hover is the color): SiteFooter legal links, Scheduler "more", FacetedList, SearchBox, Cart, OrderReview, OnboardingWizard. Stories: Attachment and File card grids show two tiles per row on phones, Localized labels one.
- 4c97c54: FilterField's popover is a fixed 320px for the list and every editor, so it no longer jumps between steps or grows as you type. ColorPicker's opacity field drops its "Opacity" caption and sits under the format select at the same width.
- abd92ae: Load Fira Code 500 alongside 400. Mono labels with `font-medium` (CodeBlock filename and about ten others) were fake-bolded from the regular weight.
- abd92ae: Preselected Combobox, TimeField and DateTimePicker show their value on the first render instead of a frame later. `useTheme` (and ThemeToggle) reads the current theme on the first render and follows `data-theme` changes, so several toggles on a page stay in sync.
- abd92ae: `typography.font-family.code` is now `'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace` (was `Inconsolata`, which nothing rendered: globals.css put Fira Code in front of it). `--font-code` and `--font-mono` read the token directly, so code, Figma's `font-family/code` variable and the DTCG export name the same family.
- 8aad291: - FormMessage: an error is now `role="alert"` with the error icon, like FieldError, so it is spoken when it appears as you leave a field (WCAG 4.1.3) and doesn't rest on red alone. Found by the VoiceOver dry run.
  - ChartRangeSelection: the wrapped chart's Recharts accessibility layer is turned off, so the selector is one tab stop; the inner `svg role="application"` was a second, unnamed one with different arrow keys.
- fba928c: Published to GitHub Packages as `@msstewie-afk/theya-shadcn` (private; install under the old name with `@theya/shadcn@npm:@msstewie-afk/theya-shadcn`, see RELEASING.md). Development and the main CI jobs moved to React 19; React 18.3 is still supported and checked by its own CI job.
- ce13496: 4px grid: the last off-grid spacing in components. AvatarGroup lg overlap 10 → 12px; Alert actions 10 → 12px below the text; Stat delta and PageHeader description 6 → 4px under their value / title; ListView toolbar and WorkspaceLayout sidebar footer gap 10 → 8px; ToolbarLink side padding 10 → 8px (as Button sm); DataTable row-menu note and Scheduler phone events 10 → 12px; Reviews rows, MegaMenu "All products" link, SavedItems image and the RichTextEditor toolbar 6 → 8px horizontally. Vertical paddings and component heights are unchanged.
- abd92ae: Sizes moved onto the 4px grid: Calendar day cells 34px → 32px and caption 30px → 32px; Pagination cells 30px → 32px (Button md); Dropzone max width 450px → 448px, file-row icon gap 10px → 8px, row separators 6px → 8px; FilterField inner padding 3px → 4px; DropdownMenu and Menubar shortcuts 11px → 12px (text-body-xs, as in ContextMenu).
- 5423324: The page reserves the scrollbar gutter from 640px only: phones have overlay scrollbars, and on a desktop with always-on scrollbars (Safari) a 360px frame showed a white 13px strip and lost that width.
- 5cb3e35: Text contrast in hover states, dark theme (WCAG 1.4.3). Checked by hovering every interactive element in every story:
  - Badge `neutral` and the Sidebar count badge use `text-subtle` instead of `text-subtler`; on a hovered row the stacked fills put them at 3.5–4.0:1. Light is a shade darker too, like Chip `neutral`.
  - Card with a `tone`, or selected: the description uses `text-subtle` in dark (was 3.9:1 under a hovered child). Light unchanged.
  - `text-link-on-tonal` (dark) blue-100 → blue-050: a primary Badge on a selected (primary-tinted) Card was 4.46:1, now 4.93:1.
- b4e5658: Progress, Slider and PasswordStrengthMeter fills use the icon color tokens (as Meter already does): the same colors in light, and in dark the fill now reaches 3:1 against its track (WCAG 1.4.11; the brand fill was 2.0:1, danger 1.36:1). PasswordStrengthMeter keeps the yellow warning fill in light, like Meter.
- abd92ae: - Iris radii: profiles can pin one radius step with `radius.anchor` and scale the rest from it. Iris sets fields (`lg`) to 2px: sm 1, md 1, lg 2, xl 3, 2xl 3, 3xl 4, 4xl 5, 5xl 11px (was ×0.75), so Iris reads clearly sharper than Theya and Lime.
  - Sidebar and Topbar edges use `border-subtle`, like cards.
- 352c6ec: Keyboard (WCAG 2.1.1): DataTable rows with `onRowClick` are Tab stops on desktop too and open with Enter or Space (they already were in the phone list); the pointer cursor shows only on rows a click opens. Pagination's disabled previous/next no longer show a pointer cursor. `pnpm a11y:auto` now also Tabs through every story (2.1.1, 2.1.2, 2.4.3), and Calendar, WheelPicker, Toolbar, HelpIcon, CodeEditor and KeyboardShortcuts have keyboard play tests.
- 2cf986b: Keyboard paths, found while adding keyboard play tests to every interactive component:
  - TopbarSearch: the results can now be reached from the keyboard. ArrowDown in the field moves focus to the first result, ArrowUp / ArrowDown / Home / End move between results and ArrowUp from the first one goes back; Escape or picking a result returns focus to the field. A result is any `role="option"` (with `tabIndex={-1}` and an Enter handler), `button` or link inside `children`. The field also gets `aria-label` from its placeholder, so it keeps a name once text is typed, and the ⌘K hint hides while the field has focus (it fell under 4.5:1 on the focused field in dark).
  - MessagePopup: the panel is named by its title and described by its description (it was named by the launcher button, "Open assistant").
- b7083bd: Spacing on the 4px grid: a label sits 4px above its field (was 6px; 8px in Field and FormItem) in TextField, TextArea, PhoneField, NumberField, TagInput, DateTimePicker, Rating, WheelPicker, SwatchPicker, RichTextEditor, ColorField, Field and Form. FilterField's editors: 12px padding, Min and Max 8px apart, 12px to Apply, an 8px header; the number filter is 288px wide from those sums. The spacing guide states the label rule.
- Landing a11y audit (31.10) fixes: the picture-only "Review" button in BookmarksPreview no longer looks clickable; Ring / Fan carousel stages are a named group ("Slides") with an arrow-keys hint, and the position names the slide ("2 of 8: Research"); FlipCard story copy no longer points at a glyph or hover; the live demo's result list has a fixed height so the text beside it doesn't jump; FolderReveal uses logical (RTL-safe) utilities; ParallaxLayer and CompletionBurst use motion tokens. New carousel locale strings `keysHint` and `position`.
- e2003af: Landing demo visuals: product pictures (BookmarksPreview, the feature visuals) now read as pictures — no text cursor or selection — and a working demo joins them (BookmarksLiveDemo: the search filters, the folders switch, the result count is announced). FeatureSplit gets a "Live demo" story and a guideline: a visual is a picture or a working demo, never something in between.
- 5dac7a3: A11y matrix fixes (1.11): UploadPanel (floating) and SiteHeader (sticky) reserve scroll-padding, so a Tab-focused element is never hidden under them (2.4.11); StickyStack scrolls back to a card when keyboard focus moves into it, so it is the one on top (2.4.11); Escape undoes a FlipCard hover flip (1.4.13); GrowBars and TrendChart take a `caption` that writes the numbers under the bars, so the light muted bars no longer carry the information alone (1.4.11); the Live bento story uses it.
- f9dc5ad: StickySteps and FeatureShowcase no longer spill past the screen on phones in comfortable density: their single column is `minmax(0,1fr)`, so a wide step visual cannot stretch it. The folders demo truncates long names and shortens its rule chip on phones.
- 34055a0: Landing cards part by borders, not shadows. Tonal LandingCards get a translucent border in their own hue (as tonal carousel cards already do); the beam and tilt hovers drop their shadow, beam keeps only its light edge. Demo previews, feature visuals, moving link cards, the Flip card's back (now a translucent primary rim), the folder's front and the testimonial metrics plate lose their shadows; plates over pictures take the subtle border.
- c01d26f: Landing polish: tonal cards tint their icons and links in the card's own hue; FeatureCard `expand` keeps the card's height (the description fades in instead of unfolding, so rows no longer jump); CardRail leaves room for a lifted card's top edge; demo visuals use a 10px radius inside 16px cards; the demo search field's ⌘K key sits evenly inset.
- d341115: Landing review fixes (2.11): ScrollHighlight dims unlit words to the subtle text color instead of 28% opacity, so every word keeps text contrast (10:1 and up); SiteHeader on a phone keeps the drawer button before the actions, so the visual order matches the Tab order; "Steps", "Features", "Read the story", carousel positions and the CardDeck position are localized (new `landing` locale block in en, ru, de, ar, zh).
- f357e29: OrbitCarousel's drum fits its stage to the cards that show (24px above and below) and centres the ring, so a leaning drum no longer leaves a band above the cards. StickyStack cards drop their shadow. Landing demo cards (feature visuals) sit in the flow with the small shadow and an even 16px at top and bottom.
- f641b2a: Landing cards: tonal (pastel) cards are opaque in the dark theme too — the tint is laid over the surface color. The dark tonal fills are translucent, so stacked or flying cards (CardDeck, StickyStack) showed through each other.
- 4bdb220: Landing visual review (2.11), from Maria's notes:
  - Feature visuals fill their sunken sheet, so the padding is even on all four sides (no min height with a centred visual). FeatureShowcase stacks all visuals in one cell: the sheet is as tall as the tallest and never jumps.
  - BookmarksPreview: the search field, folder list and link list share one inset (8px edges, 16px to the content).
  - OrbitCarousel: dots for every shape, above the buttons; the stage height is measured from the cards (no empty bands), and a ring round a word is wide enough to clear it. Slides keep their own height.
  - Stories open at rest (no focus ring left by the play test); demo carousels use photo cards instead of pale tints; scroll stories mark the scroll room with a hint band instead of a blank screen; the SiteHeader page story scrolls over real content.
- abd92ae: Dialog, AlertDialog and Alert descriptions, Message bubbles, Terminal output and the Preferences block use a fixed 20px line height (`--size-size20`) instead of `leading-relaxed` (1.625), matching the Figma library. Text in these places sits a little tighter.
- f69d0a1: Focus visibility in menus:
  - MenubarTrigger now shows the focus ring on keyboard focus (it had none).
  - NavigationMenuLink now shows the focus ring on keyboard focus, not just a fill.
  - The highlighted option fill in Select, Combobox, Autocomplete, Command, FilterField, Menubar, DropdownMenu and ContextMenu (1.15:1 light / 1.35:1 dark) is recorded as an accepted WCAG 1.4.11 deviation, alongside the focus-ring deviation.
- 2cb847b: ListView: Enter on "Search for …" keeps the search instead of clearing it and showing every row. FilterField has a new `searchChips` prop (default `true`); with `false`, Enter on the search row keeps the text in the field and closes the dropdown.
- 6e7a409: Accessibility follow-ups:
  - Button: `loading` now blocks the button like `softDisabled` (aria-disabled, presses ignored) instead of native `disabled`, so a focused button keeps focus while the action runs (WCAG 2.4.3). Its look is unchanged. Tests that checked a loading button with `toBeDisabled()` should check `aria-disabled="true"` instead.
  - OrbitCarousel, CardStack, TickerList, MarqueeColumns: the Pause / Play button no longer sets `aria-pressed` — its name already changes, and both together read as “Play, pressed”.
  - FacetedList: a value ticked past the first five stays in place while you're in that facet, so unticking it doesn't hide it and drop focus.
- b3c5e07: MarqueeColumns keeps each card as tall as its content: cards no longer squash to fit a scroll-driven column (cut pictures, lost padding), and cards made for grids (`h-full`) no longer stretch to the column.
- 20f09cb: ScrollMaskReveal lays a surface under its picture, so a blended picture (soft-light in the dark theme) has something to blend with.
- abd92ae: `useMediaQuery` answers correctly on the first render in the browser. PushSheet and Sidebar no longer mount their mobile Drawer for one frame on desktop (which briefly hid the page from screen readers), and DataTable and Carousel start in their final layout.
- abd92ae: Menubar: `MenubarMenu` has an explicit type, so the package's declarations build again (no runtime change).
- 91fb7b9: MessagePopup: on a phone, where the panel opens as a sheet, it is named by its title too (it was named after the launcher button).
- abd92ae: Mobile: screen-tied heights use `svh` instead of `vh` (PromptArea, Terminal, KeyboardShortcuts, MessagePopup, SearchBox), and Drawer (top / bottom) and full-screen Dialog pad for the safe area when the page sets `viewport-fit=cover`. New Foundations page "Mobile": touch targets, viewport units, overlays on a phone, safe area.
- abd92ae: Phone (below 640px) spacing around section dividers is 20px (`gap-5`, follows density) instead of 24–32px: AccessTokens, TeamMembers, CatalogItemPage, Reviews, BillingUsage, DashboardOverview, ResourceForm, Preferences and Checkout. Prose's `<hr>` gets 20px above and below on a phone (was twice the paragraph gap). Card and CardCompositions stories take the full width on a phone instead of a fixed 220–320px.
- 0e62499: Fira Code labels set in medium (CodeBlock / CodeEditor / DiffViewer filename, Terminal user@host, mono DataTableCell primary value) now render Fira's Medium face. Theya's `font-medium` is 375, below Fira Code's lightest loaded face, so the browser drew them at 400 and the bundled 500 face was never used. New `font-code-medium` utility.
- 1807a67: Nothing decorative moves on its own for more than 5 seconds (WCAG 2.2.2):
  - SurfaceEffect `beam`: the light rests on the border and runs only while the card is hovered or holds focus.
  - `Aurora`: drifts once (4.5 s) and rests, instead of drifting forever.
  - Foundations › Motion: rules for which presets belong in product UI and which only on landing pages, plus landing performance rules (transform/opacity only; no hidden-at-first hero headline).
- 58e7b1a: TextEffect: the typewriter plays through its phrases once, then rests on the last one without the caret (WCAG 2.2.2); the shimmer still loops, as an accepted deviation. CardFan: the open fan never squeezes a card's visible strip below 24px (WCAG 2.5.8). ColorPicker: the Change photo button is always visible instead of appearing on hover over the photo (WCAG 1.4.13), and the R/G/B/H/S/L and opacity fields have an even 8px side padding (it was 16px at the start).
- 5d09a72: States that were shown by color alone now have a second cue (WCAG 1.4.1):
  - Attachment / File: a selected file's edge doubles to 2px (no size shift). The click-only button carries `aria-current` when selected and there is no toggle, so File's selection reaches assistive tech.
  - ListItem: selected rows get a 2px start-edge bar and a semibold title, like the active SidebarItem.
  - DiffViewer: changed words are underlined (inserted) or struck through (deleted), not only tinted.
  - Terminal: error and warning lines show a visible ✕ / ! glyph next to the screen-reader prefix.
- 2acd1ed: OrbitCarousel announces the position and the slide name in one update ("3 of 6: Design"), never a new number with the old heading in between, and says nothing on load. CompletionBurst puts a pause between the label and the description in its status text.
- 188c9f4: Patterns: WCAG 2.2 AA code review (275 checks over 42 patterns, recorded in `a11y/manual.json`), with these fixes:

  - OrderHistory: Track progress, Invoice (PDF) and Buy again name their order for screen readers ("Buy again order TH-23990"), like Details, so several open rows stay distinct (2.4.6).
  - Comparison and PlanComparison: the "No" / "Not included" dash is `icon-subtle` (3:1 on white), was `icon-subtler` at 2.62:1 (1.4.11).
  - Comparison's sticky compare tray and PlanComparison's sticky plan cards reserve their height as scroll-padding, so a Tab-focused card or row is never hidden under them (2.4.11).
  - PaymentMethod: the expiry field shows "Month and year, MM / YY" as helper text, not only as a placeholder (3.3.2).
  - ListView: the table and its search are named from `noun` ("Users", "Search users…") instead of "List" / "Search…"; the seeded demo uses user / users (2.4.6).

  The accessibility matrix counts a manual review as axe evidence when a story switches an axe rule off with a reason (CardFan, Comparison: 2.5.8).

- 756470e: Accessibility fixes in patterns, found while writing their guidelines:
  - Focus no longer drops to the page when the control people used disappears (WCAG 2.4.3): SavedItems, OrderHistory, SearchResults, Comparison, FacetedList, Reviews, Cart, Checkout and CancellationFlow move it to the next item, the new view or the result.
  - CompletionScreen: new `focusOnMount` prop — the title takes focus when the screen appears. Checkout and CancellationFlow use it.
  - Cart announces an applied or removed promo code (4.1.3). Reviews reads “★” as “star” and keeps “Show all” out of the live count.
  - Links inside sentences are one weight step heavier (`font-semibold`) in SignUpForm, NoResults, SearchResults and LoginForm, so they don't rely on color alone (1.4.1). Link's docs now allow either `underline` or the heavier weight in running text.
  - MegaMenu: the current section is marked by a fill as well as color; drawer column titles are headings that name their lists.
  - LoginFormSplit: the carousel doesn't autoplay under reduced motion, holds on hover and focus, and has a Pause / Play button (2.2.2).
  - PasswordStrengthMeter: strength bands scale with the number of rules, so “Good” is reachable with 2–4 rules. Five rules read as before.
  - CancellationFlow no longer renders a stray “0” for `pauseMonths={0}`.
- 49d8b99: Patterns, small accessibility fixes:
  - Reviews: the rating filter reads "1 star" / "1 review" in the singular (it said "1 stars").
  - FacetedList: when focus moves to the section heading (after "Clear all" or removing the last filter chip), the heading shows as a small label with a focus ring instead of staying invisible (WCAG 2.4.7). Nothing below it shifts.
  - Cart: a held Enter or Space no longer presses the control that focus moves to. Holding Enter on Apply removed the code at once; holding it on a row's Remove removed the next rows too.
- abd92ae: Prose: code blocks (`pre`) are now keyboard-focusable, so a long line can be scrolled sideways without a mouse; focus shows the usual ring.
- 12bad30: Motion and color from tokens instead of raw values.
  - New tokens: `black-a600` and `bg-scrim-strong` (black 60%), used by ImageCropper around the crop frame (was a raw 55%).
  - ProductTour dims the page with the shared scrim token (black 40%, was a raw 50%), like Dialog.
  - Off-scale animation durations moved to the nearest motion step: Chip and BadgeIndicator pop 320 → 300ms, TagInput add 400 → 450ms and remove 180 → 200ms, Stepper pop 400 → 450ms after 300ms, NumberField pulse 350 → 300ms, Rating stars 420 → 450ms, Kanban drop 180 → 200ms (enter curve), menu Bloom 360 → 300ms, SuccessCheck tick delay = the slow step. Form's shake reads its duration from the token. Script animations read the tokens at run time, so a theme's motion reaches them.
  - `pnpm api:check` now fails on a raw ms duration, cubic-bezier, rgb/rgba color or numeric `duration:` in a component (`scripts/check-raw-values.mjs`); a deliberate exception carries `raw-ok: <reason>`. Kept on purpose: Button and Fab's 220ms press spring, stagger steps (CardFan, FabSpeedDial), Rating's 700ms spark burst, WheelPicker's 580ms drum settle, SecretField's 6s toast.
- abd92ae: File: focus moves onto the picked file again on React 19. The mount effect could run late (just before the next update) and use up the "focus the attachment" request while the picker was still on screen; it now waits until the swap has rendered. The same race made the File story flaky under load on React 18. With this, all 956 Storybook tests pass on React 18 and React 19.
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

- b3faab6: Fixes from the manual 1.4.1 / 1.4.11 screenshot review:

  - Checkbox: in dark, a checked or indeterminate box gets the light primary edge (5.95:1 on the surface; the blue fill alone is 2.71:1), the error box the danger edge (3.6:1; the red fill is 1.84:1). Not on a primary surface, where the box is white.
  - Switch: the off track is `bg-secondary-strong` (4.69:1 on white, 3.01:1 on the dark surface; was 2.62 / 1.87, the white thumb on it is 4.69:1). On tracks under 3:1 get a 1px inset edge in their tone: primary and danger in dark, warning in both themes.
  - SwatchPicker and ColorPicker swatches: the inner edge is the field-border color (3:1 on the surface in both themes), so a pale swatch on white or a dark one on the dark surface keeps its shape. The translucent hairline was ~1.3:1.
  - AvatarGroup: each disc sits on an opaque surface, so the avatar underneath no longer shows through a translucent tonal fallback at the overlap.
  - BadgeIndicator: filled success in light is the solid success green with white (4.74:1), like info and danger; dark keeps the status green with dark ink.
  - Tabs (and UrlTabs): underline tabs draw the focus ring inside the tab. The list scrolls, so the outer ring was clipped to a stray vertical sliver at the tab's edge. Chips keep the outer ring.

- abd92ae: Review fixes.

  - ToggleGroupItem: its own `appearance` / `size` now win over the group's; items without them follow the group as before.
  - FilterField: operator words in chips and the value field's label ("Contains", "Is missing", …) now come from the locale dictionary, matching the operator menu.
  - ListView: the seeded Status column's loading skeleton is a status dot and word instead of a badge pill.
  - Tree: type-ahead resets after 500ms instead of 600ms, in line with WAI-ARIA practice.

- 7c0eb32: OrbitCarousel rolodex turns the way its arrows show, like the wheel: the next cards wait above, and Next (↓), ArrowDown and a downward drag bring them in. Dragging the wheel or rolodex by more than half a card now lands on the next card instead of springing back (the release read the pull after it was zeroed). AnimatedIcon States opens untouched; its interaction test moved to "Test: states".
- abd92ae: Scheduler: today's date on the primary circle (week/day header and month cell) uses `text-on-primary` (white). It used `text-on-primary-fill`, the dark blue meant for text on a white pill, which read at about 2:1 on `bg-primary`.
- abd92ae: Kanban, Comparison, Tabs, CodeBlock, DataTableToolbar, Lightbox thumbnails, ItemPage gallery: horizontal scroll areas are now positioned, so screen-reader-only text inside them no longer escapes the clip and widens the page on narrow screens.
- 51cf23d: ScrollMaskReveal: the hidden text sets `inert` through `inertProps`, so it type-checks and stays inert on React 19 (a bare `inert=""` is dropped there as falsy).
- da570ea: DatePicker / DateRangePicker: on phones the bottom sheet is titled with the field's label (e.g. "Date"), not its placeholder ("Any date"). NoResults: commas and the final period stay with their link and never start a line. BillingUsage: the "metered" badge and the invoices icon sit on the section title line.
- 844681b: Storybook demo pictures: blue silk images replace the mesh gradients (public/asset-examples/silk, wide / square / portrait, with darkened copies swapped in for the dark theme). LoginFormSplit tries the originals turned upright, unchanged in both themes.
- dede34e: - TagInput and Combobox (`heightSize="sm"`): a row of chips no longer grows the field to 34px — vertical padding is 2px in sm, so the control stays 32px and lines up with TextField / Select sm.
  - NumberField (`heightSize="sm"`): the −/+ icons are 14px as intended (a shared 16px class was overriding them).
- bf8236a: Spacing on the 4px grid: menu and list items, and panel paddings.

  - Menu and list items (DropdownMenu, ContextMenu, Menubar, Command, Select, Combobox, Autocomplete, FilterField, Filter, ListItem, NavigationMenu, Sidebar, MegaMenu, AccountMenu): side padding 10px → 12px, icon–label gap 10px → 8px. Group labels use the same 12px side padding.
  - Panels: 14px → 16px (Command input row and footer, Sidebar header and group label, Message, Chat, Toggle `lg`, Topbar gap, Terminal output) and 18px → 20px (PushSheet, NotificationsInbox, Metric).

- 90acd58: Icon-to-text gaps and small stacks on the 4px grid (rule: 4px next to a 12px icon or small text, 8px next to a 16px+ icon; 4px inside a label/value pair, 8px between list items).

  - Button: lg gap 6 → 4 (same text and icon as md); xl side padding 14 → 16 and gap 6 → 8; 2xl gap 6 → 8. Fab sm icon–label gap 6 → 4.
  - Badge: sm gap 6 → 4; md side padding 10 → 12, gap 6 → 8.
  - Toggle, Tabs, Breadcrumb, Pagination, Tree, Calendar month/year dropdowns: icon–text gap 6 → 8.
  - Message and Chat (avatar to bubble), Terminal, DataTableCell avatar cells, ColorPicker channel row: 10 → 8.
  - Small status lines (Dropzone and PromptArea errors, DataTable sort header, TeamMembers, AccessTokens, Preferences, Checkout, SpecSheet, SiteFooter, PlanComparison): 6 → 4.
  - Stacks: Sonner, ProductTour, PromptArea, Details, Scheduler day, DataTableCell skeleton 6 → 4; PasswordStrengthMeter, Kanban card, Reviews filter, AccountOverview lists 6 → 8.
  - AvatarGroup sm overlap 6 → 4. NotificationsInbox tab badge 6 → 8.

- abd92ae: Spec / llms.txt import lines now name real exports: `TextArea` (was `Textarea`), `InputOTP` (was `InputOtp`), and `KebabIconVertical, KebabIconHorizontal`, `ResizablePanelGroup, …`, `TableSkeletonRows` instead of family names that are not exported. Files that export through `export { … }` lists (Select, Popover, DropdownMenu, Form, …) now list their parts too. `build-spec` fails if an import line names something the file does not export.
- 4c51a41: SurfaceEffect: `maxTilt` sets the largest turn of the `tilt` effect (default 8°). Landing cards: hover effects tuned to read in the light theme too — the spotlight is drawn inside the card (it was hidden under the card's own fill), a primary-tinted shine instead of white, a 2px beam ring, tilt up to 14° with a shorter perspective, and lift / spotlight / tilt turn an outlined card's border primary.
- abd92ae: SwatchPicker: the selected swatch shows its ring again when tooltips are on (the default). The tooltip trigger replaced the item's `data-state`, so the ring never appeared; the style now reads `aria-checked` / `aria-pressed`.
- abd92ae: Target size (WCAG 2.5.8): axe's target-size rule now runs on every story. ColorField's color button is a 24px target in the small field too (the 20px swatch inside stays the same size and place).
- 5d0a1c9: TextField's clear button is neutral (icon-subtle), like the clear buttons of Select, Combobox and DatePicker. It used Button's default primary tone and was the only blue one.
- 84acd0e: TextArea and InlineEdit use the same 12px side inset as every other field: TextArea and the multiline InlineEdit go from 12px / 8px to 12px on both sides, and the single-line InlineEdit display from 16px / 8px to 12px on both sides, so it lines up with the TextField that replaces it while editing.
- abd92ae: ThemeToggle shows the right label and icon on the first render on a dark page (a click in that first frame used to switch to the theme that was already on). Fab with `collapseOnScroll` starts collapsed when its container is already scrolled.
- abd92ae: TimeRangePicker: the two time fields shrink to fit a narrow row instead of overflowing it.
- 7046ab5: Toaster: the action / cancel buttons (Retry, Undo …) now render as designed — primary fill with `text-on-primary`, `radius-sm`, medium weight. Sonner's own `[data-button]` styles were winning, so the action showed as a near-black pill with a 4px radius and weight 500. The ghost action of `toast.progress` keeps its transparent fill.
- abd92ae: `toast.progress` on the dark toast surface: the Progress track, the percentage and the ghost action now use their on-dark values (white-a200 track, text-subtle-on-dark, text-on-dark) instead of the light-theme ones — the light gray track on a dark toast is gone. Other toast kinds are unchanged.
- 995979e: Toaster: Theya's title, description, shadow and border styles now actually apply. Sonner's own unlayered stylesheet was beating Tailwind's utilities layer, so toasts rendered with Sonner's 15/22.5 weight-500 title, its own grey 13/18.2 description, Sonner's shadow and a 1px border on the dark surface. Now: title 15/20 semibold, description 13/16 `text-subtler` (`text-subtle-on-dark` on dark), elevation lg / xl, no border on dark.
- f3d6ccf: TopbarAction and ThemeToggle are 32px (`size-control-lg`, was 34px), the same height as the topbar Avatar, and scale with density.
- af76160: Topbar: the default search placeholder is a neutral "Search…" (ru «Поиск…», de, ar, zh), not the hosting-specific "Search sites, servers, users…". Pass `placeholder` to name what is searched.
- aee87b7: Tree: first-level rows keep their 8px start padding (the level indent used to replace it, so the selection fill started right at the chevron), and the indent is on the logical start side, so nested rows indent from the right in RTL.
- d2999f1: `TruncatedText` takes `lines={2}` (two lines, then the ellipsis). Kanban card descriptions use it, so a cut description shows in full in a tooltip.
- 32bb13e: UploadPanel and Attachment: the first upload message ("Uploading 3 files", "Uploading report.pdf") is written into the live region a moment after the region appears, so screen readers announce it (text a region is born with is ignored). An Attachment says nothing about the state it is rendered with; only changes are announced.
- f03815e: Status messages that Safari + VoiceOver didn't speak (hand check, 2026-10-29):

  - Command (and FilterField, PhoneField, which use CommandEmpty): "No results" is put into the status region once typing pauses (500 ms) instead of on the first keystroke, where VoiceOver's typing echo spoke over it and it never changed again.
  - Scheduler: the new range after Previous / Next / Today is announced through the shared announcer; `aria-live` on the heading was not read.
  - DataTableToolbar: "N selected" is announced 700 ms after the change, after VoiceOver has spoken the row checkbox.
  - `announce()` takes an optional `{ delay }` (default 100 ms).

- 5640901: Landing page, Landing sections (testimonial media), Scroll effects (Masonry, Mask reveal) and the Attachment previews use the shared blue silk pictures instead of the cube renders; the dark theme swaps in their -dark copies.
- 743366e: WCAG 2.2 reviews of 1.4.13, 2.2.2, 2.4.4, 2.4.11, 2.5.1, 2.5.7, 2.5.8 and 3.3.8, recorded in `a11y/manual.json`, with these fixes:

  - Focus Not Obscured (2.4.11): Topbar, StickyActionBar, Fab and a sticky AnnouncementBar reserve their height as `scroll-padding` on the container they sit over (new `lib/scroll-padding`), so Tab-focused content stops clear of them. DataTable's sticky header no longer hides a focused cell.
  - Card (2.4.4): a whole-card link or filter overlay without its own label is named by its CardTitle instead of the raw URL.
  - WheelPicker (2.5.7): clicking a row selects it (pointer capture used to swallow the click).
  - ImageCropper (2.5.7): a click centres the frame on that point, so the crop can be moved without dragging.
  - Lightbox (2.5.1): Previous/Next show on phones when the thumbnail strip is off.
  - DataTable / DataTableToolbar (1.4.13): Escape closes the select-all tooltip while it's hovered.
  - InputOTP (3.3.8): a code pasted with spaces or dashes ("123 456") fills the slots.
  - Guidelines: PromptArea (attach button with `onFilesAdded`), Resizable (collapse/preset buttons), ImageCropper (`controls={false}`).

- 2ef8787: WheelPicker: the focus ring shows again (WCAG 2.4.7). The top/bottom fade (`mask-image`) sat on the focusable element and clipped its box-shadow ring, so a focused wheel looked unfocused. The fade now lives on an inner layer; the look is unchanged.

## 0.1.0

### Minor Changes

- First versioned release. Everything built so far: about 130 components on Radix + Tailwind v4 with a unified prop vocabulary (`tone`, `appearance`, `size`, `heightSize`, `widthSize`); Patterns (Commerce, Catalog, Search, Account, Navigation and the app screens); use-guidelines on every component's Docs page; play and axe tests in both themes; consumable from source by `apps/*` through package exports.
