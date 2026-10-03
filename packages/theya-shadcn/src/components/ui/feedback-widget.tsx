import { useId, useRef, useState, type FormEvent } from 'react';
import { ThumbsDown, ThumbsUp } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Chip } from './chip';
import { TextArea } from './textarea';

/**
 * "Was this helpful?" at the end of a help article, doc page or an AI
 * answer. One click is the whole job for most people; a "no" (or a "yes",
 * with `askOnPositive`) opens an optional follow-up: reason chips and a
 * comment. Skipping the follow-up still records the vote.
 *
 * - The vote is reported immediately (`onVote`); the follow-up later
 *   (`onSubmit`), so the main signal isn't lost when people leave.
 * - Yes/No are toggle buttons (aria-pressed) with visible labels; the
 *   thank-you is a polite live region and focus moves into the follow-up
 *   when it opens, so keyboard users land where the next step is.
 * - `size="sm"` for the compact inline version under a chat answer.
 */
export type FeedbackVote = 'yes' | 'no';

export interface FeedbackDetails {
  vote: FeedbackVote;
  reasons: string[];
  comment: string;
}

export interface FeedbackWidgetProps {
  question?: string;
  yesLabel?: string;
  noLabel?: string;
  /** Reason chips offered after "No". Empty array = comment only. */
  reasons?: string[];
  /** Reason chips after "Yes" — only when `askOnPositive`. */
  positiveReasons?: string[];
  /** Also ask a follow-up after "Yes". Default false: a yes is just thanked. */
  askOnPositive?: boolean;
  /** Fires as soon as Yes or No is clicked. */
  onVote?: (vote: FeedbackVote) => void;
  /** Fires when the follow-up is sent. */
  onSubmit?: (details: FeedbackDetails) => void;
  thankYou?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const DEFAULT_REASONS = ['Inaccurate', 'Hard to understand', 'Missing information', 'Didn’t solve my problem'];
const DEFAULT_POSITIVE = ['Accurate', 'Easy to follow', 'Solved my problem'];

export function FeedbackWidget({
  question = 'Was this page helpful?',
  yesLabel = 'Yes',
  noLabel = 'No',
  reasons = DEFAULT_REASONS,
  positiveReasons = DEFAULT_POSITIVE,
  askOnPositive = false,
  onVote,
  onSubmit,
  thankYou = 'Thanks for your feedback.',
  size = 'md',
  className,
}: FeedbackWidgetProps) {
  const [vote, setVote] = useState<FeedbackVote | null>(null);
  const [step, setStep] = useState<'ask' | 'details' | 'done'>('ask');
  const [picked, setPicked] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const detailsRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const sm = size === 'sm';

  const choose = (v: FeedbackVote) => {
    setVote(v);
    onVote?.(v);
    const follow = v === 'no' || askOnPositive;
    setStep(follow ? 'details' : 'done');
    setPicked([]);
    if (follow) requestAnimationFrame(() => detailsRef.current?.querySelector<HTMLElement>('button, textarea')?.focus());
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!vote) return;
    onSubmit?.({ vote, reasons: picked, comment: comment.trim() });
    setStep('done');
  };

  const chips = vote === 'yes' ? positiveReasons : reasons;
  const text = sm ? 'text-body-s' : 'text-body-m';

  return (
    <section aria-labelledby={titleId} data-slot="feedback-widget" className={cn('flex flex-col gap-3 font-body', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* A <p>, not a heading: the widget drops into pages with their own outline. */}
        <p id={titleId} className={cn('text-[var(--color-text-text)]', text)}>
          {question}
        </p>
        <div className="flex items-center gap-2">
          {(['yes', 'no'] as const).map((v) => (
            <Button
              key={v}
              appearance={vote === v ? 'tonal' : 'outlined'}
              tone={vote === v ? 'primary' : 'secondary'}
              size={sm ? 'sm' : 'md'}
              aria-pressed={vote === v}
              leftIcon={v === 'yes' ? <ThumbsUp /> : <ThumbsDown />}
              onClick={() => choose(v)}
            >
              {v === 'yes' ? yesLabel : noLabel}
            </Button>
          ))}
        </div>
      </div>

      {step === 'details' && (
        <form ref={detailsRef} onSubmit={send} className="flex max-w-[32rem] flex-col gap-3 animate-in fade-in-0 slide-in-from-top-1 duration-150 motion-reduce:animate-none">
          {chips.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className={cn('mb-2 text-[var(--color-text-text-subtle)]', sm ? 'text-body-xs' : 'text-body-s')}>{vote === 'no' ? 'What went wrong? (optional)' : 'What worked? (optional)'}</legend>
              <div className="flex flex-wrap gap-2">
                {chips.map((r) => (
                  <Chip key={r} size={sm ? 'sm' : 'md'} pressed={picked.includes(r)} onPressedChange={(on) => setPicked((cur) => (on ? [...cur, r] : cur.filter((x) => x !== r)))}>
                    {r}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}
          <TextArea label="Anything else?" optional heightSize={sm ? 'sm' : 'md'} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you were looking for" />
          <div className="flex items-center gap-2">
            <Button type="submit" appearance="filled" tone="primary" size={sm ? 'md' : 'lg'}>
              Send feedback
            </Button>
            <Button appearance="ghost" tone="neutral" size={sm ? 'md' : 'lg'} onClick={() => setStep('done')}>
              Skip
            </Button>
          </div>
        </form>
      )}

      <p aria-live="polite" className={cn('text-[var(--color-text-text-subtle)]', sm ? 'text-body-xs' : 'text-body-s', step !== 'done' && 'sr-only')}>
        {step === 'done' ? thankYou : ''}
      </p>
    </section>
  );
}
