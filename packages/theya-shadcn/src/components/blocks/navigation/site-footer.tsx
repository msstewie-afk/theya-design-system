'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { Github, Linkedin, X as XIcon, Youtube } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { StatusDot } from '../../ui/status-dot';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SiteFooterProps {
  appName?: string;
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
  year?: number;
  className?: string;
}

const SOCIAL: Record<NonNullable<SiteFooterProps['social']>[number]['network'], { label: string; icon: ReactNode }> = {
  github: { label: 'GitHub', icon: <Github /> },
  x: { label: 'X', icon: <XIcon /> },
  linkedin: { label: 'LinkedIn', icon: <Linkedin /> },
  youtube: { label: 'YouTube', icon: <Youtube /> },
};

/** Emoji flag from a country code (same approach as PhoneField). */
const flag = (country: string) => String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const linkClass =
  'rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m text-[var(--color-text-text-subtle)] underline-offset-4 outline-none hover:text-[var(--color-text-text)] hover:underline focus-visible:focus-ring';

/**
 * The page's last stop and the place people scroll to on purpose: for
 * contact details, status, legal pages, a sitemap of the things the top
 * navigation doesn't fit. Every column is a titled list (all visible —
 * nothing hidden behind accordions), contact and system status sit up
 * front, language is a labelled control, legal links close the page.
 */
export function SiteFooter({
  appName = 'Theya',
  tagline,
  columns,
  contact = [],
  status,
  languages = [],
  language,
  onLanguageChange,
  social = [],
  legal = [],
  year = new Date().getFullYear(),
  className,
}: SiteFooterProps) {
  const uid = useId();
  const current = languages.find((l) => l.value === language);
  return (
    <footer className={cn('@container w-full border-t border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]', className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12">
        <div className="grid gap-10 @4xl:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="grid size-8 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-primary-bg-primary)] font-body text-body-m font-semibold text-[var(--color-text-text-on-primary)]">
                {appName.charAt(0)}
              </span>
              <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{appName}</span>
            </div>
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
              <a key={l.href} href={l.href} className={cn(linkClass, 'text-body-s')}>
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
                  <SelectTrigger aria-labelledby={`${uid}-lang`} className="w-auto gap-2">
                    <SelectValue>
                      {current && (
                        <span className="inline-flex items-center gap-1.5">
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
