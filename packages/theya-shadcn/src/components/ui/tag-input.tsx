'use client';

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Chip, ChipRemove } from './chip';
import { useTheyaI18n } from '../../lib/i18n';
import { FieldErrorIcon } from './field-error-icon';

/**
 * Several free-form values as chips in one field: tags, email addresses,
 * domains, IP ranges. Unlike Combobox `multiple`, there's no option list —
 * whatever is typed becomes a chip.
 *
 * - Enter, comma or semicolon commits the typed text (`delimiters`);
 *   leaving the field commits it too, so nothing typed is lost.
 * - Pasting "a, b; c" or one-per-line splits into separate chips.
 * - `validate` marks bad values as danger chips (kept, not dropped — the
 *   person sees exactly which ones to fix) and lists them under the field.
 * - Duplicates are ignored (case-insensitive), `max` caps the count.
 * - Backspace in the empty input removes the last chip.
 * - Additions and removals are announced to screen readers.
 */
export type TagInputSize = 'sm' | 'md';

export interface TagInputProps {
  /** Controlled list of values. */
  value?: string[];
  /** Uncontrolled starting list. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Return a message for a bad value (it's still added, as a danger chip), undefined when it's fine. */
  validate?: (tag: string) => string | undefined;
  /** Normalize each value before it's added, e.g. `(v) => v.toLowerCase()` for emails and domains. Trimmed first. */
  transform?: (tag: string) => string;
  /** Keys that commit the typed text. Default Enter, comma, semicolon. Add ' ' for space-separated tags. */
  delimiters?: string[];
  /** Maximum number of values; the input hides once it's reached. */
  max?: number;
  placeholder?: string;
  /** Helper text under the field (replaced by the error while there is one). */
  description?: ReactNode;
  /** External error (e.g. "Add at least one recipient"). Shown under the field, above per-value errors. */
  error?: string;
  heightSize?: TagInputSize;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const DEFAULT_DELIMITERS = ['Enter', ',', ';'];

export function TagInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  validate,
  transform,
  delimiters = DEFAULT_DELIMITERS,
  max,
  placeholder,
  description,
  error,
  heightSize = 'md',
  disabled = false,
  readOnly = false,
  id,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: TagInputProps) {
  const { t } = useTheyaI18n();
  if (placeholder === undefined) placeholder = t.tagInput.placeholder;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const tags = valueProp ?? internal;
  const [draft, setDraft] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus is restored after render: at the `max` limit the input isn't mounted
  // yet when a chip is removed, so focusing it synchronously dropped focus on <body>.
  const refocus = useRef(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const invalid = validate ? tags.map((t) => ({ tag: t, message: validate(t) })).filter((x) => x.message) : [];
  const hasError = Boolean(error) || invalid.length > 0;
  const full = max !== undefined && tags.length >= max;

  const commit = (next: string[]) => {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const normalize = (raw: string) => {
    const trimmed = raw.trim();
    return trimmed && transform ? transform(trimmed) : trimmed;
  };

  /** Adds every non-empty, non-duplicate piece; returns how many were added. */
  const add = (pieces: string[]) => {
    const seen = new Set(tags.map((t) => t.toLowerCase()));
    const added: string[] = [];
    for (const piece of pieces) {
      const tag = normalize(piece);
      if (!tag || seen.has(tag.toLowerCase())) continue;
      if (max !== undefined && tags.length + added.length >= max) break;
      seen.add(tag.toLowerCase());
      added.push(tag);
    }
    if (added.length) {
      added.forEach((tag) => fresh.current.add(tag));
      commit([...tags, ...added]);
      setAnnouncement(t.tagInput.added(added));
    }
    return added.length;
  };

  // Motion (Kinetics' Tag Input, MIT): a tag added here pops in; a removed tag pops
  // out before it leaves the list. Tags present on first render don't animate.
  const fresh = useRef(new Set<string>());
  const [leaving, setLeaving] = useState<string[]>([]);
  const leaveTimers = useRef<number[]>([]);
  useEffect(() => () => leaveTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const removeAt = (index: number) => {
    const removed = tags[index];
    if (removed === undefined) return;
    setAnnouncement(t.tagInput.removed(String(removed)));
    refocus.current = true;
    const reduced = typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return commit(tags.filter((_, i) => i !== index));
    setLeaving((list) => [...list, removed]);
    leaveTimers.current.push(
      window.setTimeout(() => {
        setLeaving((list) => list.filter((tag) => tag !== removed));
        fresh.current.delete(removed);
        commitRef.current((current) => current.filter((tag) => tag !== removed));
      }, 180),
    );
  };
  // The timer above must remove from the tags as they are then, not as they were.
  const commitRef = useRef((update: (current: string[]) => string[]) => commit(update(tags)));
  commitRef.current = (update) => commit(update(tags));

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    inputRef.current?.focus();
  }, [tags]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (delimiters.includes(e.key)) {
      // Enter with nothing typed falls through (e.g. to submit a form).
      if (e.key === 'Enter' && !draft.trim()) return;
      e.preventDefault();
      add([draft]);
      setDraft('');
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      e.preventDefault();
      // Skip tags already on their way out.
      let last = tags.length - 1;
      while (last >= 0 && leaving.includes(tags[last])) last--;
      if (last >= 0) removeAt(last);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const splitter = delimiters.includes(' ') ? /[\s,;]+/ : /[,;\n\t]+/;
    const pieces = text.split(splitter);
    if (pieces.length < 2) return; // a single value pastes into the input as normal
    e.preventDefault();
    add([draft + pieces[0], ...pieces.slice(1)]);
    setDraft('');
  };

  const onBlur = () => {
    if (draft.trim()) {
      add([draft]);
      setDraft('');
    }
  };

  const messages: string[] = [];
  if (error) messages.push(error);
  for (const { tag, message } of invalid) messages.push(`${tag}: ${message}`);

  return (
    <div data-slot="tag-input" className={cn('flex w-full flex-col gap-1.5', className)}>
      {/* Clicking anywhere in the box (not just on the input) puts the caret in. */}
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className={cn(
          'relative flex w-full cursor-text flex-wrap items-center gap-1 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid py-1 pe-1 ps-2',
          heightSize === 'sm' ? 'min-h-[var(--size-size-control-size-control-lg)]' : 'min-h-[var(--size-size-control-size-control-2xl)]',
          'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
          readOnly
            ? 'cursor-default border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]'
            : disabled
              ? 'cursor-not-allowed border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] text-[var(--color-text-text-subtler)]'
              : hasError
                ? [
                    'border-[var(--color-border-border-danger)] bg-[var(--color-bg-input-bg-input-danger)]',
                    'hover:border-[var(--color-border-border-danger-hover)]',
                    'focus-within:border-[var(--color-border-border-danger)] focus-within:bg-[var(--color-bg-input-bg-input-danger-pressed)] focus-within:focus-ring-error',
                  ]
                : [
                    'border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)]',
                    'hover:border-[var(--color-border-border-primary)]',
                    'focus-within:border-[var(--color-border-border-primary)] focus-within:bg-[var(--color-bg-input-bg-input-active)] focus-within:focus-ring',
                  ],
        )}
      >
        {tags.map((tag, index) => {
          const bad = validate?.(tag);
          return (
            <Chip
              // Keyed by the tag (plus its repeat count, for a controlled value with duplicates), so
              // removing one doesn't remount — and re-pop — the chips after it.
              key={`${tag}-${tags.slice(0, index).filter((x) => x === tag).length}`}
              size="sm"
              tone={bad ? 'danger' : 'neutral'}
              interactive={false}
              className={cn(
                'max-w-full',
                fresh.current.has(tag) && 'animate-[theya-pop-in_400ms_var(--ease-spring)]',
                leaving.includes(tag) && 'pointer-events-none animate-[theya-pop-out_180ms_var(--ease-exit)_forwards]',
                'motion-reduce:animate-none',
              )}
            >
              <span className="max-w-[14rem] truncate">{tag}</span>
              {bad && <span className="sr-only">{t.tagInput.invalid}</span>}
              {!readOnly && !disabled && <ChipRemove aria-label={t.common.remove(tag)} onClick={() => removeAt(index)} />}
            </Chip>
          );
        })}
        {!full && !readOnly && (
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            value={draft}
            disabled={disabled}
            placeholder={tags.length === 0 ? placeholder : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-invalid={hasError || undefined}
            aria-describedby={messages.length || description || max !== undefined ? messageId : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={onBlur}
            className={cn(
              'min-w-[6rem] flex-1 bg-transparent px-1 py-0.5 font-body outline-none',
              'text-[var(--color-text-text)] placeholder:text-[var(--color-text-text-subtler)] disabled:cursor-not-allowed',
              heightSize === 'sm' ? 'text-body-s' : 'text-body-m',
            )}
          />
        )}
      </div>
      {messages.length > 0 ? (
        <div id={messageId} className="flex flex-col gap-0.5">
          {messages.map((m) => (
            <div key={m} className="flex items-start gap-1">
              <FieldErrorIcon className="mt-px shrink-0 text-[var(--color-icon-icon-danger)]" />
              <span className="font-body text-body-xs font-normal text-[var(--color-text-text-danger)]">{m}</span>
            </div>
          ))}
        </div>
      ) : description || max !== undefined ? (
        <span id={messageId} className="font-body text-body-xs font-normal text-[var(--color-text-text-subtler)]">
          {description}
          {description && max !== undefined ? ' · ' : null}
          {max !== undefined ? t.tagInput.count(tags.length, max) : null}
        </span>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
