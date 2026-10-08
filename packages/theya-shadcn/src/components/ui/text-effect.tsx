'use client';

import { useCallback, useEffect, useRef, useState, type ElementType } from 'react';
import { cn } from '../../lib/utils';
import { useInView, useReducedMotion } from './use-in-view';

/**
 * Motion preset (landing pages): animated headline text. Ported from
 * Kinetics (MIT, kinetics.colorion.co) onto Theya's tokens:
 *
 * - `split` — letters spring up one after another (Text Split Reveal):
 *   `duration-slower` on `ease-spring`, 40ms per letter.
 * - `scramble` — random glyphs settle into the text left to right
 *   (Scramble Reveal), 35ms a frame.
 * - `shimmer` — a light band flows through the text, endlessly
 *   (Gradient Shimmer Text): text-subtle with a text-link highlight.
 * - `typewriter` — types and deletes through `phrases` with a blinking
 *   caret (Typewriter).
 *
 * Screen readers always get the plain text (all phrases for the
 * typewriter); the animated letters are hidden from them. With
 * prefers-reduced-motion the text is simply shown (typewriter: the first
 * phrase). `trigger`: start when scrolled into view (default), on hover,
 * or right after mount; shimmer and typewriter always run.
 */
export type TextEffectKind = 'split' | 'scramble' | 'shimmer' | 'typewriter';

export interface TextEffectProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  effect: TextEffectKind;
  /** The text (split, scramble, shimmer). */
  children?: string;
  /** Typewriter: the phrases it types in turn. */
  phrases?: string[];
  /** When split / scramble start: in view (default), on hover, or on mount. */
  trigger?: 'view' | 'hover' | 'mount';
  /** The element to render: a heading level, `p`, `span` (default). */
  as?: ElementType;
}

const GLYPHS = '!<>-_/[]{}=+*^?#';

export function TextEffect({ effect, children = '', phrases, trigger = 'view', as: Tag = 'span', className, ...props }: TextEffectProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { threshold: 0.4 });
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const active = reduced || (trigger === 'view' ? inView : trigger === 'hover' ? hovered : mounted);
  const hoverProps = trigger === 'hover' ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } : {};

  const plain = effect === 'typewriter' ? (phrases ?? []).join(', ') : children;
  let visual: React.ReactNode;
  if (effect === 'split') visual = <SplitLetters text={children} active={active} />;
  else if (effect === 'scramble') visual = <Scramble text={children} active={active} reduced={reduced} />;
  else if (effect === 'shimmer') visual = <Shimmer text={children} />;
  else visual = <Typewriter phrases={phrases ?? []} reduced={reduced} />;

  return (
    <Tag ref={ref} data-slot="text-effect" data-effect={effect} className={cn(effect === 'scramble' && 'relative inline-grid', className)} {...hoverProps} {...props}>
      <span className="sr-only">{plain}</span>
      {visual}
    </Tag>
  );
}

/* Words stay unbroken (each its own clipping box); letters rise inside them. */
function SplitLetters({ text, active }: { text: string; active: boolean }) {
  let n = 0;
  return (
    <span aria-hidden="true">
      {text.split(/(\s+)/).map((word, w) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span key={w} className="-mb-[0.15em] inline-flex overflow-hidden pb-[0.15em] whitespace-nowrap">
            {[...word].map((letter) => {
              const i = n++;
              return (
                <span
                  key={i}
                  data-state={active ? 'visible' : 'hidden'}
                  className="inline-block transition-transform duration-slower ease-spring data-[state=hidden]:translate-y-[110%] motion-reduce:transition-none"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        ),
      )}
    </span>
  );
}

/* The real text keeps the box's size (invisible); the scrambled copy sits on top of it. */
function Scramble({ text, active, reduced }: { text: string; active: boolean; reduced: boolean }) {
  const [shown, setShown] = useState(text);
  const run = useCallback(() => {
    let frame = 0;
    const total = 24;
    const id = window.setInterval(() => {
      frame++;
      setShown(
        [...text]
          .map((c, i) => (/\s/.test(c) || frame - i * 1.2 > total * 0.6 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (frame > total + text.length) {
        window.clearInterval(id);
        setShown(text);
      }
    }, 35);
    return () => window.clearInterval(id);
  }, [text]);
  useEffect(() => {
    if (!active || reduced) {
      setShown(text);
      return;
    }
    return run();
  }, [active, reduced, run, text]);
  return (
    <>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {shown}
      </span>
    </>
  );
}

function Shimmer({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-[linear-gradient(100deg,var(--color-text-text-subtle)_30%,var(--color-text-text-link)_50%,var(--color-text-text-subtle)_70%)] bg-[length:200%_auto] bg-clip-text text-transparent',
        'animate-[theya-shimmer-text_3s_linear_infinite] motion-reduce:animate-none',
        // Windows high contrast drops background images: show plain text.
        'forced-colors:bg-none forced-colors:text-[CanvasText]',
      )}
    >
      {text}
    </span>
  );
}

function Typewriter({ phrases, reduced }: { phrases: string[]; reduced: boolean }) {
  const [text, setText] = useState(reduced ? (phrases[0] ?? '') : '');
  // A new array with the same phrases (an inline prop) must not restart the loop.
  const key = phrases.join('\n');
  const latest = useRef(phrases);
  latest.current = phrases;
  useEffect(() => {
    const phrases = latest.current;
    if (reduced || phrases.length === 0) {
      setText(phrases[0] ?? '');
      return;
    }
    let phrase = 0;
    let chars = 0;
    let deleting = false;
    let id = 0;
    const loop = () => {
      const word = phrases[phrase];
      setText(word.slice(0, chars));
      let wait = 55;
      if (!deleting && chars < word.length) chars++;
      else if (!deleting) {
        deleting = true;
        wait = 1100;
      } else if (chars > 0) {
        chars--;
        wait = 30;
      } else {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        wait = 320;
      }
      id = window.setTimeout(loop, wait);
    };
    loop();
    return () => window.clearTimeout(id);
  }, [key, reduced]);
  return (
    <span aria-hidden="true">
      {text}
      <span className="ms-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.15em] animate-[theya-caret-blink_1s_steps(1)_infinite] bg-[var(--color-icon-icon-primary)] motion-reduce:hidden" />
    </span>
  );
}
