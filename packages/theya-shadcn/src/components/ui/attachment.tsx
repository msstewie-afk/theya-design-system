import { createElement, type ReactNode } from 'react';
import { Page, MediaImage, MediaVideo, Code, Archive, Xmark, WarningTriangle } from 'iconoir-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

/** Falls back to a generic file icon for anything not matched below. */
export const ATTACHMENT_MIME_LABELS: Record<string, string> = {
  'image/png': 'PNG image',
  'image/jpeg': 'JPEG image',
  'application/pdf': 'PDF',
  'application/zip': 'ZIP archive',
  'text/plain': 'Text file',
  'video/mp4': 'MP4 video',
};

function kindIcon(type?: string, previewUrl?: string) {
  if (previewUrl) return null; // thumbnail takes over
  if (type?.startsWith('image/')) return <MediaImage />;
  if (type?.startsWith('video/')) return <MediaVideo />;
  if (type === 'application/zip') return <Archive />;
  if (type?.startsWith('text/') || type === 'application/json') return <Code />;
  return <Page />;
}

export interface AttachmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'onClick'> {
  onClick?: () => void;
  name: string;
  size?: number;
  /** Secondary metadata line, e.g. "Modified today". Overridden by `error` when set. */
  metaText?: ReactNode;
  variant?: 'pill' | 'card' | 'row' | 'line';
  type?: string;
  error?: string;
  showKind?: boolean;
  showMeta?: boolean;
  /** Marks the file as picked — a ring on top of the hover fill, plus `aria-current` on a link. */
  selected?: boolean;
  previewUrl?: string;
  /** Turns the name into a real link, its ::after stretched over the whole surface as the hit target. */
  href?: string;
  mimeLabels?: Record<string, string>;
  onRemove?: () => void;
  /** Accessible name for the remove button. Default "Remove {name}". */
  removeLabel?: string;
  actions?: ReactNode;
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

export function Attachment({
  name,
  size,
  metaText,
  variant = 'pill',
  type,
  error,
  showKind = false,
  showMeta = true,
  selected = false,
  previewUrl,
  href,
  mimeLabels = ATTACHMENT_MIME_LABELS,
  onRemove,
  removeLabel,
  actions,
  className,
  onClick,
  ...rest
}: AttachmentProps) {
  const hasError = Boolean(error);
  const kindLabel = type ? (mimeLabels[type] ?? type) : undefined;

  // Hover/press fills and the focus ring only apply when the row is
  // actually interactive (a real href, or the consumer's own onClick) —
  // a static row stays flat under the pointer instead of implying an
  // action that isn't there.
  const isInteractive = Boolean(href) || Boolean(onClick);
  // `href` rows get their keyboard/AT accessibility for free (the real
  // <a> below, stretched over the row via ::after) — only an onClick-only
  // row (no href) needs the outer element itself to become the focusable
  // control, since there's no other focusable element inside it otherwise.
  const isClickOnly = Boolean(onClick) && !href;
  // `group` so the icon/thumb box (a descendant) can react to this
  // wrapper's own :focus-within via group-focus-within below.
  const interactiveClasses = isInteractive
    ? cn(
        'group relative',
        // Focus ring color follows error state — was unconditionally the
        // primary ring, so an invalid/error row focused blue instead of
        // red. Fixed 2026-09-26.
        hasError
          ? 'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]'
          : 'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        hasError
          ? 'hover:border-[var(--color-border-border-danger-hover)] active:border-[var(--color-border-border-danger-pressed)]'
          : 'hover:border-[var(--color-border-border-primary)] active:border-[var(--color-border-border-primary)]',
        // On focus, an interactive item picks up the exact same tone as
        // `selected` — but only when it isn't already showing a more
        // definitive error/selected look, so focusing a red row doesn't
        // suddenly flash blue.
        !hasError && !selected && 'focus-within:bg-[var(--color-bg-primary-bg-primary-subtler)]',
      )
    : '';
  const borderToneClass = hasError
    ? 'border-[var(--color-border-border-danger)]'
    : selected
      ? 'border-[var(--color-border-border-primary)]'
      : 'border-[var(--color-border-border-subtle)]';
  const surfaceBgClass = hasError
    ? 'bg-[var(--color-bg-danger-bg-danger-subtle)]'
    : selected
      ? 'bg-[var(--color-bg-primary-bg-primary-subtler)]'
      : 'bg-[var(--color-bg-surface-bg-surface)]';
  const iconBoxBgClass = cn(
    hasError
      ? 'bg-[var(--color-bg-danger-bg-danger-subtler)]'
      : selected
        ? 'bg-[var(--color-bg-primary-bg-primary-subtle)]'
        : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
    isInteractive && !hasError && !selected && 'group-focus-within:bg-[var(--color-bg-primary-bg-primary-subtle)]',
  );
  const iconColorClass = cn(
    hasError
      ? 'text-[var(--color-icon-icon-danger)]'
      : selected
        ? 'text-[var(--color-icon-icon-primary)]'
        : 'text-[var(--color-icon-icon-subtle)]',
    isInteractive && !hasError && !selected && 'group-focus-within:text-[var(--color-icon-icon-primary)]',
  );

  // The name becomes the actual <a>, with an ::after stretched over the
  // whole row (the row itself needs `relative` for that to cover it) —
  // the whole surface is clickable, but actions/remove sit in their own
  // `relative z-10` wrapper so they stay independently clickable instead
  // of nesting a <button> inside the <a>.
  const nameEl = href
    ? createElement(
        'a',
        {
          href,
          'aria-current': selected ? 'true' : undefined,
          className: 'outline-none after:absolute after:inset-0 focus-visible:underline',
        },
        name,
      )
    : name;

  // Click-only rows (no href) need the whole surface to be the real
  // focusable control, same idea as the href <a>'s stretched ::after —
  // but as an actual sibling <button> rather than role="button" on the
  // outer element, so a nested `removeButton` never ends up as an
  // interactive descendant of another interactive-role element
  // (axe: nested-interactive). Actions/remove sit in their own
  // `relative z-10` layer above it, so they stay independently clickable.
  const clickOverlay = isClickOnly ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      className="absolute inset-0 outline-none"
    />
  ) : null;

  const metaLine = hasError
    ? error
    : showMeta
      ? [size !== undefined ? humanSize(size) : null, showKind ? kindLabel : null, !showKind ? metaText : metaText]
          .filter(Boolean)
          .join(', ')
      : null;

  const removeButton = onRemove && (
    <Button
      appearance="ghost"
      tone={hasError ? 'danger' : 'neutral'}
      size="sm"
      iconOnly
      className="shrink-0"
      aria-label={removeLabel ?? `Remove ${name}`}
      leftIcon={<Xmark />}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
    />
  );

  if (variant === 'pill') {
    return (
      <div
        data-slot="attachment"
        data-interactive={isInteractive || undefined}
        data-selected={selected || undefined}
        onClick={isClickOnly ? undefined : onClick}
        {...rest}
        className={cn(
          'relative inline-flex self-start max-w-[min(100%,20rem)] items-center gap-2 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid py-2 pl-3',
          onRemove ? 'pr-1.5' : 'pr-5',
          borderToneClass,
          surfaceBgClass,
          interactiveClasses,
          className,
        )}
      >
        {clickOverlay}
        <span className={cn('flex shrink-0 items-center justify-center size-4', iconColorClass)}>
          {kindIcon(type, previewUrl)}
        </span>
        <span className="min-w-0 flex flex-col items-start">
          <span className="font-body text-body-m font-medium text-[var(--color-text-text)] truncate max-w-[10rem]">{nameEl}</span>
          {size !== undefined && (
            <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">{humanSize(size)}</span>
          )}
        </span>
        {(actions || removeButton) && (
          <span className="relative z-10 flex shrink-0 items-center gap-1">
            {actions}
            {removeButton}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div {...rest} className={cn('flex self-start w-full items-center gap-2 py-1', className)}>
        <span className="font-body text-body-m font-medium text-[var(--color-text-text)] truncate flex-1">{name}</span>
        {size !== undefined && (
          <span className="font-body text-body-xs text-[var(--color-text-text-subtler)] shrink-0">{humanSize(size)}</span>
        )}
        {removeButton}
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div
        data-slot="attachment"
        data-interactive={isInteractive || undefined}
        data-selected={selected || undefined}
        onClick={isClickOnly ? undefined : onClick}
        {...rest}
        className={cn(
          'relative flex items-center gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid',
          'p-[var(--size-margin-margin-s)]',
          borderToneClass,
          surfaceBgClass,
          interactiveClasses,
          className,
        )}
      >
        {clickOverlay}
        <span className={cn('flex items-center justify-center size-10 shrink-0 rounded-[var(--size-border-radius-border-radius-md)] overflow-hidden', iconBoxBgClass)}>
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className={cn('flex items-center justify-center size-4', iconColorClass)}>
              {kindIcon(type, previewUrl)}
            </span>
          )}
        </span>
        <span className="flex-1 min-w-0 flex flex-col">
          <span
            className={cn(
              'font-body text-body-m font-medium truncate',
              hasError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text)]',
            )}
          >
            {nameEl}
          </span>
          {metaLine && (
            <span
              className={cn(
                'font-body text-body-xs truncate',
                hasError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]',
              )}
            >
              {hasError && <WarningTriangle width={11} height={11} className="inline mr-1 -mt-0.5" aria-hidden="true" />}
              {metaLine}
            </span>
          )}
        </span>
        {(actions || removeButton) && (
          <span className="relative z-10 flex shrink-0 items-center gap-1">
            {actions}
            {removeButton}
          </span>
        )}
      </div>
    );
  }

  // card (default)
  return (
    <div
      data-slot="attachment"
      data-interactive={isInteractive || undefined}
      data-selected={selected || undefined}
      onClick={isClickOnly ? undefined : onClick}
      {...rest}
      className={cn(
        'relative flex w-full flex-col items-center gap-2 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid p-3 outline-none',
        borderToneClass,
        surfaceBgClass,
        interactiveClasses,
        className,
      )}
    >
      {clickOverlay}
      <span className={cn('flex aspect-video w-full items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] overflow-hidden', iconBoxBgClass)}>
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className={cn('size-6', iconColorClass)}>
            {kindIcon(type, previewUrl)}
          </span>
        )}
      </span>
      <div className="flex w-full items-center gap-2">
        <span className="min-w-0 flex-1 flex flex-col items-start">
          <span
            className={cn(
              'font-body text-body-m font-medium truncate w-full',
              hasError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text)]',
            )}
          >
            {name}
          </span>
          {metaLine && (
            <span
              className={cn(
                'font-body text-body-xs truncate w-full',
                hasError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]',
              )}
            >
              {metaLine}
            </span>
          )}
        </span>
        {actions}
        {removeButton}
      </div>
    </div>
  );
}

export { humanSize };
