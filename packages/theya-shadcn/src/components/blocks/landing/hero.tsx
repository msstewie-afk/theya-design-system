import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export type HeroLayout = 'centered' | 'split' | 'inset';

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
    <section data-slot="hero" data-layout={layout} data-scale="display" className={cn('section-display', className)} {...props}>
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
