import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { ScrollArea } from './scroll-area';

const ITEMS = Array.from({ length: 14 }, (_, i) => `Backup ${String(14 - i).padStart(2, '0')} Sep, 02:00`);
const ROW = 'px-3 py-2 font-body text-body-m text-[var(--color-text-text)]';
const BOX = 'w-64 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]';

export const scrollAreaGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A region that must scroll inside a fixed space: a list in a popover or panel, a log, a long menu.', 'The overlay thumb takes no width, so content doesn’t shift when it appears.'],
  whenNotToUse: [
    { text: 'The page itself', instead: 'normal document scrolling' },
    { text: 'Nested scroll inside scroll on mobile', instead: 'let the content grow' },
  ],
  anatomy: [
    { part: 'Root', description: <>needs a height: <C>h-72</C> or a cap like <C>max-h-60</C>.</> },
    { part: 'Viewport', description: <>a tab stop when content overflows (<C>focusable</C>); name it with <C>aria-label</C>.</> },
    { part: 'Scrollbar', description: 'thin translucent thumb, no track; shows on hover/scroll.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <ScrollArea className={`${BOX} h-48`} aria-label="Backups">
            {ITEMS.map((t) => <div key={t} className={ROW}>{t}</div>)}
          </ScrollArea>
        ),
        caption: 'A capped list that scrolls in place; the rest of the panel stays put.',
      },
      dont: {
        example: (
          <ScrollArea className={`${BOX} h-12`} aria-label="Backups, tiny">
            {ITEMS.map((t) => <div key={t} className={ROW}>{t}</div>)}
          </ScrollArea>
        ),
        caption: 'A one-row window: people scroll more than they read — show more or paginate.',
      },
    },
  ],
  a11y: [
    'The viewport is focusable so keyboard users can scroll it with arrows; give it a name.',
    'Native wheel, touch and keyboard scrolling are kept.',
  ],
};
