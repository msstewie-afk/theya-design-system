import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Plus } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Attachment, type AttachmentProps } from './attachment';

/**
 * Not in the reference repo — always a native file-input slot. Without
 * `empty`, the supplied name/size/meta is the initial filled state and
 * clicking opens the picker to replace it; `empty` starts with the
 * dashed picker instead. `readOnly` is a deliberately non-interactive
 * presentation state (same convention as TextField's readOnly).
 * Supplying `href` turns it into a real link instead of a picker.
 */
export interface FileProps
  extends Pick<
    AttachmentProps,
    'variant' | 'type' | 'error' | 'showKind' | 'showMeta' | 'selected' | 'previewUrl' | 'href' | 'mimeLabels' | 'actions'
  > {
  /** Initial file name inherited from Attachment. */
  name?: string;
  /** Initial byte size inherited from Attachment. */
  size?: number;
  /** Secondary metadata, e.g. "Modified today". */
  meta?: ReactNode;
  /** Starts the slot without file metadata (the dashed "add" tile). */
  empty?: boolean;
  /** Label shown in the empty (dashed) tile. Default "Add file". */
  pickLabel?: string;
  /** Optional secondary line under pickLabel in the empty tile, e.g. "PNG or JPG, up to 25 MB". */
  pickHint?: ReactNode;
  /** Presentation-only: the input remains mounted but cannot be activated. */
  readOnly?: boolean;
  disabled?: boolean;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}

export function File({
  name: initialName,
  size: initialSize,
  meta: initialMeta,
  empty = false,
  pickLabel = 'Add file',
  pickHint,
  readOnly = false,
  disabled = false,
  accept,
  onFileChange,
  inputProps,
  variant = 'card',
  type: initialType,
  error,
  showKind,
  showMeta,
  selected,
  previewUrl: initialPreviewUrl,
  href,
  mimeLabels,
  actions,
  className,
}: FileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number; type: string; previewUrl?: string } | null>(
    !empty && initialName ? { name: initialName, size: initialSize ?? 0, type: initialType ?? '', previewUrl: initialPreviewUrl } : null,
  );

  const isLink = Boolean(href);
  const isInteractive = !isLink && !readOnly && !disabled;

  const openPicker = () => {
    if (isInteractive) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      const nextPreview = picked.type.startsWith('image/') ? URL.createObjectURL(picked) : undefined;
      setFile({ name: picked.name, size: picked.size, type: picked.type, previewUrl: nextPreview });
      onFileChange?.(picked);
    }
  };

  const handleRemove = () => {
    setFile(null);
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // onClick/role/tabIndex/keydown go directly onto Attachment itself
  // (it accepts and forwards arbitrary HTML attributes) rather than a
  // separate wrapping div — that's what lets Attachment's OWN
  // isInteractive detection see the click and apply its real hover-
  // border/focus-ring styling, instead of the click living outside a
  // component that has no idea it's interactive.
  const attachmentEl = file && (
    <Attachment
      name={file.name}
      size={file.size}
      type={file.type || initialType}
      metaText={initialMeta}
      variant={variant}
      error={error}
      showKind={showKind}
      showMeta={showMeta}
      selected={selected}
      previewUrl={file.previewUrl}
      href={href}
      mimeLabels={mimeLabels}
      actions={actions}
      onRemove={isLink || readOnly || disabled ? undefined : handleRemove}
      onClick={isInteractive && !href ? openPicker : undefined}
      role={isInteractive && !href ? 'button' : undefined}
      tabIndex={isInteractive && !href ? 0 : undefined}
      onKeyDown={
        isInteractive && !href
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPicker();
              }
            }
          : undefined
      }
      className={cn(disabled && 'opacity-50 cursor-not-allowed')}
    />
  );

  if (isLink) {
    return attachmentEl;
  }

  return (
    <div className={cn(variant === 'card' ? 'flex w-full' : 'inline-flex', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled || readOnly}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...inputProps}
      />
      {file ? (
        attachmentEl
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={!isInteractive}
          className={cn(
            // Mirrors the filled card's own two-level shape exactly (outer
            // bordered box, p-3, gap-2; an aspect-video thumb; text below
            // it, not crammed inside it) — matching structure, not just a
            // matching outer ratio, is what actually lines up with filled
            // cards at any grid column width.
            'flex w-full flex-col items-center gap-2 p-3',
            'rounded-[var(--size-border-radius-border-radius-2xl)] border border-dashed',
            'border-[var(--color-border-border-default)] bg-[var(--color-bg-surface-bg-surface)]',
            'transition-colors duration-150 ease-out motion-reduce:transition-none',
            'hover:not-disabled:border-[var(--color-border-border-primary)]',
            'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="flex aspect-video w-full items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
            <Plus width={20} height={20} className="text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <span className="font-body text-body-s text-[var(--color-text-text)]">{pickLabel}</span>
            {pickHint && <span className="font-body text-body-xs text-[var(--color-text-text-subtler)] text-center">{pickHint}</span>}
          </span>
        </button>
      )}
    </div>
  );
}
