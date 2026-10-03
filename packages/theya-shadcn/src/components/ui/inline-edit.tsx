import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Check, EditPencil, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { TextField } from './text-field';
import { TextArea } from './textarea';

/**
 * Edit a single value in place: the text reads as plain text until it's
 * clicked (or focused and Enter/Space pressed), then turns into a field with
 * Save and Cancel.
 *
 * Keys: Enter saves (⌘/Ctrl+Enter in `multiline`, where Enter is a new
 * line), Escape cancels and doesn't close a surrounding dialog. Leaving the
 * field saves too (`saveOnBlur`, on by default) — except when focus moves to
 * the component's own Save/Cancel. A failed `validate` or a rejected
 * `onSave` keeps the field open with the message, so nothing typed is lost.
 * Focus returns to the text after save/cancel.
 *
 * The display text sits exactly where the field's text will be (same
 * height, padding and type step), so switching modes doesn't shift the
 * layout. Three text treatments:
 * - default — TextField look, `size` sm/md;
 * - `multiline` — TextArea in edit mode, line breaks kept in display;
 * - `inheritFont` — display and field take the surrounding typography, for
 *   an editable page title or card heading (`<h1><InlineEdit inheritFont/></h1>`).
 */
export type InlineEditSize = 'sm' | 'md';

// Safari doesn't move focus to a button on click, so the field would blur
// with relatedTarget = null and save before Cancel's click ever arrives.
// Keeping focus in the field on mousedown makes every browser behave the same.
const keepFieldFocus = (e: React.MouseEvent) => e.preventDefault();

// Single-line display mirrors TextField: heightSize sm/md (32/40px,
// body-s/body-m), leading padding-lg + 1px border.
const DISPLAY_SIZE_CLASS: Record<InlineEditSize, string> = {
  sm: 'h-[var(--size-size-control-size-control-lg)] text-body-s',
  md: 'h-[var(--size-size-control-size-control-2xl)] text-body-m',
};
const SINGLE_PADDING = 'pr-[var(--size-padding-padding-xs)] pl-[var(--size-padding-padding-lg)]';
// Multiline display mirrors TextArea's own box: 8+4px leading, 8px
// trailing, 10px vertical, 1px border.
const MULTI_PADDING = 'pl-[calc(var(--size-margin-margin-xs)+4px)] pr-[var(--size-margin-margin-xs)] py-[var(--size-margin-margin-s)]';
const MULTI_TEXT: Record<InlineEditSize, string> = { sm: 'text-body-s', md: 'text-body-m' };
// inheritFont: both modes take the surrounding typography and size to it.
// Important (!) because TextField's heightSize sets its own height and type
// step on the input and twMerge can't see these arbitrary properties as
// conflicting with them.
const INHERIT_FONT =
  '[font-family:inherit]! [font-size:inherit]! [font-weight:inherit]! [line-height:inherit]! [letter-spacing:inherit]! h-auto! py-1!';
const BUTTON_SIZE: Record<InlineEditSize, 'md' | 'xl'> = { sm: 'md', md: 'xl' };

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export interface InlineEditProps {
  /** Accessible name of the value, e.g. "Site name". Used for the field and the "Edit …" hint. */
  label: string;
  /** Controlled value. Update it from `onSave`. */
  value?: string;
  /** Uncontrolled starting value. */
  defaultValue?: string;
  /**
   * Called with the new value. Return a promise to show a saving state;
   * reject (throw) to keep the field open — the error's message is shown.
   * Not called when the value didn't change.
   */
  onSave?: (value: string) => void | Promise<void>;
  /** Return an error message to block saving, or undefined when the value is fine. */
  validate?: (value: string) => string | undefined;
  /** Shown in place of an empty value. */
  placeholder?: string;
  /** Save when focus leaves the field. Default true. */
  saveOnBlur?: boolean;
  /** Text step for the default and multiline treatments. Ignored with `inheritFont`. */
  size?: InlineEditSize;
  /** Multi-line text: TextArea while editing, line breaks kept on display. Enter adds a line, ⌘/Ctrl+Enter saves. */
  multiline?: boolean;
  /** Take the surrounding typography (e.g. inside an <h1>) instead of the field's own type step. Single-line only. */
  inheritFont?: boolean;
  /** Not editable: plain text, no hover, no edit hint. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Passed to the input while editing (e.g. "off", "email"). */
  autoComplete?: string;
  className?: string;
}

export function InlineEdit({
  label,
  value: valueProp,
  defaultValue = '',
  onSave,
  validate,
  placeholder = 'Add a value',
  saveOnBlur = true,
  size = 'md',
  multiline = false,
  inheritFont = false,
  readOnly = false,
  disabled = false,
  autoComplete,
  className,
}: InlineEditProps) {
  const [internal, setInternal] = useState(defaultValue);
  const committed = valueProp ?? internal;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(committed);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const displayRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const fieldId = useId();
  const singleLine = !multiline;
  const inherit = inheritFont && singleLine;

  useEffect(() => {
    if (editing) {
      fieldRef.current?.focus();
      fieldRef.current?.select();
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      displayRef.current?.focus();
    }
  }, [editing]);

  const start = () => {
    if (readOnly || disabled) return;
    setDraft(committed);
    setError(undefined);
    setEditing(true);
  };

  const cancel = (refocus = true) => {
    if (saving) return;
    setError(undefined);
    restoreFocus.current = refocus;
    setEditing(false);
  };

  const save = async (refocus = true) => {
    if (saving) return;
    const next = multiline ? draft.replace(/\s+$/, '') : draft.trim();
    if (next === committed) {
      cancel(refocus);
      return;
    }
    const message = validate?.(next);
    if (message) {
      setError(message);
      fieldRef.current?.focus();
      return;
    }
    try {
      setSaving(true);
      await onSave?.(next);
      if (valueProp === undefined) setInternal(next);
      setError(undefined);
      restoreFocus.current = refocus;
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Couldn’t save. Try again.');
      fieldRef.current?.focus();
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Don't let a surrounding Dialog/Popover close on the same Escape.
      e.stopPropagation();
      e.preventDefault();
      cancel();
    } else if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void save();
    }
  };

  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    // Focus moving to our own Save/Cancel isn't "leaving".
    if (!saveOnBlur || rootRef.current?.contains(e.relatedTarget as Node | null)) return;
    void save(false);
  };

  const onChange = (next: string) => {
    setDraft(next);
    if (error) setError(undefined);
  };

  const buttonSize = BUTTON_SIZE[size];

  if (editing) {
    return (
      <div ref={rootRef} data-slot="inline-edit" data-state="editing" className={cn('w-full', className)}>
        <form onSubmit={onSubmit} onKeyDown={onKeyDown} onBlur={onBlur} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {multiline ? (
              <TextArea
                ref={fieldRef}
                id={fieldId}
                aria-label={label}
                value={draft}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                description={error ? undefined : `${isMac ? '⌘' : 'Ctrl'}+Enter to save, Esc to cancel`}
                heightSize={size}
                rows={Math.max(2, draft.split('\n').length)}
                className="min-h-0 resize-y [field-sizing:content]"
                disabled={saving}
              />
            ) : (
              <TextField
                ref={fieldRef}
                id={fieldId}
                aria-label={label}
                value={draft}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                heightSize={size}
                widthSize="full"
                disabled={saving}
                autoComplete={autoComplete}
                className={inherit ? INHERIT_FONT : undefined}
              />
            )}
          </div>
          <Button type="submit" appearance="filled" tone="primary" size={buttonSize} iconOnly leftIcon={<Check />} aria-label={`Save ${label}`} loading={saving} onMouseDown={keepFieldFocus} />
          <Button appearance="outlined" tone="secondary" size={buttonSize} iconOnly leftIcon={<Xmark />} aria-label="Cancel" disabled={saving} onMouseDown={keepFieldFocus} onClick={() => cancel()} />
        </form>
      </div>
    );
  }

  const empty = committed === '';
  const interactive = !readOnly && !disabled;
  const boxClass = cn(
    'flex w-full min-w-0 gap-2 border border-solid border-transparent text-left',
    multiline ? cn('items-start', MULTI_PADDING, MULTI_TEXT[size], 'font-body') : cn('items-center', SINGLE_PADDING),
    singleLine && !inherit && cn(DISPLAY_SIZE_CLASS[size], 'font-body'),
    inherit && 'py-1',
  );
  const textClass = multiline ? 'min-w-0 flex-1 whitespace-pre-wrap break-words' : 'min-w-0 flex-1 truncate';

  return (
    <div ref={rootRef} data-slot="inline-edit" data-state="idle" className={cn('w-full', className)}>
      {interactive ? (
        <button
          ref={displayRef}
          type="button"
          onClick={start}
          className={cn(
            boxClass,
            'group cursor-text',
            multiline ? 'rounded-[var(--size-border-radius-border-radius-md)]' : 'rounded-[var(--size-border-radius-border-radius-lg)]',
            'transition-colors duration-150 ease-enter motion-reduce:transition-none',
            'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:outline-none focus-visible:focus-ring',
          )}
        >
          <span className="sr-only">Edit {label}: </span>
          <span className={cn(textClass, empty ? 'text-[var(--color-text-text-subtler)]' : 'text-[var(--color-text-text)]')}>{empty ? placeholder : committed}</span>
          <EditPencil
            aria-hidden="true"
            className={cn(
              'size-[var(--size-icon-icon-sm)] shrink-0 text-[var(--color-icon-icon-subtle)] opacity-0 transition-opacity motion-reduce:transition-none',
              'group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
              multiline && 'mt-0.5',
            )}
          />
        </button>
      ) : (
        <div aria-disabled={disabled || undefined} className={cn(boxClass, disabled ? 'text-[var(--color-text-text-disabled)]' : 'text-[var(--color-text-text)]')}>
          <span className={textClass}>{empty ? '—' : committed}</span>
        </div>
      )}
    </div>
  );
}
