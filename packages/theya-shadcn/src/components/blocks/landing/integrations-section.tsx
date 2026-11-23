'use client';

import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { tonalFillAt } from '../../../lib/tonal-fills';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { SectionHead } from './feature-shared';

export interface Integration {
  id: string;
  /** The service's name. Made-up services in Theya's own stories (no real brands). */
  name: string;
  /** Its mark: an icon or a small SVG, drawn at 24px. Decorative; the name names it. */
  icon: ReactNode;
  /** One line: what connecting it does ("Saves starred messages as links"). */
  description?: ReactNode;
  /** Grid filter group ("Chat", "Storage"). */
  category?: string;
  /** The integration's page. Makes the whole card a link. */
  href?: string;
}

export interface IntegrationsSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  integrations: Integration[];
  /**
   * `grid` (default): cards with name and one line, filtered by category
   * when there are two or more. `hub`: the product in the middle and the
   * services on a ring around it — a picture of "connects to everything",
   * for six to ten services; names are for screen readers there.
   */
  layout?: 'grid' | 'hub';
  /** Hub: the product's own mark in the middle. */
  product?: ReactNode;
  /** Grid: the label of the "everything" filter. Default "All". */
  allLabel?: string;
  /** A link or button under the section ("Browse all 120 integrations"). */
  action?: ReactNode;
}

function IntegrationCard({ item, index, total }: { item: Integration; index: number; total: number }) {
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-[var(--size-border-radius-border-radius-xl)] border border-solid [&>svg]:size-6',
          tonalFillAt(index, total),
        )}
      >
        {item.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-heading text-heading-xs">{item.name}</span>
        {item.description && <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">{item.description}</span>}
      </span>
    </>
  );
  const cls =
    'flex h-full items-start gap-4 rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5 text-[var(--color-text-text)] no-underline';
  return item.href ? (
    <a
      href={item.href}
      className={cn(
        cls,
        'outline-none transition-[border-color,box-shadow] duration-fast ease-enter hover:border-[var(--color-border-border)] hover:shadow-elevation-sm focus-visible:focus-ring',
      )}
    >
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Grid({ items }: { items: Integration[] }) {
  return (
    <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {items.map((item, i) => (
        <li key={item.id} className="min-w-0">
          <IntegrationCard item={item} index={i} total={items.length} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The services a product works with. Grid: cards filtered by category
 * (Tabs chips: each category is its own panel). Hub: the product in the
 * middle, the services on a ring around it; still, no motion.
 */
export function IntegrationsSection({
  eyebrow,
  title,
  description,
  integrations,
  layout = 'grid',
  product,
  allLabel = 'All',
  action,
  className,
  ...props
}: IntegrationsSectionProps) {
  const uid = useId();
  const categories = [...new Set(integrations.map((i) => i.category).filter((c): c is string => !!c))];

  return (
    <section data-slot="integrations-section" data-scale="display" aria-labelledby={`${uid}-title`} className={cn('section-display', className)} {...props}>
      <div className="container-display flex flex-col items-center gap-10 lg:gap-12">
        <SectionHead align="center" eyebrow={eyebrow} title={<span id={`${uid}-title`}>{title}</span>} description={description} />

        {layout === 'hub' ? (
          <div className="@container w-full max-w-[40rem]">
            <div className="relative aspect-square w-full">
              {/* Two quiet rings: the orbit and an inner halo. */}
              <span aria-hidden className="absolute inset-[9%] rounded-[50%] border border-dashed border-[var(--color-border-border-subtle)]" />
              <span aria-hidden className="absolute inset-[30%] rounded-[50%] border border-solid border-[var(--color-border-border-subtler)]" />
              {product && (
                <div className="absolute inset-0 m-auto flex size-[26%] items-center justify-center rounded-[var(--size-border-radius-border-radius-4xl)] bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)] shadow-elevation-lg [&_svg]:size-[45%]">
                  {product}
                </div>
              )}
              <ul role="list" aria-label="Integrations" className="absolute inset-0 m-0 list-none p-0">
                {integrations.map((item, i) => {
                  // Evenly round the ring, starting at the top. Physical left/top: a
                  // circle is the same in both reading directions.
                  const a = (i / integrations.length) * 2 * Math.PI - Math.PI / 2;
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'absolute flex size-[15cqw] max-h-16 max-w-16 min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm [&_svg]:size-[45%]',
                        tonalFillAt(i, integrations.length),
                      )}
                      style={{ left: `${50 + 41 * Math.cos(a)}%`, top: `${50 + 41 * Math.sin(a)}%` }}
                    >
                      {item.href ? (
                        <a
                          href={item.href}
                          className="flex size-full items-center justify-center rounded-[inherit] text-current outline-none focus-visible:focus-ring [&_svg]:size-[45%]"
                        >
                          <span aria-hidden className="contents">
                            {item.icon}
                          </span>
                          <span className="sr-only">{item.name}</span>
                        </a>
                      ) : (
                        <>
                          <span aria-hidden className="contents">
                            {item.icon}
                          </span>
                          <span className="sr-only">{item.name}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : categories.length > 1 ? (
          <Tabs defaultValue="__all" className="flex w-full flex-col items-center gap-8">
            <TabsList variant="chips" aria-label="Filter integrations">
              <TabsTrigger value="__all">{allLabel}</TabsTrigger>
              {categories.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="__all" className="m-0 w-full">
              <Grid items={integrations} />
            </TabsContent>
            {categories.map((c) => (
              <TabsContent key={c} value={c} className="m-0 w-full">
                <Grid items={integrations.filter((i) => i.category === c)} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="w-full">
            <Grid items={integrations} />
          </div>
        )}

        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </section>
  );
}
