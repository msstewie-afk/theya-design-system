import { WarningCircle, WarningTriangle } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Alert, AlertDescription, AlertTitle } from './alert';

export const alertGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A message about this page or section that stays until it’s resolved.',
    'A warning before an action, or the summary of errors after submitting a form.',
  ],
  whenNotToUse: [
    { text: 'A confirmation that something just happened', instead: 'Toast' },
    { text: 'A problem with one field', instead: 'the field’s own error' },
    { text: 'Site-wide news or maintenance', instead: 'AnnouncementBar' },
    { text: 'A decision that blocks the page', instead: 'AlertDialog' },
  ],
  anatomy: [
    { part: 'Container', description: <><C>tone</C>, optional <C>indicator="stripe"</C>.</> },
    { part: 'Icon', description: 'the first child; matches the tone.' },
    { part: 'Title', description: 'what happened.' },
    { part: 'Description', optional: true, description: 'what to do about it.' },
    { part: 'Actions', optional: true, description: <><C>AlertActions</C>, or buttons under the text.</> },
    { part: 'Dismiss', optional: true, description: <><C>dismissible</C> — only for messages that can safely go away.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Alert tone="danger" className="w-80">
            <WarningCircle />
            <div className="flex flex-col gap-1">
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>Your card was declined. Update it to keep the site online after 12 November.</AlertDescription>
            </div>
          </Alert>
        ),
        caption: 'What happened, then what to do.',
      },
      dont: {
        example: (
          <Alert tone="danger" className="w-80">
            <WarningCircle />
            <AlertTitle>Error</AlertTitle>
          </Alert>
        ),
        caption: '“Error” alone gives nothing to act on.',
      },
    },
    {
      do: {
        example: (
          <Alert tone="warning" className="w-80">
            <WarningTriangle />
            <AlertTitle>Disk is 92% full</AlertTitle>
          </Alert>
        ),
        caption: 'Tone matches how serious it is.',
      },
      dont: {
        example: (
          <Alert tone="danger" className="w-80">
            <WarningCircle />
            <AlertTitle>New: dark theme is here</AlertTitle>
          </Alert>
        ),
        caption: 'Danger for news wears out the colour for real problems.',
      },
    },
  ],
  a11y: [
    <>Appearing after an action? Set <C>live</C> (<C>polite</C>, or <C>assertive</C> for errors) so it’s announced. Static alerts don’t need it.</>,
    'The tone is also in words (the title), not only in colour and icon.',
    'For a form error summary, move focus to the alert after submit.',
  ],
};
