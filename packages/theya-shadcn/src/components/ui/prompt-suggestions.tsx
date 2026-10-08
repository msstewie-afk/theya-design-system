'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PromptSuggestion {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface PromptSuggestionsProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  items: PromptSuggestion[];
  onSelect: (item: PromptSuggestion) => void;
}

/**
 * A row of suggestion cards shown above an empty PromptArea — a
 * separate, small composition-only piece (not part of PromptArea
 * itself), since suggestions are a property of the surrounding empty
 * chat state, not of the composer's own value/behavior.
 */
function PromptSuggestions({ items, onSelect, className, ...props }: PromptSuggestionsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className={cn(
            'flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
            'border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface)]',
            'px-[var(--size-margin-margin-s)] py-[var(--size-margin-margin-xs)]',
            'font-body text-body-s text-[var(--color-text-text)] cursor-pointer',
            'transition-colors duration-standard ease-enter motion-reduce:transition-none',
            'hover:border-[var(--color-border-border-primary)] hover:bg-[var(--color-bg-primary-bg-primary-subtler)]',
            'focus-visible:outline-none focus-visible:focus-ring',
          )}
        >
          {item.icon && (
            <span className="flex size-4 shrink-0 items-center justify-center text-[var(--color-icon-icon-subtle)]" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export { PromptSuggestions };
