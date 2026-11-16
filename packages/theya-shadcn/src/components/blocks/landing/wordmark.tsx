'use client';

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { cn } from "../../../lib/utils";

export interface WordmarkProps extends ComponentProps<"div"> {
  /** The word or name, one line. Plain text: it is measured to fit. */
  children: string;
  /** The heading level, when the wordmark is the page's title. Default: a paragraph. */
  as?: "h1" | "h2" | "p";
  /**
   * Cut the letters at an edge, as the atlas's SANTAL and FORMAT do: `bottom`
   * shows the top ~70% (a footer standing on the page's edge), `top` the
   * bottom ~70% (a hero hanging from the header). The full word stays in the
   * accessibility tree.
   */
  crop?: "none" | "top" | "bottom";
  /** Caps, line-height 0.85 and tracking −0.04em (display-caps). Default true. */
  caps?: boolean;
}

/**
 * A word set across the full width of its container (ld-02, after the
 * Awwwards 2026 atlas: SANTAL, FORMAT, Oryzo, Aspen). The size is measured,
 * not guessed: the word is laid out at 100px, then scaled so its width
 * equals the container's, again whenever the container resizes or a web
 * font loads. Uses the brand's display face (font-display).
 */
export function Wordmark({
  children,
  as: Tag = "p",
  crop = "none",
  caps = true,
  className,
  ...props
}: WordmarkProps) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    const word = text.current;
    if (!el || !word) return;
    const fit = () => {
      word.style.fontSize = "100px";
      const w = word.getBoundingClientRect().width;
      const avail = el.clientWidth;
      if (!(w > 0 && avail > 0)) return;
      const size = Math.floor(((100 * avail) / w) * 100) / 100;
      word.style.fontSize = `${size}px`;
      // A crop keeps about 70% of the caps: a box 0.56 of the size tall,
      // showing the line's top, or its bottom when the word is pulled up.
      el.style.height = crop === "none" ? "" : `${size * 0.56}px`;
      word.style.marginTop = crop === "top" ? `${-size * 0.24}px` : "";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [children, caps, crop]);

  return (
    <div
      ref={box}
      data-slot="wordmark"
      data-crop={crop}
      className={cn(
        "w-full overflow-hidden [container-type:inline-size]",
        className,
      )}
      {...props}
    >
      <Tag
        ref={text as never}
        className={cn(
          "m-0 inline-block whitespace-nowrap font-display leading-[0.8]",
          caps
            ? "display-caps [--tw-leading:0.8] leading-[0.8]"
            : "tracking-[-0.04em]",
          "font-[var(--display-weight,var(--typography-weight-medium))]",
        )}
        // Before the first measure (and without JS): roughly fit by length.
        style={{
          fontSize: `calc(100cqw / ${Math.max(children.length * 0.62, 1)})`,
        }}
      >
        {children}
      </Tag>
    </div>
  );
}
