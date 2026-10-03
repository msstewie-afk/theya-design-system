import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Separator } from './separator';

const ROW = 'font-body text-body-m text-[var(--color-text-text)]';

export const separatorGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A quiet line between groups that spacing alone doesn’t separate: menu groups, list rows, toolbar sections.'],
  whenNotToUse: [
    { text: 'Between every element', instead: 'spacing' },
    { text: 'Inline facts in a line', instead: 'DotSeparator' },
  ],
  anatomy: [
    { part: 'Line', description: <>horizontal or vertical; <C>emphasis</C> subtle (default) or strong.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-3">
            <span className={ROW}>Profile</span>
            <span className={ROW}>Billing</span>
            <Separator />
            <span className={ROW}>Sign out</span>
          </div>
        ),
        caption: 'One line where the group changes.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-3">
            <span className={ROW}>Profile</span>
            <Separator emphasis="strong" />
            <span className={ROW}>Billing</span>
            <Separator emphasis="strong" />
            <span className={ROW}>Sign out</span>
          </div>
        ),
        caption: 'A strong line under every row: everything is separated, so nothing is grouped.',
      },
    },
  ],
  a11y: [<>Decorative by default (hidden from screen readers). Pass <C>{'decorative={false}'}</C> only when the line marks a real boundary that should be announced.</>],
};
