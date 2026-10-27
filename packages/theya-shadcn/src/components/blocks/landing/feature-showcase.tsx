'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { mediaPanel, SectionHead } from './feature-shared';

export interface FeatureShowcaseItem {
  id: string;
  /** Short: it is an accordion header or a chip label. */
  title: string;
  description: ReactNode;
  /** The visual for this item (role="img" + label). */
  media: ReactNode;
}

export interface FeatureShowcaseProps extends Omit<ComponentProps<'section'>, 'title' | 'defaultValue'> {
  /**
   * `accordion` — the features as a list on the start side; the open one
   * shows its visual on the end side (GitHub). On phones the visual sits
   * inside the open item.
   * `chips` — chips above one panel with the text and the visual (Miro).
   */
  variant?: 'accordion' | 'chips';
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  items: FeatureShowcaseItem[];
  /** The item open first (the first one by default). */
  defaultValue?: string;
}

/**
 * Several features in one section: pick one, see it. Every item's text is
 * reachable without the visuals, and nothing moves on its own.
 */
export function FeatureShowcase({ variant = 'accordion', eyebrow, title, description, items, defaultValue, className, ...props }: FeatureShowcaseProps) {
  const [value, setValue] = useState(defaultValue ?? items[0]?.id ?? '');
  const current = items.find((i) => i.id === value) ?? items[0];

  return (
    <section data-slot="feature-showcase" data-variant={variant} data-scale="display" className={cn('section-display', className)} {...props}>
      {variant === 'accordion' ? (
        <div className="container-display grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHead eyebrow={eyebrow} title={title} description={description} />
            {/* One item is always open (collapsible={false}): the visual always has something to show. */}
            <Accordion type="single" collapsible={false} value={value} onValueChange={(v: string) => v && setValue(v)}>
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="py-5 font-body text-body-l font-semibold hover:no-underline">{item.title}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-6 pb-5">
                    <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">{item.description}</p>
                    <div className={cn(mediaPanel, 'lg:hidden')}>{item.media}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {/* Wide screens: the open item's visual, beside the list. */}
          <div className={cn(mediaPanel, 'hidden lg:flex lg:min-h-[32rem]')} data-slot="feature-showcase-media">
            {current?.media}
          </div>
        </div>
      ) : (
        <div className="container-display flex flex-col items-center gap-8 lg:gap-12">
          <SectionHead eyebrow={eyebrow} title={title} description={description} align="center" />
          <Tabs value={value} onValueChange={setValue} className="flex w-full flex-col items-center gap-8">
            <TabsList variant="chips" aria-label={typeof title === 'string' ? title : 'Features'} className="max-w-full flex-wrap justify-center">
              {items.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {items.map((item) => (
              <TabsContent key={item.id} value={item.id} className="mt-0 w-full">
                <div className="grid items-center gap-8 rounded-[var(--size-border-radius-border-radius-5xl)] bg-[var(--color-bg-surface-bg-surface-sunken)] p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12 lg:ps-12">
                  <div className="flex flex-col gap-4 px-2 pt-2 lg:p-0">
                    <h3 className="m-0 text-balance font-heading text-heading-xl text-[var(--color-text-text)]">{item.title}</h3>
                    <p className="m-0 font-body text-body-l text-[var(--color-text-text-subtle)]">{item.description}</p>
                  </div>
                  <div className="flex min-h-[20rem] items-center justify-center">{item.media}</div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </section>
  );
}
