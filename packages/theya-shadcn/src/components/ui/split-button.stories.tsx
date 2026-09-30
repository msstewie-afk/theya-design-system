import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
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
    menuLabel: { control: 'text', description: 'Accessible name of the caret that opens the menu. Default "More actions".' },
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

const body = () => within(document.body);

const menuItems = (onSelect?: (label: string) => void) => (
  <>
    <DropdownMenuItem onSelect={() => onSelect?.('Send now')}>
      <Send /> Send now
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => onSelect?.('Save as draft')}>
      <Archive /> Save as draft
    </DropdownMenuItem>
    <DropdownMenuItem tone="danger" onSelect={() => onSelect?.('Discard')}>
      <Trash /> Discard
    </DropdownMenuItem>
  </>
);

const onMenuSelect = fn();

export const Playground: Story = {
  // An action spy instead of alert(): a native dialog blocks the page.
  args: { onMainClick: fn(), menuLabel: 'More send options' },
  render: (args) => (
    <SplitButton {...args} menuContent={menuItems(onMenuSelect)}>
      Send
    </SplitButton>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onMainClick).toHaveBeenCalledTimes(1);

    // Keyboard: the caret opens the menu, arrows move, Enter picks.
    const caret = canvas.getByRole('button', { name: 'More send options' });
    await expect(caret).toHaveAttribute('aria-haspopup', 'menu');
    caret.focus();
    await userEvent.keyboard('{Enter}');
    const menu = await body().findByRole('menu');
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Send now' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(onMenuSelect).toHaveBeenLastCalledWith('Save as draft');
    await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
    await waitFor(() => expect(caret).toHaveFocus());
    // The main action didn't fire again.
    await expect(args.onMainClick).toHaveBeenCalledTimes(1);

    // Esc closes without picking.
    await userEvent.click(caret);
    await body().findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
    await expect(caret).toHaveFocus();
  },
};

/** Menu text follows the button size. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <SplitButton size="sm" menuLabel="More small actions" menuContent={menuItems()}>
        Small
      </SplitButton>
      <SplitButton size="2xl" menuLabel="More large actions" menuContent={menuItems()}>
        Large
      </SplitButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [label, textClass] of [
      ['More small actions', 'text-body-s'],
      ['More large actions', 'text-body-l'],
    ] as const) {
      const caret = canvas.getByRole('button', { name: label });
      await userEvent.click(caret);
      const item = within(await body().findByRole('menu')).getByRole('menuitem', { name: 'Send now' });
      await expect(item).toHaveClass(textClass);
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
    }
  },
};

export const Disabled: Story = {
  render: () => (
    <SplitButton disabled menuContent={menuItems()}>
      Send
    </SplitButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'More actions' })).toBeDisabled();
  },
};
