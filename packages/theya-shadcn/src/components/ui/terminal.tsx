import { useRef, useLayoutEffect, Children } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatusDot } from './status-dot';

/**
 * A read-only log/console scrollback viewer. A mono, dark-by-default
 * console: an optional connection header (status dot + user@host +
 * tools slot) and a live scrollback body (role="log") that follows
 * the newest line. Each line carries an optional `level` mapping to
 * a semantic token.
 *
 * `inverse` (default true) forces the WHOLE terminal — header
 * included — onto a fixed dark surface regardless of the page's
 * theme: real terminal chrome shouldn't flip pale in light mode.
 * Pass `inverse={false}` to fall back to the theme-reactive surface
 * instead. Unlike CodeEditor — where `inverse` only darkens the code
 * area and leaves the filename header on the regular surface —
 * Terminal darkens header and body together, since a connection
 * header with no code area of its own has no "regular surface" role
 * to preserve.
 *
 * Two different dark palettes, on purpose: the BODY renders actual
 * log/code-like content, so it uses the same Luna Pro Midnight code
 * palette as CodeEditor's `inverse` (--color-code-*-inverse). The
 * HEADER is plain UI chrome sitting on a forced-dark surface — same
 * situation as Tooltip/Sonner — so it uses the dedicated
 * --color-*-on-dark family instead (white text, not Luna's dimmer
 * #abb2bf), which is what that family exists for. The border in
 * `inverse` mode uses --color-code-border-inverse (a fixed copy of
 * border-subtle's own dark-theme value) instead of the theme-
 * reactive --color-border-border-subtle, which reads too bright
 * here whenever the PAGE itself is still in light theme.
 *
 * AUTO-SCROLL: follows the tail only while the reader is already at
 * the bottom — scroll up to read history and appends won't yank you
 * back down.
 *
 *   <Terminal user="acme" host="web-04" connection="connected"
 *     lines={[{ id: "1", text: "acme@web-04:~$ wp cache flush", level: "cmd" }]} />
 */
export type TerminalLevel = 'cmd' | 'ok' | 'success' | 'warn' | 'warning' | 'err' | 'error' | 'info' | 'dim' | 'muted';

export interface TerminalLineData {
  id?: string;
  text: string;
  level?: TerminalLevel;
}

export type TerminalConnection = 'connected' | 'connecting' | 'down';

const LEVEL_CLASS: Record<TerminalLevel, string> = {
  cmd: 'text-[var(--color-text-text)]',
  ok: 'text-[var(--color-text-text-success)]',
  success: 'text-[var(--color-text-text-success)]',
  warn: 'text-[var(--color-text-text-warning)]',
  warning: 'text-[var(--color-text-text-warning)]',
  err: 'text-[var(--color-text-text-danger)]',
  error: 'text-[var(--color-text-text-danger)]',
  info: 'text-[var(--color-text-text)]',
  dim: 'text-[var(--color-text-text-subtler)]',
  muted: 'text-[var(--color-text-text-subtler)]',
};

// `inverse` level colors, mapped onto the nearest Luna Pro Midnight
// syntax role — there's no dedicated theme-independent success/
// warning/danger "-inverse" family (only the code palette has one),
// so ok/success borrows string's green, warn/warning borrows
// number's orange, err/error borrows invalid's red.
const LEVEL_CLASS_INVERSE: Record<TerminalLevel, string> = {
  cmd: 'text-[var(--color-code-text-inverse)]',
  ok: 'text-[var(--color-code-string-inverse)]',
  success: 'text-[var(--color-code-string-inverse)]',
  warn: 'text-[var(--color-code-number-inverse)]',
  warning: 'text-[var(--color-code-number-inverse)]',
  err: 'text-[var(--color-code-invalid-inverse)]',
  error: 'text-[var(--color-code-invalid-inverse)]',
  info: 'text-[var(--color-code-text-inverse)]',
  dim: 'text-[var(--color-code-comment-inverse)]',
  muted: 'text-[var(--color-code-comment-inverse)]',
};

export interface TerminalProps extends React.ComponentProps<'div'> {
  /** Data-driven lines. Omit to compose the body yourself via children. */
  lines?: TerminalLineData[];
  user?: string;
  host?: string;
  connection?: TerminalConnection;
  /** Free-text status shown next to user@host. */
  status?: string;
  /** Right-aligned header content. */
  tools?: ReactNode;
  hideHeader?: boolean;
  bodyClassName?: string;
  ariaLabel?: string;
  /** Live-region politeness. Set "off" for chatty/high-frequency streams. */
  live?: 'polite' | 'off';
  /** Forces the whole terminal (header + body) onto the fixed dark
   * Luna Pro Midnight surface regardless of page theme. Default true. */
  inverse?: boolean;
  children?: ReactNode;
}

export function Terminal({ className, lines, user, host, connection = 'connected', status, tools, hideHeader, bodyClassName, ariaLabel = 'Terminal output', live = 'polite', inverse = true, children, ...props }: TerminalProps) {
  const showHeader = !hideHeader && (user || host || tools || status);

  return (
    <div
      data-slot="terminal"
      data-inverse={inverse || undefined}
      className={cn(
        'flex max-w-full min-w-0 flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid shadow-elevation-xs',
        inverse ? 'border-[var(--color-code-border-inverse)] bg-[var(--color-code-bg-inverse)]' : 'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        className,
      )}
      {...props}
    >
      {showHeader && (
        <TerminalHeader user={user} host={host} connection={connection} status={status} inverse={inverse}>
          {tools}
        </TerminalHeader>
      )}
      <TerminalBody className={bodyClassName} ariaLabel={ariaLabel} live={live} lines={lines} inverse={inverse}>
        {children}
      </TerminalBody>
    </div>
  );
}

const CONNECTION_TONE = { connected: 'success', connecting: 'warning', down: 'neutral' } as const;

function connectionLabel(connection: TerminalConnection, status?: string) {
  if (connection === 'connecting') return status ?? 'Connecting…';
  if (connection === 'down') return status ?? 'Disconnected';
  return status ?? 'Connected';
}

export interface TerminalHeaderProps extends React.ComponentProps<'div'> {
  user?: string;
  host?: string;
  connection?: TerminalConnection;
  status?: string;
  inverse?: boolean;
}

export function TerminalHeader({ className, user, host, connection = 'connected', status, inverse = false, children, ...props }: TerminalHeaderProps) {
  const userHost = [user, host].filter(Boolean).join('@');
  return (
    <div
      data-slot="terminal-header"
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-solid px-3 py-2.5',
        inverse ? 'border-[var(--color-code-border-inverse)] bg-[var(--color-code-bg-inverse)]' : 'border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)]',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {/* h-5 matches text-body-m's own line-height (20px, the
            user@host line below) so items-center here centers the dot
            against that first line specifically, not the shorter
            second (status) line dragging the middle down. */}
        <div className="flex h-5 shrink-0 items-center">
          <StatusDot tone={CONNECTION_TONE[connection]} inverse={inverse} className={cn('translate-y-px', connection === 'connecting' && 'motion-safe:animate-pulse')} />
        </div>
        <div className="min-w-0">
          {userHost && (
            <div className={cn('truncate font-mono text-body-m font-medium', inverse ? 'text-[var(--color-text-text-on-dark)]' : 'text-[var(--color-text-text)]')}>
              {userHost}
            </div>
          )}
          <div className={cn('truncate font-body text-body-s', inverse ? 'text-[var(--color-text-text-subtle-on-dark)]' : 'text-[var(--color-text-text-subtler)]')}>
            {connectionLabel(connection, status)}
          </div>
        </div>
      </div>
      {children && <div data-slot="terminal-tools" className="flex w-full flex-wrap items-center justify-start gap-2 sm:ml-auto sm:w-auto sm:justify-end">{children}</div>}
    </div>
  );
}

export interface TerminalBodyProps extends React.ComponentProps<'div'> {
  lines?: TerminalLineData[];
  ariaLabel?: string;
  live?: 'polite' | 'off';
  inverse?: boolean;
}

export function TerminalBody({ className, lines, ariaLabel = 'Terminal output', live = 'polite', inverse = false, children, ...props }: TerminalBodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  const dep = lines ? `${lines.length}:${lines[lines.length - 1]?.text ?? ''}` : Children.count(children);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!didInit.current) {
      didInit.current = true;
      el.scrollTop = el.scrollHeight;
      return;
    }
    const pinnedToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (pinnedToBottom) el.scrollTop = el.scrollHeight;
  }, [dep]);

  return (
    <div
      ref={ref}
      data-slot="terminal-body"
      role="log"
      aria-live={live}
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        'min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3.5',
        'font-mono text-body-m leading-relaxed',
        inverse ? 'text-[var(--color-code-text-inverse)]' : 'text-[var(--color-text-text)]',
        'outline-none focus-visible:shadow-[inset_0_0_0_3px_var(--color-focus-focus-ring)]',
        !className && 'h-[clamp(14rem,50vh,32rem)]',
        className,
      )}
      {...props}
    >
      {lines ? lines.map((line, i) => (
        <TerminalLine key={line.id ?? i} level={line.level} inverse={inverse}>
          {line.text}
        </TerminalLine>
      )) : children}
    </div>
  );
}

function severityLabel(level?: TerminalLevel) {
  if (level === 'err' || level === 'error') return 'Error';
  if (level === 'warn' || level === 'warning') return 'Warning';
  return null;
}

export interface TerminalLineProps extends React.ComponentProps<'div'> {
  level?: TerminalLevel;
  /** Match the parent Terminal's `inverse` when composing lines
   * yourself via children instead of the `lines` prop. */
  inverse?: boolean;
}

export function TerminalLine({ className, level, inverse = false, children, ...props }: TerminalLineProps) {
  const label = severityLabel(level);
  const levelClass = level ? (inverse ? LEVEL_CLASS_INVERSE[level] : LEVEL_CLASS[level]) : undefined;
  return (
    <div data-slot="terminal-line" className={cn('whitespace-pre-wrap break-all', levelClass, className)} {...props}>
      {label && <span className="sr-only">{label}: </span>}
      {children === '' ? ' ' : children}
    </div>
  );
}
