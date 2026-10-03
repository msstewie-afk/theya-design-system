import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { HelpIcon } from '@/components/ui/help-icon';

export interface Spec {
  label: string;
  value: ReactNode;
  /** Shown after the value, always — "512 MB", never a bare "512". */
  unit?: string;
  /** Explains a term people may not know. */
  hint?: ReactNode;
}

export interface SpecGroup {
  title: string;
  specs: Spec[];
}

export interface SpecSheetProps {
  groups: SpecGroup[];
  /** Specs shown before "Show all". Default 8; 0 shows everything. */
  initialCount?: number;
  className?: string;
}

/**
 * Specifications in named groups so they can be scanned, every numeric
 * value with its unit, unfamiliar terms explained in place, and long sheets
 * folded after the first few rows behind "Show all N specifications".
 */
export function SpecSheet({ groups, initialCount = 8, className }: SpecSheetProps) {
  const [all, setAll] = useState(initialCount === 0);
  const contentId = useId();
  const total = groups.reduce((n, g) => n + g.specs.length, 0);
  let budget = all ? Infinity : initialCount;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div id={contentId} className="flex flex-col gap-6">
        {groups.map((g) => {
          const shown = g.specs.slice(0, Math.max(budget, 0));
          budget -= shown.length;
          if (!shown.length) return null;
          return (
            <section key={g.title} aria-label={g.title} className="flex flex-col gap-1">
              <h3 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{g.title}</h3>
              <DescriptionList>
                {shown.map((s) => (
                  <DescriptionItem key={s.label}>
                    <DescriptionTerm>
                      <span className="inline-flex items-center gap-1.5">
                        {s.label}
                        {s.hint && <HelpIcon label={`About ${s.label}`}>{s.hint}</HelpIcon>}
                      </span>
                    </DescriptionTerm>
                    <DescriptionDetails className="tabular-nums">
                      {s.value}
                      {s.unit && <span className="text-[var(--color-text-text-subtle)]"> {s.unit}</span>}
                    </DescriptionDetails>
                  </DescriptionItem>
                ))}
              </DescriptionList>
            </section>
          );
        })}
      </div>
      {initialCount > 0 && total > initialCount && (
        <button
          type="button"
          onClick={() => setAll((a) => !a)}
          aria-expanded={all}
          aria-controls={contentId}
          className="self-start rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
        >
          {all ? 'Show fewer' : `Show all ${total} specifications`}
        </button>
      )}
    </div>
  );
}
