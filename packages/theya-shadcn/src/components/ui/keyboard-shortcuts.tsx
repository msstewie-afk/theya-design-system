import { Fragment, useState, useCallback, useEffect } from 'react';
import type { ReactNode, ReactElement, RefObject } from 'react';
import { cn } from '@/lib/utils';
import { Kbd } from './kbd';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

/**
 * A help dialog listing an app's keyboard shortcuts. Composes Dialog +
 * Kbd. Set `hotkey` (e.g. "?") to open it from anywhere — the global
 * listener ignores keys typed into an input/textarea/select/
 * contenteditable. Kbd shows the shortcut, it doesn't bind it (wire
 * the real handlers in your app).
 *
 * `hotkey` is a bare, unmodified character shortcut — WCAG 2.1.4
 * requires turn-off, remap, or "active only on focus" for that shape
 * of shortcut. Pass `scopeRef` (a ref to your app's main work area) to
 * satisfy the third option: the listener then only fires while focus
 * is inside that container. Omitting it keeps it document-wide.
 */
export interface Shortcut {
  /** Keys in one chord, or sequential chords separated by "then". */
  keys: string[];
  description: string;
}

export interface ShortcutGroup {
  heading?: string;
  shortcuts: Shortcut[];
}

function getShortcutSteps(keys: string[]) {
  return keys.reduce<string[][]>((steps, key) => {
    if (key.toLowerCase() === 'then') {
      if (steps[steps.length - 1]?.length) steps.push([]);
    } else {
      steps[steps.length - 1]?.push(key);
    }
    return steps;
  }, [[]]);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return /^(input|textarea|select)$/i.test(target.tagName);
}

export interface KeyboardShortcutsProps extends Omit<React.ComponentProps<typeof DialogContent>, 'children' | 'title'> {
  groups: ShortcutGroup[];
  title?: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement;
  hotkey?: string;
  scopeRef?: RefObject<HTMLElement | null>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcuts({
  groups,
  title = 'Keyboard shortcuts',
  description,
  trigger,
  hotkey,
  scopeRef,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: KeyboardShortcutsProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const actualOpen = isControlled ? open! : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (scopeRef && !scopeRef.current?.contains(document.activeElement)) return;
      if (event.key.toLowerCase() === hotkey.toLowerCase()) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey, scopeRef, setOpen]);

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('max-w-md', className)} {...props}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody className="max-h-[60vh] gap-6 pt-2">
          {groups.map((group, gi) => (
            <section key={group.heading ?? gi} className="flex flex-col gap-1">
              {group.heading && <h3 className="mb-1 font-heading text-heading-3xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">{group.heading}</h3>}
              <dl className="flex flex-col">
                {group.shortcuts.map((shortcut, si) => (
                  <div key={si} className="flex items-center justify-between gap-4 py-1.5">
                    <dt className="min-w-0 font-body text-body-m text-[var(--color-text-text)]">{shortcut.description}</dt>
                    <dd className="flex shrink-0 items-center gap-1">
                      {getShortcutSteps(shortcut.keys).map((step, stepIndex) => (
                        <Fragment key={stepIndex}>
                          {stepIndex > 0 && <span className="px-0.5 font-body text-body-xs text-[var(--color-text-text-subtler)]">then</span>}
                          <Kbd>{step.join(' ')}</Kbd>
                        </Fragment>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
