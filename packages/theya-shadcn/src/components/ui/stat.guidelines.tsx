import { Globe } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Stat } from './stat';

export const statGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Headline numbers on a dashboard or overview: active sites, uptime, revenue — 2 to 4 in a row.', 'A number with its trend against a previous period.'],
  whenNotToUse: [
    { text: 'Counts repeated as rows in a card', instead: 'Metric' },
    { text: 'A trend people need to read', instead: 'Sparkline or LineChart' },
    { text: 'A fill level', instead: 'Meter' },
  ],
  anatomy: [
    { part: 'Label', description: 'what is counted.' },
    { part: 'Value', description: 'big, tabular numbers.' },
    { part: 'Status', description: <>dot or <C>toneIcon</C> with a word for screen readers (<C>tone</C>, <C>toneLabel</C>).</>, optional: true },
    { part: 'Icon', description: 'top-right, decorative.', optional: true },
    { part: 'Delta', description: <>change with direction (<C>delta</C>).</>, optional: true },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-56"><Stat label="Active sites" value={128} icon={<Globe />} delta={{ value: '+12% vs last month', direction: 'up' }} /></div>,
        caption: 'A number, and how it changed against what.',
      },
      dont: { example: <div className="w-56"><Stat label="Sites" value="128 active, 4 suspended, 2 with errors" /></div>, caption: 'A sentence in the value slot: nothing to read at a glance.' },
    },
    {
      do: { example: <div className="w-56"><Stat label="Uptime, 30 days" value="99.98%" tone="success" /></div>, caption: 'Tone when the value itself is good or bad.' },
      dont: { example: <div className="w-56"><Stat label="Team members" value={14} tone="danger" /></div>, caption: 'Danger on a neutral count makes people look for a problem.' },
    },
  ],
  a11y: [
    'A named group; the tone is announced as a word (“healthy”, “critical”), not color.',
    'Delta direction is in the text too (“+12%”); the arrow is decorative.',
    <>Inside a Card use <C>variant="plain"</C> — one border, not two.</>,
  ],
};
