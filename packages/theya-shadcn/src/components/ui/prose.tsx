'use client';

import { useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

/**
 * Typography for long-form content Theya doesn't lay out itself: help
 * articles, docs, changelogs, legal pages, rendered Markdown or CMS HTML.
 * Wrap the content and plain `h1–h4`, `p`, `ul/ol`, `blockquote`, `code`,
 * `pre`, `table`, `figure`, `hr`, `kbd`, `mark` get Theya's type scale,
 * colors and vertical rhythm — no classes needed on the inner elements.
 *
 * The styles live in `src/styles/prose.css` (class-level specificity, so a
 * utility class on an inner element still wins). Mark anything that must
 * keep its own styling — a Button, Alert, Card, CodeBlock — with
 * `className="not-prose"`; prose rules skip it and everything inside it,
 * while it still gets the normal block spacing.
 *
 * Measure is capped at 70ch for comfortable reading; pass `max-w-none` to
 * fill the container instead.
 */
export type ProseSize = 'sm' | 'md' | 'lg';

export interface ProseProps extends React.ComponentProps<'div'> {
  /** Base text step: `sm` body-s (side panels, in-product help), `md` body-m (default, docs/articles), `lg` body-l (editorial). Headings scale with it. */
  size?: ProseSize;
  /** Render onto the child element instead of a <div> — e.g. `<Prose asChild><article>…</article></Prose>`. */
  asChild?: boolean;
}

// Code blocks scroll sideways when a line is longer than the column (often
// on phones). A scroll box must be reachable by keyboard to be scrolled
// (WCAG 2.1.1, axe scrollable-region-focusable), so each <pre> gets a tab
// stop — also for content added later (streamed answers, editors).
function useFocusableCodeBlocks() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tag = () =>
      root.querySelectorAll<HTMLPreElement>('pre:not([tabindex])').forEach((pre) => {
        if (!pre.closest('.not-prose')) pre.tabIndex = 0;
      });
    tag();
    const observer = new MutationObserver(tag);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function Prose({ className, size = 'md', asChild = false, ...props }: ProseProps) {
  const Comp = asChild ? Slot : 'div';
  const ref = useFocusableCodeBlocks();
  return <Comp ref={ref} data-slot="prose" data-size={size} className={cn('prose', className)} {...props} />;
}
