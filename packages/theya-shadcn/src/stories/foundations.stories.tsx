import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'iconoir-react';
import { TextField } from '../components/ui/text-field';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { tokenValue, type Theme } from './token-values';
import { TokenArchitecturePage, UsagePrinciplesPage } from './token-architecture';
import { Code, DocsPage, DocsSection, LIST, Note, Preview, SpecTable, TEXT, type SpecRow } from './docs-page';

const meta: Meta = {
  title: 'Design System/Foundations',
  parameters: {
    // The page column (DocsPage) owns all the spacing, like a Docs page.
    layout: 'fullscreen',
    // Swatch labels are specimens, not UI text: they prefer white on
    // mid-tone fills (~2.8-3.7:1) for legibility at a glance, which axe
    // would flag. Contrast is still checked for everything else on the page.
    a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not([data-swatch-label])' }] } },
  },
};

export default meta;
type Story = StoryObj;

/** How the token layers fit together — first, because every page below builds on it. */
export const TokenArchitecture: Story = {
  name: 'Token architecture',
  render: () => <TokenArchitecturePage />,
};

/** Which token goes where, for every category. */
export const UsagePrinciples: Story = {
  name: 'Usage principles',
  render: () => <UsagePrinciplesPage />,
};

/**
 * Token reference table: a row list (not a bordered grid table) — token
 * name as a small mono chip with its description underneath, then Light/
 * Dark value shown as a rounded swatch card. Text inside each swatch is
 * the resolved primitive-scale label when the value matches one exactly
 * (e.g. "Blue 500"), colored for contrast against its own fill (computed,
 * not guessed). Light/dark values pulled directly from @theya/tokens'
 * generated variables.css / variables-dark.css (confirmed 2026-09-26),
 * not re-derived or guessed.
 */
type TokenRow = { name: string; light: string; dark: string; description: string };
// Light/dark values come from the build, not from this file.
const withValues = (rows: { name: string; description: string }[]): TokenRow[] =>
  rows.map((r) => ({ ...r, light: tokenValue(r.name, 'light'), dark: tokenValue(r.name, 'dark') }));

// Current Storybook theme, kept in sync with the toolbar toggle
// (preview.ts sets data-theme on <html>).
function usePageTheme(): Theme {
  const read = (): Theme =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const [theme, setTheme] = useState<Theme>(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

// White text is used whenever it reaches this ratio; dark text only on
// genuinely light fills. Max-contrast picking put dark text on mid-tones
// (Blue 400, Cyan 500, Orange 400, border-subtle), which reads worse.
const WHITE_TEXT_MIN_CONTRAST = 2.7;

function contrastTextColor(color: string, theme: Theme = 'light'): string {
  // Translucent swatches are composited over the page surface they sit on.
  const surface = tokenValue('--color-bg-surface-bg-surface-base', theme).replace('#', '');
  const [sr, sg, sb] = [0, 2, 4].map((i) => parseInt(surface.slice(i, i + 2), 16) || 255);
  let r = 255;
  let g = 255;
  let b = 255;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
      const alpha = parts[3] ?? 1;
      r = parts[0] * alpha + sr * (1 - alpha);
      g = parts[1] * alpha + sg * (1 - alpha);
      b = parts[2] * alpha + sb * (1 - alpha);
    }
  }
  // Real WCAG relative luminance (sRGB-gamma-corrected), not the old
  // 0.299/0.587/0.114 perceived-brightness formula — that one systematically
  // under-weights blue, so saturated blues like Blue 400/300 scored as
  // "dark enough" for white text while actually failing AA (color-contrast
  // audit finding, 2026-09-27). Pick whichever candidate text color gives
  // the higher contrast ratio against the swatch, computed properly.
  const relLuminance = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * relLuminance(r) + 0.7152 * relLuminance(g) + 0.0722 * relLuminance(b);
  const contrastAgainst = (fgLuminance: number) => {
    const lighter = Math.max(luminance, fgLuminance);
    const darker = Math.min(luminance, fgLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  };
  // #151529's own luminance, #ffffff's is 1.
  const darkTextLuminance = 0.2126 * relLuminance(0x15) + 0.7152 * relLuminance(0x15) + 0.0722 * relLuminance(0x29);
  const white = contrastAgainst(1);
  return white >= WHITE_TEXT_MIN_CONTRAST || white >= contrastAgainst(darkTextLuminance) ? '#ffffff' : '#151529';
}

const RAMP_STEPS = ['005', '010', '050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

// Read from @theya/tokens' built variables.css (--typography-body-* and
// --typography-heading-heading-* — same in light and dark, the type scale
// doesn't change by theme). Displayed next to each sample in the
// Typography story per Мария's request (2026-09-26): "типографика
// неполная, где значения размеров шрифтов, weight и тд" — the story
// used to render only the sample text, with no visible numbers.
const typeValues = (prefix: string) => ({
  size: tokenValue(`${prefix}-size`),
  lineHeight: tokenValue(`${prefix}-line-height`),
  weight: Number(tokenValue(`${prefix}-weight`)),
});
const BODY_TYPE_VALUES = Object.fromEntries((['xs', 's', 'm', 'l', 'xl'] as const).map((k) => [k, typeValues(`--typography-body-${k}`)])) as Record<
  'xs' | 's' | 'm' | 'l' | 'xl',
  { size: string; lineHeight: string; weight: number }
>;

// Every heading step, including 2xs and 3xs (`text-heading-2xs`,
// `text-heading-3xs`).
const HEADING_TYPE_VALUES = Object.fromEntries(
  (['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'] as const).map((k) => [k, typeValues(`--typography-heading-heading-${k}`)]),
) as Record<'3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl', { size: string; lineHeight: string; weight: number }>;

// Literal class names: Tailwind only generates utilities it can find as
// whole strings in the source, so `text-heading-${size}` would leave the
// sizes no component uses (2xl, 3xl) without styles.
const BODY_CLASS = { xs: 'text-body-xs', s: 'text-body-s', m: 'text-body-m', l: 'text-body-l', xl: 'text-body-xl' } as const;
const HEADING_CLASS = {
  '3xs': 'text-heading-3xs', '2xs': 'text-heading-2xs', xs: 'text-heading-xs', s: 'text-heading-s', m: 'text-heading-m',
  l: 'text-heading-l', xl: 'text-heading-xl', '2xl': 'text-heading-2xl', '3xl': 'text-heading-3xl',
} as const;

/**
 * Labels each swatch with the primitive-scale step it resolves to (e.g.
 * "Blue 500") rather than a raw hex value, wherever the value is an exact
 * match — reverse-lookup against the 11 primitive ramps (same hex data as
 * RAMP_FAMILIES's swatches). Falls back to the raw value for anything
 * that isn't an exact primitive hex (e.g. the rgba() alpha overlays used
 * by several dark-theme values, which aren't a single scale step).
 */
const PRIMITIVE_FAMILIES = ['cyan', 'blue', 'gray', 'green', 'magenta', 'orange', 'purple', 'red', 'slate', 'teal', 'yellow'] as const;
// Built primitive ramps (--color-<family>-<family>-<step>), lower-cased hex.
const PRIMITIVE_HEX: Record<string, string[]> = Object.fromEntries(
  PRIMITIVE_FAMILIES.map((f) => [f, RAMP_STEPS.map((step) => tokenValue(`--color-${f}-${f}-${step}`).toLowerCase())]),
);

const HEX_TO_PRIMITIVE_LABEL: Record<string, string> = {
  // Real standalone tokens (--color-white/--color-black), not part of any
  // 12-step ramp — Мария caught these were missing from the lookup, 2026-09-26.
  '#ffffff': 'White',
  '#000000': 'Black',
};
Object.entries(PRIMITIVE_HEX).forEach(([family, hexes]) => {
  hexes.forEach((hex, i) => {
    HEX_TO_PRIMITIVE_LABEL[hex] = `${family[0].toUpperCase()}${family.slice(1)} ${RAMP_STEPS[i]}`;
  });
});
// Half steps (slate-350/450) sit between ramp columns: labelled by name
// in token tables, not shown as their own column in the ramp grid.
const HALF_STEPS = ['350', '450'];
PRIMITIVE_FAMILIES.forEach((family) => {
  HALF_STEPS.forEach((step) => {
    const hex = tokenValue(`--color-${family}-${family}-${step}`).toLowerCase();
    if (hex.startsWith('#')) HEX_TO_PRIMITIVE_LABEL[hex] = `${family[0].toUpperCase()}${family.slice(1)} ${step}`;
  });
});

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function labelFor(value: string): string {
  if (value.startsWith('#')) {
    return HEX_TO_PRIMITIVE_LABEL[value.toLowerCase()] ?? value;
  }
  // An rgba() alpha overlay is usually just a primitive color at reduced
  // opacity (e.g. rgba(55,149,255,0.5) IS Blue 300, just at 50%) — resolve
  // the rgb portion against the same primitive table before giving up.
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
    const hex = rgbToHex(parts[0], parts[1], parts[2]);
    const base = HEX_TO_PRIMITIVE_LABEL[hex];
    if (base && parts[3] !== undefined) {
      return `${base} · ${Math.round(parts[3] * 100)}%`;
    }
  }
  return value;
}

/** Мария's rule (2026-09-26, refined): a border is only for a swatch that
 * would otherwise vanish against the page's white surface — i.e. literal
 * white, not just "light". Near-white ramp steps (blue-005, etc.) are
 * deliberately left borderless now; only true white tokens keep one. */
function isWhiteish(value: string): boolean {
  let r = 0;
  let g = 0;
  let b = 0;
  if (value.startsWith('#')) {
    const hex = value.replace('#', '');
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
      const alpha = parts[3] ?? 1;
      r = parts[0] * alpha + 255 * (1 - alpha);
      g = parts[1] * alpha + 255 * (1 - alpha);
      b = parts[2] * alpha + 255 * (1 - alpha);
    }
  }
  return r >= 253 && g >= 253 && b >= 253;
}

function TokenPill({ value }: { value: string }) {
  const theme = usePageTheme();
  const needsBorder = isWhiteish(value);
  return (
    <span
      className={`inline-flex min-w-[6.5rem] items-center justify-center whitespace-nowrap rounded-[var(--size-border-radius-border-radius-xl)] px-3 py-2 text-center font-mono text-body-s font-medium${
        needsBorder ? ' border border-solid border-[var(--color-border-border-subtle)]' : ''
      }`}
      data-swatch-label=""
      style={{ background: value, color: contrastTextColor(value, theme) }}
    >
      {labelFor(value)}
    </span>
  );
}

function TokenTable({ rows }: { rows: TokenRow[] }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Reuses TextField (hover/focus/pressed states come from the component).
          name/id contain "search" so the iCloud Passwords extension skips the field;
          it ignores autoComplete="off" and the data-*-ignore hints below. */}
      <TextField
        widthSize="lg"
        leftIcon={<Search />}
        aria-label="Filter tokens"
        name="token-search"
        id="token-search"
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        data-form-type="other"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter tokens by name or description…"
      />
      <Table containerLabel="Semantic colour tokens">
        <TableHeader>
          <TableRow>
            <TableHead>Token and description</TableHead>
            <TableHead>Light theme</TableHead>
            <TableHead>Dark theme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.name}>
              <TableCell className="align-top">
                <span className="flex min-w-0 flex-col gap-1">
                  <code className="font-mono text-body-s text-[var(--color-text-text)] [overflow-wrap:anywhere]">{r.name}</code>
                  <span className="text-body-s text-[var(--color-text-text-subtle)]">{r.description}</span>
                </span>
              </TableCell>
              <TableCell className="align-top sm:w-[9rem]">
                <TokenPill value={r.light} />
              </TableCell>
              <TableCell className="align-top sm:w-[9rem]">
                <TokenPill value={r.dark} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[var(--color-text-text-subtle)]">
                No tokens match “{query}”.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const BG_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-bg-primary-bg-primary', description: 'Primary action fill — buttons, active states. Same in both themes.' },
  { name: '--color-bg-primary-bg-primary-subtle', description: 'Low-emphasis primary fill, e.g. selected-row or info-callout background.' },
  { name: '--color-bg-primary-bg-primary-on-dark', description: 'Primary fill for use on an already-dark surface (e.g. inside the sidebar).' },
  { name: '--color-bg-secondary-bg-secondary', description: 'Secondary action fill.' },
  { name: '--color-bg-success-bg-success', description: 'Success state fill.' },
  { name: '--color-bg-success-bg-success-on-dark', description: 'Success fill for use on a dark surface.' },
  { name: '--color-bg-warning-bg-warning', description: 'Warning state fill.' },
  { name: '--color-bg-warning-bg-warning-on-dark', description: 'Warning fill for use on a dark surface.' },
  { name: '--color-bg-danger-bg-danger', description: 'Danger/destructive state fill.' },
  { name: '--color-bg-danger-bg-danger-on-dark', description: 'Danger fill for use on a dark surface.' },
  { name: '--color-bg-info-bg-info', description: 'Informational state fill.' },
  { name: '--color-bg-info-bg-info-on-dark', description: 'Informational fill for use on a dark surface.' },
  { name: '--color-bg-neutral-bg-neutral-subtle', description: 'Low-emphasis neutral fill, e.g. hover/zebra-striping.' },
  { name: '--color-bg-surface-bg-surface', description: 'Default page/card surface.' },
  { name: '--color-bg-surface-bg-surface-base', description: 'Base app background, beneath surfaces.' },
  { name: '--color-bg-surface-bg-surface-overlay', description: 'Modal/popover/overlay surface, above the base surface.' },
  { name: '--color-bg-surface-bg-surface-sunken', description: 'Recessed track or well that holds raised items: Tabs chips track, WheelPicker, Kanban column. Darker than the surface in both themes.' },
  { name: '--color-bg-input-bg-input', description: 'Form control fill (input, select, textarea).' },
  { name: '--color-bg-input-bg-input-disabled', description: 'Disabled and read-only field fill. Never more prominent than an enabled field.' },
  { name: '--color-bg-layout-bg-sidebar', description: 'Sidebar navigation background.' },
  { name: '--color-bg-layout-bg-sidebar-selected', description: 'Selected sidebar item background.' },
]);

const TEXT_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-text-text', description: 'Default body/heading text color.' },
  { name: '--color-text-text-subtle', description: 'De-emphasized text — captions, helper text, metadata.' },
  { name: '--color-text-text-placeholder', description: 'Placeholder text in fields; clearly dimmer than a typed value in both themes.' },
  { name: '--color-text-text-link', description: 'Hyperlink text color.' },
  { name: '--color-text-text-on-dark', description: 'Text on a dark or colored fill, such as danger. Same in both themes. On the primary fill use text-on-primary: it follows the product theme.' },
  { name: '--color-text-text-link-on-dark', description: 'Link text for use on a dark/colored fill.' },
  { name: '--color-text-text-subtle-on-dark', description: 'De-emphasized text for use on a dark/colored fill.' },
]);

const BORDER_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-border-border', description: 'Fields and controls — inputs, Select, outline buttons, chips.' },
  { name: '--color-border-border-subtle', description: 'Cards, tables, other bordered surfaces and the Sidebar / Topbar edges — halfway between border and subtler, so a table never reads like the inputs above it.' },
  { name: '--color-border-border-subtler', description: 'Dividers — Separator, lines between items inside a card or section.' },
  { name: '--color-border-border-strong', description: 'Strong border — the darkest neutral line, for the rare frame that has to stand out (Dropzone, outlined neutral BadgeIndicator).' },
]);

const CHART_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-bg-chart-01', description: 'Chart series 1 (blue); in light it matches --color-bg-primary-bg-primary. In dark all seven series share one lightness: 3.6:1 on the page, 3.2:1 on cards.' },
  { name: '--color-bg-chart-02', description: 'Chart series 2 (magenta). Line charts also give it a dash, DonutChart a pattern with slicePatterns.' },
  { name: '--color-bg-chart-03', description: 'Chart series 3 (teal).' },
  { name: '--color-bg-chart-04', description: 'Chart series 4 (slate).' },
  { name: '--color-bg-chart-05', description: 'Chart series 5 (red).' },
  { name: '--color-bg-chart-06', description: 'Chart series 6 (green).' },
  { name: '--color-bg-chart-07', description: 'Chart series 7 (purple).' },
]);

/**
 * The bg-{tone}-bg-{tone}-status family (2026-09-26 addition, see overview.md):
 * one ramp step LIGHTER than the plain solid bg-{tone}-bg-{tone} fill —
 * canonical for a small/decorative tone indicator (StatusDot, Timeline,
 * BadgeIndicator), never a large surface. No neutral-status counterpart
 * exists by design (neutral uses icon-icon-subtle or a hardcoded base
 * instead, since a small isolated element needs a background that reads
 * the same regardless of backdrop, which alpha-neutral can't guarantee).
 */
const STATUS_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-bg-primary-bg-primary-status', description: 'One step lighter than the solid primary fill — small/decorative tone indicators only (StatusDot, Timeline, BadgeIndicator).' },
  { name: '--color-bg-info-bg-info-status', description: 'Info counterpart of the -status family — same small-indicator use as primary-status.' },
  { name: '--color-bg-success-bg-success-status', description: 'Success counterpart of the -status family. Same value in both themes.' },
  { name: '--color-bg-warning-bg-warning-status', description: 'Warning counterpart of the -status family.' },
  { name: '--color-bg-danger-bg-danger-status', description: 'Danger counterpart of the -status family. Same value in both themes.' },
]);

const ALL_TOKEN_ROWS: TokenRow[] = [...BG_TOKEN_ROWS, ...STATUS_TOKEN_ROWS, ...TEXT_TOKEN_ROWS, ...BORDER_TOKEN_ROWS, ...CHART_TOKEN_ROWS];


function RampSwatch({ prefix, step }: { prefix: string; step: string }) {
  const varName = `--color-${prefix}-${prefix}-${step}`;
  // Border only if the step is literal/near-white — Мария's refined rule
  // (2026-09-26): not "light", only white actually blends with the page.
  const literalHex = PRIMITIVE_HEX[prefix]?.[RAMP_STEPS.indexOf(step)];
  const needsBorder = literalHex ? isWhiteish(literalHex) : false;
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`h-12 rounded-[var(--size-border-radius-border-radius-xl)]${needsBorder ? ' border border-solid border-[var(--color-border-border-subtle)]' : ''}`}
        style={{ background: `var(${varName})` }}
      />
      <p className="m-0 text-center font-mono text-body-xs text-[var(--color-text-text-subtle)]">{step}</p>
    </div>
  );
}

/**
 * All 11 primitive color families that exist in @theya/tokens (confirmed
 * via variables.css, 2026-09-26). Primitives are theme-invariant — same
 * hex in variables.css and variables-dark.css — so a single ramp per
 * family, not a light/dark pair, is correct here (unlike the semantic
 * TokenTable above).
 */
const RAMP_FAMILIES = [
  { prefix: 'blue', label: 'Blue (Brand)' },
  { prefix: 'gray', label: 'Gray (Neutral)' },
  { prefix: 'cyan', label: 'Cyan' },
  { prefix: 'green', label: 'Green' },
  { prefix: 'magenta', label: 'Magenta' },
  { prefix: 'orange', label: 'Orange' },
  { prefix: 'purple', label: 'Purple' },
  { prefix: 'red', label: 'Red' },
  { prefix: 'slate', label: 'Slate' },
  { prefix: 'teal', label: 'Teal' },
  { prefix: 'yellow', label: 'Yellow' },
] as const;

function RampFamily({ prefix, label }: { prefix: string; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-body-m font-medium text-[var(--color-text-text)]">
        {label} <span className="font-mono text-body-s font-normal text-[var(--color-text-text-subtle)]">--color-{prefix}-{prefix}-*</span>
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {RAMP_STEPS.map((step) => (
          <RampSwatch key={step} prefix={prefix} step={step} />
        ))}
      </div>
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <DocsPage
      title="Colors"
      description="Semantic tokens are what components use; each one points at a step of a primitive ramp, with a separate value for light and dark. Values are read from the token build, so they can't drift from it."
    >
      <DocsSection title="Semantic tokens" description="Fills, status fills, text, borders and the chart palette, with the light and dark value of each. Filter by name or description.">
        <TokenTable rows={ALL_TOKEN_ROWS} />
      </DocsSection>
      <DocsSection
        title="Primitive ramps"
        description="Twelve colour families, each a 12-step scale from 005 to 900. Primitives are the same in both themes; only the semantic tokens above change."
      >
        <div className="flex flex-col gap-6">
          {RAMP_FAMILIES.map((f) => (
            <RampFamily key={f.prefix} prefix={f.prefix} label={f.label} />
          ))}
        </div>
      </DocsSection>
      <DocsSection
        title="Chart palette"
        description={
          <>
            <Code>--color-bg-chart-01…07</Code>: categorical series colours, shared by every chart. 01 is the same blue as <Code>--color-bg-primary-bg-primary</Code>.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {CHART_TOKEN_ROWS.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <TokenPill value={r.light} />
              <span className="text-center font-mono text-body-xs text-[var(--color-text-text-subtle)]">{r.name.replace('--color-bg-chart-', 'Chart ')}</span>
            </div>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  ),
};

// One row of a type scale: class, sample, size / line height / weight.
function ScaleRow({ name, sampleClass, sample, values }: { name: string; sampleClass: string; sample: string; values: { size: string; lineHeight: string; weight: number } }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-solid border-[var(--color-border-border-subtler)] py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
      <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">{name}</span>
      <span className={`${sampleClass} min-w-0 truncate text-[var(--color-text-text)]`}>{sample}</span>
      <span className="col-start-2 font-mono text-body-s text-[var(--color-text-text-subtler)] sm:col-start-auto">
        {values.size} / {values.lineHeight} · weight {values.weight}
      </span>
    </div>
  );
}

export const Typography: Story = {
  render: () => (
    <DocsPage
      title="Typography"
      description="Two families and two scales: body for anything people read, heading for titles. Each class sets size, line height, letter spacing and weight together."
    >
      <DocsSection
        title="Font families"
        description={
          <>
            <Code>--font-body</Code>, <Code>--font-heading</Code> and <Code>--font-code</Code>. Code text uses <Code>font-mono</Code>, which globals.css points at <Code>--font-code</Code>.
          </>
        }
      >
        <div className="flex flex-col">
          {[
            { v: '--font-body', name: tokenValue('--typography-font-family-body').split(',')[0], sample: 'The quick brown fox jumps over the lazy dog · Съешь ещё этих мягких булок' },
            { v: '--font-heading', name: tokenValue('--typography-font-family-heading').split(',')[0], sample: 'The quick brown fox jumps over the lazy dog · Съешь ещё этих мягких булок' },
            { v: '--font-code', name: 'Fira Code', sample: 'The quick brown fox jumps over the lazy dog' },
          ].map((f) => (
            <div key={f.v} className="flex flex-col gap-1 border-b border-solid border-[var(--color-border-border-subtler)] py-3 first:pt-0 last:border-b-0 last:pb-0">
              <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">
                {f.v} · {f.name}
              </span>
              <span style={{ fontFamily: `var(${f.v})` }} className="text-body-xl text-[var(--color-text-text)]">
                {f.sample}
              </span>
            </div>
          ))}
        </div>
      </DocsSection>
      <DocsSection title="Body scale" description={<><Code>text-body-xs</Code> to <Code>text-body-xl</Code>.</>}>
        <div className="flex flex-col">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <ScaleRow key={size} name={`text-body-${size}`} sampleClass={BODY_CLASS[size]} sample="The quick brown fox jumps over the lazy dog" values={BODY_TYPE_VALUES[size]} />
          ))}
        </div>
      </DocsSection>
      <DocsSection title="Heading scale" description={<><Code>text-heading-3xs</Code> to <Code>text-heading-3xl</Code>.</>}>
        <div className="flex flex-col">
          {(['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'] as const).map((size) => (
            <ScaleRow key={size} name={`text-heading-${size}`} sampleClass={HEADING_CLASS[size]} sample={size === '3xl' ? 'Quick fox' : 'The quick brown fox'} values={HEADING_TYPE_VALUES[size]} />
          ))}
        </div>
      </DocsSection>
      <DocsSection
        title="Font weights"
        description={
          <>
            Each body size has three weights as separate tokens — base, emphasize and strong: <Code>--typography-body-m-weight(-emphasize|-strong)</Code>.
          </>
        }
      >
        <div className="flex flex-col">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-solid border-[var(--color-border-border-subtler)] py-3 first:pt-0 last:border-b-0 last:pb-0">
              <span className="w-32 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtle)]">body-{size}</span>
              <span className={`${BODY_CLASS[size]} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight)` }}>
                Base
              </span>
              <span className={`${BODY_CLASS[size]} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight-emphasize)` }}>
                Emphasize
              </span>
              <span className={`${BODY_CLASS[size]} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight-strong)` }}>
                Strong
              </span>
            </div>
          ))}
        </div>
      </DocsSection>
      <DocsSection
        title="Letter spacing"
        description={
          <>
            Each body size has its own tracking and a wider step for all-caps labels: <Code>--typography-body-m-letter-spacing(-uppercase)</Code>.
          </>
        }
      >
        <div className="flex flex-col">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-solid border-[var(--color-border-border-subtler)] py-3 first:pt-0 last:border-b-0 last:pb-0">
              <span className="w-32 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtle)]">body-{size}</span>
              <span className={`${BODY_CLASS[size]} text-[var(--color-text-text)]`} style={{ letterSpacing: `var(--typography-body-${size}-letter-spacing)` }}>
                Tracking
              </span>
              <span className={`${BODY_CLASS[size]} uppercase text-[var(--color-text-text)]`} style={{ letterSpacing: `var(--typography-body-${size}-letter-spacing-uppercase)` }}>
                Uppercase tracking
              </span>
            </div>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  ),
};

const RADIUS_ROWS: SpecRow[] = [
  { token: 'radius-sm', value: tokenValue('--size-border-radius-border-radius-sm'), use: 'The smallest inner details.', usedBy: 'Kbd, Toolbar, inner parts of Card, DataTable, Sonner' },
  { token: 'radius-md', value: tokenValue('--size-border-radius-border-radius-md'), use: 'Items inside a container and small controls.', usedBy: 'Menu and list items, Checkbox, Tooltip, Toggle, Tabs triggers, Sidebar items, Command' },
  { token: 'radius-lg', value: tokenValue('--size-border-radius-border-radius-lg'), use: 'Text inputs and input-like controls.', usedBy: 'TextField, Select trigger, Combobox, Autocomplete, NumberField, InputGroup, InputOTP, Password, Filter, Chip' },
  { token: 'radius-xl', value: tokenValue('--size-border-radius-border-radius-xl'), use: 'Buttons, and floating surfaces anchored to a trigger. A menu under a button is never rounder than the button.', usedBy: 'Button, DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select content, CodeBlock, CodeEditor, Terminal' },
  { token: 'radius-2xl', value: tokenValue('--size-border-radius-border-radius-2xl'), use: 'Compact card surfaces on a page.', usedBy: 'Card, Table, DataTable, Alert, Stat, Attachment, OptionCard, Dropzone, File, charts, Patterns blocks' },
  { token: 'radius-3xl', value: tokenValue('--size-border-radius-border-radius-3xl'), use: 'Dialogs and full-height panels.', usedBy: 'Dialog, AlertDialog, Drawer, LoginFormSplit' },
  { token: 'radius-4xl', value: tokenValue('--size-border-radius-border-radius-4xl'), use: 'Reserved for large containers.', usedBy: 'Not used by components yet' },
  { token: 'radius-5xl', value: tokenValue('--size-border-radius-border-radius-5xl'), use: 'Reserved for large decorative shapes.', usedBy: 'Not used by components yet' },
  { token: 'radius-max', value: tokenValue('--size-border-radius-border-radius-max'), use: 'Pills and round shapes.', usedBy: 'Badge, Progress, Switch, Slider, StatusDot, Stepper' },
];

const RADIUS_STEPS = [
  ['sm', 2], ['md', 4], ['lg', 6], ['xl', 8], ['2xl', 10], ['3xl', 12], ['4xl', 16], ['5xl', 32], ['max', 100],
] as const;

const radius = (step: string) => `var(--size-border-radius-border-radius-${step})`;

export const BorderRadius: Story = {
  name: 'Border radius',
  render: () => (
    <DocsPage
      title="Border radius"
      description={
        <>
          Nine steps. The radius grows with the size of the surface and with how far it sits from the page: a dialog is rounder than the card inside it, the card rounder than its button, the button rounder than its input. Token names below are shortened; the full name is <Code>--size-border-radius-border-radius-{'{step}'}</Code>.
        </>
      }
    >
      {/* Nested demo: each level uses its own tier, outermost first. */}
      <Preview muted>
        <div className="flex max-w-md flex-col gap-4 bg-[var(--color-bg-surface-bg-surface)] p-5 shadow-elevation-xl" style={{ borderRadius: radius('3xl') }}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-body-l font-semibold text-[var(--color-text-text)]">Dialog</span>
            <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">3xl · 12px</span>
          </div>
          <div className="flex flex-col gap-3 border border-solid border-[var(--color-border-border-subtle)] p-4" style={{ borderRadius: radius('2xl') }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-body-m font-medium text-[var(--color-text-text)]">Card</span>
              <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">2xl · 10px</span>
            </div>
            <div className="flex h-10 items-center justify-between gap-3 border border-solid border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)] px-3" style={{ borderRadius: radius('lg') }}>
              <span className="text-body-m text-[var(--color-text-text-subtle)]">Input</span>
              <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">lg · 6px</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-3 py-2">
              <span className="text-body-m text-[var(--color-text-text)]">List item</span>
              <span className="flex items-center gap-2">
                <kbd className="border border-solid border-[var(--color-border-border)] px-1.5 font-mono text-body-s text-[var(--color-text-text-subtle)]" style={{ borderRadius: radius('sm') }}>K</kbd>
                <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">md · 4px, key sm · 2px</span>
              </span>
            </div>
            <div className="flex h-10 items-center justify-between gap-3 bg-[var(--color-bg-primary-bg-primary)] px-4" style={{ borderRadius: radius('xl') }}>
              <span className="text-body-m text-[var(--color-text-text-on-primary)]">Button</span>
              <span className="font-mono text-body-s text-[var(--color-text-text-on-primary)]">xl · 8px</span>
            </div>
          </div>
        </div>
      </Preview>

      <div className="flex flex-wrap gap-5">
        {RADIUS_STEPS.map(([step, px]) => (
          <div key={step} className="flex flex-col items-center gap-2">
            <div className="size-16 border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]" style={{ borderRadius: radius(step) }} />
            <span className="font-mono text-body-s text-[var(--color-text-text)]">{step}</span>
            <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">{px}px</span>
          </div>
        ))}
      </div>

      <SpecTable label="Radius tokens" rows={RADIUS_ROWS} />

      <Note>
        Tailwind's <Code>rounded-*</Code> names are shifted against the token names: <Code>rounded-sm</Code> is token md (4px), <Code>rounded-lg</Code> is lg (6px), <Code>rounded-xl</Code> is xl (8px). Plain <Code>rounded</Code> and <Code>rounded-md</Code> are not bridged at all and fall back to Tailwind's own 4px and 6px. In components, write the token form: <Code>rounded-[var(--size-border-radius-border-radius-lg)]</Code>.
      </Note>
    </DocsPage>
  ),
};

const FOCUS_ROWS: SpecRow[] = [
  { token: '--color-focus-focus-ring', value: tokenValue('--color-focus-focus-ring'), use: 'Default ring for every interactive control.', usedBy: 'Almost every control' },
  { token: '--color-focus-focus-ring-error', value: tokenValue('--color-focus-focus-ring-error'), use: 'Invalid fields, together with the danger border and background.', usedBy: 'TextField, Textarea, Select, Combobox, Autocomplete, DatePicker, NumberField, InputGroup, InputOTP, PromptArea, Slider' },
  { token: '--color-focus-focus-ring-success', value: tokenValue('--color-focus-focus-ring-success'), use: 'Fields and cards in a success state.', usedBy: 'Card (success tone)' },
  { token: '--color-focus-focus-ring-warning', value: tokenValue('--color-focus-focus-ring-warning'), use: 'Fields and cards in a warning state.', usedBy: 'Card (warning tone)' },
  { token: '--color-focus-focus-ring-on-primary', value: tokenValue('--color-focus-focus-ring-on-primary'), use: 'Controls that sit on a primary-filled surface. Invisible on the plain page by design.', usedBy: 'Checkbox (checked), DataTableToolbar bulk bar' },
];

const FOCUS_DEMO = [
  { tone: 'default', label: 'Default', ring: 'var(--color-focus-focus-ring)', border: 'var(--color-border-border-primary)', onPrimary: false },
  { tone: 'error', label: 'Error', ring: 'var(--color-focus-focus-ring-error)', border: 'var(--color-border-border-danger)', onPrimary: false },
  { tone: 'success', label: 'Success', ring: 'var(--color-focus-focus-ring-success)', border: 'var(--color-border-border-success)', onPrimary: false },
  { tone: 'warning', label: 'Warning', ring: 'var(--color-focus-focus-ring-warning)', border: 'var(--color-border-border-warning)', onPrimary: false },
  { tone: 'on-primary', label: 'On primary', ring: 'var(--color-focus-focus-ring-on-primary)', border: 'transparent', onPrimary: true },
] as const;

const FOCUS_RULES = [
  <>The ring is a 4px box-shadow outside the element: <Code>focus-visible:focus-ring</Code>. It follows the element's border radius on its own.</>,
  <>Use the inset ring (<Code>focus-ring-inset</Code>, 4px inside) only where an outer ring would be clipped by overflow: Tree rows and underline Tabs, whose list scrolls sideways. Tables, CodeBlock and Terminal use the outer ring.</>,
  <>Text fields show the ring on any focus, including a mouse click. Buttons and other controls show it on keyboard focus only (<Code>focus-visible</Code>).</>,
  <>Fields pair the soft ring with a solid border colour. The border is what meets the 3:1 contrast requirement; the ring alone does not.</>,
  <>The ring tone follows the state: error for invalid, success or warning for validated states, on-primary on primary-filled surfaces.</>,
];

export const FocusRing: Story = {
  name: 'Focus ring',
  render: () => (
    <DocsPage
      title="Focus ring"
      description="Five ring tokens, one per state. The previews show each ring at rest; the button under each one lets you check it with Tab."
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
        {FOCUS_DEMO.map(({ tone, label, ring, border, onPrimary }) => (
          <div
            key={tone}
            className={`flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] p-4 ${
              onPrimary ? 'bg-[var(--color-bg-primary-bg-primary)]' : 'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]'
            }`}
          >
            <span className={`text-body-m font-medium ${onPrimary ? 'text-[var(--color-text-text-on-primary)]' : 'text-[var(--color-text-text)]'}`}>{label}</span>
            {/* Static preview: the ring exactly as it renders on focus. */}
            <div
              className={`flex h-10 items-center rounded-[var(--size-border-radius-border-radius-lg)] border border-solid px-3 text-body-m ${
                onPrimary ? 'bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)]' : 'bg-[var(--color-bg-input-bg-input)] text-[var(--color-text-text-subtle)]'
              }`}
              style={{ borderColor: border, boxShadow: `0 0 0 4px ${ring}` }}
            >
              Focused
            </div>
            <button
              type="button"
              className={`w-fit rounded-[var(--size-border-radius-border-radius-xl)] px-3 py-1.5 text-body-s outline-none ${
                onPrimary ? 'bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)]' : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text)]'
              }`}
              style={{ ['--demo-ring' as string]: ring }}
              data-focus-demo=""
            >
              Tab to me
            </button>
          </div>
        ))}
      </div>

      <DocsSection title="Outside or inset">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex h-10 w-48 items-center rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-primary)] bg-[var(--color-bg-input-bg-input)] px-3 text-body-m text-[var(--color-text-text-subtle)] focus-ring">
              Outside, 4px
            </div>
            <span className="text-body-s text-[var(--color-text-text-subtle)]">Default for standalone controls.</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-56 overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
              <div className="border-b border-solid border-[var(--color-border-border-subtler)] px-3 py-2 text-body-m text-[var(--color-text-text)]">Row</div>
              <div className="px-3 py-2 text-body-m text-[var(--color-text-text)] focus-ring-inset">Focused row, inset 4px</div>
              <div className="border-t border-solid border-[var(--color-border-border-subtler)] px-3 py-2 text-body-m text-[var(--color-text-text)]">Row</div>
            </div>
            <span className="text-body-s text-[var(--color-text-text-subtle)]">Inside containers that clip overflow.</span>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Tokens">
        <SpecTable label="Focus ring tokens" rows={FOCUS_ROWS} />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className={LIST}>
          {FOCUS_RULES.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
        <Note>
          Every ring is 4px, Button, Card and Slider included. The soft ring's contrast is an accepted deviation from WCAG 1.4.11, listed on the Accessibility page.
        </Note>
      </DocsSection>
      {/* Demo-only: apply the per-card ring on keyboard focus. */}
      <style>{`[data-focus-demo]:focus-visible { box-shadow: 0 0 0 4px var(--demo-ring); }`}</style>
    </DocsPage>
  ),
};

/* ---------------------------- Elevation ---------------------------- */

// "2 layers, 28px blur, 14%" — summarized from the built shadow value.
function shadowSummary(name: string): string {
  const layers = tokenValue(name).split(/,(?![^(]*\))/).map((l) => l.trim());
  const blur = Math.max(...layers.map((l) => parseFloat(l.split(/\s+/)[2]) || 0));
  const alpha = Math.max(...layers.map((l) => parseFloat(l.match(/rgba?\([^)]*,\s*([\d.]+)\)/)?.[1] ?? '0')));
  return `${layers.length} layer${layers.length > 1 ? 's' : ''}, ${blur}px blur, ${Math.round(alpha * 100)}%`;
}

const ELEVATION_ROWS: SpecRow[] = [
  { token: 'shadow-elevation-xs', value: shadowSummary('--elevation-xs'), use: 'A surface that sits in the page flow and only needs to lift off the background.', usedBy: 'Stat, CodeBlock, CodeEditor, Terminal; Card at rest through shadow-card' },
  { token: 'shadow-elevation-sm', value: shadowSummary('--elevation-sm'), use: 'Small raised details inside a control or a layout.', usedBy: 'Alert, Sidebar, Menubar trigger; through the state tokens: Switch and Slider thumbs, the active Tabs chip, Card on hover' },
  { token: 'shadow-elevation-md', value: shadowSummary('--elevation-md'), use: 'Floating controls and short hints that hover over content.', usedBy: 'Tooltip, floating scroll buttons, DataTableToolbar bulk bar' },
  { token: 'shadow-elevation-lg', value: shadowSummary('--elevation-lg'), use: 'Surfaces that drop out of a trigger: menus, popovers, listboxes.', usedBy: 'DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select, chart tooltips' },
  { token: 'shadow-elevation-xl', value: shadowSummary('--elevation-xl'), use: 'Modal layers that take over the page.', usedBy: 'Dialog, AlertDialog, Drawer (side), PushSheet, Sonner' },
  { token: 'shadow-elevation-edge-up', value: shadowSummary('--elevation-edge-up'), use: 'A panel pinned to the bottom edge: the shadow falls up onto the content it covers.', usedBy: 'Drawer (bottom)' },
];

// "none" or "= elevation-sm" in the default theme; another theme may give any shadow.
function stateShadowSummary(name: string): string {
  const v = tokenValue(name);
  for (const step of ['xs', 'sm', 'md', 'lg', 'xl']) if (v === tokenValue(`--elevation-${step}`)) return `= elevation-${step}`;
  const alphas = [...v.matchAll(/rgba?\([^)]*,\s*([\d.]+)\)/g)].map((m) => Number(m[1]));
  return alphas.length > 0 && alphas.every((a) => a === 0) ? 'none' : shadowSummary(name);
}

const STATE_SHADOW_ROWS: SpecRow[] = [
  { token: 'shadow-control', value: stateShadowSummary('--shadow-control'), use: 'A pressable control at rest.', usedBy: 'Button, Toggle, ToggleGroup, pressable Chip, Tabs trigger' },
  { token: 'shadow-control-hover', value: stateShadowSummary('--shadow-control-hover'), use: 'The same control under the pointer.', usedBy: 'Button, Toggle, ToggleGroup, pressable Chip, Tabs trigger' },
  { token: 'shadow-control-pressed', value: stateShadowSummary('--shadow-control-pressed'), use: 'Pressed, or switched on.', usedBy: 'Button (active), Toggle and ToggleGroup (on), Chip (pressed)' },
  { token: 'shadow-field', value: stateShadowSummary('--shadow-field'), use: 'A field you type into or pick from. Inset in a sunken style.', usedBy: 'TextField, TextArea, Select, NumberField, InputGroup, Autocomplete, Combobox, DatePicker, Filter, FilterField, InputOTP, PromptArea, RichTextEditor, TagInput' },
  { token: 'shadow-track', value: stateShadowSummary('--shadow-track'), use: 'A track or box that holds a value. Inset in a sunken style.', usedBy: 'Switch and Slider tracks, Checkbox and Radio boxes, OptionCard control, Tabs chips list' },
  { token: 'shadow-thumb', value: stateShadowSummary('--shadow-thumb'), use: 'The handle you drag or flip.', usedBy: 'Switch and Slider thumbs' },
  { token: 'shadow-thumb-hover', value: stateShadowSummary('--shadow-thumb-hover'), use: 'The handle under the pointer.', usedBy: 'Slider thumb' },
  { token: 'shadow-raised', value: stateShadowSummary('--shadow-raised'), use: 'An item raised out of its track.', usedBy: 'Active Tabs chip' },
  { token: 'shadow-card', value: stateShadowSummary('--shadow-card'), use: 'A card at rest.', usedBy: 'Card' },
  { token: 'shadow-card-hover', value: stateShadowSummary('--shadow-card-hover'), use: 'An interactive card under the pointer.', usedBy: 'Card (action, href, filter)' },
];

const ELEVATION_DEMO = [
  { s: 'xs', label: 'Stat', cls: 'shadow-elevation-xs' },
  { s: 'sm', label: 'Alert', cls: 'shadow-elevation-sm' },
  { s: 'md', label: 'Tooltip', cls: 'shadow-elevation-md' },
  { s: 'lg', label: 'Menu', cls: 'shadow-elevation-lg' },
  { s: 'xl', label: 'Dialog', cls: 'shadow-elevation-xl' },
] as const;

export const Elevation: Story = {
  render: () => (
    <DocsPage
      title="Elevation"
      description={
        <>
          Five shadow steps, tinted toward slate-900 in light and black with a faint light rim on floating layers in dark. The higher the step, the further the surface is from the page; lg and xl add a 1px ambient layer because they float. Use as <Code>shadow-elevation-{'{xs|sm|md|lg|xl}'}</Code>; <Code>shadow-elevation-edge-up</Code> for a panel pinned to the bottom edge.
        </>
      }
    >
      <Preview muted className="grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:gap-8">
        {ELEVATION_DEMO.map(({ s, label, cls }) => (
          <div
            key={s}
            className={`flex h-24 flex-col justify-between rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] p-3 sm:w-36 ${cls}`}
          >
            <span className="text-body-m font-medium text-[var(--color-text-text)]">{label}</span>
            <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">elevation-{s}</span>
          </div>
        ))}
      </Preview>
      <SpecTable label="Elevation tokens" rows={ELEVATION_ROWS} valueLabel="Shadow" />
      <Note>
        Values live in <Code>@theya/tokens</Code> (<Code>--elevation-*</Code>). Focus rings are also drawn with box-shadow, but they are a separate scale: see Focus ring.
      </Note>
      <SpecTable label="State shadow tokens" rows={STATE_SHADOW_ROWS} valueLabel="Default theme" />
      <Note>
        State shadows say what a control's shadow is in each state, so a theme can change how controls are lifted or sunk (a Neumorphism theme draws shape with shadows) without touching the components. The default theme keeps today's look. They are drawn in a slot of their own, so they stack with the focus ring, a ring or a <Code>shadow-elevation-*</Code> on the same element instead of replacing it. Values: <Code>--shadow-*</Code> in <Code>@theya/tokens</Code>.
      </Note>
    </DocsPage>
  ),
};

/* ------------------------------ Motion ----------------------------- */

const DURATION_ROWS: SpecRow[] = [
  { token: 'duration-fast', value: tokenValue('--motion-duration-fast'), use: 'Micro feedback on the control itself.', usedBy: 'Radio and Switch check marks, erasing a Checkbox tick' },
  { token: 'duration-standard', value: tokenValue('--motion-duration-standard'), use: 'Default for hover, color, border and focus changes.', usedBy: 'Almost every component' },
  { token: 'duration-moderate', value: tokenValue('--motion-duration-moderate'), use: 'Overlays appearing, content expanding or collapsing.', usedBy: 'Dialog, AlertDialog, Accordion, Collapsible, Carousel, CopyButton icons' },
  { token: 'duration-slow', value: tokenValue('--motion-duration-slow'), use: 'Value changes and large panels.', usedBy: 'Progress, Meter, PushSheet, Tabs underline, Stepper, drawing a Checkbox tick' },
  { token: 'duration-slower', value: tokenValue('--motion-duration-slower'), use: 'Landing-page entrances: content revealed on scroll, letters rising in.', usedBy: 'Reveal, TextEffect, the menu Bloom, SuccessCheck, Fab lift, Tabs chips pill' },
];

const EASING_ROWS: SpecRow[] = [
  { token: 'ease-enter', value: tokenValue('--motion-easing-enter'), use: 'Things appearing and hover states. The default.', usedBy: 'Almost every transition' },
  { token: 'ease-exit', value: tokenValue('--motion-easing-exit'), use: 'Things leaving. Pair with ease-enter on the same element.', usedBy: 'Dialog, AlertDialog' },
  { token: 'ease-spring', value: tokenValue('--motion-easing-spring'), use: 'Selection feedback with a small overshoot.', usedBy: 'Radio, Switch, Button, Chip, Rating, NumberField, TagInput, BadgeIndicator, SwatchPicker, Fab, FabSpeedDial, WheelPicker' },
  { token: 'ease-press', value: tokenValue('--motion-easing-press'), use: 'Pressing a button down and releasing it.', usedBy: 'Button' },
  { token: 'ease-glide', value: tokenValue('--motion-easing-glide'), use: 'A long, soft settle for larger moves on landing pages. No overshoot.', usedBy: 'Reveal, Marquee, Tabs underline, the menu Bloom, Progress, Stepper, SuccessCheck' },
];

const BUILT_IN_ROWS: SpecRow[] = [
  { token: 'Checkbox', value: 'tick drawn on', use: 'Its stroke draws in instead of popping.', usedBy: 'Kinetics · Checkbox Draw' },
  { token: 'Switch', value: 'thumb squish', use: 'The thumb stretches while pressed, then springs across.', usedBy: 'Common pattern' },
  { token: 'Tabs', value: 'gliding marker', use: 'The underline (or the chips pill) moves to the active tab; chips also preview the hovered one.', usedBy: 'Kinetics · Tab Pill Glide, Snap Rail' },
  { token: 'Menus', value: 'Bloom', use: 'DropdownMenu, ContextMenu, Menubar, Select and Popover unfold from the trigger side; items slide in one by one.', usedBy: 'Kinetics · Command Palette Bloom' },
  { token: 'Spinner', value: 'growing arc', use: 'Button loading, Combobox, Autocomplete, Command, Dropzone.', usedBy: 'CSS Loaders · Meridian' },
  { token: 'Skeleton', value: 'sweep', use: 'A soft highlight runs across the fully rounded placeholder.', usedBy: 'Kinetics · Skeleton Sweep' },
  { token: 'Progress', value: 'sweep, segments', use: 'An indeterminate bar sweeps; segments fill one after another.', usedBy: 'Kinetics · Indeterminate Bar, Segment Loader' },
  { token: 'Stepper', value: 'fill, pop', use: 'The segment fills green, then the new current step pops.', usedBy: 'Kinetics · Step Progress' },
  { token: 'Form', value: 'shake', use: 'A failed submit shakes each invalid field once.', usedBy: 'Kinetics · Error Shake' },
  { token: 'Chip, Rating, SwatchPicker', value: 'pop', use: 'The chosen item springs up; Rating stars light up in turn and the picked one throws sparks.', usedBy: 'Kinetics · Choice Chips, Star Rating, Swatch Picker' },
  { token: 'NumberField, BadgeIndicator', value: 'pop', use: 'The number pops when it changes.', usedBy: 'Kinetics · Quantity Stepper, Badge Counter' },
  { token: 'TagInput', value: 'pop in / out', use: 'Tags pop in when added and out when removed.', usedBy: 'Kinetics · Tag Input' },
  { token: 'CopyButton, Button success', value: 'icon morph, tick', use: 'The copy icon turns into a check; success draws a tick.', usedBy: 'Kinetics · Copy Button, Status Pill' },
  { token: 'SuccessCheck, toast.success', value: 'ring and tick drawn', use: 'A success icon that draws itself once.', usedBy: 'Kinetics · Success Check' },
  { token: 'undoToast', value: 'draining bar', use: 'Shows the time left to undo; pauses on hover.', usedBy: 'Kinetics · Undo Snackbar' },
  { token: 'Fab', value: 'lift', use: 'Rises 4px on hover as its shadow grows.', usedBy: 'Kinetics · Hover Lift' },
];

const DURATION_DEMO = [
  { name: 'fast', ms: 100 },
  { name: 'standard', ms: 150 },
  { name: 'moderate', ms: 200 },
  { name: 'slow', ms: 300 },
  { name: 'slower', ms: 450 },
] as const;
const DURATION_MAX = 450;

const EASING_DEMO = [
  { name: 'enter', curve: 'var(--ease-enter)' },
  { name: 'exit', curve: 'var(--ease-exit)' },
  { name: 'spring', curve: 'var(--ease-spring)' },
  { name: 'press', curve: 'var(--ease-press)' },
  { name: 'glide', curve: 'var(--ease-glide)' },
] as const;

export const Motion: Story = {
  render: () => (
    <DocsPage
      title="Motion"
      description={
        <>
          Five durations and five easing curves: <Code>duration-{'{fast|standard|moderate|slow|slower}'}</Code> and <Code>ease-{'{enter|exit|spring|press|glide}'}</Code>. Components already move on their own (see Built in, below); the Motion presets add landing-page effects; Motion › Micro-interactions is the library of every effect, built in or not. Every transition or animation has a reduced-motion guard.
        </>
      }
    >
      <DocsSection title="Duration">
        <Preview className="flex flex-col gap-4">
          {DURATION_DEMO.map(({ name, ms }) => (
            <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 sm:flex">
              <span className="font-mono text-body-s text-[var(--color-text-text-subtle)] sm:w-36 sm:shrink-0">duration-{name}</span>
              <div className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] sm:order-none sm:flex-1">
                <div className="h-full rounded-full bg-[var(--color-bg-primary-bg-primary)]" style={{ width: `${(ms / DURATION_MAX) * 100}%` }} />
              </div>
              <span className="text-right font-mono text-body-s text-[var(--color-text-text-subtle)] sm:w-14 sm:shrink-0">{ms}ms</span>
            </div>
          ))}
        </Preview>
        <SpecTable label="Duration tokens" rows={DURATION_ROWS} />
      </DocsSection>

      <DocsSection title="Easing">
        <Preview className="flex flex-col gap-4">
          {EASING_DEMO.map(({ name, curve }) => (
            <div key={name} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <span className="font-mono text-body-s text-[var(--color-text-text-subtle)] sm:w-36 sm:shrink-0">ease-{name}</span>
              <div className="relative h-4 sm:flex-1">
                <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border-border-subtler)]" />
                <div className="theya-slide absolute top-0 size-4 rounded-full bg-[var(--color-bg-primary-bg-primary)]" style={{ animationTimingFunction: curve }} />
              </div>
            </div>
          ))}
        </Preview>
        <SpecTable label="Easing tokens" rows={EASING_ROWS} valueLabel="Curve" />
      </DocsSection>

      <DocsSection
        title="Built in"
        description={
          <>
            These move without any prop. Keyframes live in <Code>src/styles/motion.css</Code>; most are adapted from Kinetics and CSS Loaders (MIT, see THIRD-PARTY-NOTICES.md).
          </>
        }
      >
        <SpecTable label="Built-in motion" rows={BUILT_IN_ROWS} tokenLabel="Component" valueLabel="What moves" usedByLabel="Adapted from" />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className={LIST}>
          <li>Motion answers an action or a change of state. Nothing animates on first render: a chip that starts selected or the starting step of a Stepper stays still.</li>
          <li>Short and once: feedback stays under half a second. Anything that repeats stops on its own within 5 seconds (BadgeIndicator pulse rings three times) or has a pause (Marquee) — WCAG 2.2.2.</li>
          <li>Reduced motion: transitions and one-off effects are dropped and the end state shows at once; loaders don’t freeze but fade slowly; a timer (undoToast’s bar) keeps running, because it is information.</li>
          <li>Nothing decorative moves on its own for more than 5 seconds: Border beam runs only while its card is hovered or focused, Aurora drifts once and rests, and Marquee, MarqueeColumns, CardStack, TickerList and OrbitCarousel's autoplay stop on hover and focus and have a Pause button. The one accepted exception is TextEffect's shimmer.</li>
          <li>In product UI: the motion built into components (the table above), AnimatedIcon, CountUp and ProgressRing for a headline number, SwipeDeck, and TickerList for a live feed.</li>
          <li>Landing and promo pages only: Reveal and RevealGroup, TextEffect, Marquee, MarqueeColumns, SurfaceEffect, Aurora, CardStack, CardFan, OrbitCarousel, and Neon glow and Float bob from Micro-interactions (they loop in the library demo; adopted, they stop within 5 seconds or get a pause). One showpiece per screen; never in forms, settings or tables.</li>
          <li>Landing performance: animate transform and opacity only, never width, height, top or margin, so nothing shifts the layout (CLS). The hero headline and main image show on first paint: no Reveal or TextEffect that starts hidden on the largest element above the fold (LCP). Heavier effects (OrbitCarousel, CardStack, a vivid Aurora) go below the fold.</li>
          <li>A new effect goes into Motion › Micro-interactions first, as a “Now / Variant” pair, and becomes a default only once it is chosen.</li>
        </ul>
        <Note>
          Values live in <Code>@theya/tokens</Code> (<Code>--motion-*</Code>). One value is off the scale on purpose: Button's press spring runs 220ms.
        </Note>
      </DocsSection>
      {/* Demo-only keyframes. The easing demo stops under prefers-reduced-motion. The track ends at 88% so ease-spring's overshoot stays inside the frame. */}
      <style>{`
        @keyframes theya-slide { from { left: 0; } to { left: calc(88% - 1rem); } }
        .theya-slide { animation: theya-slide 1.6s infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .theya-slide { animation: none; }
        }
      `}</style>
    </DocsPage>
  ),
};

/* ----------------------------- Layering ---------------------------- */

const LAYER_ROWS: SpecRow[] = [
  { token: '--z-index-sticky', value: tokenValue('--layer-sticky'), use: 'Headers and bars that stick while the page scrolls.', usedBy: 'Topbar' },
  { token: '--z-index-drawer', value: tokenValue('--layer-drawer'), use: 'Side and bottom panels that slide over the page.', usedBy: 'Drawer and PushSheet, backdrop and panel on the same layer' },
  { token: '--z-index-overlay', value: tokenValue('--layer-overlay'), use: 'The dimmed backdrop behind a modal.', usedBy: 'Dialog and AlertDialog backdrops' },
  { token: '--z-index-modal', value: tokenValue('--layer-modal'), use: 'Dialog content above its backdrop.', usedBy: 'Dialog, AlertDialog' },
  { token: '--z-index-popover', value: tokenValue('--layer-popover'), use: 'Anything anchored to a trigger. Also works inside a modal.', usedBy: 'Popover, DropdownMenu, ContextMenu, Menubar, HoverCard, Select. NavigationMenu renders in place with a local z-10' },
  { token: '--z-index-toast', value: tokenValue('--layer-toast'), use: 'Notifications that must stay visible over any open layer.', usedBy: 'Sonner (inline zIndex var(--z-index-toast))' },
  { token: '--z-index-tooltip', value: tokenValue('--layer-tooltip'), use: 'Tooltips. Always on top, because a tooltip belongs to whatever is under the cursor, including items inside menus and toasts.', usedBy: 'Tooltip, WorkspaceLayout skip link while focused' },
];

export const Layering: Story = {
  name: 'Layering (z-index)',
  render: () => (
    <DocsPage
      title="Layering (z-index)"
      description={
        <>
          One stacking order for every layer that floats above the page. Tailwind v4 has no z-index theme scale, so there are no short classes: use <Code>z-(--z-index-modal)</Code>, not <Code>z-modal</Code>.
        </>
      }
    >
      <SpecTable label="Layer tokens" rows={LAYER_ROWS} />
      <Note>
        Values live in <Code>@theya/tokens</Code> (<Code>--layer-*</Code>); globals.css maps them to the <Code>--z-index-*</Code> names above.
      </Note>

      <DocsSection title="Local stacking">
        <p className={TEXT}>
          <Code>z-[1]</Code>, <Code>z-[2]</Code> and <Code>z-10</Code> inside Card, charts, InputOTP, ToggleGroup and similar only order the parts of one component against each other. They never compete with the layers above, so they stay as plain numbers and are not tokens.
        </p>
      </DocsSection>

      <DocsSection title="Proof" description="The blue box comes first in the DOM and would lose under plain paint order, yet it renders on top because 600 is greater than 10.">
        <div className="relative h-24 w-full">
          <div className="absolute left-16 top-8 z-(--z-index-toast) flex h-16 w-40 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary)] font-mono text-body-s text-[var(--color-text-text-on-primary)]">
            z-(--z-index-toast)
          </div>
          <div className="absolute left-8 top-0 z-10 flex h-16 w-40 items-start rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-danger-bg-danger)] px-3 py-2 font-mono text-body-s text-[var(--color-text-text-on-dark)]">
            z-10
          </div>
        </div>
      </DocsSection>
    </DocsPage>
  ),
};

/* ------------------------------ Mobile ----------------------------- */

const TOUCH_ROWS: SpecRow[] = [
  { token: '44 × 44 px', value: 'recommended', use: 'Every tap target on a phone: buttons, list rows, icon buttons, thumbs. Apple HIG and WCAG 2.5.5 (AAA).', usedBy: 'Topbar menu button, Lightbox controls, Slider thumb (hit area), ListItem md, DataTableCell controls below md' },
  { token: '24 × 24 px', value: 'minimum', use: 'WCAG 2.2 2.5.8 (AA). Smaller targets pass only with 24 px of free space around them.', usedBy: 'The floor everywhere: Checkbox (16 / 20 px box), Radio and Switch (20 px) get a 24 px hit area' },
  { token: 'Hit area', value: '::before / ::after', use: 'Keep the visual size and grow the tap area with an invisible pseudo-element, so density does not cost touch comfort. Grow to 44 px only where it cannot reach a neighbour.', usedBy: 'Checkbox, Radio, Switch, HelpIcon, SwatchPicker, Slider thumb, DataTableCell selector; on phones the 28 px close buttons of Alert, Attachment and Toast' },
  { token: 'Button size', value: 'xl 40 · 2xl 48', use: 'Phone actions use xl (the default) or 2xl. sm 28 and md 32 are for dense desktop toolbars and table rows.', usedBy: 'Button, CopyButton, SplitButton, Toggle' },
];

const VIEWPORT_ROWS: SpecRow[] = [
  { token: 'svh', value: 'small viewport', use: 'Default for any height tied to the screen: max-heights, full-height panels. It is the height with the browser toolbar shown, so nothing hides under it and nothing jumps when the toolbar collapses.', usedBy: 'Dialog (max 100svh − 2rem, full = h-svh), Drawer (92svh), Sidebar, Topbar, WorkspaceLayout (min-h-svh), PromptArea, Terminal, KeyboardShortcuts, MessagePopup, SearchBox' },
  { token: 'dvh', value: 'dynamic viewport', use: 'Only for something that must track the live height while the toolbar moves. It re-lays out during scroll, so avoid it for content.', usedBy: 'Not used by components' },
  { token: 'vh / lvh', value: 'large viewport', use: 'Only to cover the whole screen behind content, where a gap would show. Never for content sizes: on phones it is taller than what the user sees.', usedBy: 'ProductTour overlay' },
];

const OVERLAY_ROWS: SpecRow[] = [
  { token: 'Dialog', value: 'below sm', use: '1rem side gutters, height capped at 100svh − 2rem with inner scroll; footer buttons stack, primary on top. For long forms and multi-step flows use size="full" — a page-like takeover.', usedBy: 'Dialog, AlertDialog, ConfirmDialog' },
  { token: 'Drawer (bottom)', value: 'phone default', use: 'Choices, short forms, filters and anything a desktop shows in a popover with a list. Swipe to dismiss, up to 92svh.', usedBy: 'Drawer; Sidebar and PushSheet switch to it below 768 px; Filter, DatePicker, DateRangePicker (one month), ColorField and MessagePopup below 640 px' },
  { token: 'Popover, menus', value: 'anchored', use: 'Stay attached to the trigger and never get wider than the screen. A popover with a list, a calendar or a form turns into a bottom sheet on a phone with <Popover sheet>. Suggestions under a field the user is typing in stay anchored: a sheet would cover the field.', usedBy: 'Popover, DropdownMenu, ContextMenu, Select, HoverCard; anchored on purpose: Combobox, Autocomplete, FilterField' },
  { token: 'Tooltip', value: 'no hover', use: 'Touch has no hover: a tooltip only repeats what is already visible (an icon button label). Never the only place for information.', usedBy: 'Tooltip, HelpIcon (opens on tap)' },
];

const SAFE_AREA_ROWS: SpecRow[] = [
  { token: 'env(safe-area-inset-bottom)', value: 'home indicator', use: 'Bottom bars and panels add it to their bottom padding.', usedBy: 'StickyActionBar, FAB, Lightbox controls, Drawer (bottom), Dialog full' },
  { token: 'env(safe-area-inset-top)', value: 'notch', use: 'Panels pinned to the top add it to their top padding.', usedBy: 'Drawer (top), Dialog full' },
  { token: 'viewport-fit=cover', value: 'host page', use: 'Without it the browser keeps content out of the unsafe area itself and every env() above is 0. With it, the app header and landscape side insets are the host layout\'s job.', usedBy: 'Set in the app\'s <meta name="viewport">' },
];

const MOBILE_RULES = [
  'Tables never scroll sideways on a phone. Table and DataTable default to mobileLayout="stack" (label — value cards); "paged" (first column + dots) is for comparisons; "scroll" only on purpose.',
  'Cards run full width on a phone, and section dividers keep 20 px of space on each side.',
  'Nothing is hover-only. Row actions that appear on hover (revealOnHover) are always visible below md.',
  'Decide the phone layout with useMediaQuery, not by hiding desktop markup: the hook answers on the first render, so the page never flashes its other layout.',
  'Text in fields is at least 16 px below sm, so iOS Safari does not zoom the page on focus. globals.css does it for every input, textarea, select and contenteditable; a field that inherits a bigger font keeps it.',
  'Scheduler starts on the day view on a phone (seven columns don\'t fit); pass defaultView to choose another.',
  'Check every story at 360 and 375 in the viewport toolbar; the test runner runs the same widths with THEYA_VIEWPORT.',
];

export const Mobile: Story = {
  name: 'Mobile',
  render: () => (
    <DocsPage
      title="Mobile"
      description="Theya targets two phone widths: 360 px (Android) and 375 px (iPhone). Below sm (640 px) is a phone; at md (768 px) Sidebar and PushSheet turn from a Drawer into an inline panel."
    >
      <DocsSection title="Touch targets">
        <div className="flex flex-wrap items-end gap-8">
          {[
            { size: 44, label: '44 px — recommended' },
            { size: 24, label: '24 px — minimum' },
          ].map(({ size, label }) => (
            <div key={size} className="flex flex-col items-start gap-2">
              <div
                className="flex items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] border border-dashed border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]"
                style={{ width: size, height: size }}
              />
              <span className="text-body-s text-[var(--color-text-text-subtle)]">{label}</span>
            </div>
          ))}
          <div className="flex flex-col items-start gap-2">
            <div className="relative flex size-11 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] border border-dashed border-[var(--color-border-border-primary)]">
              <span className="size-5 rounded-full bg-[var(--color-bg-primary-bg-primary)]" />
            </div>
            <span className="text-body-s text-[var(--color-text-text-subtle)]">20 px control, 44 px hit area</span>
          </div>
        </div>
        <SpecTable label="Touch targets" rows={TOUCH_ROWS} tokenLabel="Target" valueLabel="Size" />
      </DocsSection>

      <DocsSection title="Viewport height">
        <SpecTable label="Viewport units" rows={VIEWPORT_ROWS} tokenLabel="Unit" valueLabel="Viewport" />
      </DocsSection>

      <DocsSection title="Overlays on a phone">
        <SpecTable label="Overlays on a phone" rows={OVERLAY_ROWS} tokenLabel="Component" valueLabel="Behaviour" />
        <pre
          tabIndex={0}
          aria-label="Code example"
          className="m-0 overflow-x-auto rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] p-4 font-mono text-body-s text-[var(--color-text-text)] outline-none focus-visible:focus-ring"
        >
          {`// A popover that becomes a bottom sheet below 640px:
<Popover sheet>
  <PopoverTrigger asChild>…</PopoverTrigger>
  <PopoverContent sheetTitle="Status">…</PopoverContent>
</Popover>

// Dialog or Drawer, decided by the product:
const isPhone = useMediaQuery('(max-width: 639.98px)');
return isPhone ? <Drawer>…</Drawer> : <Dialog>…</Dialog>;`}
        </pre>
      </DocsSection>

      <DocsSection title="Safe area">
        <SpecTable label="Safe area" rows={SAFE_AREA_ROWS} tokenLabel="Value" valueLabel="For" />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className={LIST}>
          {MOBILE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </DocsSection>
    </DocsPage>
  ),
};


const DISPLAY_ROWS: SpecRow[] = [
  { token: 'text-display-xl', value: '56/60 → 128/128', use: 'A statement on its own: the closing call to action, a manifesto line. Medium, −0.035em. Landing pages only.', usedBy: 'CTA band' },
  { token: 'text-heading-3xl', value: '44/48 → 96/100', use: 'Inside data-scale="display": the centred hero headline. Medium weight, −0.03em. Outside, the fixed product value.', usedBy: 'Hero (centered)' },
  { token: 'text-heading-2xl', value: '36/40 → 64/68', use: 'Inside data-scale="display": a hero beside media, section titles. Medium, −0.025em.', usedBy: 'Hero (split, inset), section titles' },
  { token: 'text-heading-xl', value: '26/32 → 36/44', use: 'Inside data-scale="display": card and column titles in a section.', usedBy: 'Feature cards, Stats numbers' },
  { token: 'text-body-l', value: '17/24 → 20/28', use: 'Inside data-scale="display": the lead paragraph under a headline.', usedBy: 'Hero and section intros' },
  { token: 'section-display', value: 'padding 64 → 128', use: 'Vertical padding of a landing section.', usedBy: 'Every landing section' },
  { token: 'container-display', value: 'max 1200 · gutter 16 → 40', use: 'The centred content column of a section. -narrow (720) for text, -wide (1440) for full-bleed grids.', usedBy: 'Every landing section' },
];

const DISPLAY_SAMPLES = ['text-display-xl', 'text-heading-3xl', 'text-heading-2xl', 'text-heading-xl', 'text-body-l'] as const;

/** Reads the sizes the scale resolves to at the current window width. */
function DisplayReadout() {
  const [state, setState] = useState<{ width: number; sizes: string[] }>({ width: 0, sizes: [] });
  useEffect(() => {
    const probe = document.createElement('div');
    probe.setAttribute('data-scale', 'display');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const read = () => {
      const sizes = DISPLAY_SAMPLES.map((cls) => {
        const el = document.createElement('span');
        el.className = cls;
        probe.appendChild(el);
        const cs = getComputedStyle(el);
        const out = `${parseFloat(cs.fontSize)}/${parseFloat(cs.lineHeight)}`;
        el.remove();
        return out;
      });
      setState({ width: window.innerWidth, sizes });
    };
    read();
    window.addEventListener('resize', read);
    return () => {
      window.removeEventListener('resize', read);
      probe.remove();
    };
  }, []);
  if (!state.width) return null;
  return (
    <p className="m-0 text-body-s text-[var(--color-text-text-subtle)]">
      At this window width ({state.width} px):{' '}
      {DISPLAY_SAMPLES.map((cls, i) => (
        <span key={cls}>
          {i > 0 && ' · '}
          <span className="font-mono">{cls.replace('text-', '')}</span> {state.sizes[i]}
        </span>
      ))}
    </p>
  );
}

/** Landing-page layer: fluid display type inside data-scale="display", section and container utilities. */
export const DisplayScale: Story = {
  name: 'Display scale',
  render: () => (
    <DocsPage
      title="Display scale"
      description='For landing pages. data-scale="display" on a section makes the big type fluid: it grows with the window from a phone (360 px) to a desktop (1440 px) and stops at both ends. Components stay the same — a Button or Card inside a display section is the product one.'
    >
      <DocsSection title="Example">
        <div data-scale="display" className="overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
          <section className="section-display container-display-narrow flex flex-col items-start gap-6">
            <span className="text-body-s font-medium uppercase tracking-wide text-[var(--color-text-text-subtle)]">Bookmarks</span>
            <h2 className="m-0 font-heading text-display-xl text-[var(--color-text-text)]">Every link, one place</h2>
            <p className="m-0 text-body-l text-[var(--color-text-text-subtle)]">Import from any browser, sort into folders, find anything in a keystroke.</p>
            <div className="flex flex-wrap gap-3">
              <Button size="2xl">Get started</Button>
              <Button size="2xl" appearance="outlined">See how it works</Button>
            </div>
          </section>
          <section className="section-display container-display flex flex-col gap-10 border-t border-solid border-[var(--color-border-border-subtler)]">
            <h2 className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">Built for big collections</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                ['Folders', 'Drag links between folders, or let rules sort them.'],
                ['Search', 'Titles, notes and page text, as you type.'],
                ['Cleanup', 'Spot duplicates and broken links in one pass.'],
              ].map(([title, body]) => (
                <div key={title} className="flex flex-col gap-2">
                  <h3 className="m-0 font-heading text-heading-xl text-[var(--color-text-text)]">{title}</h3>
                  <p className="m-0 text-body-m text-[var(--color-text-text-subtle)]">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <DisplayReadout />
      </DocsSection>

      <DocsSection title="Scale">
        <SpecTable label="Display scale" rows={DISPLAY_ROWS} valueLabel="360 → 1440 px" />
        <Note>
          Sizes round to 1 px and line-heights to 4 px, so line boxes stay on the 4 px grid. The scale follows the window width, not the container. Outside data-scale="display" headings keep their fixed product values.
        </Note>
      </DocsSection>

      <DocsSection title="Usage">
        <pre
          tabIndex={0}
          aria-label="Code example"
          className="m-0 overflow-x-auto rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] p-4 font-mono text-body-s text-[var(--color-text-text)] outline-none focus-visible:focus-ring"
        >
          {`<section data-scale="display" className="section-display">
  <div className="container-display-narrow">
    <h1 className="text-display-xl">…</h1>
    <p className="text-body-l">…</p>
    <Button size="2xl">…</Button>
  </div>
</section>`}
        </pre>
      </DocsSection>
    </DocsPage>
  ),
};
