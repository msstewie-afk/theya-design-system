import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { RichTextEditor, RICH_TEXT_TOOLS_BASIC } from './rich-text-editor';
import { CodeBlock } from './code-block';

/**
 * RichTextEditor — formatted text input on Tiptap. Value is HTML; content uses
 * the same `.prose` styles as <Prose>. Toolbar is one tab stop (arrows inside);
 * shortcuts: ⌘B ⌘I ⌘U ⌘K ⌘Z, Markdown-style "## ", "- ", "1. ", "> ".
 */

const RELEASE_NOTE = `<h2>Scheduled maintenance</h2>
<p>On <strong>October 12, 02:00–04:00 UTC</strong> we're moving databases in the <em>eu-central</em> region to new storage.</p>
<ul>
  <li>Sites stay online; database writes may pause for up to 30 seconds.</li>
  <li>Backups made during the window are kept as usual.</li>
</ul>
<p>Questions? See the <a href="https://example.com/status">status page</a>.</p>`;

/** Puts the caret at the end of an editor through the DOM (user-event can't do {End} in contenteditable). */
async function caretToEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
  await new Promise((r) => setTimeout(r, 50));
}

const meta = {
  title: 'Text Input/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: false, description: 'HTML (controlled).' },
    defaultValue: { control: false, description: 'Initial HTML.' },
    onValueChange: { control: false, description: 'Fires with the new HTML ("" when empty).' },
    onEditorReady: { control: false, description: 'Gives access to the Tiptap editor.' },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text', description: 'true for styling only, or a message.' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    tools: { control: false, description: 'Toolbar controls in order; [] hides the toolbar.' },
    maxLength: { control: 'number', description: 'Character limit with a counter.' },
    minHeight: { control: 'number' },
    maxHeight: { control: 'number' },
    name: { control: 'text', description: 'Hidden input with the HTML for form posts.' },
    className: { control: false },
  },
  args: {
    label: 'Announcement',
    placeholder: 'Write the announcement…',
    defaultValue: RELEASE_NOTE,
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full toolbar with content. */
export const Default: Story = {};

/** Empty, with placeholder and description. */
export const Empty: Story = {
  args: { defaultValue: '', label: 'Description', description: 'Shown on the public product page.', placeholder: 'Describe the product…' },
};

/** Basic toolbar for comments and replies. */
export const Basic: Story = {
  args: { tools: RICH_TEXT_TOOLS_BASIC, label: 'Reply', defaultValue: '', placeholder: 'Write a reply…', minHeight: 96 },
};

/** Character limit with a counter; typing past it is blocked. */
export const WithLimit: Story = {
  name: 'With limit',
  args: { maxLength: 280, label: 'Status update', defaultValue: '<p>Deploys are back to normal after the 14:10 incident.</p>', tools: ['bold', 'italic', 'link'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox', { name: 'Status update' });
    await expect(canvas.getByText(/^52\/280/)).toBeInTheDocument();
    await caretToEnd(editor);
    await userEvent.keyboard(' Thanks!');
    await waitFor(() => expect(canvas.getByText(/^60\/280/)).toBeInTheDocument());
  },
};

/** Error state with a message. */
export const Invalid: Story = {
  args: { defaultValue: '', label: 'Release notes', required: true, error: 'Release notes are required.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox', { name: /Release notes/ });
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await expect(editor).toHaveAttribute('aria-required', 'true');
    await expect(editor).toHaveAccessibleDescription('Release notes are required.');
  },
};

/** Disabled. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Long content scrolls inside a capped height. */
export const MaxHeight: Story = {
  name: 'Max height',
  args: { maxHeight: 220, defaultValue: RELEASE_NOTE + RELEASE_NOTE },
};

/** Controlled: the HTML output updates as you type. */
export const Controlled: Story = {
  render: (args) => {
    const [html, setHtml] = useState('<p>Edit me — the <strong>HTML</strong> below follows.</p>');
    return (
      <div className="flex flex-col gap-4">
        <RichTextEditor {...args} defaultValue={undefined} value={html} onValueChange={setHtml} label="Template" />
        <CodeBlock code={html || '(empty)'} language="html" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const editor = canvas.getByRole('textbox', { name: 'Template' });
    const html = () => canvasElement.querySelector('pre code')!.textContent ?? '';
    // Select the whole document through the DOM; ProseMirror picks it up from selectionchange.
    const selectAll = async () => {
      editor.focus();
      window.getSelection()!.selectAllChildren(editor);
      await new Promise((r) => setTimeout(r, 50));
    };

    // Typing replaces the selection; the HTML output follows.
    await selectAll();
    await userEvent.keyboard('Release notes');
    await waitFor(() => expect(html()).toBe('<p>Release notes</p>'));

    // Bold from the toolbar: the button reflects the state.
    await selectAll();
    const bold = canvas.getByRole('button', { name: 'Bold' });
    await userEvent.click(bold);
    await waitFor(() => expect(html()).toBe('<p><strong>Release notes</strong></p>'));
    await expect(bold).toHaveAttribute('aria-pressed', 'true');

    // Markdown-style shortcut: "- " at the start of a line starts a list.
    await caretToEnd(editor);
    await userEvent.keyboard('{Enter}- First item');
    await waitFor(() => expect(html()).toContain('<ul><li><p>First item</p></li></ul>'));

    // Link from the popover; a bare domain gets https://.
    await selectAll();
    await userEvent.click(canvas.getByRole('button', { name: 'Link' }));
    const dialog = await body.findByRole('dialog', { name: 'Link' });
    await userEvent.type(within(dialog).getByLabelText('URL'), 'example.com{Enter}');
    await waitFor(() => expect(html()).toContain('href="https://example.com"'));
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'Link' })).not.toBeInTheDocument());
    // Focus goes back to the editor after the popover.
    await waitFor(() => expect(editor).toHaveFocus());

    // Clearing everything reports an empty string, not "<p></p>".
    await selectAll();
    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(html()).toBe('(empty)'));
  },
};
