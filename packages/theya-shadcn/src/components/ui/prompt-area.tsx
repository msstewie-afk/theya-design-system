'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowUp, Square } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { matchesAccept } from '../../lib/accept';
import { Button } from './button';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { useTheyaI18n } from '../../lib/i18n';
import { FieldErrorIcon } from './field-error-icon';

export interface PromptMenuItem {
  id: string;
  label: string;
  description?: string;
}

/**
 * PromptArea — the composer for a chat / AI assistant: an auto-growing
 * textarea with a send button. Built in stages:
 * 1. Core composer — real Stop during streaming, a character-limit
 *    counter + danger state, a live region for assistive tech, and
 *    Up-arrow-to-edit-last-message in an empty field.
 * 2. Real attachments — drag/drop onto the whole surface and
 *    paste-image, both routed through the same accept/size validation.
 * 3. `leading`/`trailing` slots for composing tools (model picker,
 *    toggles, mic button) without baking any of them in.
 * 4. `@`/`/` menus — typing "@" or "/" then a query opens a filtered
 *    popup (mentions / commands); Enter/Tab inserts the picked item's
 *    label as PLAIN TEXT. Note: this is a plain <textarea>, not
 *    contentEditable, so there is no inline visual "pill" token —
 *    that would need a full contentEditable rebuild, a separate,
 *    bigger change.
 *
 * Enter submits, Shift+Enter inserts a newline; the field grows with
 * content up to `maxRows`, then scrolls. Controlled with `value` /
 * `onValueChange`, or uncontrolled with `defaultValue`; `onSubmit`
 * fires with the trimmed text (and the field clears when uncontrolled).
 */
export interface PromptAreaProps
  extends Omit<React.ComponentProps<'div'>, 'onSubmit' | 'defaultValue' | 'value'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  onEditLast?: () => void;
  placeholder?: string;
  disabled?: boolean;
  busy?: boolean;
  maxRows?: number;
  maxLength?: number;
  leading?: ReactNode;
  trailing?: ReactNode;
  attachments?: ReactNode;
  submitLabel?: string;
  stopLabel?: string;
  onFilesAdded?: (files: File[]) => void;
  accept?: string;
  maxFileSize?: number;
  onFileRejected?: (file: File, reason: 'type' | 'size') => void;
  /** Items shown when the user types "@" then a query. Inserted as plain text on selection — see the component's own doc comment on why there's no inline pill. */
  mentions?: PromptMenuItem[];
  /** Items shown when the user types "/" then a query, e.g. quick actions or saved prompts. */
  commands?: PromptMenuItem[];
  /** Called when a mention is picked from the "@" menu. */
  onMentionSelect?: (item: PromptMenuItem) => void;
  /** Called when a command is picked from the "/" menu. */
  onCommandSelect?: (item: PromptMenuItem) => void;
}

type Trigger = { type: '@' | '/'; start: number; query: string };

function PromptArea({
  className,
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  onStop,
  onEditLast,
  placeholder,
  disabled = false,
  busy = false,
  maxRows = 8,
  maxLength,
  leading,
  trailing,
  attachments,
  submitLabel,
  stopLabel,
  onFilesAdded,
  accept,
  maxFileSize,
  onFileRejected,
  mentions,
  commands,
  onMentionSelect,
  onCommandSelect,
  'aria-label': ariaLabel,
  ...props
}: PromptAreaProps) {
  const { t } = useTheyaI18n();
  if (placeholder === undefined) placeholder = t.promptArea.placeholder;
  if (submitLabel === undefined) submitLabel = t.promptArea.send;
  if (stopLabel === undefined) stopLabel = t.promptArea.stop;
  if (ariaLabel === undefined) ariaLabel = t.promptArea.label;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const text = isControlled ? value! : internal;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const wasBusy = useRef(busy);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const counterId = useId();
  const errorId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const acceptFiles = (fileList: FileList | File[]) => {
    if (!onFilesAdded && !onFileRejected) return;
    const accepted: File[] = [];
    for (const file of Array.from(fileList)) {
      if (accept && !matchesAccept(file, accept)) {
        onFileRejected?.(file, 'type');
        continue;
      }
      if (maxFileSize != null && file.size > maxFileSize) {
        onFileRejected?.(file, 'size');
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) onFilesAdded?.(accepted);
  };

  const setText = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const style = getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 20;
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const max = line * maxRows + padY;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    // Always scrollable, never clipped: if text spacing changes after this
    // runs (a reader's spacing bookmarklet, WCAG 1.4.12), the extra lines
    // scroll instead of being cut off. While the text fits there's nothing
    // to scroll, so no scrollbar shows.
    el.style.overflowY = 'auto';
  }, [text, maxRows]);

  useEffect(() => {
    if (busy && !wasBusy.current) setLiveMessage('Generating response. Press Stop to cancel.');
    else if (!busy && wasBusy.current) setLiveMessage('Response finished.');
    wasBusy.current = busy;
  }, [busy]);

  // Scans backward from the cursor for an unbroken "@word" or "/word" run
  // that starts either at the beginning of the text or right after
  // whitespace — the same rule chat composers everywhere use so a "/"
  // in the middle of a URL doesn't trigger the command menu.
  const detectTrigger = useCallback(
    (fullText: string, cursor: number): Trigger | null => {
      let i = cursor - 1;
      while (i >= 0 && !/\s/.test(fullText[i])) {
        if (fullText[i] === '@' || fullText[i] === '/') {
          const type = fullText[i] as '@' | '/';
          const list = type === '@' ? mentions : commands;
          if (!list || list.length === 0) return null;
          if (i > 0 && !/\s/.test(fullText[i - 1])) return null;
          return { type, start: i, query: fullText.slice(i + 1, cursor) };
        }
        i--;
      }
      return null;
    },
    [mentions, commands],
  );

  const activeList = trigger?.type === '@' ? mentions : trigger?.type === '/' ? commands : undefined;
  const filtered =
    trigger && activeList
      ? activeList.filter((item) => item.label.toLowerCase().includes(trigger.query.toLowerCase()))
      : [];
  const menuOpen = trigger != null && filtered.length > 0;

  const selectMenuItem = (item: PromptMenuItem) => {
    if (!trigger) return;
    const before = text.slice(0, trigger.start);
    const after = text.slice(trigger.start + 1 + trigger.query.length);
    const inserted = `${trigger.type}${item.label} `;
    setText(`${before}${inserted}${after}`);
    setTrigger(null);
    setActiveIndex(0);
    if (trigger.type === '@') onMentionSelect?.(item);
    else onCommandSelect?.(item);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const pos = before.length + inserted.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const overLimit = maxLength != null && text.length > maxLength;
  // Over the limit blocks sending: the error said the message was too long
  // while Enter / the Send button still submitted it.
  const canSubmit = text.trim().length > 0 && !disabled && !busy && !overLimit;

  const submit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit?.(text.trim());
    if (!isControlled) setInternal('');
  }, [canSubmit, onSubmit, text, isControlled]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setText(next);
    setTrigger(detectTrigger(next, e.target.selectionStart ?? next.length));
    setActiveIndex(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMenuItem(filtered[activeIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setTrigger(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === 'ArrowUp' && onEditLast && text.length === 0) {
      e.preventDefault();
      onEditLast();
    }
  };

  const nearLimit = maxLength != null && text.length >= maxLength * 0.8;

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={menuOpen} onOpenChange={(open) => !open && setTrigger(null)}>
        <PopoverAnchor asChild>
          <div
            data-slot="prompt-area"
            data-disabled={disabled || undefined}
            className={cn(
              'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
              'border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)]',
              'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
              // The plain (non-error) focus-within rules below have a
              // pseudo-class in their selector, giving them higher CSS
              // specificity than overLimit's own plain, unconditional
              // danger classes further down — unguarded, focusing an
              // over-limit field would win back the neutral "active" blue
              // bg instead of staying danger-colored. Gate both branches
              // on overLimit explicitly instead of relying on source order.
              !disabled && !overLimit && 'hover:not-focus-within:border-[var(--color-border-border-primary)]',
              !overLimit && 'focus-within:border-[var(--color-border-border-primary)]',
              !overLimit && 'focus-within:bg-[var(--color-bg-input-bg-input-active)]',
              !overLimit && 'focus-within:focus-ring',
              disabled && 'border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
              isDragging && 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]',
              overLimit && [
                'border-[var(--color-border-border-danger)]',
                'bg-[var(--color-bg-input-bg-input-danger)]',
                'hover:border-[var(--color-border-border-danger-hover)]',
                'focus-within:border-[var(--color-border-border-danger)]',
                // Actively focused (typing) while over-limit goes one step
                // denser than the idle/hover danger bg, matching the same
                // "pressed/active = denser" treatment as every other field.
                'focus-within:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
                'focus-within:focus-ring-error',
              ],
              className,
            )}
            onDragEnter={(e) => {
              if (disabled || !onFilesAdded) return;
              e.preventDefault();
              dragDepth.current += 1;
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              if (!disabled && onFilesAdded) e.preventDefault();
            }}
            onDragLeave={(e) => {
              if (disabled || !onFilesAdded) return;
              e.preventDefault();
              dragDepth.current = Math.max(0, dragDepth.current - 1);
              if (dragDepth.current === 0) setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              dragDepth.current = 0;
              setIsDragging(false);
              if (disabled || !onFilesAdded) return;
              if (e.dataTransfer.files.length > 0) acceptFiles(e.dataTransfer.files);
            }}
            {...props}
          >
            <div role="status" aria-live="polite" className="sr-only">
              {liveMessage}
            </div>

            {attachments != null && <div className="flex flex-wrap gap-2 p-2 pb-0">{attachments}</div>}

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onPaste={(e) => {
                if (disabled || !onFilesAdded) return;
                const pasted = Array.from(e.clipboardData.files);
                if (pasted.length > 0) acceptFiles(pasted);
              }}
              placeholder={placeholder}
              disabled={disabled}
              aria-label={ariaLabel}
              // The @ / "/" menu is driven from the textarea (focus stays
              // here), so it points at the highlighted option. A textarea
              // can't take role="combobox"; textbox supports these three.
              aria-autocomplete={mentions || commands ? 'list' : undefined}
              aria-controls={menuOpen ? listId : undefined}
              aria-activedescendant={menuOpen ? optionId(activeIndex) : undefined}
              aria-invalid={overLimit || undefined}
              aria-describedby={[nearLimit ? counterId : null, overLimit ? errorId : null].filter(Boolean).join(' ') || undefined}
              className={cn(
                'block max-h-[50svh] w-full cursor-text resize-none bg-transparent',
                'px-[var(--size-padding-padding-lg)] py-[var(--size-margin-margin-s)]',
                'font-body text-body-m text-[var(--color-text-text)] outline-none',
                'placeholder:text-[var(--color-text-text-subtler)]',
                'disabled:cursor-not-allowed disabled:text-[var(--color-text-text-disabled)] disabled:italic',
              )}
            />

            <div className="flex items-center gap-1 px-2 pb-2">
              {leading}
              {nearLimit && (
                <span
                  id={counterId}
                  className={cn(
                    'font-body text-body-xs tabular-nums',
                    overLimit ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]',
                  )}
                >
                  {text.length}/{maxLength}
                </span>
              )}
              {trailing}
              <Button
                appearance="filled"
                tone="primary"
                size="sm"
                iconOnly
                className="ms-auto"
                onClick={busy ? onStop : submit}
                disabled={busy ? false : !canSubmit}
                aria-label={busy ? stopLabel : submitLabel}
                title={busy ? stopLabel : submitLabel}
                leftIcon={busy ? <Square /> : <ArrowUp />}
              />
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent
          // Anchor-opened: name the panel after its menu (was an unnamed "dialog").
          aria-label={trigger?.type === '@' ? t.promptArea.mentions : t.promptArea.commands}
          align="start"
          side="top"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-64 p-1"
        >
          <ul id={listId} role="listbox" aria-label={trigger?.type === '@' ? t.promptArea.mentions : t.promptArea.commands}>
            {filtered.map((item, index) => (
              <li
                key={item.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectMenuItem(item)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-1.5 cursor-default select-none',
                  index === activeIndex && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                )}
              >
                <span className="font-body text-body-s text-[var(--color-text-text)]">
                  {trigger?.type}
                  {item.label}
                </span>
                {item.description && (
                  <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">{item.description}</span>
                )}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {overLimit && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 font-body text-body-xs text-[var(--color-text-text-danger)]">
          <FieldErrorIcon className="shrink-0 text-[var(--color-icon-icon-danger)]" />
          <span>
            {t.promptArea.tooLong(maxLength!, text.length)}
          </span>
        </p>
      )}
    </div>
  );
}

export { PromptArea };
