import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyButton } from './copy-button';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Chip } from './chip';

/**
 * A static, read-only snippet in a mono surface box with a copy
 * button. Presentational (no syntax highlighting): pass the raw
 * `code` string and it renders a horizontally-scrolling <pre> plus a
 * CopyButton wired to that exact string.
 *
 * With a `filename` and/or `language` it grows a thin header bar;
 * without one, the copy button floats top-right and the <pre>
 * reserves space so short lines don't slip under it.
 */
export interface CodeBlockProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  code: string;
  /** Language hint shown as a muted label in the header (no highlighting applied). */
  language?: string;
  /** Filename shown mono in the header (takes visual priority over `language`). */
  filename?: string;
  copy?: boolean;
  copyLabel?: string;
}

export function CodeBlock({ code, language, filename, copy = true, copyLabel = 'Copy code', className, ...props }: CodeBlockProps) {
  const hasHeader = Boolean(filename || language);

  // Tooltip result feedback: mirrors CopyButton's own 1500ms reset timer so
  // the tooltip's "Copied!"/"Failed to copy" flash and the button's own
  // icon-swap-back happen on the same beat. Forcing `open: true` while
  // status !== 'idle' makes the tooltip pop up on click even without a
  // hover (Radix falls back to its own hover-driven open state once we
  // hand the `open` prop back `undefined` — see useControllableState).
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const flashStatus = (next: 'copied' | 'error') => {
    window.clearTimeout(resetTimer.current);
    setStatus(next);
    resetTimer.current = setTimeout(() => setStatus('idle'), 1500);
  };

  const tooltipIntent = status === 'copied' ? 'success' : status === 'error' ? 'danger' : 'neutral';
  const tooltipText = status === 'copied' ? 'Copied!' : status === 'error' ? 'Failed to copy' : copyLabel;

  const copyButton = copy ? (
    <Tooltip open={status !== 'idle' ? true : undefined}>
      <TooltipTrigger asChild>
        <CopyButton
          value={code}
          label={null}
          aria-label={copyLabel}
          size="sm"
          appearance={hasHeader ? 'ghost' : 'tonal'}
          onCopied={() => flashStatus('copied')}
          onCopyError={() => flashStatus('error')}
          className={cn(!hasHeader && 'absolute right-2 top-2 z-10')}
        />
      </TooltipTrigger>
      <TooltipContent tone={tooltipIntent}>{tooltipText}</TooltipContent>
    </Tooltip>
  ) : null;

  return (
    <div className={cn('relative min-w-0 max-w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] shadow-xs', className)} {...props}>
      {hasHeader ? (
        <div className="flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-3 py-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            {filename && <span className="truncate font-code text-body-m font-medium text-[var(--color-text-text)]">{filename}</span>}
            {language && (
              // Static label, not a real toggle — interactive={false} turns
              // off hover/click/keyboard entirely. Might be worth its own
              // Chip variant later if this "inert tag" look shows up more.
              // size="sm" is a deliberate exception to the "external chip
              // = md" default (Мария's call) — this reads as a compact
              // inert tag beside the filename, not a standalone chip.
              <Chip tone="info" size="sm" interactive={false} className="shrink-0 uppercase">
                {language}
              </Chip>
            )}
          </div>
          {copyButton}
        </div>
      ) : (
        copyButton
      )}
      <pre
        tabIndex={0}
        className={cn(
          // font-size/line-height match CodeEditor's own CodeMirror theme
          // exactly (13px / 20.8px) — was `text-body-s` (12px, a body-text
          // composite, not meant for code) before, so the two components
          // rendered code at visibly different sizes.
          'overflow-x-auto overflow-y-hidden p-4 font-code text-[13px] leading-[20.8px] text-[var(--color-text-text)]',
          'outline-none focus-visible:shadow-[inset_0_0_0_3px_var(--color-focus-focus-ring)]',
          !hasHeader && copy && 'pr-12',
        )}
      >
        <code className="font-code">{code}</code>
      </pre>
    </div>
  );
}
