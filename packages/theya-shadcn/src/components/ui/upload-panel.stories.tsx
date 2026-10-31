import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button } from './button';
import { UploadPanel, type UploadPanelFile } from './upload-panel';
import { uploadPanelGuidelines } from './upload-panel.guidelines';

const meta: Meta<typeof UploadPanel> = {
  title: 'Files/UploadPanel',
  component: UploadPanel,
  tags: ['autodocs'],
  parameters: {
    guidelines: uploadPanelGuidelines,
    docs: {
      description: {
        component: 'Files uploading in the background, in a panel in the corner: how many, how far, how long; expand it for each file with pause, cancel and retry.',
      },
    },
  },
  argTypes: {
    files: { control: 'object', description: 'The files: id, name, size, progress (0–100), upload (uploading | paused | done), error, timeLeft (s).', table: { category: 'Content' } },
    timeLeft: { control: 'number', description: 'Seconds left for the whole batch.', table: { category: 'Content' } },
    defaultExpanded: { control: 'boolean', description: 'Expanded at first.', table: { category: 'State' } },
    floating: { control: 'boolean', description: 'Fixed to the bottom end corner (true) or rendered in place.', table: { category: 'Appearance' } },
  },
};
export default meta;
type Story = StoryObj<typeof UploadPanel>;

const FILES: UploadPanelFile[] = [
  { id: 'a', name: 'Nature.mp4', size: 48_000_000, progress: 66, upload: 'uploading', timeLeft: 4 },
  { id: 'b', name: 'Intro movie.mp4', size: 31_000_000, progress: 30, upload: 'uploading', timeLeft: 5 },
  { id: 'c', name: 'Intro asset video.mp4', size: 22_000_000, progress: 22, upload: 'uploading', timeLeft: 7 },
];

const noop = () => {};

/** Collapsed: how many, how far, how long, and the batch controls. The bar runs along the bottom edge. */
export const Default: Story = {
  args: { files: FILES, timeLeft: 7, floating: false, onPauseAll: noop, onCancelAll: noop, onPause: noop, onCancel: noop, className: 'w-full max-w-[24rem]' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: 'Uploads' });
    await expect(within(panel).getByText('Uploading 3 files', { selector: 'p:not(.sr-only)' })).toBeInTheDocument();
    const toggle = within(panel).getByRole('button', { name: 'Show files' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(within(panel).getByRole('progressbar', { name: 'Nature.mp4' })).toBeInTheDocument();
    // Escape collapses and leaves focus on the toggle.
    await userEvent.keyboard('{Escape}');
    await expect(within(panel).getByRole('button', { name: 'Show files' })).toHaveFocus();
  },
};

/** Expanded: each file with its own bar, time, pause and cancel. */
export const Expanded: Story = {
  args: {
    files: [{ ...FILES[0] }, { ...FILES[1], upload: 'paused' }, { ...FILES[2], error: 'Connection lost' }, { id: 'd', name: 'Poster.png', size: 2_400_000, progress: 100, upload: 'done' }],
    timeLeft: 7,
    defaultExpanded: true,
    floating: false,
    onPauseAll: noop,
    onCancelAll: noop,
    onPause: noop,
    onResume: noop,
    onCancel: noop,
    onRetry: noop,
    className: 'w-full max-w-[24rem]',
  },
};

/** Everything in: "Uploaded 3 files" with a check, and a close button. */
export const Finished: Story = {
  args: { files: FILES.map((f) => ({ ...f, progress: 100, upload: 'done' as const })), floating: false, onClose: noop, className: 'w-full max-w-[24rem]' },
};

/** A simulated batch in the corner: start it, pause and resume one file or all, cancel one. Screen readers hear when the batch starts, pauses and finishes. */
export const Live: Story = {
  render: function LiveStory() {
    const [files, setFiles] = useState<UploadPanelFile[] | null>(null);
    const running = files?.some((f) => f.upload === 'uploading' && !f.error);
    useEffect(() => {
      if (!running) return;
      const id = setInterval(() => {
        setFiles((list) =>
          list
            ? list.map((f) => {
                if (f.upload !== 'uploading' || f.error) return f;
                const progress = Math.min(100, f.progress + 1_200_000_000 / (f.size ?? 1) / 10);
                return { ...f, progress, upload: progress >= 100 ? 'done' : 'uploading', timeLeft: Math.ceil(((100 - progress) / 100) * ((f.size ?? 0) / 12_000_000)) };
              })
            : list,
        );
      }, 100);
      return () => clearInterval(id);
    }, [running]);
    const set = (id: string, upload: UploadPanelFile['upload']) => setFiles((l) => l && l.map((f) => (f.id === id ? { ...f, upload } : f)));
    const all = (from: UploadPanelFile['upload'], to: UploadPanelFile['upload']) => setFiles((l) => l && l.map((f) => (f.upload === from ? { ...f, upload: to } : f)));
    const left = files ? Math.max(0, ...files.filter((f) => f.upload === 'uploading').map((f) => f.timeLeft ?? 0)) : 0;
    return (
      <div className="min-h-[28rem]">
        <Button onClick={() => setFiles(FILES.map((f) => ({ ...f, progress: 0 })))}>Upload 3 files</Button>
        {files && files.length > 0 && (
          <UploadPanel
            files={files}
            timeLeft={left}
            onPause={(id) => set(id, 'paused')}
            onResume={(id) => set(id, 'uploading')}
            onCancel={(id) => setFiles((l) => l && l.filter((f) => f.id !== id))}
            onPauseAll={() => all('uploading', 'paused')}
            onResumeAll={() => all('paused', 'uploading')}
            onCancelAll={() => setFiles(null)}
            onClose={() => setFiles(null)}
          />
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Upload 3 files' }));
    const panel = await canvas.findByRole('region', { name: 'Uploads' });
    await waitFor(() => expect(within(panel).getByText('Uploading 3 files', { selector: '.sr-only' })).toBeInTheDocument());
    await userEvent.click(within(panel).getByRole('button', { name: 'Pause all' }));
    await waitFor(() => expect(within(panel).getByText('Uploading 3 files: Paused')).toBeInTheDocument());
    await userEvent.click(within(panel).getByRole('button', { name: 'Resume all' }));
    await waitFor(() => expect(within(panel).getByText('Uploaded 3 files', { selector: '.sr-only' })).toBeInTheDocument(), { timeout: 8000 });
    await userEvent.click(within(panel).getByRole('button', { name: 'Close' }));
    await expect(canvas.queryByRole('region', { name: 'Uploads' })).toBeNull();
  },
};
