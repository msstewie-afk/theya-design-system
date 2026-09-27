import type { Meta, StoryObj } from '@storybook/react';
import { Trash, Send, Archive } from 'iconoir-react';
import { SplitButton } from './split-button';
import { DropdownMenuItem } from './dropdown-menu';

const meta: Meta<typeof SplitButton> = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Not in the reference repo — composed from scratch with our own Button + DropdownMenu.',
      },
    },
  },
  argTypes: {
    children: { control: 'text', description: 'Label + icon(s) for the primary (left) action.' },
    onMainClick: { control: false, description: 'Called when the primary action is clicked.' },
    menuContent: { control: false, description: 'Content rendered inside the DropdownMenu opened by the caret — typically DropdownMenuItem elements.' },
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Playground: Story = {
  render: () => (
    <SplitButton
      onMainClick={() => alert('Send clicked')}
      menuContent={
        <>
          <DropdownMenuItem>
            <Send /> Send now
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Archive /> Save as draft
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <Trash /> Discard
          </DropdownMenuItem>
        </>
      }
    >
      Send
    </SplitButton>
  ),
};
