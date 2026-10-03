import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { OptionCard, OptionCardGroup } from './option-card';
import { Radio, RadioGroup } from './radio';

export const optionCardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A one-of choice where each option needs a title, a line of explanation and often a price: plans, verification methods, delivery.', '2–5 options that are the main decision on the screen.'],
  whenNotToUse: [
    { text: 'Short options a label explains', instead: 'RadioGroup' },
    { text: 'Several options at once', instead: 'CheckboxGroup' },
    { text: 'Cards that navigate somewhere', instead: 'Card with a link' },
  ],
  anatomy: [
    { part: 'Group', description: <><C>OptionCardGroup</C> — a radio group laid out as a grid (2 columns from sm).</> },
    { part: 'Icon', optional: true, description: 'helps tell options apart at a glance.' },
    { part: 'Title and description', description: 'the title is the accessible name, the description is read after it.' },
    { part: 'Aside', optional: true, description: 'right-aligned detail, usually the price.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <OptionCardGroup defaultValue="http" aria-label="Verification method" className="w-full">
            <OptionCard value="http" title="HTTP-01" description="Serve a token file from the site." />
            <OptionCard value="dns" title="DNS-01" description="Add a TXT record. Works for wildcards." />
          </OptionCardGroup>
        ),
        caption: 'Each choice needs a sentence — cards give it room.',
      },
      dont: {
        example: (
          <OptionCardGroup defaultValue="yes" aria-label="Send invoice" className="w-full">
            <OptionCard value="yes" title="Yes" />
            <OptionCard value="no" title="No" />
          </OptionCardGroup>
        ),
        caption: 'Cards for a plain yes/no — a radio pair or switch says it in a line.',
      },
    },
  ],
  a11y: [
    'Works like a radio group: one tab stop, arrows move and select.',
    <>Name the group with <C>aria-label</C> or a visible heading via <C>aria-labelledby</C>.</>,
    'Don’t put buttons or links inside a card — the whole card is one radio.',
  ],
};
