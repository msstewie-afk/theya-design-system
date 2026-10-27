import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

// The sunken sheet a feature visual sits on. Radius follows the padding:
// the visual's 16px corners + 16 / 24px padding ≈ 32px (5xl).
export const mediaPanel =
  'flex min-h-[20rem] items-center justify-center rounded-[var(--size-border-radius-border-radius-5xl)] bg-[var(--color-bg-surface-bg-surface-sunken)] p-4 sm:p-6';

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

