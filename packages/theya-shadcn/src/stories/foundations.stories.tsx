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

export const BorderRadius: Story = {
  name: 'Border radius',
  render: () => (
    <Page>
      <Section title="Border radius scale" description="--size-border-radius-border-radius-{sm,md,lg,xl,2xl,3xl,max}.">
        <div className="flex flex-wrap gap-6">
          {['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'max'].map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div className="size-20 border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]" style={{ borderRadius: `var(--size-border-radius-border-radius-${r})` }} />
              <p className="font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">--size-border-radius-border-radius-{r}</p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

const FOCUS_RINGS = [
  { label: 'Default', cls: 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]', onPrimary: false },
  { label: 'Error', cls: 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]', onPrimary: false },
  { label: 'Success', cls: 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-success)]', onPrimary: false },
  { label: 'Warning', cls: 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-warning)]', onPrimary: false },
  { label: 'On primary', cls: 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-on-primary)]', onPrimary: true },
] as const;

export const FocusRing: Story = {
  name: 'Focus ring',
  render: () => (
    <Page>
      <Section title="Focus ring" description="Five ring tokens exist, not one: --color-focus-focus-ring-{default,error,success,warning,on-primary}. Tab to each control to see its ring. 'on-primary' is a white-alpha ring (rgb(255 255 255 / 0.3), see globals.css) meant for a control sitting ON a primary-filled surface — a box-shadow ring renders OUTSIDE its element, over whatever is behind it, so it only reads against a primary-colored backdrop, never against plain page background (that was this demo's bug until Мария caught it, 2026-09-27: it put the ring on a primary-filled BUTTON sitting on the plain white page, so the ring rendered over white and was invisible).">
        <div className="flex flex-wrap gap-6">
          {FOCUS_RINGS.filter((r) => !r.onPrimary).map(({ label, cls }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <button
                type="button"
                className={`w-fit rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-2 text-sm text-[var(--color-text-text)] outline-none ${cls}`}
              >
                Tab to me
              </button>
              <span className="font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">{label}</span>
            </div>
          ))}
          {FOCUS_RINGS.filter((r) => r.onPrimary).map(({ label, cls }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary)] p-4">
              <button
                type="button"
                className={`w-fit rounded-[var(--size-border-radius-border-radius-md)] border border-transparent bg-[var(--color-bg-primary-on-primary)] px-4 py-2 text-sm text-[var(--color-text-text-primary)] outline-none ${cls}`}
              >
                Tab to me
              </button>
              <span className="font-mono text-[0.6875rem] text-[var(--color-text-text-on-primary)]">{label}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

export const Elevation: Story = {
  render: () => (
    <Page>
      <Section title="Elevation" description="shadow-elevation-{xs,sm,md,lg,xl} — a Theya-specific ink-tinted scale (rgba(27,27,31,…)), additive alongside Tailwind's own generic shadow-sm/md/lg/xl/2xl utilities already used across the codebase.">
        <div className="flex flex-wrap gap-6 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-6">
          {([
            { s: 'xs', cls: 'grid size-20 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] font-mono text-[11px] text-[var(--color-text-text-subtle)] shadow-elevation-xs' },
            { s: 'sm', cls: 'grid size-20 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] font-mono text-[11px] text-[var(--color-text-text-subtle)] shadow-elevation-sm' },
            { s: 'md', cls: 'grid size-20 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] font-mono text-[11px] text-[var(--color-text-text-subtle)] shadow-elevation-md' },
            { s: 'lg', cls: 'grid size-20 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] font-mono text-[11px] text-[var(--color-text-text-subtle)] shadow-elevation-lg' },
            { s: 'xl', cls: 'grid size-20 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] font-mono text-[11px] text-[var(--color-text-text-subtle)] shadow-elevation-xl' },
          ] as const).map(({ s, cls }) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={cls}>
                {s}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

export const Motion: Story = {
  render: () => (
    <Page>
      <Section title="Motion" description="duration-{fast,standard,moderate,slow} — semantic names for the duration values already dominant in the codebase (duration-150 alone: 53 uses). Easing needs no new token: ease-out/ease-in are already real Tailwind defaults.">
        <div className="flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5">
          {([
            { name: 'fast', ms: 100, cls: 'h-full w-full origin-left scale-x-0 rounded-full bg-[var(--color-bg-primary-bg-primary)] ease-out animate-[grow_2.4s_ease-in-out_infinite] duration-fast' },
            { name: 'standard', ms: 150, cls: 'h-full w-full origin-left scale-x-0 rounded-full bg-[var(--color-bg-primary-bg-primary)] ease-out animate-[grow_2.4s_ease-in-out_infinite] duration-standard' },
            { name: 'moderate', ms: 200, cls: 'h-full w-full origin-left scale-x-0 rounded-full bg-[var(--color-bg-primary-bg-primary)] ease-out animate-[grow_2.4s_ease-in-out_infinite] duration-moderate' },
            { name: 'slow', ms: 300, cls: 'h-full w-full origin-left scale-x-0 rounded-full bg-[var(--color-bg-primary-bg-primary)] ease-out animate-[grow_2.4s_ease-in-out_infinite] duration-slow' },
          ] as const).map(({ name, ms, cls }) => (
            <div key={name} className="flex items-center gap-4">
              <span className="w-24 shrink-0 font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">duration-{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
                <div className={cls} />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[0.6875rem] text-[var(--color-text-text-subtle)]">{ms}ms</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes grow { 0%, 10% { transform: scaleX(0); } 50%, 60% { transform: scaleX(1); } 100% { transform: scaleX(1); } }`}</style>
      </Section>
    </Page>
  ),
};

const Z_LAYERS: [string, number][] = [
  ['z-index-base', 1],
  ['z-index-sticky', 100],
  ['z-index-drawer', 200],
  ['z-index-overlay', 300],
  ['z-index-modal', 400],
  ['z-index-popover', 500],
  ['z-index-toast', 600],
];

export const Layering: Story = {
  name: 'Layering (z-index)',
  render: () => (
    <Page>
      <Section title="Layering (z-index)" description="A single coordinated stacking order, additive alongside the raw z-10/z-40/z-50/z-[1]/z-[2] numbers already scattered across components (grep 2026-09-26). Tailwind v4's z-index utility isn't @theme-namespaced (confirmed live, 2026-09-26 — it's a fixed utility, unlike shadow/duration) — consume these via the z-(--custom-property) syntax, e.g. z-(--z-index-modal), not a short z-modal class. Adopt per component incrementally, not a forced migration.">
        <div className="overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]">
          {Z_LAYERS.map(([name, value], i) => (
            <div
              key={name}
              className="flex items-center justify-between border-b border-solid border-[var(--color-border-border-subtle)] px-4 py-2 last:border-b-0"
              style={{ background: i % 2 ? 'var(--color-bg-surface-bg-surface)' : 'var(--color-bg-neutral-bg-neutral-subtle)' }}
            >
              <span className="font-mono text-xs text-[var(--color-text-text)]">--{name}</span>
              <span className="font-mono text-xs text-[var(--color-text-text-subtle)]">{value}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-6 h-24 w-full">
          <div className="absolute left-16 top-8 z-(--z-index-toast) flex h-16 w-32 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary)] font-mono text-xs text-[var(--color-text-text-on-dark)]">
            z-(--z-index-toast)
          </div>
          <div className="absolute left-8 top-0 z-10 flex h-16 w-32 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-danger-bg-danger)] font-mono text-xs text-[var(--color-text-text-on-dark)]">
            z-10 (plain Tailwind)
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-text-subtle)]">Live proof the token actually works: the toast box is drawn FIRST in the DOM (would lose to the later z-10 box under plain paint order) yet correctly renders on top, because 600 &gt; 10.</p>
      </Section>
    </Page>
  ),
};
