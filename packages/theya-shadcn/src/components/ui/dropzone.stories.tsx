import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone, type StagedFile } from './dropzone';

const meta: Meta<typeof Dropzone> = {
  title: 'Forms/Dropzone',
  tags: ['autodocs'],
  argTypes: {
    'aria-label': { control: 'text', description: 'Accessible name for the drop zone.', table: { category: 'Content' } },
    hint: { control: 'text', description: 'Helper text shown below the drag/browse prompt.', table: { category: 'Content' } },
    accept: { control: 'text', description: 'Accepted file types, passed to the underlying file input.', table: { category: 'Content' } },
    successFile: {
      control: false,
      description: 'Replaces the drag/or/Browse content with a single-file success confirmation (checkmark, name, upload date). Ignored while error is set.',
      table: { category: 'Content' },
    },
    multiple: { control: 'boolean', description: 'Allows selecting/dropping more than one file.', table: { category: 'Behavior' } },
    onFiles: { control: false, description: 'Called with the accepted files on drop or selection.', table: { category: 'Behavior' } },
    onRemove: { control: false, description: 'Called with a staged file\'s index when its remove control is used.', table: { category: 'Behavior' } },
    files: { control: false, description: 'Staged files to list below the drop zone.', table: { category: 'Behavior' } },
    error: { control: 'text', description: 'Error message; switches the zone into an error state.', table: { category: 'State' } },
    loading: {
      control: 'boolean',
      description: 'Zone shows a spinner + "Uploading…" and becomes non-interactive. Takes priority over error/successFile while true.',
      table: { category: 'State' },
    },
    disabled: { control: 'boolean', description: 'Disables the drop zone.', table: { category: 'State' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

function StagedDemo() {
  const [files, setFiles] = useState<StagedFile[]>([
    { name: 'certificate.pem', size: 2400 },
    { name: 'bad-file.exe', size: 1200000, error: 'File type not allowed' },
  ]);
  return (
    <div className="w-[480px]">
      <Dropzone
        aria-label="Upload TLS certificate"
        hint="JPG, PNG, GIF, WEBP up to 125 MB"
        files={files}
        onFiles={(newFiles) =>
          setFiles((prev) => [...prev, ...newFiles.map((f) => ({ name: f.name, size: f.size }))])
        }
        onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
      />
    </div>
  );
}

export const Playground: Story = {
  render: () => <StagedDemo />,
};

export const Empty: Story = {
  render: () => (
    <div className="w-[480px]">
      <Dropzone aria-label="Upload file" hint="JPG, PNG, GIF, WEBP up to 125 MB" onFiles={() => {}} />
    </div>
  ),
};

export const WithError: Story = {
  name: 'With error',
  render: () => (
    <div className="w-[480px]">
      <Dropzone
        aria-label="Upload file"
        hint="JPG, PNG, GIF, WEBP up to 125 MB"
        error="JPG, PNG, GIF, WEBP only, up to 125 MB"
        onFiles={() => {}}
      />
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div className="w-[450px]">
      <Dropzone
        aria-label="Upload resume"
        successFile={{ name: 'Alex Smith-Product Designer.pdf', uploadedAt: '05/25/26' }}
        onFiles={() => {}}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-[450px]">
      <Dropzone aria-label="Upload resume" loading onFiles={() => {}} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[480px]">
      <Dropzone aria-label="Upload file" hint="JPG, PNG, GIF, WEBP up to 125 MB" disabled onFiles={() => {}} />
    </div>
  ),
};
