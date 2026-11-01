import { MediaImage, WarningCircle } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Metric } from './metric';
import { Stat } from './stat';

export const metricGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Quick-glance counts repeated as rows inside a card: photos selected, galleries shared, licenses pending.'],
  whenNotToUse: [
    { text: 'A headline KPI that stands alone', instead: 'Stat' },
    { text: 'Usage against a limit that needs a bar', instead: 'Meter' },
    { text: 'Properties of one object', instead: 'DescriptionList' },
  ],
  anatomy: [
    { part: 'Icon', description: 'muted and decorative.', optional: true },
    { part: 'Value', description: 'the number, read first.' },
    { part: 'Label', description: <>follows the value in the same line (“121<C>/150 selects</C>”).</> },
    { part: 'Actions', description: 'a link or small button on the right.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Metric icon={<MediaImage />} value={121} label="/150 selects" />
            <Metric icon={<WarningCircle />} value={2} label=" licenses awaiting signature" />
          </div>
        ),
        caption: 'Rows of counts in a card, scanned top to bottom.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Stat label="Selects" value="121/150" />
            <Stat label="Licenses awaiting signature" value={2} />
          </div>
        ),
        caption: 'KPI tiles stacked as a list: heavy, and every row competes for attention.',
      },
    },
  ],
  a11y: [
    'Each row is a named group (label, plus description), so it reads as one statement.',
    'The icon is hidden from screen readers — the label must carry any severity.',
  ],
};
