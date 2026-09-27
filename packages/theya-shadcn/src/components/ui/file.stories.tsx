import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { File } from './file';
import { Button } from './button';

const meta: Meta<typeof File> = {
  title: 'Forms/File',
  component: File,
  tags: ['autodocs'],
  parameters: {
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

export const Default: Story = {
  args: { name: 'quarterly-report.pdf', size: 248000, meta: 'Modified 2 days ago', type: 'application/pdf' },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
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
};

export const AsLink: Story = {
  name: 'Link',
  args: { name: 'quarterly-report.pdf', size: 248000, href: 'https://example.com/quarterly-report.pdf' },
  render: (args) => (
    <div className="max-w-56">
      <File {...args} />
    </div>
  ),
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
        <Button type="filled" tone="primary" size="md" onClick={(e) => e.currentTarget.closest('form')?.requestSubmit()}>
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
};
