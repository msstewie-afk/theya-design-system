/**
 * Layout and type for the Foundations pages, matched to Storybook's Docs
 * pages (Button, SignUpForm): a 1000px column with 64px above it, the same
 * title, section heading and text styles, no boxes around text. Tables use
 * Theya's own Table, so they stack on a phone like every other table.
 */
import { Fragment, type ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

/** Text classes shared by the pages: Docs body text is body-m on a 24px line. */
export const TEXT = 'm-0 text-body-m leading-6 text-[var(--color-text-text)]';
export const LIST = 'm-0 flex list-disc flex-col gap-2 pl-5 text-body-m leading-6 text-[var(--color-text-text)]';
export const NUMBERED = 'm-0 flex list-decimal flex-col gap-2 pl-5 text-body-m leading-6 text-[var(--color-text-text)]';

/**
 * One Foundations page. Same frame as a Docs page: the stories that use it
 * set `layout: 'fullscreen'`, so this column owns all the spacing.
 * Headings get 40px above them (24px gap + 16px section margin), anything
 * else 24px.
 */
export function DocsPage({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[calc(1000px+2.5rem)] px-5 py-16 font-body text-[var(--color-text-text)]">
      <header className="flex flex-col gap-4">
        <h1 className="m-0 font-heading text-heading-l text-[var(--color-text-text)]">{title}</h1>
        {description && <p className="m-0 text-body-m leading-6 text-[var(--color-text-text-subtle)]">{description}</p>}
      </header>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </div>
  );
}

/** A section of a page: the same heading as a story or a guideline block on a Docs page. */
export function DocsSection({ title, description, children }: { title: string; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="mt-4 flex flex-col gap-4">
      <h2 className="m-0 font-heading text-heading-s text-[var(--color-text-text)]">{title}</h2>
      {description && <p className="m-0 text-body-m leading-6 text-[var(--color-text-text-subtle)]">{description}</p>}
      {children}
    </section>
  );
}

/** A heading inside a section. */
export function DocsSubheading({ children }: { children: ReactNode }) {
  return <h3 className="m-0 mt-2 text-body-l font-semibold text-[var(--color-text-text)]">{children}</h3>;
}

/** Inline code, the same as on Docs pages. */
export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-1 py-px font-mono text-[0.85em] text-[var(--color-text-text)]">{children}</code>;
}

/**
 * A token or class name that may wrap: break points after "-", "/", "(" and
 * ",", so a long name breaks between its parts instead of mid-word.
 */
export function Breakable({ children }: { children: string }) {
  const parts = children.split(/(?<=[-/(,])/);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <wbr />}
        </Fragment>
      ))}
    </>
  );
}

/**
 * A frame for a live specimen (shadows, radii, motion), like the story
 * canvas on a Docs page. `muted` puts it on the neutral fill, for things
 * that only show against a tint (shadows, nested surfaces).
 */
export function Preview({ muted = false, className = '', children }: { muted?: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-[var(--size-border-radius-border-radius-2xl)] p-6 ${
        muted ? 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]' : 'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** A short note under a scale: a known exception or where the values live. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-info-bg-info-subtle)] px-4 py-3 text-body-m leading-6 text-[var(--color-text-text)]">
      {children}
    </p>
  );
}

export type SpecRow = { token: string; value: string; use: ReactNode; usedBy: ReactNode };

/**
 * The four-column table of a scale: token, value, what it is for, where it
 * is used. From lg up names and values stay on one line; narrower, they
 * wrap between their parts, so the table always fits the column. On a
 * phone each row stacks (Table's default).
 */
export function SpecTable({
  rows,
  label,
  tokenLabel = 'Token',
  valueLabel = 'Value',
  usedByLabel = 'Used by',
}: {
  rows: SpecRow[];
  label: string;
  tokenLabel?: string;
  valueLabel?: string;
  usedByLabel?: string;
}) {
  return (
    <Table containerLabel={label}>
      <TableHeader>
        <TableRow>
          <TableHead>{tokenLabel}</TableHead>
          <TableHead>{valueLabel}</TableHead>
          <TableHead>Use for</TableHead>
          <TableHead>{usedByLabel}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.token}>
            <TableCell className="align-top font-mono text-body-s lg:whitespace-nowrap lg:[&_wbr]:hidden">
              <Breakable>{r.token}</Breakable>
            </TableCell>
            <TableCell className="align-top font-mono text-body-s text-[var(--color-text-text-subtle)] lg:whitespace-nowrap lg:[&_wbr]:hidden">
              <Breakable>{r.value}</Breakable>
            </TableCell>
            <TableCell className="align-top text-body-s">{r.use}</TableCell>
            <TableCell className="align-top text-body-s text-[var(--color-text-text-subtle)] sm:w-[28%]">{r.usedBy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
