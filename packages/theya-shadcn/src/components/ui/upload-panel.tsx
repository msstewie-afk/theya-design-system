'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, NavArrowDown, NavArrowUp, Pause, Play, Refresh, WarningTriangle, Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { Progress } from './progress';
import { humanSize } from './attachment';

/**
 * A panel in the corner of the screen for files uploading in the
 * background (Google Drive, Dropbox): collapsed it says how many files,
 * how far and how long; expanded it lists every file with its own bar,
 * pause / resume, cancel and retry. When everything is in it says
 * "Uploaded 3 files" and can be closed.
 *
 * - It holds no upload logic: pass the files with their `progress` and
 *   `upload` state, and handle the callbacks. A callback left out hides its
 *   button.
 * - A named region ("Uploads"), not a toast: it stays until closed and
 *   never takes focus. A polite live region says when uploads start,
 *   pause, finish or fail — never every percent or second.
 * - Escape inside the panel collapses it. On phones it spans the bottom
 *   edge (`floating`), otherwise it sits in the bottom end corner.
 */
export interface UploadPanelFile {
  id: string;
  name: string;
  /** Bytes. */
  size?: number;
  /** 0–100. */
  progress: number;
  upload: 'uploading' | 'paused' | 'done';
  /** Why it failed; the file shows a Retry button when `onRetry` is set. */
  error?: string;
  /** Seconds left for this file, if known. */
  timeLeft?: number;
}

export interface UploadPanelProps extends Omit<React.ComponentProps<'section'>, 'children' | 'onPause'> {
  files: UploadPanelFile[];
  /** Seconds left for everything, if known. */
  timeLeft?: number;
  /** Expanded at first (default false). */
  defaultExpanded?: boolean;
  /** Controlled expansion. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onPauseAll?: () => void;
  onResumeAll?: () => void;
  onCancelAll?: () => void;
  /** Shows a close button once nothing is uploading. */
  onClose?: () => void;
  /** Fixed to the bottom end corner of the viewport (default true); false renders it in place. */
  floating?: boolean;
}

export function UploadPanel({
  files,
  timeLeft,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onPauseAll,
  onResumeAll,
  onCancelAll,
  onClose,
  floating = true,
  className,
  'aria-label': ariaLabel,
  ...props
}: UploadPanelProps) {
  const { t, locale } = useTheyaI18n();
  const uid = useId();
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedState;
  const setExpanded = (v: boolean) => {
    if (expandedProp === undefined) setExpandedState(v);
    onExpandedChange?.(v);
  };

  const failed = files.filter((f) => f.error);
  const active = files.filter((f) => !f.error && f.upload !== 'done');
  const running = active.filter((f) => f.upload === 'uploading');
  const allPaused = active.length > 0 && running.length === 0;
  const finished = active.length === 0;
  // Overall progress, weighted by size when sizes are known.
  const weight = (f: UploadPanelFile) => f.size ?? 1;
  const live = files.filter((f) => !f.error);
  const total = live.reduce((s, f) => s + weight(f), 0);
  const pct = total ? Math.round(live.reduce((s, f) => s + (weight(f) * (f.upload === 'done' ? 100 : f.progress)) / 100, 0) / total * 100) : 100;

  const duration = (sec: number) => {
    const minutes = sec >= 90;
    return new Intl.NumberFormat(locale, { style: 'unit', unit: minutes ? 'minute' : 'second', unitDisplay: 'long' }).format(minutes ? Math.round(sec / 60) : Math.max(1, Math.round(sec)));
  };

  // The batch keeps its size in the title while it runs ("Uploading 3 files"), as in Drive.
  const title = finished ? t.uploadPanel.uploaded(files.length - failed.length) : t.uploadPanel.uploading(files.length);
  const meta = finished
    ? failed.length
      ? t.uploadPanel.failed(failed.length)
      : null
    : [allPaused ? t.upload.paused : null, `${pct}%`, !allPaused && timeLeft !== undefined ? t.uploadPanel.left(duration(timeLeft)) : null, failed.length ? t.uploadPanel.failed(failed.length) : null]
        .filter(Boolean)
        .join(' · ');

  // Announce changes of the whole batch only, and each new failure once.
  const [announce, setAnnounce] = useState('');
  const lastState = useRef('');
  const state = finished ? 'done' : allPaused ? 'paused' : 'uploading';
  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (state === 'done') setAnnounce([t.uploadPanel.uploaded(files.length - failed.length), failed.length ? t.uploadPanel.failed(failed.length) : ''].filter(Boolean).join(', '));
    else if (state === 'paused') setAnnounce(`${t.uploadPanel.uploading(files.length)}: ${t.upload.paused}`);
    else setAnnounce(t.uploadPanel.uploading(files.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  const seenFailures = useRef(new Set<string>());
  useEffect(() => {
    const fresh = failed.filter((f) => !seenFailures.current.has(f.id));
    fresh.forEach((f) => seenFailures.current.add(f.id));
    const last = fresh[fresh.length - 1];
    if (last) setAnnounce(t.upload.failed(last.name, last.error ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed.map((f) => f.id).join()]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && expanded) {
      e.stopPropagation();
      setExpanded(false);
      // Focus stays on the panel: move it to the toggle, which survives the collapse.
      (e.currentTarget.querySelector('[data-slot="upload-panel-toggle"]') as HTMLElement | null)?.focus();
    }
  };

  const iconBtn = 'shrink-0';
  return (
    <section
      data-slot="upload-panel"
      aria-label={ariaLabel ?? t.uploadPanel.label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] shadow-elevation-lg',
        floating && 'fixed z-50 max-sm:inset-x-2 max-sm:bottom-[max(0.5rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:end-4 sm:w-[24rem]',
        className,
      )}
      {...props}
    >
      {/* Summary: title, how far / how long, batch controls. */}
      <div className="flex items-center gap-2 py-3 pe-2 ps-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="m-0 flex items-center gap-1 truncate font-body text-body-m font-semibold text-[var(--color-text-text)]">
            {finished && !failed.length && <Check aria-hidden className="size-4 shrink-0 text-[var(--color-icon-icon-success)]" />}
            {title}
          </p>
          {meta && <p className={cn('m-0 truncate font-body text-body-xs tabular-nums', failed.length && finished ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]')}>{meta}</p>}
        </div>
        {!finished && allPaused && onResumeAll && (
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.resumeAll} leftIcon={<Play />} onClick={onResumeAll} />
        )}
        {!finished && !allPaused && onPauseAll && (
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.pauseAll} leftIcon={<Pause />} onClick={onPauseAll} />
        )}
        {!finished && onCancelAll && (
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.cancelAll} leftIcon={<Xmark />} onClick={onCancelAll} />
        )}
        <Button
          appearance="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          data-slot="upload-panel-toggle"
          className={iconBtn}
          aria-label={expanded ? t.uploadPanel.hideFiles : t.uploadPanel.showFiles}
          aria-expanded={expanded}
          aria-controls={`${uid}-list`}
          leftIcon={expanded ? <NavArrowDown /> : <NavArrowUp />}
          onClick={() => setExpanded(!expanded)}
        />
        {finished && onClose && <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.common.close} leftIcon={<Xmark />} onClick={onClose} />}
      </div>
      {/* The batch bar along the bottom edge of the summary while collapsed. */}
      {!expanded && !finished && (
        <Progress
          value={pct}
          aria-label={title}
          aria-valuetext={meta ?? undefined}
          className={cn('h-1 rounded-none', allPaused && '[&>*]:bg-[var(--color-bg-neutral-bg-neutral-strong)]')}
        />
      )}
      <ul
        id={`${uid}-list`}
        hidden={!expanded}
        className="m-0 flex max-h-[min(20rem,50vh)] list-none flex-col overflow-y-auto border-t border-solid border-[var(--color-border-border-subtler)] px-0 py-1"
      >
        {files.map((f) => {
          const inFlight = !f.error && f.upload !== 'done';
          const fileMeta = f.error
            ? f.error
            : f.upload === 'done'
              ? [f.size !== undefined ? humanSize(f.size) : null, t.upload.done].filter(Boolean).join(' · ')
              : [f.upload === 'paused' ? t.upload.paused : null, `${Math.round(f.progress)}%`, f.upload === 'uploading' && f.timeLeft !== undefined ? t.uploadPanel.left(duration(f.timeLeft)) : null]
                  .filter(Boolean)
                  .join(' · ');
          return (
            <li key={f.id} className="flex items-center gap-2 py-2 pe-2 ps-4">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={cn('truncate font-body text-body-s font-medium', f.error ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text)]')}>{f.name}</span>
                <span className={cn('truncate font-body text-body-xs tabular-nums', f.error ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]')}>
                  {f.error && <WarningTriangle aria-hidden width={11} height={11} className="-mt-0.5 me-1 inline" />}
                  {f.upload === 'done' && !f.error && <Check aria-hidden width={12} height={12} className="-mt-0.5 me-1 inline text-[var(--color-icon-icon-success)]" />}
                  {fileMeta}
                </span>
                {/* The bar's room is kept for every row, so rows line up and don't shrink when a file finishes. */}
                {inFlight ? (
                  <Progress
                    value={f.progress}
                    aria-label={f.name}
                    aria-valuetext={fileMeta}
                    className={cn('mt-2 h-1', f.upload === 'paused' && '[&>*]:bg-[var(--color-bg-neutral-bg-neutral-strong)]')}
                  />
                ) : (
                  <span aria-hidden className="mt-2 block h-1" />
                )}
              </div>
              {f.error && onRetry && (
                <Button appearance="ghost" tone="danger" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.retry(f.name)} leftIcon={<Refresh />} onClick={() => onRetry(f.id)} />
              )}
              {inFlight && f.upload === 'uploading' && onPause && (
                <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.pause(f.name)} leftIcon={<Pause />} onClick={() => onPause(f.id)} />
              )}
              {inFlight && f.upload === 'paused' && onResume && (
                <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.resume(f.name)} leftIcon={<Play />} onClick={() => onResume(f.id)} />
              )}
              {(inFlight || f.error) && onCancel && (
                <Button appearance="ghost" tone="neutral" size="sm" iconOnly className={iconBtn} aria-label={t.uploadPanel.cancel(f.name)} leftIcon={<Xmark />} onClick={() => onCancel(f.id)} />
              )}
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  );
}
