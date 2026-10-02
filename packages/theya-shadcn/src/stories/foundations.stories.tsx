import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'iconoir-react';
import { TextField } from '../components/ui/text-field';
import { tokenValue, type Theme } from './token-values';

const meta: Meta = {
  title: 'Design System/Foundations',
  parameters: {
    layout: 'padded',
    // Swatch labels are specimens, not UI text: they prefer white on
    // mid-tone fills (~2.8-3.7:1) for legibility at a glance, which axe
    // would flag. Contrast is still checked for everything else on the page.
    a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not([data-swatch-label])' }] } },
  },
};

export default meta;
type Story = StoryObj;

/**
 * A living reference built ONLY from CSS custom properties confirmed
 * present in globals.css (via `grep -oE '\-\-[a-z0-9-]+'`), not from
 * names assumed by convention. This matters: a prior pass across this
 * session's components used an invented --color-icon-* namespace,
 * several --color-border-border-{primary,success,warning,danger} and
 * --color-text-text-{success,warning,danger} tokens, --size-margin-
 * margin-* spacing tokens, and per-tone --color-bg-*-subtle variants
 * beyond primary — NONE of which exist in the real file. Since an
 * unresolved var() silently renders as nothing rather than erroring,
 * those components likely have missing colors/spacing in practice.
 * That's a separate remediation pass; this page documents only what
 * is verified to actually exist right now.
 */

/** Constrains page width — Мария's call (2026-09-26): full-bleed reads
 * wrong for a reference/token page — content this dense reads better
 * narrower than the viewport. ~70% width, centered. */
function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[70%] flex-col gap-10 pt-[100px]">{children}</div>;
}

function ColorSwatch({ label, varName, fg }: { label: string; varName: string; fg?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-14 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)]" style={{ background: `var(${varName})` }}>
        {fg && (
          <span style={{ color: `var(${fg})` }} className="text-xs font-medium">
            Aa
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--color-text-text)]">{label}</p>
        <p className="truncate font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">{varName}</p>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-solid border-[var(--color-border-border-subtle)] pb-10 last:border-b-0">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-text)]">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

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

// Includes 2xs/3xs — previously missing from this story even though the
// tokens (and the `text-heading-2xs`/`text-heading-3xs` utilities) exist.
const HEADING_TYPE_VALUES = Object.fromEntries(
  (['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'] as const).map((k) => [k, typeValues(`--typography-heading-heading-${k}`)]),
) as Record<'3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl', { size: string; lineHeight: string; weight: number }>;

/**
 * Labels each swatch with the primitive-scale step it resolves to (e.g.
 * "Blue 500") rather than a raw hex value, wherever the value is an exact
 * match — reverse-lookup against the 11 primitive ramps (same hex data as
 * RAMP_FAMILIES's swatches). Falls back to the raw value for anything
 * that isn't an exact primitive hex (e.g. the rgba() alpha overlays used
 * by several dark-theme values, which aren't a single scale step).
 */
const PRIMITIVE_FAMILIES = ['azure', 'cyan', 'blue', 'gray', 'green', 'magenta', 'orange', 'purple', 'red', 'slate', 'teal', 'yellow'] as const;
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
      className={`inline-flex min-w-[6.5rem] items-center justify-center whitespace-nowrap rounded-[8px] px-3 py-2 text-center font-mono text-[0.75rem] font-medium${
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
    <div className="flex flex-col gap-2">
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
      <div className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] items-baseline gap-x-10 border-b border-solid border-[var(--color-border-border-subtle)] pb-3 pt-6 text-xs font-medium uppercase tracking-wide text-[var(--color-text-text-subtle)]">
        <span>Token and description</span>
        <span>Light theme</span>
        <span>Dark theme</span>
      </div>
      <div className="flex flex-col">
        {filtered.map((r) => (
          <div key={r.name} className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] items-start gap-x-10 gap-y-2 border-b border-solid border-[var(--color-border-border-subtler)] py-5 last:border-b-0">
            <div className="flex min-w-0 flex-col gap-2">
              <code className="w-fit rounded-[var(--size-border-radius-border-radius-sm)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-2 py-1 font-mono text-[0.75rem] text-[var(--color-text-text)]">{r.name}</code>
              <p className="text-xs text-[var(--color-text-text-subtle)]">{r.description}</p>
            </div>
            <TokenPill value={r.light} />
            <TokenPill value={r.dark} />
          </div>
        ))}
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-[var(--color-text-text-subtle)]">No tokens match “{query}”.</p>}
      </div>
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
  { name: '--color-bg-input-bg-input', description: 'Form control fill (input, select, textarea).' },
  { name: '--color-bg-layout-bg-sidebar', description: 'Sidebar navigation background.' },
  { name: '--color-bg-layout-bg-sidebar-selected', description: 'Selected sidebar item background.' },
]);

const TEXT_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-text-text', description: 'Default body/heading text color.' },
  { name: '--color-text-text-subtle', description: 'De-emphasized text — captions, helper text, metadata.' },
  { name: '--color-text-text-link', description: 'Hyperlink text color.' },
  { name: '--color-text-text-on-dark', description: 'Text for use on a dark/colored fill (e.g. inside a primary button). Same in both themes.' },
  { name: '--color-text-text-link-on-dark', description: 'Link text for use on a dark/colored fill.' },
  { name: '--color-text-text-subtle-on-dark', description: 'De-emphasized text for use on a dark/colored fill.' },
]);

const BORDER_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-border-border-subtle', description: 'Default border — cards, inputs, dividers between sections.' },
  { name: '--color-border-border-subtler', description: 'Lower-contrast border — dividers between rows within a section.' },
]);

const CHART_TOKEN_ROWS: TokenRow[] = withValues([
  { name: '--color-bg-chart-01', description: 'Chart series 1 (blue) — deliberately matches --color-bg-primary-bg-primary. Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-02', description: 'Chart series 2 (magenta). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-03', description: 'Chart series 3 (teal). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-04', description: 'Chart series 4 (slate). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-05', description: 'Chart series 5 (red). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-06', description: 'Chart series 6 (green). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-07', description: 'Chart series 7 (azure). Primitive-derived, theme-invariant.' },
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
        className={`h-12 rounded-[8px]${needsBorder ? ' border border-solid border-[var(--color-border-border-subtle)]' : ''}`}
        style={{ background: `var(${varName})` }}
      />
      <p className="text-center font-mono text-[0.625rem] text-[var(--color-text-text-subtle)]">{step}</p>
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
  { prefix: 'azure', label: 'Azure' },
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
      <p className="text-xs font-medium text-[var(--color-text-text)]">
        {label} <span className="font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">--color-{prefix}-{prefix}-*</span>
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
    <Page>
      <Section
        title="Semantic tokens"
        description="All bg-*/text-*/border-*/chart-* semantic tokens — token + description, then Light/Dark shown as color swatches, searchable below. Values read directly from @theya/tokens' generated variables.css / variables-dark.css, not re-derived."
      >
        <TokenTable rows={ALL_TOKEN_ROWS} />
      </Section>
      <Section title="Primitive ramps" description="All 11 primitive color families, each a 12-step scale (005…900). Primitives have no light/dark split — the same hex is used in both themes; only the semantic tokens above vary by theme.">
        <div className="flex flex-col gap-6">
          {RAMP_FAMILIES.map((f) => (
            <RampFamily key={f.prefix} prefix={f.prefix} label={f.label} />
          ))}
        </div>
      </Section>
      <Section title="Chart palette" description="--color-bg-chart-01…07 — categorical series colors, shared across every chart component. 01 is deliberately the same blue as --color-bg-primary-bg-primary. Same swatch style as the semantic tokens above, since these are the same kind of token.">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {CHART_TOKEN_ROWS.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <TokenPill value={r.light} />
              <span className="text-center font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">{r.name.replace('--color-bg-chart-', 'Chart ')}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

export const Typography: Story = {
  render: () => (
    <Page>
      <Section title="Font families" description="--font-body, --font-heading, --font-code — set directly since Tailwind's built-in font-mono utility does NOT read our --font-code token.">
        <div className="flex flex-col gap-4">
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg text-[var(--color-text-text)]">
            --font-body — The quick brown fox jumps over the lazy dog
          </p>
          <p style={{ fontFamily: 'var(--font-heading)' }} className="text-lg text-[var(--color-text-text)]">
            --font-heading — The quick brown fox jumps over the lazy dog
          </p>
          <p style={{ fontFamily: 'var(--font-code)' }} className="text-lg text-[var(--color-text-text)]">
            --font-code — The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </Section>
      <Section title="Body scale" description="text-body-xs/s/m/l/xl — Tailwind v4 generates these as text-* utilities directly from the --text-body-* theme keys.">
        <div className="flex flex-col gap-4">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => {
            const v = BODY_TYPE_VALUES[size];
            return (
              <div key={size} className="flex flex-wrap items-baseline gap-4 border-b border-solid border-[var(--color-border-border-subtle)] pb-3">
                <span className="w-32 shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">text-body-{size}</span>
                <span className={`text-body-${size} text-[var(--color-text-text)]`}>The quick brown fox jumps over the lazy dog</span>
                <span className="ml-auto shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtler)]">
                  {v.size} / {v.lineHeight} · weight {v.weight}
                </span>
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Heading scale" description="text-heading-3xs through text-heading-3xl.">
        <div className="flex flex-col gap-4">
          {(['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'] as const).map((size) => {
            const v = HEADING_TYPE_VALUES[size];
            return (
              <div key={size} className="flex flex-wrap items-baseline gap-4 border-b border-solid border-[var(--color-border-border-subtle)] pb-3">
                <span className="w-32 shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">text-heading-{size}</span>
                <span className={`text-heading-${size} font-semibold text-[var(--color-text-text)]`}>The quick brown fox</span>
                <span className="ml-auto shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtler)]">
                  {v.size} / {v.lineHeight} · weight {v.weight}
                </span>
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Font weights" description="Each body size carries 3 weight steps (base/emphasize/strong) as separate tokens rather than a single shared font-weight scale — e.g. --typography-body-m-weight(-emphasize|-strong).">
        <div className="flex flex-col gap-4">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-baseline gap-6 border-b border-solid border-[var(--color-border-border-subtle)] pb-3">
              <span className="w-32 shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">body-{size}</span>
              <span className={`text-body-${size} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight)` }}>
                Base
              </span>
              <span className={`text-body-${size} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight-emphasize)` }}>
                Emphasize
              </span>
              <span className={`text-body-${size} text-[var(--color-text-text)]`} style={{ fontWeight: `var(--typography-body-${size}-weight-strong)` }}>
                Strong
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Letter spacing" description="Each body size has its own tracking value plus a separate -uppercase step for all-caps labels — e.g. --typography-body-m-letter-spacing(-uppercase).">
        <div className="flex flex-col gap-4">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-baseline gap-6 border-b border-solid border-[var(--color-border-border-subtle)] pb-3">
              <span className="w-32 shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">body-{size}</span>
              <span className={`text-body-${size} text-[var(--color-text-text)]`} style={{ letterSpacing: `var(--typography-body-${size}-letter-spacing)` }}>
                Tracking
              </span>
              <span className={`text-body-${size} uppercase text-[var(--color-text-text)]`} style={{ letterSpacing: `var(--typography-body-${size}-letter-spacing-uppercase)` }}>
                Uppercase tracking
              </span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

const RADIUS_ROWS: SpecRow[] = [
  { token: 'radius-sm', value: tokenValue('--size-border-radius-border-radius-sm'), use: 'The smallest inner details.', usedBy: 'Kbd, Skeleton, Tabs indicator, Toolbar, inner parts of Card, DataTable, Sonner' },
  { token: 'radius-md', value: tokenValue('--size-border-radius-border-radius-md'), use: 'Items inside a container and small controls.', usedBy: 'Menu and list items, Checkbox, Tooltip, Toggle, Tabs triggers, Sidebar items, Command (72 uses)' },
  { token: 'radius-lg', value: tokenValue('--size-border-radius-border-radius-lg'), use: 'Text inputs and input-like controls.', usedBy: 'TextField, Select trigger, Combobox, Autocomplete, NumberField, InputGroup, InputOTP, Password, Filter, Chip' },
  { token: 'radius-xl', value: tokenValue('--size-border-radius-border-radius-xl'), use: 'Buttons, and floating surfaces anchored to a trigger. A menu under a button is never rounder than the button.', usedBy: 'Button, DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select content, CodeBlock, CodeEditor, Terminal' },
  { token: 'radius-2xl', value: tokenValue('--size-border-radius-border-radius-2xl'), use: 'Compact card surfaces on a page.', usedBy: 'Card, Table, DataTable, Alert, Stat, Attachment, OptionCard, Dropzone, File, charts, Patterns blocks' },
  { token: 'radius-3xl', value: tokenValue('--size-border-radius-border-radius-3xl'), use: 'Dialogs and full-height panels.', usedBy: 'Dialog, AlertDialog, Drawer, LoginFormSplit' },
  { token: 'radius-4xl', value: tokenValue('--size-border-radius-border-radius-4xl'), use: 'Reserved for large containers.', usedBy: 'Not used by components yet' },
  { token: 'radius-5xl', value: tokenValue('--size-border-radius-border-radius-5xl'), use: 'Reserved for large decorative shapes.', usedBy: 'Not used by components yet' },
  { token: 'radius-max', value: tokenValue('--size-border-radius-border-radius-max'), use: 'Pills and round shapes.', usedBy: 'Badge, Progress, Switch, Slider, StatusDot, Stepper (today mostly as rounded-full)' },
];

const RADIUS_STEPS = [
  ['sm', 2], ['md', 4], ['lg', 6], ['xl', 8], ['2xl', 10], ['3xl', 12], ['4xl', 16], ['5xl', 32], ['max', 100],
] as const;

const radius = (step: string) => `var(--size-border-radius-border-radius-${step})`;

export const BorderRadius: Story = {
  name: 'Border radius',
  render: () => (
    <Page>
      <Section
        title="Border radius"
        description="Nine steps. The radius grows with the size of the surface and with how far it sits from the page: a dialog is rounder than the card inside it, the card rounder than its button, the button rounder than its input. Token names below are shortened; the full name is --size-border-radius-border-radius-{step}."
      >
        <div className="flex flex-col gap-8">
          {/* Nested demo: each level uses its own tier, outermost first. */}
          <div className="rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-8">
            <div className="flex max-w-md flex-col gap-4 bg-[var(--color-bg-surface-bg-surface)] p-5 shadow-elevation-xl" style={{ borderRadius: radius('3xl') }}>
              <div className="flex items-baseline justify-between">
                <span className="text-body-l font-semibold text-[var(--color-text-text)]">Dialog</span>
                <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">3xl · 12px</span>
              </div>
              <div className="flex flex-col gap-3 border border-solid border-[var(--color-border-border-subtle)] p-4" style={{ borderRadius: radius('2xl') }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-body-m font-medium text-[var(--color-text-text)]">Card</span>
                  <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">2xl · 10px</span>
                </div>
                <div className="flex h-10 items-center justify-between border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-input-bg-input)] px-3" style={{ borderRadius: radius('lg') }}>
                  <span className="text-body-m text-[var(--color-text-text-subtle)]">Input</span>
                  <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">lg · 6px</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-3 py-2">
                  <span className="text-body-m text-[var(--color-text-text)]">List item</span>
                  <span className="flex items-center gap-2">
                    <kbd className="border border-solid border-[var(--color-border-border-subtle)] px-1.5 font-mono text-body-s text-[var(--color-text-text-subtle)]" style={{ borderRadius: radius('sm') }}>K</kbd>
                    <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">md · 4px, key sm · 2px</span>
                  </span>
                </div>
                <div className="flex h-10 items-center justify-between bg-[var(--color-bg-primary-bg-primary)] px-4" style={{ borderRadius: radius('xl') }}>
                  <span className="text-body-m text-[var(--color-text-text-on-dark)]">Button</span>
                  <span className="font-mono text-body-s text-[var(--color-text-text-on-dark)]">xl · 8px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            {RADIUS_STEPS.map(([step, px]) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="size-16 border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]" style={{ borderRadius: radius(step) }} />
                <span className="font-mono text-body-s text-[var(--color-text-text)]">{step}</span>
                <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">{px}px</span>
              </div>
            ))}
          </div>

          <SpecTable rows={RADIUS_ROWS} />

          <MigrationNote>
            Tailwind's rounded-* names are shifted against the token names: rounded-sm is token md (4px), rounded-lg is lg (6px), rounded-xl is xl (8px). Plain rounded and rounded-md are not bridged at all and fall back to Tailwind's own 4px and 6px. In components, write the token form: rounded-[var(--size-border-radius-border-radius-lg)].
          </MigrationNote>
        </div>
      </Section>
    </Page>
  ),
};

const FOCUS_ROWS: SpecRow[] = [
  { token: '--color-focus-focus-ring', value: tokenValue('--color-focus-focus-ring'), use: 'Default ring for every interactive control.', usedBy: 'Almost every control (65 uses of the 4px ring)' },
  { token: '--color-focus-focus-ring-error', value: tokenValue('--color-focus-focus-ring-error'), use: 'Invalid fields, together with the danger border and background.', usedBy: 'TextField, Textarea, Select, Combobox, Autocomplete, DatePicker, NumberField, InputGroup, InputOTP, PromptArea, Slider' },
  { token: '--color-focus-focus-ring-success', value: tokenValue('--color-focus-focus-ring-success'), use: 'Fields and cards in a success state.', usedBy: 'Card (success severity)' },
  { token: '--color-focus-focus-ring-warning', value: tokenValue('--color-focus-focus-ring-warning'), use: 'Fields and cards in a warning state.', usedBy: 'Card (warning severity)' },
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
  "The ring is a 4px box-shadow outside the element: focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]. It follows the element's border radius on its own.",
  'Use an inset ring (shadow-[inset_0_0_0_3px_...]) only where an outer ring would be clipped by overflow: table cells, tree rows, code blocks, the terminal.',
  'Text fields show the ring on any focus, including a mouse click. Buttons and other controls show it on keyboard focus only (focus-visible).',
  'Fields pair the soft ring with a solid border color. The border is what meets the 3:1 contrast requirement; the ring alone does not.',
  'The ring tone follows the state: error for invalid, success or warning for validated states, on-primary on primary-filled surfaces.',
];

export const FocusRing: Story = {
  name: 'Focus ring',
  render: () => (
    <Page>
      <Section
        title="Focus ring"
        description="Five ring tokens, one per state. The previews show each ring at rest; the button under each one lets you check it with Tab."
      >
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
            {FOCUS_DEMO.map(({ tone, label, ring, border, onPrimary }) => (
              <div
                key={tone}
                className={`flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] p-4 ${
                  onPrimary ? 'bg-[var(--color-bg-primary-bg-primary)]' : 'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]'
                }`}
              >
                <span className={`text-body-m font-medium ${onPrimary ? 'text-[var(--color-text-text-on-dark)]' : 'text-[var(--color-text-text)]'}`}>{label}</span>
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

          <div className="flex flex-col gap-3">
            <SubHeading>Outside or inset</SubHeading>
            <div className="flex flex-wrap items-start gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-48 items-center rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-primary)] bg-[var(--color-bg-input-bg-input)] px-3 text-body-m text-[var(--color-text-text-subtle)] shadow-[0_0_0_4px_var(--color-focus-focus-ring)]">
                  Outside, 4px
                </div>
                <span className="text-body-s text-[var(--color-text-text-subtle)]">Default for standalone controls.</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-56 overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
                  <div className="border-b border-solid border-[var(--color-border-border-subtler)] px-3 py-2 text-body-m text-[var(--color-text-text)]">Row</div>
                  <div className="px-3 py-2 text-body-m text-[var(--color-text-text)] shadow-[inset_0_0_0_3px_var(--color-focus-focus-ring)]">Focused row, inset 3px</div>
                  <div className="border-t border-solid border-[var(--color-border-border-subtler)] px-3 py-2 text-body-m text-[var(--color-text-text)]">Row</div>
                </div>
                <span className="text-body-s text-[var(--color-text-text-subtle)]">Inside containers that clip overflow.</span>
              </div>
            </div>
          </div>

          <SpecTable rows={FOCUS_ROWS} />

          <div className="flex flex-col gap-3">
            <SubHeading>Rules</SubHeading>
            <ul className="flex max-w-[70ch] list-disc flex-col gap-2 pl-5 text-body-m text-[var(--color-text-text)]">
              {FOCUS_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          <MigrationNote>
            Ring widths are not uniform yet: Button, Card and Slider draw 3px instead of 4px. This is under review in the WCAG pass. Button's ring contrast is a documented, accepted exception.
          </MigrationNote>
        </div>
        {/* Demo-only: apply the per-card ring on keyboard focus. */}
        <style>{`[data-focus-demo]:focus-visible { box-shadow: 0 0 0 4px var(--demo-ring); }`}</style>
      </Section>
    </Page>
  ),
};

type SpecRow = { token: string; value: string; use: string; usedBy: string };

// Four-column spec table shared by the scale stories below.
function SpecTable({ rows, valueLabel = 'Value' }: { rows: SpecRow[]; valueLabel?: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]">
            {['Token', valueLabel, 'Use for', 'Used by today'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-body-s font-medium text-[var(--color-text-text-subtle)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.token} className="border-b border-solid border-[var(--color-border-border-subtler)] align-top last:border-b-0">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-body-s text-[var(--color-text-text)]">{r.token}</td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-body-s text-[var(--color-text-text-subtle)]">{r.value}</td>
              <td className="px-4 py-3 text-body-m text-[var(--color-text-text)]">{r.use}</td>
              <td className="px-4 py-3 text-body-s text-[var(--color-text-text-subtle)]">{r.usedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Honest status line: the scales exist, components have not migrated yet.
function MigrationNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-info-bg-info-subtle)] px-4 py-3 text-body-s text-[var(--color-text-text)]">
      {children}
    </p>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-body-l font-semibold text-[var(--color-text-text)]">{children}</h3>;
}

/* ---------------------------- Elevation ---------------------------- */

// "2 layers, 28px blur, 14%" — summarized from the built shadow value.
function shadowSummary(name: string): string {
  const layers = tokenValue(name).split(/,(?![^(]*\))/).map((l) => l.trim());
  const blur = Math.max(...layers.map((l) => parseFloat(l.split(/\s+/)[2]) || 0));
  const alpha = Math.max(...layers.map((l) => parseFloat(l.match(/rgba?\([^)]*,\s*([\d.]+)\)/)?.[1] ?? '0')));
  return `${layers.length} layer${layers.length > 1 ? 's' : ''}, ${blur}px blur, ${Math.round(alpha * 100)}%`;
}

const ELEVATION_ROWS: SpecRow[] = [
  { token: 'shadow-elevation-xs', value: shadowSummary('--elevation-xs'), use: 'A surface that sits in the page flow and only needs to lift off the background.', usedBy: 'Stat, CodeBlock, CodeEditor, Terminal, Card at rest' },
  { token: 'shadow-elevation-sm', value: shadowSummary('--elevation-sm'), use: 'Small raised details inside a control or a layout.', usedBy: 'Alert, Switch and Slider thumbs, Sidebar, Menubar trigger' },
  { token: 'shadow-elevation-md', value: shadowSummary('--elevation-md'), use: 'Floating controls and short hints that hover over content.', usedBy: 'Tooltip, floating scroll buttons, DataTableToolbar bulk bar' },
  { token: 'shadow-elevation-lg', value: shadowSummary('--elevation-lg'), use: 'Surfaces that drop out of a trigger: menus, popovers, listboxes.', usedBy: 'DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select, chart tooltips' },
  { token: 'shadow-elevation-xl', value: shadowSummary('--elevation-xl'), use: 'Modal layers that take over the page.', usedBy: 'Dialog, AlertDialog, Drawer, PushSheet, Sonner' },
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
    <Page>
      <Section
        title="Elevation"
        description="Five ink-tinted shadow steps (rgba(27,27,31,...)). The higher the step, the further the surface is from the page. Use as shadow-elevation-{xs|sm|md|lg|xl}."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-8 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-8">
            {ELEVATION_DEMO.map(({ s, label, cls }) => (
              <div
                key={s}
                className={`flex h-24 w-36 flex-col justify-between rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] p-3 ${cls}`}
              >
                <span className="text-body-m font-medium text-[var(--color-text-text)]">{label}</span>
                <span className="font-mono text-body-s text-[var(--color-text-text-subtle)]">elevation-{s}</span>
              </div>
            ))}
          </div>
          <SpecTable rows={ELEVATION_ROWS} valueLabel="Shadow" />
          <MigrationNote>
            Migrated 2026-10-01: every component uses shadow-elevation-*. Values live in @theya/tokens (--elevation-*). Focus rings drawn with box-shadow are a separate thing.
          </MigrationNote>
        </div>
      </Section>
    </Page>
  ),
};

/* ------------------------------ Motion ----------------------------- */

const DURATION_ROWS: SpecRow[] = [
  { token: 'duration-fast', value: tokenValue('--motion-duration-fast'), use: 'Micro feedback on the control itself.', usedBy: 'Checkbox, Radio and Switch check marks, DropdownMenu' },
  { token: 'duration-standard', value: tokenValue('--motion-duration-standard'), use: 'Default for hover, color, border and focus changes.', usedBy: 'Almost every component' },
  { token: 'duration-moderate', value: tokenValue('--motion-duration-moderate'), use: 'Overlays appearing, content expanding or collapsing.', usedBy: 'Dialog, AlertDialog, Accordion, Collapsible, Carousel' },
  { token: 'duration-slow', value: tokenValue('--motion-duration-slow'), use: 'Value changes and large panels.', usedBy: 'Progress, Meter, PushSheet' },
];

const EASING_ROWS: SpecRow[] = [
  { token: 'ease-enter', value: tokenValue('--motion-easing-enter'), use: 'Things appearing and hover states. The default.', usedBy: 'Almost every transition' },
  { token: 'ease-exit', value: tokenValue('--motion-easing-exit'), use: 'Things leaving. Pair with ease-enter on the same element.', usedBy: 'Dialog, AlertDialog' },
  { token: 'ease-spring', value: tokenValue('--motion-easing-spring'), use: 'Selection feedback with a small overshoot.', usedBy: 'Checkbox, Radio, Switch, Button' },
  { token: 'ease-press', value: tokenValue('--motion-easing-press'), use: 'Pressing a button down and releasing it.', usedBy: 'Button' },
];

const DURATION_DEMO = [
  { name: 'fast', ms: 100, cls: 'duration-fast' },
  { name: 'standard', ms: 150, cls: 'duration-standard' },
  { name: 'moderate', ms: 200, cls: 'duration-moderate' },
  { name: 'slow', ms: 300, cls: 'duration-slow' },
] as const;

const EASING_DEMO = [
  { name: 'enter', curve: 'var(--ease-enter)' },
  { name: 'exit', curve: 'var(--ease-exit)' },
  { name: 'spring', curve: 'var(--ease-spring)' },
  { name: 'press', curve: 'var(--ease-press)' },
] as const;

export const Motion: Story = {
  render: () => (
    <Page>
      <Section
        title="Motion"
        description="Four durations and four easing curves. Use as duration-{fast|standard|moderate|slow} and ease-{enter|exit|spring|press}. Every transition or animation also gets a reduced-motion guard: motion-reduce:transition-none or motion-reduce:animate-none."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <SubHeading>Duration</SubHeading>
            <div className="flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5">
              {DURATION_DEMO.map(({ name, ms, cls }) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtle)]">duration-{name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
                    <div className={`theya-grow h-full w-full origin-left rounded-full bg-[var(--color-bg-primary-bg-primary)] ${cls}`} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-body-s text-[var(--color-text-text-subtle)]">{ms}ms</span>
                </div>
              ))}
            </div>
            <SpecTable rows={DURATION_ROWS} />
          </div>

          <div className="flex flex-col gap-4">
            <SubHeading>Easing</SubHeading>
            <div className="flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5">
              {EASING_DEMO.map(({ name, curve }) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtle)]">ease-{name}</span>
                  <div className="relative h-4 flex-1">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border-border-subtler)]" />
                    <div
                      className="theya-slide absolute top-0 size-4 rounded-full bg-[var(--color-bg-primary-bg-primary)]"
                      style={{ animationTimingFunction: curve }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <SpecTable rows={EASING_ROWS} valueLabel="Curve" />
          </div>

          <MigrationNote>
            Migrated 2026-10-01: components use duration-fast/standard/moderate/slow and ease-enter/exit/spring/press. Values live in @theya/tokens (--motion-*). One off-scale value remains on purpose: Button's 220ms press spring.
          </MigrationNote>
        </div>
        {/* Demo-only keyframes. Both demos stop entirely under prefers-reduced-motion. */}
        <style>{`
          @keyframes theya-grow { 0%, 10% { transform: scaleX(0); } 50%, 100% { transform: scaleX(1); } }
          @keyframes theya-slide { from { left: 0; } to { left: calc(100% - 1rem); } }
          .theya-grow { transform: scaleX(0); animation: theya-grow 2.4s ease-in-out infinite; }
          .theya-slide { animation: theya-slide 1.6s infinite alternate; }
          @media (prefers-reduced-motion: reduce) {
            .theya-grow { animation: none; transform: scaleX(1); }
            .theya-slide { animation: none; }
          }
        `}</style>
      </Section>
    </Page>
  ),
};

/* ----------------------------- Layering ---------------------------- */

const LAYER_ROWS: SpecRow[] = [
  { token: '--z-index-sticky', value: tokenValue('--layer-sticky'), use: 'Headers and bars that stick while the page scrolls.', usedBy: 'Topbar' },
  { token: '--z-index-drawer', value: tokenValue('--layer-drawer'), use: 'Side and bottom panels that slide over the page.', usedBy: 'Drawer and PushSheet, backdrop and panel on the same layer' },
  { token: '--z-index-overlay', value: tokenValue('--layer-overlay'), use: 'The dimmed backdrop behind a modal.', usedBy: 'Dialog and AlertDialog backdrops' },
  { token: '--z-index-modal', value: tokenValue('--layer-modal'), use: 'Dialog content above its backdrop.', usedBy: 'Dialog, AlertDialog' },
  { token: '--z-index-popover', value: tokenValue('--layer-popover'), use: 'Anything anchored to a trigger. Also works inside a modal.', usedBy: 'Popover, DropdownMenu, ContextMenu, Menubar, HoverCard, Select. NavigationMenu still uses a local z-10 (no portal yet)' },
  { token: '--z-index-toast', value: tokenValue('--layer-toast'), use: 'Notifications that must stay visible over any open layer.', usedBy: 'Sonner (inline zIndex var(--z-index-toast))' },
  { token: '--z-index-tooltip', value: tokenValue('--layer-tooltip'), use: 'Tooltips. Always on top, because a tooltip belongs to whatever is under the cursor, including items inside menus and toasts.', usedBy: 'Tooltip, AppShell skip link while focused' },
];

export const Layering: Story = {
  name: 'Layering (z-index)',
  render: () => (
    <Page>
      <Section
        title="Layering (z-index)"
        description="One stacking order for every layer that floats above the page. Tailwind v4 has no z-index theme scale, so there are no short classes: use z-(--z-index-modal), not z-modal."
      >
        <div className="flex flex-col gap-6">
          <SpecTable rows={LAYER_ROWS} />
          <div className="flex flex-col gap-2">
            <SubHeading>Local stacking</SubHeading>
            <p className="max-w-[70ch] text-body-m text-[var(--color-text-text)]">
              z-[1], z-[2] and z-10 inside Card, charts, InputOTP, ToggleGroup and similar only order the parts of one component against each other. They never compete with the layers above, so they stay as plain numbers and are not tokens.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <SubHeading>Proof</SubHeading>
            <div className="relative h-24 w-full">
              <div className="absolute left-16 top-8 z-(--z-index-toast) flex h-16 w-40 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary)] font-mono text-body-s text-[var(--color-text-text-on-dark)]">
                z-(--z-index-toast)
              </div>
              <div className="absolute left-8 top-0 z-10 flex h-16 w-40 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-danger-bg-danger)] font-mono text-body-s text-[var(--color-text-text-on-dark)]">
                z-10
              </div>
            </div>
            <p className="text-body-s text-[var(--color-text-text-subtle)]">
              The blue box comes first in the DOM and would lose under plain paint order, yet it renders on top because 600 is greater than 10.
            </p>
          </div>
          <MigrationNote>
            Migrated 2026-10-01: every overlay sits on its layer above. Values live in @theya/tokens (--layer-*).
          </MigrationNote>
        </div>
      </Section>
    </Page>
  ),
};
