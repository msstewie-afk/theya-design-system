import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Trash, Send, Archive } from 'iconoir-react';
import { SplitButton } from './split-button';
import { DropdownMenuItem } from './dropdown-menu';
import { splitButtonGuidelines } from './split-button.guidelines';

const meta: Meta<typeof SplitButton> = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  parameters: {
    guidelines: splitButtonGuidelines,
    docs: {
      description: {
        component: 'Composed from our own Button + DropdownMenu.',
      },
    },
  },
  argTypes: {
    children: { control: 'text', description: 'Label + icon(s) for the primary (left) action.' },
    onMainClick: { control: false, description: 'Called when the primary action is clicked.' },
    menuContent: { control: false, description: 'Content rendered inside the DropdownMenu opened by the caret — typically DropdownMenuItem elements.' },
    menuLabel: { control: 'text', description: 'Accessible name of the caret that opens the menu. Default "More actions".' },
    appearance: { control: 'inline-radio', options: ['filled', 'tonal', 'outlined', 'ghost'], description: 'Shared by both halves.' },
    tone: { control: 'select', options: ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'danger'], description: 'Shared by both halves.' },
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

const APPEARANCES = ['filled', 'tonal', 'outlined', 'ghost'] as const;
const TONES = ['primary', 'secondary', 'neutral', 'danger'] as const;

/** Every appearance × a few tones — mainly to review the divider between the halves. */
export const Appearances: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {APPEARANCES.map((appearance) => (
        <div key={appearance} className="flex flex-wrap items-center gap-4">
          <span className="w-20 text-body-s">{appearance}</span>
          {TONES.map((tone) => (
            <SplitButton
              key={tone}
              appearance={appearance}
              tone={tone}
              menuLabel={`More ${appearance} ${tone} actions`}
              menuContent={menuItems()}
            >
              {tone}
            </SplitButton>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>('[data-slot="split-button"]');
    await expect(groups).toHaveLength(APPEARANCES.length * TONES.length);
    groups.forEach((group, i) => {
      const appearance = APPEARANCES[Math.floor(i / TONES.length)];
      const divider = group.querySelector('[data-slot="split-button-divider"]');
      const gap = getComputedStyle(group).columnGap;
      if (appearance === 'ghost') {
        // No fill to show a gap against — a token-colored hairline instead.
        expect(divider).not.toBeNull();
        expect(gap).toBe('normal');
      } else {
        // A real gap shows the background behind; no painted divider.
        expect(divider).toBeNull();
        expect(gap).toBe('2px');
      }
    });
  },
};
