import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { FeedbackWidget, type FeedbackDetails, type FeedbackVote } from './feedback-widget';
import { Prose } from './prose';
import { feedbackWidgetGuidelines } from './feedback-widget.guidelines';

/**
 * FeedbackWidget — "Was this helpful?" with Yes/No. A "No" opens an
 * optional follow-up (reason chips + comment); skipping still records the
 * vote. `onVote` fires at once, `onSubmit` when the follow-up is sent.
 */
const meta = {
  title: 'Status & Feedback/FeedbackWidget',
  component: FeedbackWidget,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: feedbackWidgetGuidelines },
  argTypes: {
    question: { control: 'text', table: { category: 'Content' } },
    askOnPositive: { control: 'boolean', description: 'Also ask a follow-up after Yes.', table: { category: 'Behavior' } },
    size: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Appearance' } },
    reasons: { control: false },
    positiveReasons: { control: false },
    onVote: { control: false },
    onSubmit: { control: false },
  },
  args: { size: 'md' },
} satisfies Meta<typeof FeedbackWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click No to see the follow-up; the log underneath shows what the app receives. */
export const Default: Story = {
  render: function Render(args) {
    const [log, setLog] = useState<string[]>([]);
    return (
      <div className="flex flex-col gap-6">
        <FeedbackWidget
          {...args}
          onVote={(v: FeedbackVote) => setLog((l) => [...l, `onVote: ${v}`])}
          onSubmit={(d: FeedbackDetails) => setLog((l) => [...l, `onSubmit: ${JSON.stringify(d)}`])}
        />
        <pre className="min-h-12 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] p-3 font-mono text-body-xs text-[var(--color-text-text-subtle)]">{log.join('\n') || 'No events yet'}</pre>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = () => canvasElement.querySelector('pre')!.textContent ?? '';
    const yes = canvas.getByRole('button', { name: 'Yes' });
    const no = canvas.getByRole('button', { name: 'No' });

    // The vote is reported at once; No opens the follow-up with focus on its first control.
    await userEvent.click(no);
    await expect(no).toHaveAttribute('aria-pressed', 'true');
    await expect(yes).toHaveAttribute('aria-pressed', 'false');
    await expect(log()).toBe('onVote: no');
    const group = canvas.getByRole('group', { name: /What went wrong/ });
    const firstChip = within(group).getByRole('button', { name: 'Inaccurate' });
    await waitFor(() => expect(firstChip).toHaveFocus());

    // Reasons toggle; the comment is trimmed; Send reports everything once.
    await userEvent.click(firstChip);
    await expect(firstChip).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(canvas.getByLabelText(/Anything else\?/), '  Missing a CLI example  ');
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }));
    await expect(log()).toContain(`onSubmit: {"vote":"no","reasons":["Inaccurate"],"comment":"Missing a CLI example"}`);
    await expect(canvas.getByText('Thanks for your feedback.')).toBeVisible();
    // The form is gone; focus lands on the chosen answer instead of <body>.
    await expect(canvas.queryByRole('button', { name: 'Send feedback' })).not.toBeInTheDocument();
    await waitFor(() => expect(no).toHaveFocus());

    // Changing the answer to Yes reports it; without askOnPositive there's no follow-up.
    await userEvent.click(yes);
    await expect(log()).toMatch(/onVote: yes$/);
    await expect(canvas.queryByRole('group', { name: /What worked/ })).not.toBeInTheDocument();
  },
};

/** At the end of a help article, under a divider. */
export const EndOfArticle: Story = {
  render: (args) => (
    <div className="flex max-w-[70ch] flex-col gap-6">
      <Prose>
        <h2>Moving a site to a new region</h2>
        <p>A region move copies your site, its databases and certificates, then switches traffic over once everything checks out.</p>
      </Prose>
      <div className="border-t border-solid border-[var(--color-border-border-subtler)] pt-5">
        <FeedbackWidget {...args} />
      </div>
    </div>
  ),
};

/** Compact, under an assistant answer; asks what worked after a Yes too. */
export const UnderAnAnswer: Story = {
  args: { size: 'sm', question: 'Did this answer help?', askOnPositive: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const yes = canvas.getByRole('button', { name: 'Yes' });
    await userEvent.click(yes);
    // askOnPositive: Yes asks what worked, too.
    await expect(canvas.getByRole('group', { name: /What worked/ })).toBeInTheDocument();
    // Skip closes the follow-up without a submit and keeps focus on the answer.
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(canvas.getByText('Thanks for your feedback.')).toBeVisible();
    await waitFor(() => expect(yes).toHaveFocus());
  },
};
