import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { mediaPanel, SectionHead } from './feature-shared';

export interface FeatureSplitProps extends Omit<ComponentProps<'section'>, 'title'> {
  /**
   * `stacked` — title on the start side, description and link on the end
   * side, the visual full width below (Linear).
   * `side` — text beside the visual; `reverse` puts the visual first.
   */
  layout?: 'stacked' | 'side';
  /** With `side`: the visual on the start side. */
  reverse?: boolean;
  eyebrow?: ReactNode;
  /** The section title (h2). No full stop after the last sentence. */
  title: ReactNode;
  description?: ReactNode;
  /** One quiet link: "Learn more →". */
  link?: ReactNode;
  /** The product visual, built from Theya components (role="img" + label). */
  media?: ReactNode;
}

/** One feature, told in a title, a line or two, and a slice of the product. */
export function FeatureSplit({ layout = 'stacked', reverse = false, eyebrow, title, description, link, media, className, ...props }: FeatureSplitProps) {
  return (
    <section data-slot="feature-split" data-layout={layout} data-scale="display" className={cn('section-display', className)} {...props}>
      {layout === 'stacked' ? (
        <div className="container-display flex flex-col gap-12 lg:gap-16">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
            <SectionHead eyebrow={eyebrow} title={title} />
            {(description || link) && (
              <div
                // Line the text up with the title, not the eyebrow above it
                // (eyebrow line 20px + its 16px margin = 36px).
                className={cn('flex flex-col items-start gap-4', eyebrow ? 'lg:pt-9' : 'lg:pt-2')}
              >
                {description && <p className="m-0 text-pretty font-body text-body-l text-[var(--color-text-text-subtle)]">{description}</p>}
                {link}
              </div>
            )}
          </div>
          {media && <div className={mediaPanel}>{media}</div>}
        </div>
      ) : (
        <div className="container-display grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className={cn('flex flex-col items-start gap-6', reverse && 'lg:order-last')}>
            <SectionHead eyebrow={eyebrow} title={title} description={description} />
            {link}
          </div>
          {media && <div className={mediaPanel}>{media}</div>}
        </div>
      )}
    </section>
  );
}
