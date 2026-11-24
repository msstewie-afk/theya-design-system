**English** · [Русский](LANDING.ru.md)

# Building a landing page with Theya

These are rules for agents and for people. Theya has the blocks; this page says which ones to pick. In a test on 21.11.2026, an agent laid out a PlateCovery hero component by component ("stages → Stepper", "plates on an arc → wheel carousel") and the result was flat and small. Starting from a ready composition fixed most of it, with the same blocks.

Stories live under `Patterns: Landing/*` in the Storybook. The rules of each UI component (when to use, when not, anatomy, a11y) are in `spec/components/<name>.json` and in `public/llms-full.txt`. Landing blocks keep theirs in `src/components/blocks/landing/<name>.guidelines.tsx` in the Theya repo, shown on each block's Docs page in the Storybook.

## 1. Start from a composition, not from components

Open these first, pick the closest one, then change its content. Don't lay out a blank page.

| Composition | Story | For |
|---|---|---|
| App, restrained | `Patterns: Landing/Recipes → App, restrained` | a mobile app, a calm product |
| Landing page | `Patterns: Landing/Landing page → Bookmarks`, `→ Gradient` | a SaaS product, start to end |
| First screens | `Patterns: Landing/First screens` (six screens) | presentational first screens with a strong type idea: wordmark, Swiss bento, split mosaic, manifesto, collage |
| Hero layouts | `Patterns: Landing/Hero` | centered, split, inset, statement, wordmark, name + subtitle + points |

## 2. The first screen

- **The title is display type.** Use `Hero titleSize="display"` (56 → 128 px), `layout="wordmark"` or `"statement"`. Heading sizes are for sections further down. A first screen set at section-heading size reads as a page inside an app.
- **A product name as the title** goes with a `subtitle`, one large line that says what it does, and two to four `points`, each opening with its point in bold.
- **The theme's face.** `titleFont="theme"` (the default) is the theme's own heading face, serif or not: Playfair Display in ember. `display-serif` is Theya's EB Garamond whatever the theme. Pick it only on purpose.
- **One main action**, at most one more. On a phone they stack at full width.
- **Text on a bright ground is dark.** Measure it: white on a saturated orange is about 2.7 : 1, which fails.
- **One h1** per page: the hero's.

## 3. Which block for which task

| Task | Block |
|---|---|
| Logos of customers or press | `LogoStrip` (static or marquee) |
| Three to six features | `FeatureCard` in a grid, `BentoGrid` for unequal weight |
| One feature with its visual | `FeatureSplit` |
| Features where the visual changes as you pick | `FeatureShowcase` |
| Steps / how it works | `StickySteps` |
| Numbers | `StatsRow`, `StatCard`, `CountUp` |
| Quotes | `QuoteCard`, `TestimonialCase`; a wall: `MarqueeColumns` |
| Before / after | `BeforeAfter` |
| A manifesto line that reads as you scroll | `ScrollHighlight` |
| Plans and prices | `PricingSection` (in the product: `PlanComparison`) |
| The services it connects to | `IntegrationsSection` (grid with filter, or hub) |
| Latest posts | `BlogTeaser` |
| Newsletter sign-up | `SiteFooter newsletter` |
| Questions | `FaqSection` |
| The closing call to action | `CtaBand`, in a `SectionPanel` for a coloured band |
| A coloured or gradient band | `SectionPanel tone="primary"` or `tone="gradient"` (dusk, lagoon, ochre) |
| The product as real UI cards over a ground | `ProductCollage` + `CollageItem` |
| An app screen or a web app in a frame | `DeviceFrame type="phone" \| "browser"` |
| Download a mobile app | `StoreButtons` (one store per device; official badges through `badges` before launch) |
| Switch stages, plans, modes | `Tabs variant="chips"` when each choice has its own panel (even one line), `ToggleGroup` when only a picture changes |
| One picture that changes in place | `ArcStage` (a calm move along an arc, for a hero), or `Carousel` with one slide in view |
| A showcase of five to eight image cards | `OrbitCarousel` |

## 4. Not X for Y

- **`Stepper` is not a switcher.** It shows progress through a process (a form, a wizard). For stages to switch between, use `Tabs variant="chips"`.
- **`OrbitCarousel` is not for one changing picture.** Its shapes need five or more cards. For one dish per stage, use `ArcStage`.
- **`Aurora` is not a brand ground.** It mixes primary, info and success, and on an orange theme that turns brown. For a coloured ground, use `SectionPanel tone="primary"` or `"gradient"`.
- **A screenshot is not the product visual** when Theya can draw it. Compose the visual from Theya components (`BookmarksPreview` and `ProductCollage` show how), so it follows the theme and the dark mode.
- **No `description` as a dumping ground.** A subtitle, a sentence and a list are three different slots.

## 5. Grounds, colour, shadows

- Gradient grounds come from the theme profile (`gradient` in `packages/tokens/src/profiles/*.json`): dusk, lagoon and ochre are dark with white ink; ember is bright persimmon with dark ink (`gradient.ink`). On a theme without one, `tone="gradient"` falls back to a flat primary.
- A first screen whose ground fills the window: `SectionPanel tone="gradient" shape="bleed" padding="none"` around the `Hero` (story `Patterns: Landing/Hero → On Bright Gradient`). `image` puts a photo in place of the mesh.
- A picture as the ground (`SectionPanel image` + `imageGround`, or Hero `backdrop={<ImageGround … />}`; demo pictures in `public/asset-examples/backgrounds`, with notes on tone and where text fits in `SOURCES.txt`). If the text does not pass on it, adjust the ground before changing the picture: `tint="deep"` (primary with black, tone in tone) under white text, `tint="surface"` or `opacity` below 100 (the panel's fill shows through) under the regular text. Then check the contrast by eye or on a screenshot: the scan skips text over pictures. `flip` (x / y / both) gives one picture four compositions; never mirror photos of people, text or products.
- On a coloured ground the buttons switch themselves: on `data-surface="primary"`, and in the gradient canvas the filled button turns into a white pill.
- On a coloured ground, use coloured shadows (the ground's darkest colour), never grey.

## 6. Motion

- UI durations stop at 450 ms. Landings have two more: `--transition-duration-journey` (1600 ms, an object travelling a long path, with `--ease-travel`; `glide` is too sharp for that) and `--transition-duration-ambient` (16 s, one loop of a ground that breathes: `AmbientBlobs`). Never use them for UI feedback.
- Anything that moves by itself for more than 5 s needs a visible pause (WCAG 2.2.2) and stops while the tab is hidden.
- With reduced motion, things appear in place. Nothing waits for an animation to become readable.

## 7. Before you call it done

- Screens at 360, 768 and 1280 px, light and dark.
- Accessibility: in the Theya repo, `node scripts/a11y-tree.mjs`, `a11y-auto.mjs` and `a11y-states.mjs` with `--only "<story title>"` on every story you touched. In an app, run axe on the page in both themes, and test the keyboard by hand.
- Keep a log of deviations: whatever you had to build by hand, and which Theya block, prop or token was missing. That log is how Theya grows.
