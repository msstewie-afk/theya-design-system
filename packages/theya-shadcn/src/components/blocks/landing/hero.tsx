import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { Wordmark } from './wordmark';

export type HeroLayout = 'centered' | 'split' | 'inset' | 'statement' | 'wordmark';

export interface HeroProps extends Omit<ComponentProps<'section'>, 'title'> {
  /**
   * `centered` — text in a narrow centred column, media below.
   * `split` — text on the start side, media beside it from lg up.
   * `inset` — a rounded card inside the page gutter with the media filling it
   * behind the text (a photo or a full product scene).
   */
  layout?: HeroLayout;
  /**
   * Above the title. A string is set as a small capitals label ("BOOKMARKS");
   * pass an element for an announcement pill ("New · Import from Safari →").
   */
  eyebrow?: ReactNode;
  /** The headline. HeroAccent marks a word or a whole line in another weight or face. */
  title: ReactNode;
  /** `sans` (Geologica) or `serif` (the display serif, EB Garamond) for the whole title. */
  titleFont?: 'sans' | 'serif';
  description?: ReactNode;
  /**
   * Between the description and the actions: chips that switch what the
   * media shows (by role, by use case) — Tabs variant="chips" or a ToggleGroup.
   */
  filters?: ReactNode;
  /** Buttons, or a one-line form (email + button). */
  actions?: ReactNode;
  /** A quiet line under the actions: platforms, "No credit card needed". */
  note?: ReactNode;
  /** The product visual: compose it from Theya components rather than a screenshot. */
  media?: ReactNode;
  /** Heading level of the title. A page has one h1: the hero's. */
  titleAs?: 'h1' | 'h2';
  /**
   * `wordmark` only: section links set in numbered columns under the
   * wordmark, as in the atlas's first screen 01.
   */
  links?: { label: ReactNode; href: string }[];
  /** A layer behind the content (a HeroTexture, an Aurora): centered and split only. */
  backdrop?: ReactNode;
}

export interface HeroAccentProps extends ComponentProps<'em'> {
  /**
   * `weight` — a heavier weight of the title face (Geologica has no italic).
   * `serif` — the display serif in italic, for a word or a line inside a sans
   * title (Era, Wispr); 1.12em so its cap height meets Geologica's, and a
   * 0.82 line box so a serif line under a sans one sits as close as the sans
   * lines do (the serif's small x-height leaves more white above it).
   * `italic` — italic of the same face, for a serif title.
   */
  variant?: 'weight' | 'serif' | 'italic';
  /** Put the accent on its own line (two lines, two faces). */
  line?: boolean;
}

const ACCENT: Record<NonNullable<HeroAccentProps['variant']>, string> = {
  weight: 'not-italic font-bold',
  serif: 'font-display-serif text-[1.12em] italic leading-[0.82]',
  italic: 'italic',
};

/** Emphasis inside a hero title: a word, or with `line` a whole line in another face. */
export function HeroAccent({ variant = 'weight', line = false, className, ...props }: HeroAccentProps) {
  // A tight serif line lets its descenders hang below the title box; on its
  // own line, give that space back so the description keeps its distance.
  return (
    <em
      data-slot="hero-accent"
      data-variant={variant}
      className={cn(ACCENT[variant], line && 'block', line && variant === 'serif' && 'pb-[0.1em]', className)}
      {...props}
    />
  );
}

/** The first section of a landing page: headline, one line of why, the main action. */
export function Hero({
  layout = 'centered',
  eyebrow,
  title,
  titleFont = 'sans',
  description,
  filters,
  actions,
  note,
  media,
  titleAs: Title = 'h1',
  links,
  backdrop,
  className,
  ...props
}: HeroProps) {
  const centered = layout === 'centered';
  const inset = layout === 'inset';

  const text = (
    <div className={cn('relative z-[1] flex flex-col', centered ? 'items-center text-center' : 'items-start')}>
      {eyebrow &&
        (typeof eyebrow === 'string' ? (
          <p data-slot="hero-eyebrow" className="m-0 mb-6 font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)]">
            {eyebrow}
          </p>
        ) : (
          <div data-slot="hero-eyebrow" className="mb-6">
            {eyebrow}
          </div>
        ))}
      {/* Centred: heading-3xl (44 → 96 px). Beside media or over an image the
          column is half as wide, so heading-2xl (36 → 64 px). */}
      <Title
        data-slot="hero-title"
        className={cn(
          'm-0 text-balance text-[var(--color-text-text)]',
          centered ? 'text-heading-3xl' : 'text-heading-2xl',
          // EB Garamond's small x-height makes the sans line-height (~1.04) look
          // loose; 0.92 sets its lines as close as the sans title sets its own.
          titleFont === 'serif' ? 'font-display-serif leading-[0.92]' : 'font-heading',
        )}
      >
        {title}
      </Title>
      {description && (
        <p className={cn('m-0 max-w-[36rem] font-body text-body-l text-pretty text-[var(--color-text-text-subtle)]', centered ? 'mt-8' : 'mt-6')}>{description}</p>
      )}
      {filters && <div className={cn('mt-8 flex flex-wrap gap-2', centered && 'justify-center')}>{filters}</div>}
      {/* On a phone the actions stack at full width instead of wrapping into two uneven rows. */}
      {actions && (
        <div className={cn('flex gap-3 max-sm:flex-col max-sm:self-stretch sm:flex-wrap', filters ? 'mt-6' : 'mt-8', centered && 'sm:justify-center')}>{actions}</div>
      )}
      {note && <p className="m-0 mt-4 font-body text-body-s text-[var(--color-text-text-subtle)]">{note}</p>}
    </div>
  );

  if (layout === 'statement') {
    // A phrase over a full-bleed scene (ld-02, the atlas's first screen 02): edge to edge, the statement at the bottom in display type, one
    // or two actions. A dark scene in both themes, like inset.
    return (
      <section
        data-slot="hero"
        data-layout="statement"
        data-scale="display"
        data-theme="dark"
        className={cn('relative isolate flex min-h-[min(100svh,64rem)] items-end overflow-hidden bg-[var(--color-bg-surface-bg-surface-sunken)] [color-scheme:dark]', className)}
        {...props}
      >
        {media && (
          <div data-slot="hero-media" className="absolute inset-0 -z-10 [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover">
            {media}
          </div>
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--color-bg-surface-bg-surface-sunken)] via-[color-mix(in_srgb,var(--color-bg-surface-bg-surface-sunken)_55%,transparent)] via-35% to-transparent to-70%" />
        <div className="container-display-wide w-full pb-[var(--display-section-padding)]">
          {eyebrow && <div className="mb-6 caption-mono text-[var(--color-text-text-subtle)]">{eyebrow}</div>}
          <Title data-slot="hero-title" className="m-0 max-w-[14ch] text-balance font-display text-display-xl text-[var(--color-text-text)]">
            {title}
          </Title>
          <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            {description && <p className="m-0 max-w-[32rem] font-body text-body-l text-pretty text-[var(--color-text-text-subtle)]">{description}</p>}
            {actions && <div className="flex shrink-0 gap-3 max-sm:flex-col max-sm:self-stretch">{actions}</div>}
          </div>
          {note && <p className="m-0 mt-4 font-body text-body-s text-[var(--color-text-text-subtle)]">{note}</p>}
        </div>
      </section>
    );
  }

  if (layout === 'wordmark') {
    // The name across the full width, a hairline, then the page in numbered
    // columns (ld-02, the atlas's first screen 01). The wordmark is the
    // page title, so `title` must be plain text.
    return (
      <section data-slot="hero" data-layout="wordmark" data-scale="display" className={cn('pt-[var(--display-gutter)]', className)} {...props}>
        <div className="container-display-wide">
          <Wordmark as={Title} className="text-[var(--color-text-text)]">
            {String(title)}
          </Wordmark>
          <div className="mt-[var(--display-gutter)] grid gap-8 border-t border-solid border-[var(--color-border-border)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {links && (
              <nav aria-label="Sections" className="lg:col-span-2">
                <ol className="m-0 grid list-none grid-cols-2 gap-x-8 gap-y-3 p-0">
                  {links.map((l, i) => (
                    <li key={l.href} className="flex items-baseline gap-3">
                      <span aria-hidden className="caption-mono text-[var(--color-text-text-subtle)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <a href={l.href} className="font-body text-body-m font-medium text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {description && <p className="m-0 font-body text-body-m text-pretty text-[var(--color-text-text-subtle)]">{description}</p>}
            {actions && <div className="flex flex-wrap items-start gap-3 lg:justify-end">{actions}</div>}
          </div>
        </div>
        {media && (
          <div data-slot="hero-media" className="container-display-wide mt-[var(--display-section-padding)]">
            {media}
          </div>
        )}
      </section>
    );
  }

  if (inset) {
    return (
      <section data-slot="hero" data-layout="inset" data-scale="display" className={cn('px-[var(--display-gutter)] pt-[var(--display-gutter)]', className)} {...props}>
        {/* A dark scene in both themes: the nested dark theme keeps the
            text and buttons on it legible whatever is behind. */}
        <div
          data-theme="dark"
          className="relative isolate mx-auto flex min-h-[min(80svh,52rem)] max-w-[var(--display-container-wide)] items-end overflow-hidden rounded-[var(--size-border-radius-border-radius-5xl)] bg-[var(--color-bg-surface-bg-surface-sunken)] p-[var(--display-gutter)] [color-scheme:dark] sm:p-16"
        >
          {media && (
            <div data-slot="hero-media" className="absolute inset-0 -z-10 [&>img]:size-full [&>img]:object-cover">
              {media}
            </div>
          )}
          {/* Scrim from the text side so the copy never sits on a busy image. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--color-bg-surface-bg-surface-sunken)] via-[color-mix(in_srgb,var(--color-bg-surface-bg-surface-sunken)_70%,transparent)] to-transparent sm:bg-gradient-to-r" />
          <div className="max-w-[40rem]">{text}</div>
        </div>
      </section>
    );
  }

  return (
    <section data-slot="hero" data-layout={layout} data-scale="display" className={cn('section-display', backdrop && 'relative isolate overflow-hidden', className)} {...props}>
      {backdrop && (
        <div data-slot="hero-backdrop" aria-hidden className="absolute inset-0 -z-10">
          {backdrop}
        </div>
      )}
      <div
        className={cn(
          'container-display',
          centered ? 'flex flex-col items-center gap-16 lg:gap-20' : 'grid items-center gap-12 lg:grid-cols-2 lg:gap-16',
        )}
      >
        {/* Centred titles get ~960px: two lines at 96px, as in the references;
            the description keeps its own 36rem measure. */}
        {centered ? <div className="max-w-[60rem]">{text}</div> : text}
        {media && (
          <div data-slot="hero-media" className="w-full min-w-0">
            {media}
          </div>
        )}
      </div>
    </section>
  );
}
