import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';
import { DropdownMenuItem } from './dropdown-menu';
import { SplitButton } from './split-button';

export const splitButtonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One main action with a few variations of it: “Deploy” / Deploy to staging / Deploy without cache.', 'The main action is what people want most of the time; the rest are occasional.'],
  whenNotToUse: [
    { text: 'Unrelated actions', instead: 'separate Buttons or a DropdownMenu' },
    { text: 'When none of the options is clearly the default', instead: 'DropdownMenu button' },
    { text: 'Destructive variants hidden in the menu' },
  ],
  anatomy: [
    { part: 'Main segment', description: <>a Button running <C>onMainClick</C>; <C>leftIcon</C> if any.</> },
    { part: 'Caret segment', description: <>opens the menu; named by <C>menuLabel</C>.</> },
    { part: 'Menu', description: <><C>menuContent</C>: DropdownMenuItems — variants of the main action.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <SplitButton
            size="md"
            menuLabel="More deploy options"
            menuContent={
              <>
                <DropdownMenuItem>Deploy to staging</DropdownMenuItem>
                <DropdownMenuItem>Deploy without cache</DropdownMenuItem>
              </>
            }
          >
            Deploy
          </SplitButton>
        ),
        caption: 'The menu holds variants of the same action.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            <Button size="md">Deploy</Button>
            <Button appearance="outlined" tone="secondary" size="md">Deploy to staging</Button>
            <Button appearance="outlined" tone="secondary" size="md">Without cache</Button>
          </div>
        ),
        caption: 'Three buttons for one action crowd the bar; the rare variants belong in the menu.',
      },
    },
  ],
  a11y: [
    <>Give the caret a specific <C>menuLabel</C> when there are several on a screen: “More send options”.</>,
    'Two tab stops: the main action and the caret.',
  ],
};
