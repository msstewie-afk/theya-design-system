import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Badge } from './badge';

export const badgeGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A short status or label attached to something: “Active”, “Beta”, “Expired”.', 'A count next to a name: unread, pending, errors.'],
  whenNotToUse: [
    { text: 'Something people click, select or remove', instead: 'Chip or Button' },
    { text: 'A sentence or an explanation', instead: 'Alert or plain text' },
    { text: 'A dot-only live status in a dense list', instead: 'StatusDot' },
  ],
  anatomy: [
    { part: 'Container', description: <><C>tone</C> × <C>appearance</C> (<C>tonal</C> by default, <C>filled</C> for the strongest) × <C>size</C>.</> },
    { part: 'Label', description: 'one or two words.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex gap-2">
            <Badge tone="success">Active</Badge>
            <Badge tone="warning">Expiring</Badge>
            <Badge tone="danger">Failed</Badge>
          </div>
        ),
        caption: 'Tone follows meaning, and the word says it too.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            <Badge tone="info">WordPress</Badge>
            <Badge tone="danger">Joomla</Badge>
            <Badge tone="success">Node.js</Badge>
          </div>
        ),
        caption: 'Status colours as decoration teach people that red doesn’t mean anything.',
      },
    },
    {
      do: { example: <Badge tone="neutral">Beta</Badge>, caption: 'One word.' },
      dont: { example: <Badge tone="neutral">This feature is in beta and may change</Badge>, caption: 'A sentence in a pill is hard to read and wraps badly.' },
    },
  ],
  a11y: [
    'Never colour alone: the label carries the meaning.',
    <>For a bare count, add context for screen readers: <C>3</C> + sr-only “unread messages”.</>,
    'A badge isn’t focusable; if it does something, it’s a Chip or a Button.',
  ],
};
