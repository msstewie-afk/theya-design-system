import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof Menubar> = {
  title: 'Navigation/Menubar',
  component: Menubar,
  tags: ['autodocs'],
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
          <MenubarItem variant="danger">Delete</MenubarItem>
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
