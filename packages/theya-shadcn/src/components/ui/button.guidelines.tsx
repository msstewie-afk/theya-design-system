import { Trash } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';

export const buttonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'To do something: save, submit, create, delete, start a flow, open a dialog.',
    <>One <C>filled</C> primary action per area; secondary actions <C>outlined</C> or <C>ghost</C> next to it.</>,
    <>Inside cards and toolbars at <C>md</C>; page-level actions at the default <C>xl</C>.</>,
  ],
  whenNotToUse: [
    { text: 'Going to another page or section', instead: 'a link, or Button asChild around an <a>' },
    { text: 'Switching a setting on or off', instead: 'Switch' },
    { text: 'Choosing one of a few options', instead: 'ToggleGroup or RadioGroup' },
    { text: 'Several related actions that don’t fit side by side', instead: 'SplitButton or DropdownMenu' },
  ],
  anatomy: [
    { part: 'Container', description: <>appearance (<C>filled</C>, <C>tonal</C>, <C>outlined</C>, <C>ghost</C>) × tone × size.</> },
    { part: 'Label', description: 'a verb, sentence case: “Save changes”, “Delete domain”.' },
    { part: 'Left icon', optional: true, description: <>via <C>leftIcon</C>; replaced by the spinner while <C>loading</C>.</> },
    { part: 'Right icon', optional: true, description: <>via <C>rightIcon</C> — for direction (→) or a menu (⌄).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex gap-2">
            <Button appearance="outlined" tone="secondary" size="md">Cancel</Button>
            <Button appearance="filled" tone="primary" size="md">Save changes</Button>
          </div>
        ),
        caption: 'One primary action; the alternative is quieter.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            <Button appearance="filled" tone="primary" size="md">Cancel</Button>
            <Button appearance="filled" tone="primary" size="md">Save changes</Button>
          </div>
        ),
        caption: 'Two filled buttons compete — people can’t tell which one moves them forward.',
      },
    },
    {
      do: {
        example: <Button appearance="filled" tone="danger" size="md" leftIcon={<Trash />}>Delete domain</Button>,
        caption: 'The label says what happens.',
      },
      dont: {
        example: <Button appearance="filled" tone="danger" size="md">OK</Button>,
        caption: '“OK”, “Yes”, “Submit” make people re-read the question to know what they’re agreeing to.',
      },
    },
    {
      do: {
        example: (
          <div className="flex flex-col items-start gap-1.5">
            <Button appearance="filled" tone="primary" size="md" softDisabled aria-describedby="gl-btn-why">Publish</Button>
            <span id="gl-btn-why" className="font-body text-body-s text-[var(--color-text-text-subtle)]">Add a title to publish.</span>
          </div>
        ),
        caption: <><C>softDisabled</C> with the reason next to it — still focusable, and it says what’s missing.</>,
      },
      dont: {
        example: <Button appearance="filled" tone="primary" size="md" disabled>Publish</Button>,
        caption: 'A disabled button with no reason leaves people guessing, and keyboard users can’t reach it at all.',
      },
    },
  ],
  a11y: [
    <><C>iconOnly</C> buttons need <C>aria-label</C> — a dev warning fires without it.</>,
    <><C>loading</C> keeps the width and the label (the spinner replaces the icon), so nothing jumps and the name stays the same.</>,
    <>Prefer <C>softDisabled</C> + <C>aria-describedby</C> over <C>disabled</C> when the reason matters.</>,
    'The focus ring (4px) takes the button’s tone; never remove it.',
    'Don’t nest a button inside a link or another button.',
  ],
};
