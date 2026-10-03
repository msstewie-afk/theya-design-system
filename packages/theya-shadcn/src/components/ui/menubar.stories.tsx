import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './menubar';
import { menubarGuidelines } from './menubar.guidelines';

const meta: Meta<typeof Menubar> = {
  title: 'Navigation/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: { guidelines: menubarGuidelines },
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Border + shadow, like a floating toolbar. Set false for a bare bar that blends into a surrounding app toolbar (no card chrome). Default true.',
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], description: 'Reading direction, affects arrow-key navigation.' },
    loop: { control: 'boolean', description: 'Arrow-key navigation loops from the last top-level menu back to the first.' },
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

function EditorMenubar({ bordered, defaultValue }: { bordered?: boolean; defaultValue?: string }) {
  return (
    <Menubar aria-label="Editor menu" bordered={bordered} defaultValue={defaultValue}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Copy link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem tone="danger">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show sidebar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show status bar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Layout</MenubarLabel>
          <MenubarRadioGroup value="list">
            <MenubarRadioItem value="list">List view</MenubarRadioItem>
            <MenubarRadioItem value="grid">Grid view</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export const Default: Story = {
  render: () => <EditorMenubar />,
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const bar = within(canvasElement).getByRole('menubar', { name: 'Editor menu' });
    const file = within(bar).getByRole('menuitem', { name: 'File' });
    // One tab stop; arrows move between top-level menus.
    file.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(bar).getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    // Enter opens; ArrowRight moves to the next menu while open.
    await userEvent.keyboard('{Enter}');
    await expect(await page.findByRole('menuitem', { name: 'Undo' })).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    await expect(await page.findByRole('menuitemcheckbox', { name: 'Show sidebar' })).toHaveAttribute('aria-checked', 'true');

    // Escape closes and returns focus to the top-level trigger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
    await expect(within(bar).getByRole('menuitem', { name: 'View' })).toHaveFocus();
  },
};

/** `bordered={false}` drops the border + shadow, so the bar blends into a surrounding app toolbar instead of reading as a floating card. */
export const Unbordered: Story = {
  render: () => <EditorMenubar bordered={false} />,
};

/** The View menu open by default — a checkbox item and a radio group, no click needed to see them. */
export const OpenMenu: Story = {
  name: 'Open menu',
  render: () => <EditorMenubar defaultValue="view" />,
};
