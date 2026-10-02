import { createElement, useId, type ReactNode } from 'react';
import { Page, MediaImage, MediaVideo, Code, Archive, Xmark, WarningTriangle, Refresh } from 'iconoir-react';
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
  /**
   * What a click-only row does, e.g. "Replace file". Shown in place of the
   * meta line while the row is hovered or keyboard-focused, and read as
   * the click control's description ("report.pdf, button, Replace file").
   * Ignored with `href` or `error`.
   */
  clickHint?: string;
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
  clickHint,
  actions,
  className,
  onClick,
  'aria-pressed': ariaPressed,
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

  // The click hint swaps in for the meta line only while the overlay
  // button itself is hovered or keyboard-focused — keyed on the overlay
  // via :has(), not plain group-hover/focus-within, so hovering or
  // focusing the Remove button (its own z-10 layer) doesn't announce
  // "Replace file".
  const hintId = useId();
  const hint = isClickOnly && clickHint && !hasError ? clickHint : undefined;
  const ON_ACTION_SHOW =
    'hidden group-has-[[data-slot=attachment-click]:hover]:inline-flex group-has-[[data-slot=attachment-click]:focus-visible]:inline-flex';
  const ON_ACTION_HIDE =
    'group-has-[[data-slot=attachment-click]:hover]:hidden group-has-[[data-slot=attachment-click]:focus-visible]:hidden';
  const metaHideClass = hint ? ON_ACTION_HIDE : undefined;
  const hintEl = hint ? (
    <span
      id={hintId}
      data-slot="attachment-hint"
      className={cn(ON_ACTION_SHOW, 'items-center gap-1 font-body text-body-xs text-[var(--color-text-text-link)]')}
    >
      <Refresh width={11} height={11} aria-hidden="true" />
      {hint}
    </span>
  ) : null;
  // `group` so the icon/thumb box (a descendant) can react to this
  // wrapper's own :focus-within via group-focus-within below.
  const interactiveClasses = isInteractive
    ? cn(
        'group relative',
        // Focus ring color follows error state — was unconditionally the
        // primary ring, so an invalid/error row focused blue instead of
        // red. Fixed 2026-09-26.
        hasError
          ? 'focus-within:focus-ring-error'
          : 'focus-within:focus-ring',
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
      data-slot="attachment-click"
      onClick={onClick}
      aria-label={name}
      aria-describedby={hint ? hintId : undefined}
      // Toggle state belongs on the control, not the wrapper: aria-pressed on
      // the role-less outer <div> was invalid (axe aria-allowed-attr,
      // 2026-09-28 full test-runner pass).
      aria-pressed={ariaPressed}
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
          {/* The error text itself, not only the danger border/bg: 'pill'
              and 'line' used to drop it, so a rejected file was flagged
              by color alone with no reason given (WCAG 1.4.1). */}
          {hasError ? (
            <span className="font-body text-body-xs text-[var(--color-text-text-danger)]">
              <WarningTriangle width={11} height={11} className="inline mr-1 -mt-0.5" aria-hidden="true" />
              {error}
            </span>
          ) : (
            <>
              {size !== undefined && <span className={cn('font-body text-body-xs text-[var(--color-text-text-subtler)]', metaHideClass)}>{humanSize(size)}</span>}
              {hintEl}
            </>
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
      <div
        {...rest}
        data-slot="attachment"
        data-interactive={isInteractive || undefined}
        className={cn('flex self-start w-full items-center gap-2 py-1', isInteractive && 'group relative cursor-pointer rounded-[var(--size-border-radius-border-radius-md)] focus-within:focus-ring', className)}
      >
        {/* Same stretched-button overlay as the other variants — 'line'
            used to drop onClick entirely, so a click-only line row was
            unclickable (File relied on role="button" on this div). */}
        {clickOverlay}
        {/* nameEl, not name: with `href` it is the real <a>. 'line' and
            'card' rendered the plain name, silently dropping href. */}
        <span className="font-body text-body-m font-medium text-[var(--color-text-text)] truncate flex-1">{nameEl}</span>
        {hasError ? (
          <span className="font-body text-body-xs text-[var(--color-text-text-danger)] shrink-0">
            <WarningTriangle width={11} height={11} className="inline mr-1 -mt-0.5" aria-hidden="true" />
            {error}
          </span>
        ) : (
          <>
            {size !== undefined && <span className={cn('font-body text-body-xs text-[var(--color-text-text-subtler)] shrink-0', metaHideClass)}>{humanSize(size)}</span>}
            {hintEl && <span className="shrink-0">{hintEl}</span>}
          </>
        )}
        {removeButton && <span className="relative z-10">{removeButton}</span>}
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
                metaHideClass,
              )}
            >
              {hasError && <WarningTriangle width={11} height={11} className="inline mr-1 -mt-0.5" aria-hidden="true" />}
              {metaLine}
            </span>
          )}
          {hintEl}
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
            {nameEl}
          </span>
          {metaLine && (
            <span
              className={cn(
                'font-body text-body-xs truncate w-full',
                hasError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]',
                metaHideClass,
              )}
            >
              {metaLine}
            </span>
          )}
          {hintEl}
        </span>
        {actions}
        {removeButton}
      </div>
    </div>
  );
}

export { humanSize };
