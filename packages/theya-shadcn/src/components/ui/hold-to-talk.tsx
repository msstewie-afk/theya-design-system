'use client';

import { useRef, useState } from 'react';
import { Microphone } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Push-to-talk for a prompt (Kinetics' Hold to Talk, MIT): press and hold — pointer,
 * Space or Enter — and the button grows into a pill with a live waveform; release to
 * send, or slide off / press Escape to cancel. It doesn't record anything itself:
 * start your recorder in `onHoldStart`, then stop and send in `onHoldEnd`, or discard
 * in `onCancel`. Fits PromptArea's `trailing` slot.
 *
 * Accessibility: a real button with aria-pressed while held, its name says how to use
 * it; the "Release to send" hint is announced once when holding starts. With reduced
 * motion the waveform stays still.
 */
export interface HoldToTalkProps extends Omit<React.ComponentProps<'button'>, 'onClick' | 'children'> {
  onHoldStart?: () => void;
  /** Released normally: send what was recorded. */
  onHoldEnd?: () => void;
  /** Escape, or the pointer slid off the button before release: discard. */
  onCancel?: () => void;
  /** Accessible name. Default "Hold to talk". */
  label?: string;
}

const BARS = [0.42, 0.3, 0.5, 0.28, 0.46];

export function HoldToTalk({ onHoldStart, onHoldEnd, onCancel, label, disabled, className, ...props }: HoldToTalkProps) {
  const { t } = useTheyaI18n();
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);

  const start = () => {
    if (disabled || liveRef.current) return;
    liveRef.current = true;
    setLive(true);
    onHoldStart?.();
  };
  const finish = (cancelled: boolean) => {
    if (!liveRef.current) return;
    liveRef.current = false;
    setLive(false);
    if (cancelled) onCancel?.();
    else onHoldEnd?.();
  };

  return (
    <>
      <button
        type="button"
        data-slot="hold-to-talk"
        data-state={live ? 'live' : 'idle'}
        aria-label={label ?? t.holdToTalk.label}
        aria-pressed={live}
        disabled={disabled}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          start();
        }}
        onPointerUp={(event) => {
          // Released over the button sends; released elsewhere (slid off) cancels.
          const r = event.currentTarget.getBoundingClientRect();
          const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
          finish(!inside);
        }}
        onPointerCancel={() => finish(true)}
        onKeyDown={(event) => {
          if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
            event.preventDefault();
            start();
          } else if (event.key === 'Escape' && liveRef.current) {
            event.preventDefault();
            finish(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') finish(false);
        }}
        onBlur={() => finish(true)}
        onContextMenu={(event) => event.preventDefault()}
        className={cn(
          'inline-flex h-8 min-w-8 shrink-0 cursor-pointer touch-none select-none items-center justify-center gap-2 rounded-full px-2',
          'transition-[background-color,color,padding] duration-moderate ease-spring motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
          live
            ? 'bg-[var(--color-bg-primary-bg-primary)] px-3 text-[var(--color-text-text-on-primary)]'
            : 'text-[var(--color-icon-icon-subtle)] hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:not-disabled:text-[var(--color-icon-icon)]',
          className,
        )}
        {...props}
      >
        <Microphone aria-hidden="true" className="size-4 shrink-0" />
        {live && (
          <span aria-hidden="true" className="flex h-4 items-center gap-[3px]">
            {BARS.map((d, i) => (
              <i
                key={i}
                className="h-full w-[3px] rounded-full bg-current animate-[theya-talk_ease-in-out_infinite_alternate] motion-reduce:animate-none motion-reduce:scale-y-50"
                style={{ animationDuration: `${d}s` }}
              />
            ))}
          </span>
        )}
      </button>
      <span role="status" className="sr-only">
        {live ? t.holdToTalk.release : ''}
      </span>
    </>
  );
}
