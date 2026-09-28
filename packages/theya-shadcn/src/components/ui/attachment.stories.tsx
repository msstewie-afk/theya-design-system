import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Download } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import { Attachment } from './attachment';
import { Button } from './button';
import { Separator } from './separator';

const meta: Meta<typeof Attachment> = {
  title: 'Data Display/Attachment',
  component: Attachment,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'The display unit File is built on — pill/card/row/line variants.' } },
  },
  args: { name: 'quarterly-report.pdf', size: 248000 },
  argTypes: {
    name: { control: 'text', description: 'File name.', table: { category: 'Content' } },
    size: { control: 'number', description: 'File size in bytes, formatted for display.', table: { category: 'Content' } },
    onClick: { control: false, description: 'Fires when the attachment is clicked (ignored when href is set).', table: { category: 'Behavior' } },
    onRemove: { control: false, description: 'Shows a remove control; fires when it is activated.', table: { category: 'Behavior' } },
    removeLabel: { control: 'text', description: 'Accessible name for the remove button. Default "Remove {name}".', table: { category: 'Content' } },
    actions: { control: false, description: 'Extra action controls rendered in the slot.', table: { category: 'Advanced' } },
    variant: {
      control: 'inline-radio',
      options: ['pill', 'card', 'row', 'line'],
      description: 'Shape: inline chip, thumbnail tile, list line, or dense line',
      table: { category: 'Appearance' },
    },
    type: { control: 'text', description: 'MIME type, used to pick the kind icon/label.', table: { category: 'Content' } },
    metaText: { control: 'text', description: 'Secondary metadata line, e.g. "Modified today". Overridden by error when set.', table: { category: 'Content' } },
    error: { control: 'text', description: 'Error message, shown instead of metaText and styled danger.', table: { category: 'State' } },
    showKind: { control: 'boolean', description: 'Shows the file-kind label (from mimeLabels) instead of metaText.', table: { category: 'Appearance' } },
    showMeta: { control: 'boolean', description: 'Shows the secondary metadata line (size/kind/metaText) below the name.', table: { category: 'Appearance' } },
    selected: { control: 'boolean', description: 'Marks the file as picked — a ring on top of the hover fill, plus aria-current on a link.', table: { category: 'Appearance' } },
    previewUrl: { control: 'text', description: 'Thumbnail image URL, replaces the kind icon when set.', table: { category: 'Content' } },
    href: { control: 'text', description: "Turns the name into a real link, its ::after stretched over the whole surface as the hit target.", table: { category: 'Behavior' } },
    mimeLabels: { control: false, description: 'Overrides for the MIME-type-to-label mapping used by showKind.', table: { category: 'Advanced' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<typeof Attachment>;

/** Name + size with a type icon picked from the extension. */
export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <Attachment variant="card" name="report.pdf" size={242000} type="application/pdf" onRemove={() => {}} />
      <Attachment variant="row" name="report.pdf" size={242000} type="application/pdf" onRemove={() => {}} />
      <Attachment variant="pill" name="report.pdf" size={242000} type="application/pdf" onRemove={() => {}} />
      <Attachment variant="line" name="report.pdf" size={242000} onRemove={() => {}} />
    </div>
  ),
};

/** A removable chip that disappears once removed. */
export const Removable: Story = {
  render: function RemovableExample(args) {
    const [gone, setGone] = useState(false);
    if (gone) return <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Removed</p>;
    return <Attachment {...args} onRemove={() => setGone(true)} />;
  },
};

/** A wrapping row of staged pills of different kinds. */
export const StagedList: Story = {
  name: 'Staged list',
  render: () => (
    <div className="flex max-w-[600px] flex-row flex-wrap gap-2">
      <Attachment name="logo.svg" size={12800} onRemove={() => {}} />
      <Attachment name="demo.mp4" type="video/mp4" size={48400000} onRemove={() => {}} />
      <Attachment name="data.csv" type="text/plain" size={9200} onRemove={() => {}} />
      <Attachment name="archive.zip" type="application/zip" size={1280000} onRemove={() => {}} />
      <Attachment name="main.ts" size={4100} onRemove={() => {}} />
    </div>
  ),
};

/** `type` picks the icon and (with `showKind`) spells the MIME label out in the meta line. */
export const MimeTypes: Story = {
  name: 'Mime types',
  render: () => (
    <div className="flex max-w-[600px] flex-row flex-wrap gap-2">
      <Attachment name="quarterly-report" type="application/pdf" size={248000} />
      <Attachment name="cover" type="image/png" size={184000} />
      <Attachment name="release" type="video/mp4" size={48400000} />
      <Attachment name="export" type="text/plain" size={9200} />
      <Attachment name="bundle" type="application/zip" size={1280000} />
    </div>
  ),
};

/** `actions` replaces the built-in remove button with any control you pass. */
/** `actions` renders alongside the built-in remove button — any icon works, not just Download. */
export const CustomAction: Story = {
  name: 'Custom action',
  args: {
    actions: <Button appearance="ghost" size="sm" iconOnly aria-label="Download quarterly-report.pdf" leftIcon={<Download />} />,
    onRemove: () => {},
  },
};

/** Thumbnail-forward tile, one with a real preview, one with a trailing custom action. */
export const Card: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-3 gap-3">
      <Attachment variant="card" name="quarterly-report.pdf" type="application/pdf" size={248000} onRemove={() => {}} />
      <Attachment
        variant="card"
        name="cover.png"
        type="image/png"
        size={184000}
        previewUrl="/asset-examples/nova-web.jpg"
        onRemove={() => {}}
      />
      <Attachment
        variant="card"
        name="release.mp4"
        type="video/mp4"
        size={48400000}
        actions={<Button appearance="ghost" size="sm" iconOnly aria-label="Download release.mp4" leftIcon={<Download />} />}
      />
    </div>
  ),
};

/** An invalid file states its reason with role="alert" and turns its content destructive. */
/**
 * ATTACHMENT_MIME_LABELS holds the English fallbacks; pass a translated map
 * through mimeLabels to localize, keys you leave out keep the fallback. Two
 * more strings the component does not own: error is yours to pass already
 * translated, and the remove button's accessible name comes from removeLabel
 * (default "Remove {name}") — shown here in German.
 */
export const LocalizedLabels: Story = {
  name: 'Localized labels',
  render: () => {
    const de: Record<string, string> = {
      'application/pdf': 'PDF-Dokument',
      'image/png': 'PNG-Bild',
    };
    return (
      <div className="grid max-w-2xl grid-cols-3 gap-3">
        <Attachment
          variant="card"
          name="quartalsbericht.pdf"
          type="application/pdf"
          size={248000}
          mimeLabels={de}
          onRemove={() => {}}
          removeLabel="quartalsbericht.pdf entfernen"
        />
        <Attachment
          variant="card"
          name="titelbild.png"
          type="image/png"
          size={184000}
          previewUrl="/asset-examples/nova-web.jpg"
          mimeLabels={de}
          onRemove={() => {}}
          removeLabel="titelbild.png entfernen"
        />
        {/* text/plain is untranslated here, so it keeps the English fallback. */}
        <Attachment
          variant="card"
          name="export.csv"
          type="text/plain"
          size={9200}
          mimeLabels={de}
          error="Überschreitet das Upload-Limit von 2 GB"
          onRemove={() => {}}
          removeLabel="export.csv entfernen"
        />
      </div>
    );
  },
};

export const WithError: Story = {
  name: 'With error',
  args: { name: 'backup.tar.gz', size: 5300000000, error: 'Exceeds the 2 GB upload limit', onRemove: () => {} },
};

/** The error treatment across shapes, with and without a control. */
export const ErrorStates: Story = {
  name: 'Error states',
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-start gap-2">
        <Attachment name="backup.tar.gz" size={5300000000} error="Exceeds the 2 GB upload limit" onRemove={() => {}} />
        <Attachment name="notes.pages" error="File type is not supported" />
      </div>
      <div className="flex flex-col gap-2">
        <Attachment variant="row" name="backup.tar.gz" type="application/zip" size={5300000000} error="Exceeds the 2 GB upload limit" onRemove={() => {}} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Attachment variant="card" name="backup.tar.gz" type="application/zip" size={5300000000} error="Exceeds the 2 GB upload limit" onRemove={() => {}} />
      </div>
    </div>
  ),
};

/** `metaText` appends a secondary string after the size/kind, in every shape; `error` takes the line over when both are set. */
export const MetaText: Story = {
  name: 'Meta text',
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-start gap-2">
        <Attachment name="logo.svg" size={12800} metaText="Uploaded by ada" />
        <Attachment name="main.ts" size={4100} metaText="Modified 2 days ago" onRemove={() => {}} />
      </div>
      <Attachment variant="row" name="quarterly-report.pdf" type="application/pdf" size={248000} metaText="Modified 2 days ago" />
      <div className="grid grid-cols-3 gap-3">
        <Attachment variant="card" name="cover.png" type="image/png" size={184000} previewUrl="/asset-examples/nova-web.jpg" metaText="Uploaded today" />
      </div>
    </div>
  ),
};

/** `variant="line"` is the densest shape — no thumbnail, size against the right edge, failure on its own row. This is the row Dropzone's staged list renders. */
export const Line: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-1.5">
      <Attachment variant="line" name="quarterly-report.pdf" size={248000} onRemove={() => {}} />
      <Attachment variant="line" name="cover.png" size={184000} onRemove={() => {}} />
      <Attachment variant="line" name="backup.tar.gz" size={5300000000} error="Exceeds the 2 GB upload limit" onRemove={() => {}} />
      <Attachment variant="line" name="notes.md" size={4100} />
    </div>
  ),
};

/** Long names truncate rather than push the layout, in every shape; the pill is capped so one long name can't stretch a chip across a whole composer. */
export const LongNames: Story = {
  name: 'Long names',
  render: () => {
    const long = 'eu-west-1-production-database-backup-2026-08-04-full-with-binlogs-and-a-very-long-tail.tar.gz';
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="flex flex-wrap items-start gap-2">
          <Attachment name={long} size={5300000000} onRemove={() => {}} />
        </div>
        <Attachment variant="line" name={long} size={5300000000} onRemove={() => {}} />
        <Attachment variant="row" name={long} type="application/zip" size={5300000000} onRemove={() => {}} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Attachment variant="card" name={long} type="application/zip" size={5300000000} onRemove={() => {}} />
        </div>
      </div>
    );
  },
};

export const KindLabel: Story = {
  name: 'Kind label',
  render: () => (
    <div className="flex flex-col gap-2 w-[280px]">
      <Attachment variant="row" name="cover.png" size={820000} type="image/png" showKind onRemove={() => {}} />
    </div>
  ),
};

export const Row: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-2 w-[360px]">
      <Attachment variant="row" name="quarterly-report.pdf" type="application/pdf" size={248000} onRemove={() => {}} />
      <Attachment variant="row" name="cover.png" type="image/png" size={184000} onRemove={() => {}} />
      <Attachment variant="row" name="archive.zip" type="application/zip" size={1280000} onRemove={() => {}} />
    </div>
  ),
};

export const AsLink: Story = {
  name: 'As link',
  render: () => (
    <div className="flex max-w-lg flex-col gap-2 w-[360px]">
      <Attachment
        variant="row"
        href="#quarterly-report"
        name="quarterly-report.pdf"
        type="application/pdf"
        size={248000}
        actions={<Button appearance="ghost" size="sm" iconOnly aria-label="More actions" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />}
      />
      <Attachment variant="row" href="#cover" name="cover.png" type="image/png" size={184000} />
      <Attachment variant="row" name="static.csv" type="text/plain" size={9200} />
    </div>
  ),
};

export const Selected: Story = {
  render: function SelectedExample() {
    const files = [
      { name: 'quarterly-report.pdf', type: 'application/pdf', size: 248000 },
      { name: 'cover.png', type: 'image/png', size: 184000 },
      { name: 'export.csv', type: 'text/plain', size: 9200 },
    ];
    const [picked, setPicked] = useState('cover.png');
    return (
      <div className="grid max-w-2xl grid-cols-3 gap-3">
        {files.map((f) => (
          <Attachment
            key={f.name}
            variant="card"
            name={f.name}
            type={f.type}
            size={f.size}
            selected={picked === f.name}
            aria-pressed={picked === f.name}
            // role="button"/tabIndex/onKeyDown are now built into Attachment
            // itself for any onClick-only (no href) row — see attachment.tsx.
            onClick={() => setPicked(f.name)}
          />
        ))}
      </div>
    );
  },
};

export const InteractiveStates: Story = {
  name: 'Interactive states',
  render: () => (
    <div className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2 w-[360px]">
        <Attachment
          variant="row"
          href="#quarterly-report"
          name="quarterly-report.pdf"
          type="application/pdf"
          size={248000}
          actions={<Button appearance="ghost" size="sm" iconOnly aria-label="More actions" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />}
        />
        <Attachment variant="row" href="#cover" name="cover.png" type="image/png" size={184000} selected />
        <Attachment variant="row" name="static.csv" type="text/plain" size={9200} />
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <Attachment href="#logo" name="logo.svg" size={12800} />
        <Attachment href="#main" name="main.ts" size={4100} selected />
        <Attachment name="static.txt" size={2400} />
      </div>
    </div>
  ),
};
