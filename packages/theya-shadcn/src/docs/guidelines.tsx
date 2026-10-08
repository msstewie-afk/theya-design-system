/**
 * Use-guidelines for component Docs pages. Each component keeps its own
 * guidelines as data (`<name>.guidelines.tsx` next to it) and passes them
 * through its stories' meta: `parameters: { guidelines }`. The Docs page
 * template (.storybook/docs-page.tsx) renders them in two parts: status
 * and when to use at the top, anatomy, do/don't and accessibility after
 * the stories — so every page has the same shape.
 */
/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { Check, Xmark } from 'iconoir-react';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';

export type ComponentStatus = 'stable' | 'beta' | 'deprecated';

export interface DoDontPair {
  do: { example: ReactNode; caption: ReactNode };
  dont: { example: ReactNode; caption: ReactNode };
}

export interface ComponentGuidelines {
  status: ComponentStatus;
  /** Deprecated only: what to use instead. */
  replacement?: string;
  whenToUse: ReactNode[];
  /** Each with the component to reach for instead, when there is one. */
  whenNotToUse: { text: ReactNode; instead?: string }[];
  anatomy: { part: string; description: ReactNode; optional?: boolean }[];
  doDont: DoDontPair[];
  a11y: ReactNode[];
}

const STATUS = {
  stable: { tone: 'success', label: 'Stable', note: 'Ready to use. Changes to its API go through deprecation first.' },
  beta: { tone: 'warning', label: 'Beta', note: 'Usable, but the API may still change.' },
  deprecated: { tone: 'danger', label: 'Deprecated', note: 'Don’t use in new work.' },
} as const;

function H({ children }: { children: ReactNode }) {
  return <h2 className="m-0 font-body text-heading-xs font-semibold text-[var(--color-text-text)]">{children}</h2>;
}

function Bullets({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn('m-0 flex list-disc flex-col gap-1.5 pl-5 font-body text-body-m text-[var(--color-text-text)]', className)}>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

/** Inline code inside guideline text. */
export function C({ children }: { children: ReactNode }) {
  return <code className="rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-1 py-px font-mono text-[0.85em] text-[var(--color-text-text)]">{children}</code>;
}

// Component names known to the library, from file names (no modules are
// loaded — the glob is lazy and only its keys are read). Used to set just
// the names inside an `instead` hint in code style, not the whole phrase.
const pascal = (kebab: string) => kebab.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
const COMPONENT_NAMES = new Set([
  ...Object.keys(import.meta.glob('../components/**/*.tsx'))
    .map((path) => path.split('/').pop()!.replace(/\.tsx$/, ''))
    .filter((name) => !/\.(stories|guidelines|test)$/.test(name))
    .map(pascal),
  // Exports whose name differs from their file.
  'TextArea', 'RadioGroup', 'Toaster', 'ColorField', 'RatingStar', 'FormItem', 'BreadcrumbEllipsis', 'PaginationEllipsis', 'InputOTP', 'formatPrice',
]);

// Splits on PascalCase words (optional plural "s") and code-like tokens:
// a.b calls/paths, prop="value", and Component(...) forms.
const INSTEAD_TOKEN = /(\b[A-Z][A-Za-z]*s?\b|\b\w+(?:\.\w+)+\b|\b\w+="[^"]*")/;

function isCode(token: string) {
  if (/\.|="/.test(token)) return true;
  return COMPONENT_NAMES.has(token) || (token.endsWith('s') && COMPONENT_NAMES.has(token.slice(0, -1)));
}

/** An `instead` hint: component names and code in code style, the rest plain. */
function Instead({ text }: { text: string }) {
  return (
    <>
      {text.split(INSTEAD_TOKEN).map((part, i) => (i % 2 === 1 && isCode(part) ? <C key={i}>{part}</C> : part))}
    </>
  );
}

/** Top of the page: status, when to use, when not to. */
export function GuidelinesIntro({ guidelines: g }: { guidelines: ComponentGuidelines }) {
  const s = STATUS[g.status];
  return (
    <div className="sb-unstyled my-8 flex flex-col gap-6">
      <p className="m-0 flex flex-wrap items-center gap-2 font-body text-body-s text-[var(--color-text-text-subtle)]">
        <Badge tone={s.tone}>{s.label}</Badge>
        {s.note}
        {g.replacement && (
          <span>
            {' Use '}
            <C>{g.replacement}</C>
            {' instead.'}
          </span>
        )}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <H>When to use</H>
          <Bullets items={g.whenToUse} />
        </section>
        <section className="flex flex-col gap-3">
          <H>When not to use</H>
          <Bullets
            items={g.whenNotToUse.map((w) => (
              <>
                {w.text}
                {w.instead && (
                  <>
                    {' → '}
                    <Instead text={w.instead} />
                  </>
                )}
              </>
            ))}
          />
        </section>
      </div>
    </div>
  );
}

function DoDontCard({ kind, example, caption }: { kind: 'do' | 'dont'; example: ReactNode; caption: ReactNode }) {
  const isDo = kind === 'do';
  return (
    // Two-column pairs: the figure spans both rows of the pair's grid as a
    // subgrid, so example and caption rows line up across Do and Don't — the
    // green and red lines sit at the same height whatever the caption length.
    <figure className="m-0 flex flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border)] md:row-span-2 md:grid md:grid-rows-subgrid md:gap-0">
      <div className="flex min-h-32 flex-1 items-center justify-center bg-[var(--color-bg-surface-bg-surface-base)] p-6">{example}</div>
      <figcaption
        className={cn(
          'flex flex-col gap-1 border-t-4 border-solid p-4',
          isDo ? 'border-t-[var(--color-border-border-success)]' : 'border-t-[var(--color-border-border-danger)]',
        )}
      >
        <span className={cn('inline-flex items-center gap-1.5 font-body text-body-m font-semibold', isDo ? 'text-[var(--color-text-text-success)]' : 'text-[var(--color-text-text-danger)]')}>
          {isDo ? <Check aria-hidden="true" className="size-4" /> : <Xmark aria-hidden="true" className="size-4" />}
          {isDo ? 'Do' : 'Don’t'}
        </span>
        <span className="font-body text-body-m text-[var(--color-text-text)]">{caption}</span>
      </figcaption>
    </figure>
  );
}

/** After the stories: anatomy, do / don't, accessibility. */
export function GuidelinesDetails({ guidelines: g, a11yStatus }: { guidelines: ComponentGuidelines; a11yStatus?: ReactNode }) {
  return (
    <div className="sb-unstyled my-10 flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <H>Anatomy</H>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 font-body text-body-m text-[var(--color-text-text)]">
          {g.anatomy.map((a) => (
            <li key={a.part}>
              <span className="font-semibold">{a.part}</span>
              {a.optional && <span className="text-[var(--color-text-text-subtle)]"> (optional)</span>}
              {' — '}
              {a.description}
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <H>Do and don’t</H>
        {g.doDont.map((p, i) => (
          <div key={i} className="grid gap-4 md:grid-cols-2 md:grid-rows-[1fr_auto] md:gap-y-0">
            <DoDontCard kind="do" {...p.do} />
            <DoDontCard kind="dont" {...p.dont} />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <H>Accessibility</H>
        <Bullets items={g.a11y} />
        {a11yStatus}
      </section>
    </div>
  );
}
