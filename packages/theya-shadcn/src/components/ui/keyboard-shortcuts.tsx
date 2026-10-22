'use client';

import { Fragment, useState, useCallback, useEffect } from 'react';
import type { ReactNode, ReactElement, RefObject } from 'react';
import { cn } from '../../lib/utils';
import { Kbd } from './kbd';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { useTheyaI18n } from '../../lib/i18n';
import { isCharacterHotkey, isTypingTarget, matchesHotkey } from '../../lib/hotkey';

/**
 * A help dialog listing an app's keyboard shortcuts. Composes Dialog +
 * Kbd. Set `hotkey` to open it from anywhere: "?" or a chord such as
 * "Mod+/" (⌘ on Apple, Ctrl elsewhere) — see lib/hotkey. Kbd shows the
 * shortcut, it doesn't bind it (wire the real handlers in your app).
 *
 * A bare character hotkey ("?") is a WCAG 2.1.4 character-key
 * shortcut: it is ignored while typing in an input/textarea/select/
 * contenteditable, and the app must give users a way to turn it off or
 * remap it (pass `undefined` or their chosen chord from a setting), or
 * pass `scopeRef` (your main work area) so it only fires while focus is
 * inside it. A chord with Ctrl / ⌘ / Alt also fires while typing.
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

export interface KeyboardShortcutsProps extends Omit<React.ComponentProps<typeof DialogContent>, 'children' | 'title'> {
  groups: ShortcutGroup[];
  title?: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement;
  /** "?" or a chord like "Mod+/" (lib/hotkey). A bare character needs a user off/remap setting or `scopeRef` (WCAG 2.1.4). */
  hotkey?: string;
  scopeRef?: RefObject<HTMLElement | null>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcuts({
  groups,
  title,
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
  const { t } = useTheyaI18n();
  if (title === undefined) title = t.keyboardShortcuts.title;
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
      if (isCharacterHotkey(hotkey) && isTypingTarget(event.target)) return;
      if (scopeRef && !scopeRef.current?.contains(document.activeElement)) return;
      if (matchesHotkey(event, hotkey)) {
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
        <DialogBody className="max-h-[60svh] gap-6 pt-2">
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
                          {stepIndex > 0 && <span className="px-0.5 font-body text-body-xs text-[var(--color-text-text-subtler)]">{t.keyboardShortcuts.then}</span>}
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
