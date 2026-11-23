'use client';

import { useId, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Github, Linkedin, X as XIcon, Youtube } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TextField } from '../../ui/text-field';
import { StatusDot } from '../../ui/status-dot';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterNewsletter {
  /** "Get one useful email a month". */
  title: ReactNode;
  /** What they'll get and how often. */
  description?: ReactNode;
  /** The button. Default "Subscribe". */
  action?: string;
  /** Under the field: privacy, how to leave ("No spam. Unsubscribe in one click."). */
  note?: ReactNode;
  /** Shown in place of the form once subscribed. Default "Thanks — check your inbox to confirm." */
  success?: ReactNode;
  /**
   * Called with the address. Resolve when it's saved; throw (or reject) with
   * a message people can act on, and it shows under the field.
   */
  onSubscribe?: (email: string) => void | Promise<void>;
}

function NewsletterForm({ title, description, action = 'Subscribe', note, success = 'Thanks — check your inbox to confirm.', onSubscribe }: FooterNewsletter) {
  const uid = useId();
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string>();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    // The browser's own check (type="email", required) runs first; this is for a blank paste.
    if (!email) return setError('Enter your email address.');
    setError(undefined);
    setState('sending');
    try {
      await onSubscribe?.(email);
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error && err.message ? err.message : "That didn't go through. Try again in a moment.");
    }
  };
  return (
    // A surface panel, not the footer's tinted ground: the field's border is
    // measured against what it sits on, and on the tinted footer it fell
    // under 3:1 (contrast scan 1.4.11, 23.11). On the surface it holds.
    <section
      aria-labelledby={`${uid}-title`}
      className="grid gap-6 rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] @3xl:items-end @3xl:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2 id={`${uid}-title`} className="m-0 font-heading text-heading-s text-[var(--color-text-text)]">
          {title}
        </h2>
        {description && <p className="m-0 max-w-[36rem] font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
      <div className="min-w-0">
        {/* Always in the page, so the thank-you is read out when it fills in. */}
        <p role="status" className={cn('m-0 font-body text-body-m font-medium text-[var(--color-text-text)]', state !== 'done' && 'sr-only')}>
          {state === 'done' ? success : ''}
        </p>
        {state !== 'done' && (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 @md:flex-row @md:items-end">
              <div className="min-w-0 flex-1">
                <TextField
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  label="Email"
                  placeholder="you@company.com"
                  widthSize="full"
                  error={error}
                  disabled={state === 'sending'}
                />
              </div>
              {/* xl = 40px, the field's height. */}
              <Button type="submit" size="xl" loading={state === 'sending'} className="shrink-0 @max-md:w-full">
                {action}
              </Button>
            </div>
            {note && <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">{note}</p>}
          </form>
        )}
      </div>
    </section>
  );
}

export interface SiteFooterProps {
  appName?: string;
  /** The product mark; replaces the default initial-in-a-square next to `appName`. */
  logo?: ReactNode;
  /** One line about the product under the logo. */
  tagline?: string;
  columns: FooterColumn[];
  /** Ways to reach a person — the footer is where people look for them. */
  contact?: { label: string; value: string; href: string }[];
  status?: { label: string; href: string; tone: 'success' | 'warning' | 'danger' };
  /**
   * `country` (ISO 3166 alpha-2) picks the flag — languages have no flags of
   * their own, so say which country stands for it. `short` defaults to the
   * value in capitals ("EN").
   */
  languages?: { value: string; label: string; country: string; short?: string }[];
  language?: string;
  onLanguageChange?: (value: string) => void;
  social?: { network: 'github' | 'x' | 'linkedin' | 'youtube'; href: string }[];
  legal?: { label: string; href: string }[];
  /** A newsletter sign-up across the top of the footer. */
  newsletter?: FooterNewsletter;
  year?: number;
  className?: string;
  /**
   * Classes for the inner column. Defaults to a 1280px column with 24px
   * sides; on a landing page pass `container-display` so the footer lines up
   * with the header and the sections above it.
   */
  contentClassName?: string;
}

const SOCIAL: Record<NonNullable<SiteFooterProps['social']>[number]['network'], { label: string; icon: ReactNode }> = {
  // Decorative: the link carries the network's name (aria-label).
  github: { label: 'GitHub', icon: <Github aria-hidden="true" /> },
  x: { label: 'X', icon: <XIcon aria-hidden="true" /> },
  linkedin: { label: 'LinkedIn', icon: <Linkedin aria-hidden="true" /> },
  youtube: { label: 'YouTube', icon: <Youtube aria-hidden="true" /> },
};

/** Emoji flag from a country code (same approach as PhoneField). */
const flag = (country: string) => String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const linkClass =
  'rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m text-[var(--color-text-text-subtle)] underline-offset-4 outline-none hover:text-[var(--color-text-text)] hover:underline focus-visible:focus-ring';

// Small text (body-s): never underlined, not even on hover; one weight step heavier, hover is the color (Link's small-text rule).
const smallLinkClass =
  'rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-subtle)] outline-none hover:text-[var(--color-text-text)] focus-visible:focus-ring';

/**
 * The page's last stop and the place people scroll to on purpose: for
 * contact details, status, legal pages, a sitemap of the things the top
 * navigation doesn't fit. Every column is a titled list (all visible —
 * nothing hidden behind accordions), contact and system status sit up
 * front, language is a labelled control, legal links close the page.
 */
export function SiteFooter({
  appName = 'Theya',
  logo,
  tagline,
  columns,
  contact = [],
  status,
  languages = [],
  language,
  onLanguageChange,
  social = [],
  legal = [],
  newsletter,
  year = new Date().getFullYear(),
  className,
  contentClassName,
}: SiteFooterProps) {
  const uid = useId();
  const current = languages.find((l) => l.value === language);
  return (
    <footer className={cn('@container w-full border-t border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]', className)}>
      <div className={cn('flex flex-col gap-10 py-12', contentClassName ?? 'mx-auto max-w-7xl px-6')}>
        {newsletter && <NewsletterForm {...newsletter} />}
        <div className="grid gap-10 @4xl:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            {logo ?? (
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="grid size-8 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-primary-bg-primary)] font-body text-body-m font-semibold text-[var(--color-text-text-on-primary)]">
                  {appName.charAt(0)}
                </span>
                <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{appName}</span>
              </div>
            )}
            {tagline && <p className="max-w-xs font-body text-body-m text-[var(--color-text-text-subtle)]">{tagline}</p>}
            {contact.length > 0 && (
              <dl className="flex flex-col gap-2">
                {contact.map((c) => (
                  <div key={c.label} className="flex flex-col">
                    <dt className="font-body text-body-s text-[var(--color-text-text-subtle)]">{c.label}</dt>
                    <dd className="m-0">
                      <a href={c.href} className={cn(linkClass, 'font-medium text-[var(--color-text-text)]')}>
                        {c.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {status && (
              <a href={status.href} className={cn(linkClass, 'inline-flex items-center gap-2 self-start')}>
                <StatusDot tone={status.tone} />
                {status.label}
              </a>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 @2xl:grid-cols-4">
            {columns.map((col, i) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h2 id={`${uid}-${i}`} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
                  {col.title}
                </h2>
                <ul aria-labelledby={`${uid}-${i}`} className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={linkClass}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-solid border-[var(--color-border-border-subtler)] pt-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{`© ${year} ${appName}`}</p>
            {legal.map((l) => (
              <a key={l.href} href={l.href} className={smallLinkClass}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {languages.length > 1 && (
              <div className="flex items-center gap-2">
                <span id={`${uid}-lang`} className="font-body text-body-s text-[var(--color-text-text-subtle)]">
                  Language
                </span>
                <Select value={language} onValueChange={onLanguageChange} heightSize="sm">
                  {/* Trigger: flag + two letters, as wide as that needs. The list shows full names. */}
                  {/* Strong border: the footer is tinted, and the default field border drops under 3:1 on it. */}
                  <SelectTrigger aria-labelledby={`${uid}-lang`} className="w-auto gap-2 border-[var(--color-border-border-strong)]">
                    <SelectValue>
                      {current && (
                        <span className="inline-flex items-center gap-1">
                          <span aria-hidden="true">{flag(current.country)}</span>
                          <span aria-hidden="true">{current.short ?? current.value.toUpperCase()}</span>
                          <span className="sr-only">{current.label}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        <span aria-hidden="true" className="me-2">
                          {flag(l.country)}
                        </span>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {social.length > 0 && (
              <ul className="flex items-center gap-1">
                {social.map((s) => (
                  <li key={s.network}>
                    <a
                      href={s.href}
                      aria-label={`${appName} on ${SOCIAL[s.network].label}`}
                      className="grid size-8 place-items-center rounded-[var(--size-border-radius-border-radius-lg)] text-[var(--color-icon-icon-subtle)] outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)] focus-visible:focus-ring [&_svg]:size-4"
                    >
                      {SOCIAL[s.network].icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
