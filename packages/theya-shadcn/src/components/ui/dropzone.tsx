import { useRef, useState, useId } from 'react';
import { CloudUpload, Xmark, Page, Check, WarningCircle } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Separator } from './separator';

function ExclamationCircle({ className }: { className?: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <rect x="5.25" y="2.5" width="1.5" height="4" rx="0.75" fill="white" />
      <circle cx="6" cy="8.5" r="0.9" fill="white" />
    </svg>
  );
}

export interface StagedFile {
  name: string;
  size: number;
  error?: string;
}

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hint?: string;
  error?: string;
  /** Replaces the drag/or/Browse content with a single-file success confirmation (checkmark, name, upload date) — for single-file flows like a resume upload. Ignored while `error` is set. */
  successFile?: { name: string; uploadedAt: string };
  /** Zone shows a spinner + "Uploading…" and becomes non-interactive. Takes priority over error/successFile while true. */
  loading?: boolean;
  files?: StagedFile[];
  onRemove?: (index: number) => void;
  'aria-label'?: string;
  className?: string;
}

function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return `${rounded} ${units[unit]}`;
}

function Dropzone({
  onFiles,
  accept,
  multiple = true,
  disabled = false,
  hint,
  error,
  successFile,
  loading = false,
  files,
  onRemove,
  className,
  'aria-label': ariaLabel,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const errorId = useId();
  const hintId = useId();
  const labelId = useId();
  const contextId = useId();
  const dragDepth = useRef(0);

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const openPicker = () => {
    if (!disabled && !loading) inputRef.current?.click();
  };

  return (
    <div className={cn('flex w-[450px] min-w-0 flex-col gap-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          if (list.length > 0) onFiles(list);
          e.target.value = '';
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        onDragEnter={(e) => {
          if (disabled || loading) return;
          e.preventDefault();
          dragDepth.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          if (!disabled && !loading) e.preventDefault();
        }}
        onDragLeave={(e) => {
          if (disabled || loading) return;
          e.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setIsDragging(false);
          if (disabled || loading) return;
          const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
          if (list.length > 0) onFiles(multiple ? list : list.slice(0, 1));
        }}
        className={cn(
          'group relative flex w-[450px] h-[280px] flex-col items-center justify-center gap-4 text-center cursor-pointer outline-none',
          'rounded-[var(--size-border-radius-border-radius-2xl)] border border-dashed',
          'border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'p-[var(--size-margin-margin-3xl)]',
          'transition-[border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
          // Hover/focus were unconditionally primary, painting over an
          // error or success dropzone on hover — gated off both states below,
          // each with its own matching hover treatment (2026-09-26 fix).
          !error && !successFile && 'hover:not-disabled:border-[var(--color-border-border-primary)] hover:not-disabled:bg-[var(--color-bg-primary-bg-primary-subtle)]',
          // focus-within, not focus-visible: the real focusable control is
          // now the stretched overlay <button> below (a nested-interactive
          // fix — this div used to carry role="button" itself, with the
          // "Browse" Button nested inside it, which axe flags), not this div.
          !error && !successFile && 'focus-within:border-[var(--color-border-border-primary)]',
          'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          error && 'border-[var(--color-border-border-danger)] bg-[var(--color-bg-danger-bg-danger-subtle)]',
          error && 'hover:not-disabled:border-[var(--color-border-border-danger-hover)] hover:not-disabled:bg-[var(--color-bg-danger-bg-danger-subtle-hover)]',
          !error && successFile && 'border-[var(--color-border-border-success)] bg-[var(--color-bg-success-bg-success-subtle)]',
          !error && successFile && 'hover:not-disabled:border-[var(--color-border-border-success-hover)] hover:not-disabled:bg-[var(--color-bg-success-bg-success-subtle-hover)]',
          isDragging && 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]',
          loading && 'pointer-events-none cursor-default',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        )}
      >
        {/* Stretched hit-target: a real <button>, not role="button" on the
            outer div — that would nest the "Browse" Button inside another
            interactive-role element (axe: nested-interactive). Sits behind
            "Browse" (which gets its own `relative z-10` below) so both stay
            independently clickable; everything else in the zone is
            non-interactive, so covering it is fine. */}
        <button
          type="button"
          disabled={disabled || loading}
          aria-labelledby={ariaLabel ? `${contextId} ${labelId}` : labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onClick={openPicker}
          className="absolute inset-0 cursor-pointer outline-none disabled:cursor-not-allowed"
        />
        {ariaLabel && (
          <span id={contextId} className="sr-only">
            {ariaLabel}
          </span>
        )}
        <span
          className={cn(
            'grid size-14 place-items-center rounded-full transition-colors duration-150 ease-out motion-reduce:transition-none',
            error
              ? 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-icon-icon-danger)]'
              : loading
                ? 'bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-icon-icon-primary)]'
                : successFile
                  ? 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-icon-icon-success)]'
                  : 'bg-[var(--color-bg-neutral-bg-neutral-subtler)] text-[var(--color-icon-icon-subtle)] group-hover:text-[var(--color-icon-icon-primary)]',
          )}
        >
          {error ? (
            <WarningCircle width={24} height={24} aria-hidden="true" />
          ) : loading ? (
            <span className="size-6 rounded-full border-2 border-[var(--color-border-border-subtle)] border-t-[var(--color-icon-icon-primary)] animate-spin motion-reduce:animate-none" />
          ) : successFile ? (
            <Check width={24} height={24} aria-hidden="true" />
          ) : (
            <CloudUpload width={24} height={24} aria-hidden="true" />
          )}
        </span>
        {loading && !error ? (
          <p className="font-body text-heading-s text-[var(--color-text-text)]">Uploading…</p>
        ) : successFile && !error ? (
          <div className="flex flex-col items-center gap-1">
            <p className="font-body text-heading-s text-[var(--color-text-text)]">{successFile.name}</p>
            {/* text-text-subtler doesn't clear AA against this state's
                tinted bg-success-subtle background (axe: color-contrast) —
                text-text-success is the pairing every other success surface
                in this codebase uses with that same background (see Alert,
                Badge, Button's tonal-success variant). */}
            <p className="font-body text-body-xs text-[var(--color-text-text-success)]">Uploaded on {successFile.uploadedAt}</p>
          </div>
        ) : (
          /* Label/or/Browse read as one tight group — the outer gap-4 above
             is for icon-to-group and group-to-hint spacing; this inner gap
             is deliberately smaller so the three lines feel like a unit.
             Only the heading line's wording changes on error — or/Browse
             stay so the person can still retry. */
          <div className="flex flex-col items-center gap-0">
            <p id={labelId} className="font-body text-heading-s text-[var(--color-text-text)]">
              {error ? 'File is uploaded with error' : 'Drag files here'}
            </p>
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">or</p>
            <Button type="filled" tone="primary" size="lg" className="relative z-10 mt-2" disabled={disabled} onClick={(e) => { e.stopPropagation(); openPicker(); }}>
              Browse
            </Button>
          </div>
        )}
        {error ? (
          <p id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 font-body text-body-xs text-[var(--color-text-text-danger)]">
            <ExclamationCircle className="shrink-0 text-[var(--color-icon-icon-danger)]" />
            <span className="min-w-0">{error}</span>
          </p>
        ) : (
          hint && (
            <p id={hintId} className="mt-2 font-body text-body-xs text-[var(--color-text-text-subtler)]">
              {hint}
            </p>
          )
        )}
      </div>

      {files && files.length > 0 && (
        <ul className="flex flex-col" aria-label="Staged files">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} aria-invalid={file.error ? true : undefined}>
              {index > 0 && <Separator className="my-1.5" />}
              {/* Icon + two-line text stack (name, then a lighter/smaller
                  size line) + a remove icon on the right — ported from the
                  Mobbin reference's uploaded-file row shape. No horizontal
                  padding or per-row border anymore — rows sit flush with
                  the dropzone's own edges; Separator marks the boundary
                  between rows instead of a box per row. */}
              <div className="flex min-w-0 flex-col gap-1 py-[var(--size-margin-margin-xs)]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-center size-8 rounded-[var(--size-border-radius-border-radius-md)]',
                      file.error
                        ? 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-icon-icon-danger)]'
                        : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)]',
                    )}
                  >
                    <Page width={16} height={16} aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cn(
                        'min-w-0 truncate font-body text-body-m font-medium',
                        file.error ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text)]',
                      )}
                    >
                      {file.name}
                    </span>
                    <span className="shrink-0 font-body text-body-xs text-[var(--color-text-text-subtler)]">
                      {humanSize(file.size)}
                    </span>
                  </div>
                  {onRemove && (
                    <Button
                      type="ghost"
                      size="sm"
                      iconOnly
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => onRemove(index)}
                      leftIcon={<Xmark />}
                    />
                  )}
                </div>
                {file.error && (
                  <p role="alert" className="flex items-start gap-1.5 font-body text-body-xs text-[var(--color-text-text-danger)]">
                    <ExclamationCircle className="mt-px shrink-0 text-[var(--color-icon-icon-danger)]" />
                    <span className="min-w-0">{file.error}</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { Dropzone, humanSize };
