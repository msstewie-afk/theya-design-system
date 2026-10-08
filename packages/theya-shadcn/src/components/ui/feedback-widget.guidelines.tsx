import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { FeedbackWidget } from './feedback-widget';

export const feedbackWidgetGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    '“Was this helpful?” at the end of a help article, a docs page or an AI answer.',
    <>A compact version under a chat answer (<C>size="sm"</C>).</>,
  ],
  whenNotToUse: [
    { text: 'Rating a product, order or support case', instead: 'Rating or a survey' },
    { text: 'Collecting bug reports', instead: 'a form or a support channel' },
    { text: 'Mid-task, while people are busy', instead: 'ask after the task is done' },
  ],
  anatomy: [
    { part: 'Question', description: 'about this exact content.' },
    { part: 'Yes / No', description: <>toggle buttons; the vote is sent right away (<C>onVote</C>).</> },
    { part: 'Follow-up', description: <>reason chips + comment after “No” (or “Yes” with <C>askOnPositive</C>); optional, sent with <C>onSubmit</C>.</>, optional: true },
    { part: 'Thank-you', description: 'replaces the widget when done.' },
  ],
  doDont: [
    {
      do: { example: <FeedbackWidget question="Did this article solve your problem?" />, caption: 'One question about this page, answered in one click.' },
      dont: { example: <FeedbackWidget question="How satisfied are you with our hosting overall?" />, caption: 'A product-wide question under one article gives answers nobody can act on.' },
    },
  ],
  a11y: [
    'Yes / No have visible labels and report their state (aria-pressed).',
    'When the follow-up opens, focus moves into it; after finishing, focus returns to the chosen vote.',
    'The thank-you is a polite live region.',
  ],
};
