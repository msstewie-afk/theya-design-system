'use client';

import { useState } from 'react';
import { Eye, EyeClosed } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { CopyButton } from './copy-button';
import { toast } from './sonner';
import { useTheyaI18n } from '../../lib/i18n';

export interface SecretFieldProps {
  value: string;
  defaultRevealed?: boolean;
  revealable?: boolean;
  label?: string;
  /** Title of the copy-success toast. Default "Copied". */
  copyToastTitle?: string;
  className?: string;
}

function maskTail(value: string) {
  return value.length > 4 ? value.slice(-4) : '';
}

function maskValue(value: string) {
  return '•'.repeat(10) + maskTail(value);
}

function SecretField({
  value,
  defaultRevealed = false,
  revealable = true,
  label,
  copyToastTitle,
  className,
}: SecretFieldProps) {
  const { t } = useTheyaI18n();
  if (label === undefined) label = t.secretField.label;
  if (copyToastTitle === undefined) copyToastTitle = t.secretField.copied;
  const [revealed, setRevealed] = useState(defaultRevealed);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
        'border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'h-[var(--size-size-control-size-control-2xl)] px-[var(--size-margin-margin-s)]',
        className,
      )}
    >
      <code className="min-w-0 flex-1 break-all font-mono text-body-s text-[var(--color-text-text)]">
        {revealed ? (
          value
        ) : (
          <>
            <span aria-hidden="true">{maskValue(value)}</span>
            {/* The visible tail is how sighted users tell keys apart — say it too. */}
            <span className="sr-only">
              {t.secretField.hidden(String(label), maskTail(value) || undefined)}
            </span>
          </>
        )}
      </code>
      {revealable && (
        <Button
          appearance="ghost"
          size="sm"
          iconOnly
          // A toggle keeps one stable name and reports state via aria-pressed.
          // Swapping the name as well announced "Hide API key, pressed" —
          // two conflicting signals. Label isn't lowercased: it breaks
          // acronyms ("API key" -> "api key").
          aria-label={t.secretField.show(String(label))}
          aria-pressed={revealed}
          onClick={() => setRevealed((r) => !r)}
          leftIcon={revealed ? <Eye /> : <EyeClosed />}
        />
      )}
      <CopyButton
        value={value}
        label={null}
        // Named after the label so several fields on one page stay distinct.
        aria-label={t.secretField.copy(String(label))}
        appearance="ghost"
        onCopied={() => toast.success(copyToastTitle, { description: t.secretField.copiedHint })}
        onCopyError={() => {
          // Clipboard blocked, denied, or unavailable. Reveal the value (when
          // allowed) so it can be copied by hand — masked, it isn't in the DOM.
          if (revealable) setRevealed(true);
          // Explicit duration: toast.error persists until dismissed by
          // default, which is right for a failed operation but not for a
          // blocked clipboard — the fallback is already on screen.
          toast.error(t.secretField.copyFailed, {
            duration: 6000,
            description: revealable ? t.secretField.copyManually : t.secretField.insecure,
          });
        }}
      />
    </div>
  );
}

export { SecretField };
