/**
 * Foundations pages: how the token layers are organised and the rules for
 * using them. Rendered by two stories in foundations.stories.tsx
 * ("Token architecture", "Usage principles"). Values shown here are read
 * from the token build (token-values.ts), so they can't drift from it.
 */
import type { ReactNode } from 'react';
import { NavArrowRight } from 'iconoir-react';
import { tokenValue } from './token-values';

/* ------------------------------ helpers ------------------------------ */

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[70%] flex-col gap-10 pt-[100px]">{children}</div>;
}

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-solid border-[var(--color-border-border-subtle)] pb-10 last:border-b-0">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-text)]">{title}</h2>
        {description && <p className="mt-1 max-w-[70ch] text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-body-l font-semibold text-[var(--color-text-text)]">{children}</h3>;
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-1 py-px font-mono text-[0.85em] text-[var(--color-text-text)]">{children}</code>;
}

const panel = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]';

/* --------------------------- Architecture ---------------------------- */

const LAYERS: { name: string; where: string; what: ReactNode; rule: ReactNode }[] = [
  {
    name: 'Primitives',
    where: 'packages/tokens/src/primitive',
    what: (
      <>
        Raw values, named by what they <em>are</em>: a hue and a step (<Code>--color-blue-blue-500</Code>), a size in px (<Code>--size-size40</Code>), a font family or weight. 12 colour ramps plus a short graphite ramp, alpha versions of most of them, 47 sizes, one heading and one body family.
      </>
    ),
    rule: 'Never referenced by components. The same in both themes.',
  },
  {
    name: 'Semantic',
    where: 'packages/tokens/src/semantic',
    what: (
      <>
        Named by what they are <em>for</em>: <Code>--color-bg-primary-bg-primary</Code>, <Code>--size-size-control-size-control-2xl</Code>, <Code>--typography-body-m-*</Code>. Every value is a reference to a primitive. Colour has two files — <Code>color.default.json</Code> and <Code>color.dark.json</Code> — with the same names and different references.
      </>
    ),
    rule: 'What components use. A theme is a different set of references for this layer, nothing else.',
  },
  {
    name: 'Code-only semantic',
    where: 'packages/tokens/src/code',
    what: (
      <>
        Semantic tokens that never existed in Figma: the <Code>-on-primary</Code> set, white and black alpha, the chart palette (<Code>--color-bg-chart-01…07</Code>), elevation, motion and layers.
      </>
    ),
    rule: 'Same rules as the semantic layer. New tokens are added here first.',
  },
  {
    name: 'Bridge to Tailwind',
    where: 'theya-shadcn/src/styles/globals.css',
    what: (
      <>
        <Code>@theme</Code> maps tokens onto the keys Tailwind builds utilities from, so <Code>text-body-m</Code>, <Code>font-heading</Code>, <Code>duration-standard</Code>, <Code>ease-enter</Code> and <Code>shadow-elevation-lg</Code> exist. <Code>@utility</Code> adds composites one class can't express otherwise (<Code>focus-ring</Code>). A shadcn alias block (<Code>--primary</Code>, <Code>--background</Code>…) keeps third-party shadcn snippets working.
      </>
    ),
    rule: 'Adds names, never values. Components read Theya tokens, not the shadcn aliases.',
  },
  {
    name: 'Components',
    where: 'theya-shadcn/src/components',
    what: (
      <>
        Compose semantic tokens. There is no separate component-token layer: a Button doesn't get <Code>--button-bg</Code>, it uses <Code>--color-bg-primary-bg-primary</Code>. Local custom properties exist only for a component's own geometry (<Code>--wp-row-h</Code>, <Code>--card-select-inset</Code>).
      </>
    ),
    rule: 'If a component needs a value no token has, the token is added — not a local constant.',
  },
];

type Chain = { kind: string; primitive: string; semantic: string; usage: string; sample: ReactNode };

const CHAINS: Chain[] = [
  {
    kind: 'Colour',
    primitive: '--color-blue-blue-500',
    semantic: '--color-bg-primary-bg-primary',
    usage: 'bg-[var(--color-bg-primary-bg-primary)]',
    sample: <span className="block size-8 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-primary-bg-primary)]" />,
  },
  {
    kind: 'Control height',
    primitive: '--size-size40',
    semantic: '--size-size-control-size-control-2xl',
    usage: 'h-[var(--size-size-control-size-control-2xl)]',
    sample: <span className="block h-[var(--size-size-control-size-control-2xl)] w-16 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]" />,
  },
  {
    kind: 'Radius',
    primitive: '--size-size6',
    semantic: '--size-border-radius-border-radius-lg',
    usage: 'rounded-[var(--size-border-radius-border-radius-lg)]',
    sample: <span className="block size-8 rounded-[var(--size-border-radius-border-radius-lg)] border-2 border-solid border-[var(--color-border-border-primary)]" />,
  },
  {
    kind: 'Type',
    primitive: '--size-size15',
    semantic: '--typography-body-m-size',
    usage: 'text-body-m',
    sample: <span className="text-body-m text-[var(--color-text-text)]">Aa</span>,
  },
  {
    kind: 'Motion',
    primitive: '—',
    semantic: '--motion-duration-standard',
    usage: 'duration-standard',
    sample: <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">{tokenValue('--motion-duration-standard')}</span>,
  },
];

function TokenChip({ name, layer }: { name: string; layer: 'primitive' | 'semantic' | 'usage' }) {
  if (name === '—') return <span className="text-body-s text-[var(--color-text-text-subtler)]">no primitive</span>;
  const value = layer === 'usage' ? null : tokenValue(name);
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <code className="truncate font-mono text-body-s text-[var(--color-text-text)]" title={name}>
        {name}
      </code>
      {value && <span className="font-mono text-body-xs text-[var(--color-text-text-subtler)]">{value}</span>}
    </span>
  );
}

const NAME_PARTS: { part: string; example: string; values: ReactNode }[] = [
  { part: 'Category', example: 'color', values: 'color, size, typography, motion, elevation, layer' },
  { part: 'Property', example: 'text', values: 'text, icon, border, bg, focus — the CSS property the token is meant for' },
  { part: 'Role', example: 'success', values: 'primary, secondary, neutral, success, warning, danger, info, surface, link, code, rating, chart' },
  { part: 'Emphasis', example: 'subtle', values: '(none) = default, subtle, subtler — quieter; strong — louder' },
  { part: 'State', example: 'hover', values: 'hover, pressed, disabled' },
  { part: 'Context', example: 'on-tonal', values: 'on-dark — on a solid colour fill; on-tonal — on a tinted subtle fill; on-primary — inside a brand-filled surface' },
];

export function TokenArchitecturePage() {
  return (
    <Page>
      <Section
        title="Token architecture"
        description="Every visual value in Theya comes from a token, and tokens are organised in layers. Each layer may only reference the one below it. Read top to bottom: from a raw value to the class in a component."
      >
        <ol className="flex flex-col gap-2">
          {LAYERS.map((l, i) => (
            <li key={l.name} className={`${panel} grid gap-x-6 gap-y-2 p-5 md:grid-cols-[12rem_minmax(0,1fr)]`}>
              <div className="flex flex-col gap-1">
                <span className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">{`Layer ${i + 1}`}</span>
                <span className="text-body-l font-semibold text-[var(--color-text-text)]">{l.name}</span>
                <span className="break-all font-mono text-body-xs text-[var(--color-text-text-subtle)]">{l.where}</span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-body-m text-[var(--color-text-text)]">{l.what}</p>
                <p className="text-body-m font-medium text-[var(--color-text-text)]">{l.rule}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="From value to class" description="The same path for every kind of token. Values are read from the current build.">
        {/* Scrolls sideways on narrow screens, so it's focusable for keyboard scrolling. */}
        <div role="region" aria-label="Token chains" tabIndex={0} className={`${panel} overflow-x-auto outline-none focus-visible:focus-ring`}>
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]">
                {/* Empty columns (row label, arrows, sample) get <td>: an empty <th> is an unnamed header. */}
                {['', 'Primitive', '', 'Semantic', '', 'In a component', ''].map((h, i) =>
                  h ? (
                    <th key={i} scope="col" className="px-3 py-2.5 text-body-s font-medium text-[var(--color-text-text-subtle)]">
                      {h}
                    </th>
                  ) : (
                    <td key={i} />
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {CHAINS.map((c) => (
                <tr key={c.kind} className="border-b border-solid border-[var(--color-border-border-subtler)] align-middle last:border-b-0">
                  <th scope="row" className="px-3 py-3 text-body-m font-medium text-[var(--color-text-text)]">
                    {c.kind}
                  </th>
                  <td className="px-3 py-3">
                    <TokenChip name={c.primitive} layer="primitive" />
                  </td>
                  <td aria-hidden="true" className="text-[var(--color-icon-icon-subtler)] [&_svg]:size-4">
                    <NavArrowRight />
                  </td>
                  <td className="px-3 py-3">
                    <TokenChip name={c.semantic} layer="semantic" />
                  </td>
                  <td aria-hidden="true" className="text-[var(--color-icon-icon-subtler)] [&_svg]:size-4">
                    <NavArrowRight />
                  </td>
                  <td className="px-3 py-3">
                    <TokenChip name={c.usage} layer="usage" />
                  </td>
                  <td className="px-3 py-3">{c.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Naming"
        description={
          <>
            Semantic colour names read left to right from general to specific. Not every part is always present. Example: <Code>--color-text-text-success-on-tonal</Code> — colour, for text, success role, placed on a tinted success fill.
          </>
        }
      >
        <div className={`${panel} overflow-x-auto`}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]">
                {['Part', 'Example', 'Values'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-body-s font-medium text-[var(--color-text-text-subtle)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAME_PARTS.map((p) => (
                <tr key={p.part} className="border-b border-solid border-[var(--color-border-border-subtler)] align-top last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3 text-body-m font-medium text-[var(--color-text-text)]">{p.part}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-body-s text-[var(--color-text-text)]">{p.example}</td>
                  <td className="px-4 py-3 text-body-m text-[var(--color-text-text-subtle)]">{p.values}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-[70ch] text-body-m text-[var(--color-text-text)]">
          Size tokens use the same idea with a t-shirt scale: <Code>--size-{'{group}'}-{'{group}'}-{'{step}'}</Code>, steps from <Code>4xs</Code> to <Code>6xl</Code> — <Code>size-control</Code> (heights), <Code>border-radius</Code>, <Code>gap</Code>, <Code>padding</Code>, <Code>margin</Code>, <Code>border-width</Code>, <Code>icon</Code>, <Code>width</Code>. The group name is repeated because it is both the folder and the token name in the source; that is a known quirk, kept for parity with Figma.
        </p>
      </Section>

      <Section title="Themes" description="Light and dark are two builds of the same names.">
        <ul className="flex max-w-[70ch] list-disc flex-col gap-2 pl-5 text-body-m text-[var(--color-text-text)]">
          <li>
            The build writes <Code>variables.css</Code> on <Code>:root</Code> and <Code>variables-dark.css</Code> on <Code>[data-theme="dark"]</Code>. Switching the attribute switches every semantic colour at once.
          </li>
          <li>Only semantic colour differs between themes. Primitives, sizes, type, motion and layers are the same.</li>
          <li>
            Components never branch on the theme (<Code>dark:</Code> utilities, JS checks). If something must look different in dark, that is a different token value in <Code>color.dark.json</Code>. The rare exception is content that isn't a token at all — a photo on white gets a white plate in dark.
          </li>
          <li>
            A part that must stay dark in both themes (Terminal, inverse CodeEditor, Tooltip) uses the <Code>-on-dark</Code> tokens or forces <Code>data-theme="dark"</Code> on its own subtree.
          </li>
        </ul>
      </Section>

      <Section title="Where tokens come from" description="Code is the source of truth since 2 October 2026.">
        <ol className="flex max-w-[70ch] list-decimal flex-col gap-2 pl-5 text-body-m text-[var(--color-text-text)]">
          <li>
            Tokens are edited as JSON in <Code>packages/tokens/src</Code>. Figma is updated by hand to match; the old Figma export script is retired.
          </li>
          <li>
            Style Dictionary builds CSS custom properties, a JS module and a Tailwind JSON (<Code>pnpm --filter @theya/tokens build</Code>, also run by <Code>pnpm storybook</Code>).
          </li>
          <li>
            The CSS gets <em>resolved</em> values — <Code>--color-bg-primary-bg-primary: {tokenValue('--color-bg-primary-bg-primary')}</Code>, not a <Code>var()</Code> to the primitive. The chain exists in the source; changing a primitive needs a rebuild.
          </li>
          <li>
            <Code>globals.css</Code> imports both files and the fonts, then the <Code>@theme</Code> bridge.
          </li>
        </ol>
      </Section>
    </Page>
  );
}

/* ----------------------------- Principles ---------------------------- */

const GENERAL: ReactNode[] = [
  <>Choose a token by its role, not its value. Info and primary are the same blue today; an info badge still uses the info tokens, so it follows when info changes.</>,
  <>Components use semantic tokens. Primitives appear only where a palette is the point — chart series, a deliberately fixed-dark surface — and every such case is listed under Exceptions below.</>,
  <>No raw values for colour, radius, shadow, duration, easing or z-index: no hex, no <Code>rounded-[7px]</Code>, no <Code>duration-[180ms]</Code>. Layout spacing uses Tailwind's 4px scale, see Spacing.</>,
  <>Pair by surface. The fill decides its ink: a solid fill takes <Code>-on-dark</Code> text and icons, a tinted fill takes <Code>-on-tonal</Code>, the brand surface takes <Code>-on-primary</Code>. Default text on a coloured fill is a bug even when it happens to pass contrast.</>,
  <>Missing a value? Add a token (with light and dark) in <Code>src/code</Code> and document it here. A local constant is a token nobody can find.</>,
  <>A state changes everything that signals it together: invalid is border and background, never the border alone; disabled uses the disabled tokens, never <Code>opacity-50</Code> on top.</>,
];

const CATEGORIES: { title: string; rules: ReactNode[] }[] = [
  {
    title: 'Colour',
    rules: [
      <>Property matches the CSS property: <Code>--color-text-*</Code> for text, <Code>--color-icon-*</Code> for glyphs, <Code>--color-border-*</Code> for strokes, <Code>--color-bg-*</Code> for fills. Icon tokens are tuned lighter than text on purpose; don't colour an icon with a text token.</>,
      <>Text emphasis is a ladder: <Code>text</Code> → <Code>text-subtle</Code> (secondary) → <Code>text-subtler</Code> (meta, captions). Disabled is its own token, not the bottom of the ladder.</>,
      <>Status comes in three strengths. Filled: <Code>bg-{'{status}'}</Code> with <Code>-on-dark</Code> ink. Tonal: <Code>bg-{'{status}'}-subtle</Code> with <Code>text-{'{status}'}-on-tonal</Code>. Outline: <Code>border-{'{status}'}</Code> with <Code>text-{'{status}'}</Code>. Status colour always means a status — never decoration.</>,
      <>Hover and pressed come from the same family as the rest state (<Code>bg-primary</Code> → <Code>bg-primary-hover</Code> → <Code>bg-primary-pressed</Code>). Never darken with opacity or a filter.</>,
      <>Contrast is built into the pairs: text 4.5:1, borders that carry meaning and focus rings 3:1, in both themes. Don't stack translucent fills — in dark they add up and break the pair.</>,
      <>Links on a tinted panel use <Code>text-link-on-tonal</Code>. Charts use <Code>chart-01…07</Code> by series index; a chart whose colour means a status uses the status tokens.</>,
    ],
  },
  {
    title: 'Typography',
    rules: [
      <>Use the composite classes — <Code>text-body-m</Code>, <Code>text-heading-s</Code> — they set size, line height, letter spacing and weight together. Don't add a separate font size or line height.</>,
      <><Code>text-body-m</Code> is the default for anything people read. <Code>text-body-s</Code> is for secondary text: meta, captions, helper text. <Code>text-body-xs</Code> is rare.</>,
      <>Section labels in caps use <Code>font-heading text-heading-2xs uppercase tracking-[0.07em]</Code> (3xs inside menus) — the same style as table headers.</>,
      <>Weights through <Code>font-medium</Code> / <Code>font-semibold</Code>: they map to Geologica's shifted weights. A numeric <Code>font-[600]</Code> renders a step too heavy.</>,
      <><Code>font-mono</Code> (Fira Code) for code, IDs, keys and values people copy.</>,
    ],
  },
  {
    title: 'Spacing and size',
    rules: [
      <>Spacing follows a 4px grid. In components it's written with Tailwind's numeric scale (<Code>gap-3</Code> = 12px), which has the same values as the <Code>gap</Code> / <Code>padding</Code> tokens; the token form is used where a value must be shared by name across components.</>,
      <>Proximity shows grouping: space inside a group is smaller than between groups. Forms: 12px inside, 24px between. Control rows: 8px inside a group, 16px between groups. A divider gets equal space on both sides.</>,
      <>In a control the side padding is larger than the gap between its icon and label.</>,
      <>Control heights come only from <Code>size-control</Code>. A field and a button that sit together share one size, so their heights match.</>,
      <>Buttons inside cards are <Code>md</Code>; page-level actions are <Code>xl</Code>.</>,
    ],
  },
  {
    title: 'Radius',
    rules: [
      <>Radius grows with the size of the container: <Code>lg</Code> 6px for fields and small controls, <Code>xl</Code> 8px for buttons and menus anchored to a trigger, <Code>2xl</Code> 10px for cards and panels, <Code>3xl</Code> 12px for dialogs and drawers, <Code>max</Code> for pills.</>,
      <>Nested corners: the inner radius is smaller than the outer one, never equal or larger.</>,
      <>Write the token form, <Code>rounded-[var(--size-border-radius-border-radius-xl)]</Code>. The short Tailwind names are shifted against the token names and easy to misread.</>,
    ],
  },
  {
    title: 'Elevation, layers and motion',
    rules: [
      <>A shadow means the thing floats. In-flow surfaces get <Code>xs</Code>, small raised details <Code>sm</Code>, floating hints <Code>md</Code>, menus and popovers <Code>lg</Code>; dialogs, drawers and toasts <Code>xl</Code>. Elevation is not a way to separate sections — use a border or space.</>,
      <>Anything above the page uses its layer: <Code>z-(--z-index-modal)</Code>, <Code>z-(--z-index-popover)</Code>… Plain <Code>z-[1]</Code>/<Code>z-10</Code> only order parts inside one component.</>,
      <>Duration grows with distance and size: <Code>fast</Code> for micro feedback on the control itself (check marks), <Code>standard</Code> for hover, colour and focus changes, <Code>moderate</Code> for overlays and expanding content, <Code>slow</Code> for value changes and large panels. Appearing and hover use <Code>ease-enter</Code>, leaving <Code>ease-exit</Code>, selection feedback <Code>ease-spring</Code>, a button press <Code>ease-press</Code>.</>,
      <>Every transition and animation has a reduced-motion guard: <Code>motion-reduce:transition-none</Code> or <Code>motion-reduce:animate-none</Code>.</>,
    ],
  },
  {
    title: 'Focus',
    rules: [
      <>Keyboard focus is always visible: <Code>focus-visible:focus-ring</Code>, 4px, in the tone of the control (<Code>focus-ring-error</Code>, <Code>-success</Code>, <Code>-warning</Code>, <Code>-on-primary</Code>).</>,
      <>Where an outer ring would be clipped, use <Code>focus-ring-inset</Code> or put the ring on the frame (<Code>has-[:focus-visible]:focus-ring</Code>).</>,
      <><Code>outline-none</Code> only together with a ring. Hover never shows a ring.</>,
    ],
  },
];

const EXCEPTIONS: { where: string; what: string }[] = [
  { where: 'Charts, UsageBar', what: 'Series colours by index (chart-01…07; UsageBar adds purple-500). Palette, not meaning.' },
  { where: 'Terminal, CodeEditor inverse', what: 'Fixed dark surface with the --color-code-*-inverse palette regardless of the page theme.' },
  { where: 'Rating star', what: 'icon-rating / border-rating — a yellow that isn’t the warning status.' },
  { where: 'ItemCard product photos', what: 'White plate in dark (--color-white): the photo is shot on white, not a theme surface.' },
  { where: 'Button press', what: 'A 220ms spring, the one duration off the motion scale.' },
];

export function UsagePrinciplesPage() {
  return (
    <Page>
      <Section title="Usage principles" description="The rules that decide which token goes where. They hold for every category; the sections below add what is specific to each.">
        <ol className="flex max-w-[75ch] list-decimal flex-col gap-3 pl-5 text-body-m text-[var(--color-text-text)] marker:font-semibold">
          {GENERAL.map((r, i) => (
            <li key={i} className="pl-1">
              {r}
            </li>
          ))}
        </ol>
      </Section>

      {CATEGORIES.map((c) => (
        <Section key={c.title} title={c.title}>
          <ul className="flex max-w-[75ch] list-disc flex-col gap-2.5 pl-5 text-body-m text-[var(--color-text-text)]">
            {c.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Exceptions" description="Every place a component deliberately leaves the rules above. Anything not listed here is a bug.">
        <div className={`${panel} overflow-x-auto`}>
          <table className="w-full border-collapse text-left">
            <tbody>
              {EXCEPTIONS.map((e) => (
                <tr key={e.where} className="border-b border-solid border-[var(--color-border-border-subtler)] align-top last:border-b-0">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 text-body-m font-medium text-[var(--color-text-text)]">
                    {e.where}
                  </th>
                  <td className="px-4 py-3 text-body-m text-[var(--color-text-text-subtle)]">{e.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SubHeading>Before adding a token</SubHeading>
        <ol className="flex max-w-[75ch] list-decimal flex-col gap-2 pl-5 text-body-m text-[var(--color-text-text)]">
          <li>Look for an existing semantic token with the right role — the name, not the hex.</li>
          <li>If none fits, add it to the semantic layer (or src/code) with a reference to a primitive, in both colour files.</li>
          <li>Check contrast against every surface it will sit on, in both themes.</li>
          <li>Rebuild tokens, use it, and document it on the matching Foundations page.</li>
        </ol>
      </Section>
    </Page>
  );
}
