import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'iconoir-react';
import { TextField } from '../components/ui/text-field';

const meta: Meta = {
  title: 'Design System/Foundations',
  parameters: { layout: 'padded' },
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

function contrastTextColor(color: string): string {
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
      // Blend against an assumed white card background, since these swatches sit on --color-bg-surface-bg-surface.
      r = parts[0] * alpha + 255 * (1 - alpha);
      g = parts[1] * alpha + 255 * (1 - alpha);
      b = parts[2] * alpha + 255 * (1 - alpha);
    }
  }
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? '#151529' : '#ffffff';
}

const RAMP_STEPS = ['005', '010', '050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

// Hardcoded from @theya/tokens' built variables.css (--typography-body-*
// and --typography-heading-* — same values in light and dark, type scale
// doesn't change by theme). Displayed next to each sample in the
// Typography story per Мария's request (2026-09-26): "типографика
// неполная, где значения размеров шрифтов, weight и тд" — the story
// used to render only the sample text, with no visible numbers.
const BODY_TYPE_VALUES: Record<'xs' | 's' | 'm' | 'l' | 'xl', { size: string; lineHeight: string; weight: number }> = {
  xs: { size: '11px', lineHeight: '14px', weight: 400 },
  s: { size: '12px', lineHeight: '16px', weight: 400 },
  m: { size: '14px', lineHeight: '20px', weight: 400 },
  l: { size: '16px', lineHeight: '22px', weight: 400 },
  xl: { size: '24px', lineHeight: '28px', weight: 400 },
};

// Includes 2xs/3xs — previously missing from this story even though the
// tokens (and the `text-heading-2xs`/`text-heading-3xs` utilities) exist.
const HEADING_TYPE_VALUES: Record<'3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl', { size: string; lineHeight: string; weight: number }> = {
  '3xs': { size: '10px', lineHeight: '14px', weight: 500 },
  '2xs': { size: '12px', lineHeight: '16px', weight: 600 },
  xs: { size: '16px', lineHeight: '22px', weight: 700 },
  s: { size: '20px', lineHeight: '28px', weight: 600 },
  m: { size: '24px', lineHeight: '30px', weight: 700 },
  l: { size: '28px', lineHeight: '32px', weight: 700 },
  xl: { size: '32px', lineHeight: '40px', weight: 700 },
  '2xl': { size: '60px', lineHeight: '72px', weight: 700 },
  '3xl': { size: '100px', lineHeight: '112px', weight: 200 },
};

/**
 * Labels each swatch with the primitive-scale step it resolves to (e.g.
 * "Blue 500") rather than a raw hex value, wherever the value is an exact
 * match — reverse-lookup against the 11 primitive ramps (same hex data as
 * RAMP_FAMILIES's swatches). Falls back to the raw value for anything
 * that isn't an exact primitive hex (e.g. the rgba() alpha overlays used
 * by several dark-theme values, which aren't a single scale step).
 */
const PRIMITIVE_HEX: Record<string, string[]> = {
  azure: ['#ecf7ff', '#dcf1ff', '#b4e1ff', '#7acaff', '#46b5ff', '#069cff', '#3292f1', '#0278ca', '#0068ae', '#004877', '#003354', '#001f33'],
  blue: ['#f2f8ff', '#dfeeff', '#cfe6ff', '#bddcff', '#63acff', '#3795ff', '#248bff', '#0068de', '#0057b9', '#00428c', '#002f64', '#001f41'],
  gray: ['#f9f9fe', '#edeef8', '#e1e2eb', '#d8d8ed', '#adadc3', '#9696ac', '#6b6b7e', '#606070', '#4e4e5e', '#393943', '#1b1b1f', '#0a0a0a'],
  green: ['#dff9ea', '#c3e8d2', '#aedec2', '#92d5ae', '#54c181', '#43af70', '#379c61', '#198446', '#156b39', '#144227', '#13301f', '#08110c'],
  magenta: ['#fbe5f5', '#fbc6ec', '#f9a6e2', '#f282d2', '#ec6ec9', '#e651bc', '#d02ca2', '#bc2692', '#a21379', '#850b63', '#580741', '#40022f'],
  orange: ['#fff3e5', '#ffe2c0', '#ffd4a2', '#ffc784', '#ff9f2e', '#ef8100', '#d17119', '#b44b00', '#8e2f00', '#a54a11', '#8a3e0f', '#5d2f13'],
  purple: ['#faf0fd', '#f2dafb', '#e9bdf8', '#db8df7', '#cc75eb', '#c859ef', '#c04ae8', '#9a38bc', '#7c259a', '#5f1778', '#430c56', '#330742'],
  red: ['#fff1f7', '#ffdce8', '#ffc2d6', '#f78dad', '#f05a7e', '#e63f7b', '#b40d49', '#82052f', '#640728', '#a60c3b', '#8a0b32', '#5c0f27'],
  slate: ['#f7f7fe', '#e7e7f8', '#caccf0', '#bec0e9', '#a9aade', '#9a9cce', '#5f6190', '#4b4d77', '#393a5d', '#282944', '#151529', '#0c0c18'],
  teal: ['#eafbfb', '#c9f3f2', '#92e7e5', '#56cdca', '#18bbb6', '#02a8a3', '#10827d', '#097a76', '#006d69', '#005350', '#003e3c', '#002625'],
  yellow: ['#fffae5', '#fff2c0', '#ffeca2', '#ffe684', '#ffd52e', '#efb300', '#c7930d', '#a97900', '#8e5f00', '#583800', '#3c2500', '#1d1000'],
};

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
  const needsBorder = isWhiteish(value);
  return (
    <span
      className={`inline-flex min-w-[6.5rem] items-center justify-center whitespace-nowrap rounded-[8px] px-3 py-2 text-center font-mono text-[0.75rem] font-medium${
        needsBorder ? ' border border-solid border-[var(--color-border-border-subtle)]' : ''
      }`}
      style={{ background: value, color: contrastTextColor(value) }}
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

const BG_TOKEN_ROWS: TokenRow[] = [
  { name: '--color-bg-primary-bg-primary', light: '#0068de', dark: '#0068de', description: 'Primary action fill — buttons, active states. Same in both themes.' },
  { name: '--color-bg-primary-bg-primary-subtle', light: '#dfeeff', dark: 'rgba(55, 149, 255, 0.5)', description: 'Low-emphasis primary fill, e.g. selected-row or info-callout background.' },
  { name: '--color-bg-primary-bg-primary-on-dark', light: '#248bff', dark: '#0068de', description: 'Primary fill for use on an already-dark surface (e.g. inside the sidebar).' },
  { name: '--color-bg-secondary-bg-secondary', light: '#9a9cce', dark: 'rgba(249, 249, 254, 0.2)', description: 'Secondary action fill.' },
  { name: '--color-bg-success-bg-success', light: '#198446', dark: '#156B39', description: 'Success state fill.' },
  { name: '--color-bg-success-bg-success-on-dark', light: '#54C181', dark: '#54C181', description: 'Success fill for use on a dark surface.' },
  { name: '--color-bg-warning-bg-warning', light: '#ffd52e', dark: '#A54A11', description: 'Warning state fill.' },
  { name: '--color-bg-warning-bg-warning-on-dark', light: '#ffe684', dark: '#ffe684', description: 'Warning fill for use on a dark surface.' },
  { name: '--color-bg-danger-bg-danger', light: '#b40d49', dark: '#A60C3B', description: 'Danger/destructive state fill.' },
  { name: '--color-bg-danger-bg-danger-on-dark', light: '#F78DAD', dark: '#F78DAD', description: 'Danger fill for use on a dark surface.' },
  { name: '--color-bg-info-bg-info', light: '#0068de', dark: '#00428c', description: 'Informational state fill.' },
  { name: '--color-bg-info-bg-info-on-dark', light: '#63acff', dark: '#0057b9', description: 'Informational fill for use on a dark surface.' },
  { name: '--color-bg-neutral-bg-neutral-subtle', light: '#edeef8', dark: 'rgba(249, 249, 254, 0.2)', description: 'Low-emphasis neutral fill, e.g. hover/zebra-striping.' },
  { name: '--color-bg-surface-bg-surface', light: '#ffffff', dark: '#282944', description: 'Default page/card surface.' },
  { name: '--color-bg-surface-bg-surface-base', light: '#ffffff', dark: '#282944', description: 'Base app background, beneath surfaces.' },
  { name: '--color-bg-surface-bg-surface-overlay', light: '#ffffff', dark: '#0c0c18', description: 'Modal/popover/overlay surface, above the base surface.' },
  { name: '--color-bg-input-bg-input', light: '#ffffff', dark: '#000000', description: 'Form control fill (input, select, textarea).' },
  { name: '--color-bg-layout-bg-sidebar', light: '#393a5d', dark: '#0c0c18', description: 'Sidebar navigation background.' },
  { name: '--color-bg-layout-bg-sidebar-selected', light: '#4b4d77', dark: '#282944', description: 'Selected sidebar item background.' },
];

const TEXT_TOKEN_ROWS: TokenRow[] = [
  { name: '--color-text-text', light: '#151529', dark: '#f7f7fe', description: 'Default body/heading text color.' },
  { name: '--color-text-text-subtle', light: '#393a5d', dark: '#caccf0', description: 'De-emphasized text — captions, helper text, metadata.' },
  { name: '--color-text-text-link', light: '#0068de', dark: '#63acff', description: 'Hyperlink text color.' },
  { name: '--color-text-text-on-dark', light: '#ffffff', dark: '#ffffff', description: 'Text for use on a dark/colored fill (e.g. inside a primary button). Same in both themes.' },
  { name: '--color-text-text-link-on-dark', light: '#bddcff', dark: '#63acff', description: 'Link text for use on a dark/colored fill.' },
  { name: '--color-text-text-subtle-on-dark', light: '#bec0e9', dark: '#caccf0', description: 'De-emphasized text for use on a dark/colored fill.' },
];

const BORDER_TOKEN_ROWS: TokenRow[] = [
  { name: '--color-border-border-subtle', light: '#bec0e9', dark: '#5f6190', description: 'Default border — cards, inputs, dividers between sections.' },
  { name: '--color-border-border-subtler', light: '#e7e7f8', dark: '#4b4d77', description: 'Lower-contrast border — dividers between rows within a section.' },
];

const CHART_TOKEN_ROWS: TokenRow[] = [
  { name: '--color-bg-chart-01', light: '#0068de', dark: '#0068de', description: 'Chart series 1 (blue) — deliberately matches --color-bg-primary-bg-primary. Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-02', light: '#bc2692', dark: '#bc2692', description: 'Chart series 2 (magenta). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-03', light: '#097a76', dark: '#097a76', description: 'Chart series 3 (teal). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-04', light: '#4b4d77', dark: '#4b4d77', description: 'Chart series 4 (slate). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-05', light: '#82052f', dark: '#82052f', description: 'Chart series 5 (red). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-06', light: '#198446', dark: '#198446', description: 'Chart series 6 (green). Primitive-derived, theme-invariant.' },
  { name: '--color-bg-chart-07', light: '#0278ca', dark: '#0278ca', description: 'Chart series 7 (azure). Primitive-derived, theme-invariant.' },
];

/**
 * The bg-{tone}-bg-{tone}-status family (2026-09-26 addition, see overview.md):
 * one ramp step LIGHTER than the plain solid bg-{tone}-bg-{tone} fill —
 * canonical for a small/decorative tone indicator (StatusDot, Timeline,
 * BadgeIndicator), never a large surface. No neutral-status counterpart
 * exists by design (neutral uses icon-icon-subtle or a hardcoded base
 * instead, since a small isolated element needs a background that reads
 * the same regardless of backdrop, which alpha-neutral can't guarantee).
 */
const STATUS_TOKEN_ROWS: TokenRow[] = [
  { name: '--color-bg-primary-bg-primary-status', light: '#248bff', dark: '#3795ff', description: 'One step lighter than the solid primary fill — small/decorative tone indicators only (StatusDot, Timeline, BadgeIndicator).' },
  { name: '--color-bg-info-bg-info-status', light: '#248bff', dark: '#0068de', description: 'Info counterpart of the -status family — same small-indicator use as primary-status.' },
  { name: '--color-bg-success-bg-success-status', light: '#379C61', dark: '#379C61', description: 'Success counterpart of the -status family. Same value in both themes.' },
  { name: '--color-bg-warning-bg-warning-status', light: '#ffe684', dark: '#d17119', description: 'Warning counterpart of the -status family.' },
  { name: '--color-bg-danger-bg-danger-status', light: '#e63f7b', dark: '#e63f7b', description: 'Danger counterpart of the -status family. Same value in both themes.' },
];

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
  { token: 'radius-sm', value: '2px', use: 'The smallest inner details.', usedBy: 'Kbd, Skeleton, Tabs indicator, Toolbar, inner parts of Card, DataTable, Sonner' },
  { token: 'radius-md', value: '4px', use: 'Items inside a container and small controls.', usedBy: 'Menu and list items, Checkbox, Tooltip, Toggle, Tabs triggers, Sidebar items, Command (72 uses)' },
  { token: 'radius-lg', value: '6px', use: 'Text inputs and input-like controls.', usedBy: 'TextField, Select trigger, Combobox, Autocomplete, NumberField, InputGroup, InputOTP, Password, Filter, Chip' },
  { token: 'radius-xl', value: '8px', use: 'Buttons, and floating surfaces anchored to a trigger. A menu under a button is never rounder than the button.', usedBy: 'Button, DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select content, CodeBlock, CodeEditor, Terminal' },
  { token: 'radius-2xl', value: '10px', use: 'Compact card surfaces on a page.', usedBy: 'Card, Table, DataTable, Alert, Stat, Attachment, OptionCard, Dropzone, File, charts, Patterns blocks' },
  { token: 'radius-3xl', value: '12px', use: 'Dialogs and full-height panels.', usedBy: 'Dialog, AlertDialog, Drawer, LoginFormSplit' },
  { token: 'radius-4xl', value: '16px', use: 'Reserved for large containers.', usedBy: 'Not used by components yet' },
  { token: 'radius-5xl', value: '32px', use: 'Reserved for large decorative shapes.', usedBy: 'Not used by components yet' },
  { token: 'radius-max', value: '100px', use: 'Pills and round shapes.', usedBy: 'Badge, Progress, Switch, Slider, StatusDot, Stepper (today mostly as rounded-full)' },
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
  { token: '--color-focus-focus-ring', value: 'rgba(55, 149, 255, 0.4)', use: 'Default ring for every interactive control.', usedBy: 'Almost every control (65 uses of the 4px ring)' },
  { token: '--color-focus-focus-ring-error', value: 'rgba(208, 45, 75, 0.4)', use: 'Invalid fields, together with the danger border and background.', usedBy: 'TextField, Textarea, Select, Combobox, Autocomplete, DatePicker, NumberField, InputGroup, InputOTP, PromptArea, Slider' },
  { token: '--color-focus-focus-ring-success', value: 'rgba(55, 156, 97, 0.4)', use: 'Fields and cards in a success state.', usedBy: 'Card (success severity)' },
  { token: '--color-focus-focus-ring-warning', value: 'rgba(239, 179, 0, 0.4)', use: 'Fields and cards in a warning state.', usedBy: 'Card (warning severity)' },
  { token: '--color-focus-focus-ring-on-primary', value: 'white 30%', use: 'Controls that sit on a primary-filled surface. Invisible on the plain page by design.', usedBy: 'Checkbox (checked), DataTableToolbar bulk bar' },
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

const ELEVATION_ROWS: SpecRow[] = [
  { token: 'shadow-elevation-xs', value: '1 layer, 2px blur, 8%', use: 'A surface that sits in the page flow and only needs to lift off the background.', usedBy: 'Stat, CodeBlock, CodeEditor, Terminal, Card at rest (shadow-xs)' },
  { token: 'shadow-elevation-sm', value: '2 layers, 3px blur, 10%', use: 'Small raised details inside a control or a layout.', usedBy: 'Alert, Switch and Slider thumbs, Sidebar, Menubar trigger (shadow-sm)' },
  { token: 'shadow-elevation-md', value: '2 layers, 10px blur, 10%', use: 'Floating controls and short hints that hover over content.', usedBy: 'Tooltip, floating scroll buttons, DataTableToolbar bulk bar (shadow-md)' },
  { token: 'shadow-elevation-lg', value: '2 layers, 28px blur, 14%', use: 'Surfaces that drop out of a trigger: menus, popovers, listboxes.', usedBy: 'DropdownMenu, ContextMenu, Menubar, Popover, HoverCard, NavigationMenu, Select, chart tooltips (shadow-lg)' },
  { token: 'shadow-elevation-xl', value: '2 layers, 56px blur, 18%', use: 'Modal layers that take over the page.', usedBy: 'Dialog, AlertDialog, Drawer, PushSheet, Sonner (shadow-xl)' },
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
            Components still use Tailwind's generic shadow-xs ... shadow-xl with the same step names. Migration is a 1:1 rename (shadow-lg to shadow-elevation-lg). Focus rings drawn with box-shadow are a separate thing and stay as they are.
          </MigrationNote>
        </div>
      </Section>
    </Page>
  ),
};

/* ------------------------------ Motion ----------------------------- */

const DURATION_ROWS: SpecRow[] = [
  { token: 'duration-fast', value: '100ms', use: 'Micro feedback on the control itself.', usedBy: 'Checkbox, Radio and Switch check marks, DropdownMenu (duration-100)' },
  { token: 'duration-standard', value: '150ms', use: 'Default for hover, color, border and focus changes.', usedBy: '52 uses across almost every component (duration-150)' },
  { token: 'duration-moderate', value: '200ms', use: 'Overlays appearing, content expanding or collapsing.', usedBy: 'Dialog, AlertDialog, Accordion, Collapsible, Carousel (duration-200)' },
  { token: 'duration-slow', value: '300ms', use: 'Value changes and large panels.', usedBy: 'Progress, Meter, PushSheet (duration-300)' },
];

const EASING_ROWS: SpecRow[] = [
  { token: 'ease-enter', value: 'cubic-bezier(0, 0, 0.2, 1)', use: 'Things appearing and hover states. The default.', usedBy: '82 uses (ease-out)' },
  { token: 'ease-exit', value: 'cubic-bezier(0.4, 0, 1, 1)', use: 'Things leaving. Pair with ease-enter on the same element.', usedBy: 'Dialog, AlertDialog (ease-in)' },
  { token: 'ease-spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', use: 'Selection feedback with a small overshoot.', usedBy: 'Checkbox, Radio, Switch, Button' },
  { token: 'ease-press', value: 'cubic-bezier(0.4, 0, 0.2, 1)', use: 'Pressing a button down and releasing it.', usedBy: 'Button' },
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
            Components still use raw Tailwind values (duration-150, ease-out, inline cubic-bezier). Each maps 1:1 to a token above.
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
  { token: '--z-index-sticky', value: '100', use: 'Headers and bars that stick while the page scrolls.', usedBy: 'Topbar (z-40), AppShell header (z-50)' },
  { token: '--z-index-drawer', value: '200', use: 'Side and bottom panels that slide over the page.', usedBy: 'Drawer, PushSheet (z-50)' },
  { token: '--z-index-overlay', value: '300', use: 'The dimmed backdrop behind a modal.', usedBy: 'Dialog and AlertDialog overlays (z-50)' },
  { token: '--z-index-modal', value: '400', use: 'Dialog content above its backdrop.', usedBy: 'Dialog, AlertDialog (z-50)' },
  { token: '--z-index-popover', value: '500', use: 'Anything anchored to a trigger. Also works inside a modal.', usedBy: 'Popover, DropdownMenu, ContextMenu, Menubar, HoverCard, Select, NavigationMenu (z-50)' },
  { token: '--z-index-toast', value: '600', use: 'Notifications that must stay visible over any open layer.', usedBy: 'Sonner (its own z-index)' },
  { token: '--z-index-tooltip', value: '700', use: 'Tooltips. Always on top, because a tooltip belongs to whatever is under the cursor, including items inside menus and toasts.', usedBy: 'Tooltip (z-50)' },
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
            Today every overlay sits on the same z-50 and the order depends on which portal was added last. Migration moves each component to its layer above.
          </MigrationNote>
        </div>
      </Section>
    </Page>
  ),
};
