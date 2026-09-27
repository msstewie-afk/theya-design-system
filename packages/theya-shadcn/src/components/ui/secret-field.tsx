import { useState } from 'react';
import { Eye, EyeClosed } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { CopyButton } from './copy-button';
import { toast } from './sonner';

export interface SecretFieldProps {
  value: string;
  defaultRevealed?: boolean;
  revealable?: boolean;
  label?: string;
  /** Title of the copy-success toast. Default "Copied". */
  copyToastTitle?: string;
  className?: string;
}

function maskValue(value: string) {
  const tail = value.length > 4 ? value.slice(-4) : '';
  return '•'.repeat(10) + tail;
}

function SecretField({
  value,
  defaultRevealed = false,
  revealable = true,
  label = 'Value',
  copyToastTitle = 'Copied',
  className,
}: SecretFieldProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
        'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
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
            <span className="sr-only">{`${label} hidden`}</span>
          </>
        )}
      </code>
      {revealable && (
        <Button
          type="ghost"
          size="sm"
          iconOnly
          aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Reveal ${label.toLowerCase()}`}
          aria-pressed={revealed}
          onClick={() => setRevealed((r) => !r)}
          leftIcon={revealed ? <Eye /> : <EyeClosed />}
        />
      )}
      <CopyButton
        value={value}
        label={null}
        aria-label="Copy value"
        type="ghost"
        onCopied={() => toast.success(copyToastTitle, { description: 'Paste it somewhere safe now.' })}
        onCopyError={() => {
          // Clipboard blocked, denied, or unavailable. Reveal the value (when
          // allowed) so it can be copied by hand — masked, it isn't in the DOM.
          if (revealable) setRevealed(true);
          // Explicit duration: toast.error persists until dismissed by
          // default, which is right for a failed operation but not for a
          // blocked clipboard — the fallback is already on screen.
          toast.error("Couldn't copy", {
            duration: 6000,
            description: revealable ? 'Select the value and copy it manually.' : "Copying isn't available here — try a secure (https) connection.",
          });
        }}
      />
    </div>
  );
}

export { SecretField };
