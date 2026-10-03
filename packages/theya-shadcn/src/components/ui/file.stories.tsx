import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { File } from './file';
import { Button } from './button';
import { fileGuidelines } from './file.guidelines';

const meta: Meta<typeof File> = {
  title: 'Files/File',
  component: File,
  tags: ['autodocs'],
  parameters: {
    guidelines: fileGuidelines,
    docs: {
      description: {
        component:
          'Not in the reference repo — always a native file-input slot, built on the standalone Attachment component.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['pill', 'card', 'row', 'line'], description: 'Visual layout of the file slot.', table: { category: 'Appearance' } },
    name: { control: 'text', description: 'Initial file name inherited from Attachment.', table: { category: 'Content' } },
    size: { control: 'number', description: 'Initial byte size inherited from Attachment.', table: { category: 'Content' } },
    type: { control: 'text', description: 'MIME type, used to pick the kind icon/label.', table: { category: 'Content' } },
    meta: { control: 'text', description: 'Secondary metadata, e.g. "Modified today".', table: { category: 'Content' } },
    pickLabel: { control: 'text', description: 'Label shown in the empty (dashed) tile. Default "Add file".', table: { category: 'Content' } },
    pickHint: { control: 'text', description: 'Optional secondary line under pickLabel in the empty tile, e.g. "PNG or JPG, up to 25 MB".', table: { category: 'Content' } },
    replaceLabel: { control: 'text', description: 'Shown on hover/keyboard focus of a filled slot and read as its description. Default "Replace file".', table: { category: 'Content' } },
    error: { control: 'text', description: 'Error message; overrides meta when set.', table: { category: 'State' } },
    empty: { control: 'boolean', description: 'Starts the slot without file metadata (the dashed "add" tile).', table: { category: 'State' } },
    readOnly: { control: 'boolean', description: 'Presentation-only: the input remains mounted but cannot be activated.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the file slot.', table: { category: 'State' } },
    showKind: { control: 'boolean', description: 'Shows the file-kind icon.', table: { category: 'Appearance' } },
    showMeta: { control: 'boolean', description: 'Shows the secondary metadata line.', table: { category: 'Appearance' } },
    selected: { control: 'boolean', description: 'Marks the file as picked — a ring on top of the hover fill, plus aria-current on a link.', table: { category: 'Appearance' } },
    previewUrl: { control: 'text', description: 'Thumbnail image source for the preview slot.', table: { category: 'Content' } },
    href: { control: 'text', description: 'Turns the name into a real link, its ::after stretched over the whole surface as the hit target.', table: { category: 'Behavior' } },
    accept: { control: 'text', description: 'Accepted file types, passed to the underlying file input.', table: { category: 'Behavior' } },
    mimeLabels: { control: false, description: 'Overrides for the MIME-type-to-label mapping used by showKind.', table: { category: 'Advanced' } },
    actions: { control: false, description: 'Extra action controls rendered in the slot.', table: { category: 'Advanced' } },
    onFileChange: { control: false, description: 'Called with the picked File (or null on clear) when the input changes.', table: { category: 'Behavior' } },
    inputProps: { control: false, description: 'Extra props forwarded to the underlying file input.', table: { category: 'Advanced' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<typeof File>;

const inputs = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="file"]'));
const doc = (name: string, type = 'text/plain') => new globalThis.File(['x'], name, { type });

/**
 * Sets a real FileList on the input and fires change, like the browser
 * does after the picker closes. userEvent.upload instead refocuses the
 * hidden input (focus would never land there for real) and overrides
 * `files` with a property FormData can't see.
 */
function choose(input: HTMLInputElement, file: globalThis.File) {
  const data = new DataTransfer();
  data.items.add(file);
  input.files = data.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export const Default: Story = {
  args: { name: 'quarterly-report.pdf', size: 248000, meta: 'Modified 2 days ago', type: 'application/pdf', onFileChange: fn() },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'quarterly-report.pdf' })).toBeInTheDocument();
    // Picking again replaces the file in place.
    choose(inputs(canvasElement)[0], doc('q3-final.pdf', 'application/pdf'));
    await expect(await canvas.findByRole('button', { name: 'q3-final.pdf' })).toBeInTheDocument();
    await expect(args.onFileChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'q3-final.pdf' }));

    // Removing hands focus to the picker that replaces the file.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove q3-final.pdf' }));
    await expect(args.onFileChange).toHaveBeenLastCalledWith(null);
    const picker = await canvas.findByRole('button', { name: 'Add file' });
    await waitFor(() => expect(picker).toHaveFocus());
  },
};

export const Empty: Story = {
  args: { empty: true },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
};

/** Every Attachment shape the file-input slot can render as. */
export const Variants: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <File variant="pill" name="report.pdf" type="application/pdf" size={248000} />
      <File variant="line" name="report.pdf" type="application/pdf" size={248000} />
      <File variant="row" name="report.pdf" type="application/pdf" size={248000} />
      <div className="w-[180px]">
        <File variant="card" name="report.pdf" type="application/pdf" size={248000} />
      </div>
    </div>
  ),
};

export const CardGrid: Story = {
  name: 'Card Grid',
  render: () => (
    <div className="grid grid-cols-3 gap-3 w-[600px]">
      <File name="cover.png" size={801000} type="image/png" meta="Modified today" />
      <File name="report.pdf" size={242000} type="application/pdf" meta="Modified 2 days ago" />
      <File name="notes.md" size={4100} meta="Modified 1 week ago" />
      <File name="build.zip" size={1280000} meta="Modified 1 month ago" />
      <File name="main.ts" size={9200} meta="Modified 3 days ago" />
      <File empty />
    </div>
  ),
};

export const RowVariant: Story = {
  name: 'Row variant',
  render: () => (
    <div className="flex flex-col gap-2 w-[320px]">
      <File variant="row" name="report.pdf" size={242000} type="application/pdf" meta="Modified 2 days ago" />
      <File variant="row" name="archive.zip" size={1200000} type="application/zip" meta="Modified 1 month ago" />
    </div>
  ),
};

/**
 * `showKind` spells the type out in the meta line, between the size and
 * `meta`: "820 KB, PNG image, Modified today". Off by default — the icon
 * already carries the kind. Pass a translated map via `mimeLabels` to
 * localize it; keys you leave out keep the English fallback.
 */
export const KindLabel: Story = {
  name: 'Kind label',
  render: () => (
    <div className="flex max-w-lg flex-col gap-2">
      <File variant="row" name="cover.png" type="image/png" size={820000} meta="Modified today" />
      <File variant="row" name="cover.png" type="image/png" size={820000} meta="Modified today" showKind />
      <File
        variant="row"
        name="titelbild.png"
        type="image/png"
        size={820000}
        meta="Heute geändert"
        showKind
        mimeLabels={{ 'image/png': 'PNG-Bild' }}
      />
      <File variant="row" name="cover.png" type="image/png" size={820000} meta="Modified today" showKind showMeta={false} />
    </div>
  ),
};

/** `error` replaces the meta line with the reason (role="alert") and turns the content destructive. */
export const WithError: Story = {
  name: 'With error',
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <File variant="row" name="backup.tar.gz" type="application/gzip" size={5300000000} error="Exceeds the 2 GB upload limit" />
        <File variant="row" name="notes.pages" type="application/octet-stream" error="File type is not supported" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <File name="backup.tar.gz" type="application/gzip" size={5300000000} error="Exceeds the 2 GB upload limit" />
        <File name="cover.png" type="image/png" size={820000} error="Upload failed" />
        <File name="data.csv" type="text/csv" size={9200} meta="Modified today" />
      </div>
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { name: 'quarterly-report.pdf', size: 248000, meta: 'Modified 2 days ago', readOnly: true },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('quarterly-report.pdf')).toBeInTheDocument();
    // Presentation only: nothing to press, the input can't open.
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(inputs(canvasElement)[0]).toBeDisabled();
  },
};

export const AsLink: Story = {
  name: 'Link',
  args: { name: 'quarterly-report.pdf', size: 248000, href: 'https://example.com/quarterly-report.pdf' },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /quarterly-report\.pdf/ })).toHaveAttribute('href', 'https://example.com/quarterly-report.pdf');
    // A link, not a picker: no file input, no remove.
    await expect(inputs(canvasElement)).toHaveLength(0);
    await expect(canvas.queryByRole('button', { name: /Remove/ })).toBeNull();
  },
};

/**
 * `empty` starts the slot without file metadata. Click the dashed tile to
 * open the picker; the chosen file replaces the tile, with a control to
 * pick again and one to clear it. Nothing here is wired by the story —
 * the slot is uncontrolled, like the native input it replaces.
 */
export const Slot: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <File empty inputProps={{ name: 'attachment' }} />
        <File empty pickLabel="Add image" pickHint="PNG or JPG, up to 25 MB" inputProps={{ name: 'cover', accept: 'image/png,image/jpeg' }} />
      </div>
      <File variant="row" name="report.pdf" type="application/pdf" size={248000} meta="Modified today" />
      <File variant="row" name="archive.zip" size={1280000} meta="Modified 1 month ago" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('button', { name: 'Add file' });
    await expect(canvas.getByRole('button', { name: 'Add image PNG or JPG, up to 25 MB' })).toBeInTheDocument();

    // Picking swaps the tile for the file; focus follows onto it.
    first.focus();
    choose(inputs(canvasElement)[0], doc('notes.txt'));
    const picked = await canvas.findByRole('button', { name: 'notes.txt' });
    await waitFor(() => expect(picked).toHaveFocus());

    // Removing swaps back; focus lands on the tile again.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove notes.txt' }));
    await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Add file' })[0]).toHaveFocus());
  },
};

/** The slot needs no state of its own: the file lives in the input, so a plain form submits it. */
export const SlotInForm: Story = {
  name: 'Slot in a form',
  render: function SlotInFormExample() {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <form
        className="flex max-w-56 flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const file = data.get('cover');
          setSubmitted(file instanceof globalThis.File && file.size > 0 ? file.name : 'nothing');
        }}
      >
        <File empty pickLabel="Add image" pickHint="PNG or JPG" inputProps={{ name: 'cover', accept: 'image/png,image/jpeg' }} />
        <Button appearance="filled" tone="primary" size="md" onClick={(e) => e.currentTarget.closest('form')?.requestSubmit()}>
          Upload
        </Button>
        {submitted && (
          <p className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
            Form carried: <span className="font-mono">{submitted}</span>
          </p>
        )}
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The chosen file travels with a plain form submit.
    choose(inputs(canvasElement)[0], doc('cover.png', 'image/png'));
    await canvas.findByRole('button', { name: 'cover.png' });
    await userEvent.click(canvas.getByRole('button', { name: 'Upload' }));
    await expect(await canvas.findByText('cover.png', { selector: 'span.font-mono' })).toBeInTheDocument();

    // Clearing empties the input too, so the next submit carries nothing.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove cover.png' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Upload' }));
    await expect(await canvas.findByText('nothing', { selector: 'span.font-mono' })).toBeInTheDocument();
  },
};

/**
 * A filled slot is one big click target that opens the picker. While it's
 * hovered or keyboard-focused, the meta line turns into "Replace file", and
 * the same text is the control's accessible description — so nobody clicks
 * a file card expecting to open it and gets a file dialog instead.
 * `replaceLabel` localizes it.
 */
export const ReplaceHint: Story = {
  args: { name: 'quarterly-report.pdf', size: 248000, type: 'application/pdf' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('button', { name: 'quarterly-report.pdf' });
    await expect(card).toHaveAccessibleDescription('Replace file');
    const hint = canvas.getByText('Replace file');
    const meta = canvas.getByText(/242 KB/);
    await expect(hint).not.toBeVisible();
    await expect(meta).toBeVisible();

    // Keyboard focus on the card swaps the meta line for the hint.
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await waitFor(() => expect(hint).toBeVisible());
    await expect(meta).not.toBeVisible();

    // Focus on Remove is a different action — the hint goes away.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Remove quarterly-report.pdf' })).toHaveFocus();
    await waitFor(() => expect(hint).not.toBeVisible());
    await expect(meta).toBeVisible();
  },
};
