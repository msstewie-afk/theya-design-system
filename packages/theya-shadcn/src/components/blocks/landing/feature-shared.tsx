import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { warnDeprecated } from '../../../lib/deprecation';

/**
 * The face of a landing title.
 * - `theme` — the theme's heading font (whatever the profile sets: Geologica,
 *   Playfair Display in ember, Schibsted Grotesk in the gradient themes).
 * - `display-serif` — Theya's own display serif (EB Garamond), whatever the theme.
 * `sans` and `serif` are the old names of the same two values, kept so
 * existing pages do not break. `sans` read as "a sans-serif" and led agents
 * to pick `serif` on a serif theme (PlateCovery, 21.11).
 */
export type TitleFont = 'theme' | 'display-serif' | /** @deprecated use 'theme' */ 'sans' | /** @deprecated use 'display-serif' */ 'serif';

/** Classes for a TitleFont: the family and, for the display serif, its tighter line height. */
export function titleFontClass(font: TitleFont = 'theme') {
  if (font === 'sans') warnDeprecated('titleFont sans', "use titleFont=\"theme\" (the theme's heading face).");
  if (font === 'serif') warnDeprecated('titleFont serif', 'use titleFont="display-serif" (EB Garamond).');
  return font === 'display-serif' || font === 'serif' ? 'font-display-serif leading-[0.92]' : 'font-heading';
}

// The sunken sheet a feature visual sits on. Radius follows the padding:
// the visual's 16px corners + 16 / 24px padding ≈ 32px (5xl). The visual
// fills the sheet, so the padding is the same on all four sides (no min
// height with a centred visual: that left wide bands above and below).
export const mediaPanel =
  'flex flex-col rounded-[var(--size-border-radius-border-radius-5xl)] bg-[var(--color-bg-surface-bg-surface-sunken)] p-4 sm:p-6 [&>*]:w-full [&>*]:max-w-none';

export function SectionHead({
  eyebrow,
  title,
  description,
  titleAs: Title = 'h2',
  align = 'start',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  titleAs?: 'h2' | 'h3';
  align?: 'start' | 'center';
}) {
  return (
    <div className={cn('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start')}>
      {eyebrow && <p className="m-0 mb-4 font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)]">{eyebrow}</p>}
      <Title className="m-0 text-balance font-heading text-heading-2xl text-[var(--color-text-text)]">{title}</Title>
      {description && <p className="m-0 mt-4 max-w-[36rem] text-pretty font-body text-body-l text-[var(--color-text-text-subtle)]">{description}</p>}
    </div>
  );
}

