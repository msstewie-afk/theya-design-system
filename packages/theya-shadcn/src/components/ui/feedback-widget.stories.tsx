import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackWidget, type FeedbackDetails, type FeedbackVote } from './feedback-widget';
import { Prose } from './prose';

/**
 * FeedbackWidget — "Was this helpful?" with Yes/No. A "No" opens an
 * optional follow-up (reason chips + comment); skipping still records the
 * vote. `onVote` fires at once, `onSubmit` when the follow-up is sent.
 */
const meta = {
  title: 'Status & Feedback/FeedbackWidget',
  component: FeedbackWidget,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
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
};
