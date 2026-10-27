'use client';

import { useRef, type ComponentProps, type PointerEvent, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { SurfaceEffect } from '../../ui/surface-effect';

/*
 * Landing cards: the card kinds landing pages use most (monday, GitHub,
 * Clerk, Linear, Atlassian), on one base. Bigger than product Cards
 * (16px radius, 24px padding, display type) and with landing hover
 * behaviours. A whole-card link is a real <a> on the title, stretched over
 * the card, so the card has one accessible name and one Tab stop.
 */

export type LandingCardSurface = 'outlined' | 'sunken' | 'tonal' | 'inverse' | 'primary';
/** Tonal fills, theme-aware (light and dark): the pastel product cards. */
export type LandingCardHue = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'neutral';
/**
 * `lift` rises with a larger shadow; `spotlight` a glow follows the pointer;
 * `beam` a light runs round the border while hovered or focused (GitHub);
 * `shine` a streak sweeps across; `tilt` turns toward the pointer. All
 * pointer-only and off under reduced motion.
 */
export type LandingCardHover = 'none' | 'lift' | 'spotlight' | 'beam' | 'shine' | 'tilt';

const HUE: Record<LandingCardHue, string> = {
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)]',
  secondary: 'bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)]',
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
};

// On a tinted fill the subtle ink drops under 4.5:1 on some hues, so body
// text uses the full ink and links the on-tonal link color.
const ON_TONAL = '[--color-text-text-subtle:var(--color-text-text)] [--color-text-text-link:var(--color-text-text-link-on-tonal)]';

const SURFACE: Record<Exclude<LandingCardSurface, 'tonal'>, string> = {
  outlined: 'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
  sunken: 'bg-[var(--color-bg-surface-bg-surface-sunken)]',
  inverse: 'bg-[var(--color-bg-surface-bg-surface-sunken)] [color-scheme:dark]',
  primary: cn(
    'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]',
    '[--color-text-text:var(--color-text-text-on-primary)]',
    '[--color-text-text-subtle:var(--color-text-text-subtle-on-primary)]',
    '[--color-text-text-link:var(--color-text-text-on-primary)]',
    '[--color-icon-icon:var(--color-text-text-on-primary)]',
    '[--color-icon-icon-subtle:var(--color-icon-icon-on-primary)]',
    '[--color-border-border-subtler:var(--color-border-border-subtler-on-primary)]',
  ),
};

const RADIUS = 'rounded-[var(--size-border-radius-border-radius-4xl)]';

// The SurfaceEffect presets are tuned for dark panels; on a light page a
// white streak or a 22% glow all but disappears. Landing cards push them so
// they read in both themes.
const HOVER_FX: Partial<Record<LandingCardHover, string>> = {
  // A 2px ring for the light to run round; a shadow while it runs.
  beam: 'p-0.5 transition-shadow duration-standard hover:shadow-elevation-lg focus-within:shadow-elevation-lg',
  // A primary-tinted streak instead of white: visible on a white card too.
  shine: 'before:w-2/5 before:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-icon-icon-primary)_24%,transparent),transparent)]',
  // A shorter perspective makes the same turn read as depth, plus a shadow.
  tilt: '[transform:perspective(600px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] transition-[transform,box-shadow] hover:shadow-elevation-lg',
};

export interface LandingCardProps extends ComponentProps<'article'> {
  surface?: LandingCardSurface;
  /** With surface="tonal". */
  hue?: LandingCardHue;
  hover?: LandingCardHover;
}

/** The base every landing card is built on. Use it directly for a custom card. */
export function LandingCard({ surface = 'outlined', hue = 'primary', hover = 'none', className, children, onPointerMove, ...props }: LandingCardProps) {
  const ref = useRef<HTMLElement>(null);
  // Spotlight is drawn inside the card, between its fill and its content
  // (a glow under the card would be hidden by the card's own background).
  const track = (event: PointerEvent<HTMLElement>) => {
    onPointerMove?.(event as PointerEvent<HTMLElement> & PointerEvent<HTMLDivElement>);
    if (hover !== 'spotlight' || event.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--spot-x', `${event.clientX - r.left}px`);
    ref.current.style.setProperty('--spot-y', `${event.clientY - r.top}px`);
  };
  const card = (
    <article
      ref={ref}
      onPointerMove={track}
      data-slot="landing-card"
      data-surface={surface === 'primary' ? 'primary' : undefined}
      data-theme={surface === 'inverse' ? 'dark' : undefined}
      className={cn(
        'relative isolate flex h-full min-w-0 flex-col overflow-hidden text-[var(--color-text-text)]',
        RADIUS,
        surface === 'tonal' ? [HUE[hue], ON_TONAL] : SURFACE[surface],
        // The stretched title link draws the focus ring round the whole card.
        'has-[[data-card-link]:focus-visible]:focus-ring',
        // Spotlight, tilt and lift also turn an outlined card's border primary while hovered.
        surface === 'outlined' && (hover === 'spotlight' || hover === 'tilt' || hover === 'lift') && 'transition-colors duration-standard hover:border-[var(--color-border-border-primary)] group-hover/fx:border-[var(--color-border-border-primary)]',
        hover === 'beam' && 'border-0',
        className,
      )}
      {...props}
    >
      {hover === 'spotlight' && (
        <span
          aria-hidden
          // Physical left/top: the pointer position is measured from the left edge in any direction.
          className="pointer-events-none absolute -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-icon-icon-primary)_28%,transparent),transparent_70%)] opacity-0 transition-opacity duration-moderate [left:var(--spot-x,-999px)] [top:var(--spot-y,-999px)] group-hover/spot:opacity-100 motion-reduce:hidden"
        />
      )}
      {children}
    </article>
  );
  if (hover === 'none') return card;
  // The spotlight needs no wrapper: it lives inside the card.
  if (hover === 'spotlight') return <div className="group/spot h-full min-w-0">{card}</div>;
  return (
    <SurfaceEffect
      effect={hover}
      maxTilt={14}
      className={cn(
        'group/fx h-full min-w-0',
        RADIUS,
        HOVER_FX[hover],
        // The beam runs only while the card is hovered or focused: nothing moves on its own.
        hover === 'beam' && 'before:[animation-play-state:paused] hover:before:[animation-play-state:running] focus-within:before:[animation-play-state:running]',
      )}
    >
      {card}
    </SurfaceEffect>
  );
}

/** The card's title; with `href` it is the link for the whole card. */
function CardTitleLink({
  href,
  children,
  className,
  as: Tag = 'h3',
  'aria-label': ariaLabel,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'p';
  /** A fuller name for the link; it must start with the visible title (WCAG 2.5.3). */
  'aria-label'?: string;
}) {
  return (
    <Tag className={cn('m-0 text-balance font-heading text-[var(--color-text-text)]', className)}>
      {href ? (
        <a href={href} aria-label={ariaLabel} data-card-link className="text-inherit no-underline outline-none after:absolute after:inset-0 after:z-10 after:content-['']">
          {children}
        </a>
      ) : (
        children
      )}
    </Tag>
  );
}

const linkLabel = 'mt-auto inline-flex items-center gap-1 pt-4 font-body text-body-m font-medium text-[var(--color-text-text-link)]';

// ---------------------------------------------------------------------------

export interface FeatureCardProps extends Omit<LandingCardProps, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  /** The visible link text at the bottom ("Learn more"); the title stays the link's name. */
  linkLabel?: ReactNode;
  /**
   * monday: the description is folded away until the card is hovered or
   * holds focus. Only on devices that can hover; on touch it is always open.
   */
  expand?: boolean;
}

/** Icon, title, one or two sentences, a link (GitHub, monday “Full control”). */
export function FeatureCard({ icon, title, description, href, linkLabel: label, expand = false, className, ...props }: FeatureCardProps) {
  return (
    <LandingCard className={cn('group/fc gap-4 p-6 lg:p-8', className)} {...props}>
      {icon && (
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-icon-icon-primary)] shadow-elevation-sm [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <CardTitleLink href={href} className="text-heading-xs font-semibold">
        {title}
      </CardTitleLink>
      {description && (
        <div
          className={cn(
            'grid',
            expand &&
              '[@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/fc:grid-rows-[1fr] [@media(hover:hover)]:group-hover/fc:opacity-100 [@media(hover:hover)]:group-focus-within/fc:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within/fc:opacity-100 motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-moderate motion-safe:ease-enter',
          )}
        >
          <p className="m-0 min-h-0 overflow-hidden font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>
        </div>
      )}
      {href && label && (
        <span aria-hidden className={linkLabel}>
          {label}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </span>
      )}
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface MediaCardProps extends Omit<LandingCardProps, 'title'> {
  /** A visual built from components (role="img" + label) or an <img>. */
  media: ReactNode;
  /** `top` (default) or `bottom`: the media bleeds to the card's edge on that side. */
  mediaPosition?: 'top' | 'bottom';
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
}

/** A slice of the product, then a caption (Clerk, Atlassian, Linear). */
export function MediaCard({ media, mediaPosition = 'top', eyebrow, title, description, href, className, ...props }: MediaCardProps) {
  const mediaBox = (
    <div
      data-slot="media-card-media"
      className={cn(
        'flex min-h-[14rem] flex-1 items-center justify-center overflow-hidden bg-[var(--color-bg-surface-bg-surface-sunken)] p-6 [&>img]:size-full [&>img]:object-cover',
        mediaPosition === 'top' ? 'border-b' : 'border-t',
        'border-solid border-[var(--color-border-border-subtler)] border-x-0',
        mediaPosition === 'top' ? 'border-t-0' : 'border-b-0',
      )}
    >
      {media}
    </div>
  );
  return (
    <LandingCard className={className} {...props}>
      {mediaPosition === 'top' && mediaBox}
      <div className="flex flex-col gap-2 p-6">
        {eyebrow && <p className="m-0 font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)]">{eyebrow}</p>}
        <CardTitleLink href={href} className="text-heading-xs font-semibold">
          {title}
        </CardTitleLink>
        {description && <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
      {mediaPosition === 'bottom' && mediaBox}
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface StatCardProps extends Omit<LandingCardProps, 'title'> {
  /** The number, as text or a CountUp. */
  value: ReactNode;
  label: ReactNode;
  /** Where the number comes from: "Forrester TEI study, 2026", a logo. */
  source?: ReactNode;
}

/** One big number with what it measures and where it comes from (monday ROI, Miro). */
export function StatCard({ value, label, source, className, ...props }: StatCardProps) {
  return (
    <LandingCard className={cn('justify-between gap-8 p-6 lg:p-8', className)} {...props}>
      <div className="flex flex-col gap-2">
        <p className="m-0 font-heading text-heading-2xl font-semibold tabular-nums text-[var(--color-text-text)]">{value}</p>
        <p className="m-0 font-body text-body-l text-[var(--color-text-text)]">{label}</p>
      </div>
      {source && <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">{source}</p>}
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface StoryCardProps extends Omit<LandingCardProps, 'title'> {
  media?: ReactNode;
  /** The customer: the card's title, and the link's name with `href`. */
  company: string;
  /** Their industry or team, above the name. */
  label?: ReactNode;
  /** The result: value + what it means ("40%", "less time looking for links"). */
  stat?: { value: ReactNode; label: ReactNode };
  quote?: ReactNode;
  /** Who said it: name and role. */
  cite?: ReactNode;
  href?: string;
  linkLabel?: ReactNode;
}

/** A customer story: who, the result as a number, a line in their words (monday). */
export function StoryCard({ media, company, label, stat, quote, cite, href, linkLabel: link = 'Read the story', className, ...props }: StoryCardProps) {
  return (
    <LandingCard className={className} {...props}>
      {media && <div className="flex min-h-[12rem] items-center justify-center overflow-hidden bg-[var(--color-bg-surface-bg-surface-sunken)] p-6 [&>img]:size-full [&>img]:object-cover">{media}</div>}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          {label && <p className="m-0 font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)]">{label}</p>}
          <CardTitleLink href={href} aria-label={`${company}: ${typeof link === 'string' ? link.toLowerCase() : 'read the story'}`} className="text-heading-xs font-semibold">
            {company}
          </CardTitleLink>
        </div>
        {stat && (
          <p className="m-0 flex flex-col">
            <span className="font-heading text-heading-xl font-semibold tabular-nums">{stat.value}</span>
            <span className="font-body text-body-m text-[var(--color-text-text-subtle)]">{stat.label}</span>
          </p>
        )}
        {quote && (
          <figure className="m-0 flex flex-col gap-2">
            <blockquote className="m-0 font-body text-body-l text-[var(--color-text-text)]">{quote}</blockquote>
            {cite && <figcaption className="font-body text-body-s text-[var(--color-text-text-subtle)]">{cite}</figcaption>}
          </figure>
        )}
        {href && (
          <span aria-hidden className={linkLabel}>
            {link}
            <ArrowRight className="size-4 rtl:-scale-x-100" />
          </span>
        )}
      </div>
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface QuoteCardProps extends Omit<LandingCardProps, 'role' | 'title'> {
  quote: ReactNode;
  name: ReactNode;
  /** Their role and company. */
  title?: ReactNode;
  /** An Avatar, or initials. */
  avatar?: ReactNode;
  /** Set the quote in the display serif (Wispr). */
  serif?: boolean;
}

/** A testimonial: the words first, then who said them. */
export function QuoteCard({ quote, name, title: role, avatar, serif = false, className, ...props }: QuoteCardProps) {
  return (
    <LandingCard className={cn('p-6 lg:p-8', className)} {...props}>
      <figure className="m-0 flex h-full flex-col justify-between gap-8">
        <blockquote className={cn('m-0 text-pretty text-[var(--color-text-text)]', serif ? 'font-display-serif text-heading-m leading-snug' : 'font-body text-body-l')}>
          {quote}
        </blockquote>
        <figcaption className="flex items-center gap-3">
          {avatar}
          <span className="flex flex-col">
            <span className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{name}</span>
            {role && <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">{role}</span>}
          </span>
        </figcaption>
      </figure>
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface LinkCardProps extends Omit<LandingCardProps, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href: string;
}

/** A big title and an arrow in the corner; the whole card is the link (docs, guides, “Explore”). */
export function LinkCard({ eyebrow, title, description, href, className, ...props }: LinkCardProps) {
  return (
    <LandingCard className={cn('group/lc min-h-[12rem] justify-between gap-8 p-6 lg:p-8', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        {eyebrow ? <p className="m-0 font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)]">{eyebrow}</p> : <span />}
        <ArrowUpRight
          aria-hidden
          className="size-6 shrink-0 text-[var(--color-icon-icon)] motion-safe:transition-transform motion-safe:duration-standard group-hover/lc:-translate-y-0.5 group-hover/lc:translate-x-0.5 rtl:-scale-x-100"
        />
      </div>
      <div className="flex flex-col gap-2">
        <CardTitleLink href={href} className="text-heading-xl font-semibold">
          {title}
        </CardTitleLink>
        {description && <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface BentoGridProps extends ComponentProps<'div'> {
  /** Columns from lg up (one column on phones, two from sm). */
  columns?: 2 | 3 | 4;
}

const COLS: Record<NonNullable<BentoGridProps['columns']>, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

/** A grid of cards of different sizes (Clerk, Linear). Size each one with BentoItem. */
export function BentoGrid({ columns = 3, className, ...props }: BentoGridProps) {
  return <div data-slot="bento-grid" className={cn('grid auto-rows-[minmax(14rem,auto)] gap-4 sm:grid-cols-2 lg:gap-6', COLS[columns], className)} {...props} />;
}

export interface BentoItemProps extends ComponentProps<'div'> {
  /** Columns it spans from lg up (from sm a 2 becomes the full row). */
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

const COL_SPAN = { 1: '', 2: 'sm:col-span-2', 3: 'sm:col-span-2 lg:col-span-3', 4: 'sm:col-span-2 lg:col-span-4' } as const;

export function BentoItem({ colSpan = 1, rowSpan = 1, className, ...props }: BentoItemProps) {
  return <div data-slot="bento-item" className={cn('min-w-0', COL_SPAN[colSpan], rowSpan === 2 && 'lg:row-span-2', className)} {...props} />;
}
