import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
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

const zone = (root: HTMLElement) => root.querySelector('[data-dropzone-trigger]') as HTMLButtonElement;
const surface = (root: HTMLElement) => zone(root).parentElement as HTMLElement;
const picker = (root: HTMLElement) => root.querySelector('input[type="file"]') as HTMLInputElement;

function drop(root: HTMLElement, files: File[]) {
  // A real DataTransfer in a native DragEvent: fireEvent copies only the
  // init object's own properties (DataTransfer keeps `files` on its
  // prototype, so the handler got an empty list), and Chromium rejects a
  // plain object as DragEventInit.dataTransfer.
  const data = new DataTransfer();
  files.forEach((file) => data.items.add(file));
  for (const type of ['dragenter', 'dragover', 'drop']) {
    surface(root).dispatchEvent(new DragEvent(type, { dataTransfer: data, bubbles: true, cancelable: true }));
  }
}

const pem = () => new File(['x'], 'server.pem', { type: 'application/x-pem-file' });

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = zone(canvasElement);
    await expect(trigger).toHaveAccessibleName('Upload TLS certificate Drag files here');
    await expect(trigger).toHaveAccessibleDescription('JPG, PNG, GIF, WEBP up to 125 MB');
    // One tab stop for the zone: "Browse" is a pointer target only.
    await expect(canvas.getByText('Browse').closest('button')).toHaveAttribute('tabindex', '-1');

    // Picker and drop both stage files.
    await userEvent.upload(picker(canvasElement), pem());
    await expect(await canvas.findByText('server.pem')).toBeInTheDocument();
    drop(canvasElement, [new File(['y'], 'chain.crt')]);
    await expect(await canvas.findByText('chain.crt')).toBeInTheDocument();

    // Removing a row moves focus to the row that took its place.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove bad-file.exe' }));
    await waitFor(() => expect(canvas.queryByText('bad-file.exe')).toBeNull());
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove server.pem' })).toHaveFocus());

    // Removing the last row falls back to the previous one.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove chain.crt' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove server.pem' })).toHaveFocus());
  },
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
  play: async ({ canvasElement }) => {
    const trigger = zone(canvasElement);
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleName('Upload file File is uploaded with error');
    await expect(trigger).toHaveAccessibleDescription('JPG, PNG, GIF, WEBP only, up to 125 MB');
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('JPG, PNG, GIF, WEBP only, up to 125 MB');
  },
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
  play: async ({ canvasElement }) => {
    // The confirmation state still gives the zone a name.
    await expect(zone(canvasElement)).toHaveAccessibleName('Upload resume Alex Smith-Product Designer.pdf');
  },
};

export const Loading: Story = {
  render: () => (
    <div className="w-[450px]">
      <Dropzone aria-label="Upload resume" loading onFiles={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = zone(canvasElement);
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAccessibleName('Upload resume Uploading…');
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[480px]">
      <Dropzone aria-label="Upload file" hint="JPG, PNG, GIF, WEBP up to 125 MB" disabled onFiles={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(zone(canvasElement)).toBeDisabled();
    await expect(picker(canvasElement)).toBeDisabled();
  },
};

const onAccepted = fn();
const onRejected = fn();

function AcceptDemo() {
  const [message, setMessage] = useState('');
  return (
    <div className="w-[480px]">
      <Dropzone
        aria-label="Upload TLS certificate"
        accept=".pem,.crt"
        hint="PEM or CRT only"
        error={message || undefined}
        onFiles={(files) => {
          onAccepted(files.map((f) => f.name));
          setMessage('');
        }}
        onReject={(files) => {
          onRejected(files.map((f) => f.name));
          setMessage(`${files.map((f) => f.name).join(', ')}: only .pem and .crt are allowed`);
        }}
      />
    </div>
  );
}

/** `accept` applies to dropped files too: matching files go to onFiles, the rest to onReject. */
export const AcceptFilter: Story = {
  name: 'Accept filter',
  render: () => <AcceptDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A wrong type goes to onReject, never to onFiles.
    drop(canvasElement, [new File(['z'], 'setup.exe', { type: 'application/x-msdownload' })]);
    await expect(onRejected).toHaveBeenLastCalledWith(['setup.exe']);
    await expect(onAccepted).not.toHaveBeenCalled();
    await expect(canvas.getByRole('alert')).toHaveTextContent('setup.exe: only .pem and .crt are allowed');

    // A mixed drop splits: the matching file is accepted, the other rejected.
    drop(canvasElement, [pem(), new File(['w'], 'photo.png', { type: 'image/png' })]);
    await expect(onAccepted).toHaveBeenLastCalledWith(['server.pem']);
    await expect(onRejected).toHaveBeenLastCalledWith(['photo.png']);
  },
};
