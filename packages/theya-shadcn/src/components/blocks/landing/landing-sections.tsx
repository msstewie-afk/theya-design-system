'use client';

import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { ChatTyping } from '../../ui/chat';
import { Message } from '../../ui/message';
import { useMediaQuery } from '../../ui/use-media-query';
import { SectionHead } from './feature-shared';
import { LandingCard, type LandingCardProps } from './landing-cards';

/*
 * The closing sections of a landing page: a customer case (a quote with the
 * person and two results), an FAQ (accordion, or questions answered as a
 * chat) and a CTA band (one big line and the main action). Built from
 * LandingCard, Accordion, Message and ChatTyping.
 */

// ---------------------------------------------------------------------------

export interface TestimonialCaseProps extends Omit<LandingCardProps, 'title' | 'role' | 'results'> {
  /** The words, without quotation marks (they are drawn). */
  quote: ReactNode;
  name: ReactNode;
  /** Role and company ("Head of research, Northwind"). */
  role?: ReactNode;
  /** A small portrait next to the name (Avatar). */
  avatar?: ReactNode;
  /** A photo or a product shot beside the quote (an <img> with alt, or alt="" when decorative). */
  media?: ReactNode;
  /** One or two results ("90%", "faster to find a source"). */
  results?: { value: ReactNode; label: ReactNode }[];
  /** The quote in the display serif (default true), as on Wispr and Granola. */
  serif?: boolean;
}

/**
 * A customer case (Wispr): a large quote with the person under it, and
 * beside it a photo with one or two results. The quote and its author are a
 * figure; the results a description list ("faster to find a source, 90%").
 */
export function TestimonialCase({ quote, name, role, avatar, media, results, serif = true, className, ...props }: TestimonialCaseProps) {
  return (
    <LandingCard data-slot="testimonial-case" className={cn('grid gap-0 overflow-hidden lg:grid-cols-[3fr_2fr]', className)} {...props}>
      <figure className="m-0 flex flex-col justify-between gap-10 p-6 sm:p-10 lg:p-12">
        <blockquote
          className={cn(
            'm-0 text-pretty text-[var(--color-text-text)]',
            serif ? 'font-display-serif text-heading-xl leading-[1.05]' : 'font-heading text-heading-l',
          )}
        >
          <span aria-hidden>“</span>
          {quote}
          <span aria-hidden>”</span>
        </blockquote>
        <figcaption className="flex items-center gap-3">
          {avatar}
          <span className="flex flex-col">
            <span className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{name}</span>
            {role && <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">{role}</span>}
          </span>
        </figcaption>
      </figure>
      {(media || results?.length) && (
        <div className="relative flex min-h-[18rem] flex-col justify-end bg-[var(--color-bg-surface-bg-surface-sunken)] [&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover">
          {media}
          {results?.length ? (
            // The results sit on their own surface over the photo, so they read on any image.
            <dl className="relative m-4 grid grid-cols-2 gap-4 rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5 sm:m-6">
              {results.slice(0, 2).map((r, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-1">
                  <dt className="order-2 font-body text-body-s text-[var(--color-text-text-subtle)]">{r.label}</dt>
                  <dd className="order-1 m-0 font-heading text-heading-l font-semibold tabular-nums text-[var(--color-text-text)]">{r.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      )}
    </LandingCard>
  );
}

// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export interface FaqSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  items: FaqItem[];
  /**
   * `accordion` (default): the heading on the start side, the questions
   * opening in place on the end side.
   * `chat`: the questions as a list; the chosen one is asked and answered
   * as a short chat beside it (Wispr). Below 1024px it becomes the accordion.
   */
  variant?: 'accordion' | 'chat';
  /** Chat: the product's avatar on its answers. */
  avatar?: ReactNode;
  /** Chat: who answers ("Theya"). */
  author?: ReactNode;
}

/**
 * Frequently asked questions. The accordion is the default and the safe
 * choice; the chat variant is a list of questions (a vertical tab list: ↑ /
 * ↓ move between them) whose answer arrives as a message, after a moment
 * of "typing" (none with reduced motion).
 */
export function FaqSection({ title, description, items, variant = 'accordion', avatar, author, className, ...props }: FaqSectionProps) {
  const uid = useId();
  const wide = useMediaQuery('(min-width: 1024px)');
  const chat = variant === 'chat' && wide;
  return (
    <section data-slot="faq-section" data-variant={chat ? 'chat' : 'accordion'} data-scale="display" aria-labelledby={`${uid}-title`} className={cn('section-display', className)} {...props}>
      <div className={cn('container-display grid gap-10 lg:gap-16', chat ? 'lg:grid-cols-[1fr_2fr]' : 'lg:grid-cols-[2fr_3fr]')}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHead title={<span id={`${uid}-title`}>{title}</span>} description={description} />
        </div>
        {chat ? (
          <FaqChat items={items} avatar={avatar} author={author} />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {items.map((it, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-body-l">{it.question}</AccordionTrigger>
                <AccordionContent className="text-body-m text-[var(--color-text-text-subtle)]">{it.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}

function FaqChat({ items, avatar, author }: { items: FaqItem[]; avatar?: ReactNode; author?: ReactNode }) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [value, setValue] = useState('0');
  // A short "typing" before each answer, the first time it is shown.
  const [typing, setTyping] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => new Set(['0']));
  useEffect(() => {
    if (reduced || seen.has(value)) return;
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setSeen((s) => new Set(s).add(value));
    }, 700);
    return () => window.clearTimeout(id);
  }, [value, reduced, seen]);

  return (
    <TabsPrimitive.Root value={value} onValueChange={setValue} orientation="vertical" className="grid gap-6 xl:grid-cols-[2fr_3fr]">
      <TabsPrimitive.List className="flex flex-col gap-1">
        {items.map((it, i) => (
          <TabsPrimitive.Trigger
            key={i}
            value={String(i)}
            className={cn(
              'w-full cursor-pointer rounded-[var(--size-border-radius-border-radius-2xl)] border-0 bg-transparent px-4 py-3 text-start font-body text-body-l text-[var(--color-text-text-subtle)] outline-none',
              'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:focus-ring',
              'data-[state=active]:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[state=active]:font-medium data-[state=active]:text-[var(--color-text-text-link-on-tonal)]',
              'motion-safe:transition-colors motion-safe:duration-standard',
            )}
          >
            {it.question}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((it, i) => (
        <TabsPrimitive.Content key={i} value={String(i)} className="flex min-h-[20rem] flex-col gap-4 rounded-[var(--size-border-radius-border-radius-4xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-6 outline-none focus-visible:focus-ring data-[state=inactive]:hidden">
          <Message variant="sent" appearance="tonal">
            {it.question}
          </Message>
          {typing && value === String(i) ? (
            <ChatTyping avatar={avatar} />
          ) : (
            <Message avatar={avatar} author={author} className="motion-safe:animate-[theya-ticker-in_var(--motion-duration-slow)_var(--ease-enter)]">
              {it.answer}
            </Message>
          )}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------

export interface CtaBandProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** One big line (heading-3xl, up to 96px). Mark an accent word with HeroAccent. */
  title: ReactNode;
  description?: ReactNode;
  /** The main action, and at most one more. */
  actions: ReactNode;
  /** A quiet line under the actions ("Free for one person. Mac, Windows, iPhone, Android."). */
  note?: ReactNode;
  /** The title in the display serif. */
  titleFont?: 'sans' | 'serif';
}

/**
 * The last section (Wispr, Linear): one large sentence and the main action,
 * centred. Put it in a SectionPanel for a colored band.
 */
export function CtaBand({ title, description, actions, note, titleFont = 'sans', className, ...props }: CtaBandProps) {
  const uid = useId();
  return (
    <section data-slot="cta-band" data-scale="display" aria-labelledby={`${uid}-title`} className={cn('section-display', className)} {...props}>
      <div className="container-display flex flex-col items-center text-center">
        <h2
          id={`${uid}-title`}
          className={cn(
            'm-0 max-w-[16ch] text-balance text-heading-3xl text-[var(--color-text-text)]',
            titleFont === 'serif' ? 'font-display-serif leading-[0.92]' : 'font-heading',
          )}
        >
          {title}
        </h2>
        {description && <p className="m-0 mt-6 max-w-[36rem] text-pretty font-body text-body-l text-[var(--color-text-text-subtle)]">{description}</p>}
        <div className="mt-10 flex gap-3 max-sm:flex-col max-sm:self-stretch sm:flex-wrap sm:justify-center">{actions}</div>
        {note && <p className="m-0 mt-4 font-body text-body-s text-[var(--color-text-text-subtle)]">{note}</p>}
      </div>
    </section>
  );
}
