import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Undo } from 'iconoir-react';
import { toast } from './sonner';
import { undoToast } from './undo-toast';
import { Button } from './button';
import { undoToastGuidelines } from './undo-toast.guidelines';
import { testOnly } from '../../lib/test-only';

/**
 * undoToast — the optimistic-destructive pattern over sonner. Apply the
 * change immediately, then call `undoToast({...})` to pop a toast with an
 * "Undo" action and a grace window: clicking Undo runs `onUndo` (roll
 * back); otherwise, when the toast auto-closes after `duration` (10s) or is
 * dismissed, `onCommit` runs once to finalise. It is a function, not a
 * component — these stories are Buttons that call it. The global
 * `<Toaster/>` (mounted in `.storybook/preview.ts`) renders the toast, so
 * these stories don't mount their own (see Status & Feedback/Toaster's own comment
 * for why a second instance would just eat the calls). Use for reversible
 * deletes (galleries, client access, files); for high-stakes/irreversible actions
 * use a typed-confirm Dialog instead.
 */
const meta = {
  title: 'Status & Feedback/UndoToast',
  component: Button,
  parameters: { layout: 'centered', guidelines: undoToastGuidelines },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Spies wrapped around the stories' own callbacks so tests can count them.
const undoSpy = fn();
const commitSpy = fn();

const body = () => within(document.body);
const toastByTitle = (title: string) => body().findByText(title, { selector: '[data-title]' });

/** Dismiss every toast and wait until none are left (keeps stories isolated). */
async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

/**
 * The default flow: delete optimistically, then offer a 10s undo. Undo
 * confirms a restore; letting it lapse commits.
 */
export const Default: Story = {
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Gallery deleted',
          description: 'Blue hour · recoverable for 30 days',
          onUndo: () => {
            undoSpy();
            toast.success('Gallery restored');
          },
          onCommit: () => {
            commitSpy();
            toast('Delete committed');
          },
        })
      }
    >
      Delete gallery
    </Button>
  ),
};

/**
 * Title only — the description is optional. The default trash icon and
 * "Undo" label carry the rest. Status reads from the text + icon, never
 * color alone.
 */
export const TitleOnly: Story = {
  name: 'Title only',
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Archive copy deleted',
          onCommit: () => toast('Archive copy removed'),
        })
      }
    >
      Delete archive copy
    </Button>
  ),
};

/**
 * Override `undoLabel`, `icon`, and shorten the grace window. Here a client
 * loses access to a gallery with a 6s window, a restore label, and a non-trash
 * glyph.
 */
export const CustomLabelAndIcon: Story = {
  name: 'Custom label and icon',
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Client removed',
          description: 'Rhea Okafor · Golden hour',
          duration: 6000,
          undoLabel: 'Restore',
          icon: <Undo width={16} height={16} />,
          onUndo: () => toast.success('Client restored'),
          onCommit: () => toast('Client removed'),
        })
      }
    >
      Remove client
    </Button>
  ),
  play: testOnly(async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove client' }));
    const item = (await toastByTitle('Client removed')).closest('[data-sonner-toast]') as HTMLElement;
    await expect(within(item).getByText('Rhea Okafor · Golden hour')).toBeInTheDocument();
    await userEvent.click(within(item).getByRole('button', { name: 'Restore' }));
    await expect(await toastByTitle('Client restored')).toBeInTheDocument();
    await clearToasts();
  }),
};

/**
 * Pass `icon={null}` to drop the leading glyph entirely — useful when the
 * title already names the object and you want the most compact toast.
 */
export const WithoutIcon: Story = {
  name: 'Without icon',
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'File moved to trash',
          description: 'GOLDEN_0907.tif',
          icon: null,
          onUndo: () => toast.success('File restored'),
          onCommit: () => toast('File deleted'),
        })
      }
    >
      Move to trash
    </Button>
  ),
};

/**
 * A longer 30s grace window for higher-stakes (but still reversible)
 * deletes — give users relying on assistive tech enough time to reach the
 * Undo action before commit.
 */
export const LongerGraceWindow: Story = {
  name: 'Longer grace window',
  render: () => (
    <Button
      appearance="outlined"
      tone="danger"
      onClick={() =>
        undoToast({
          title: 'Archive emptied',
          description: 'Mnemosyne · 30 seconds to undo',
          duration: 30000,
          onUndo: () => toast.success('Archive restored'),
          onCommit: () => toast('Archive deletion committed'),
        })
      }
    >
      Empty archive
    </Button>
  ),
};

/** Every variation in one canvas — trigger them and compare the toasts. */
export const Playground: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        appearance="outlined"
        tone="secondary"
        onClick={() =>
          undoToast({
            title: 'Gallery deleted',
            description: 'Blue hour · recoverable for 30 days',
            onUndo: () => toast.success('Gallery restored'),
          })
        }
      >
        Delete gallery
      </Button>
      <Button
        appearance="outlined"
        tone="secondary"
        onClick={() =>
          undoToast({
            title: 'Client removed',
            undoLabel: 'Restore',
            icon: <Undo width={16} height={16} />,
            duration: 6000,
          })
        }
      >
        Remove client
      </Button>
      <Button appearance="outlined" tone="secondary" onClick={() => undoToast({ title: 'File moved to trash', icon: null })}>
        Move to trash
      </Button>
    </div>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Delete gallery' });
    undoSpy.mockClear();
    commitSpy.mockClear();

    // Undo rolls back and never commits.
    await userEvent.click(trigger);
    const first = (await toastByTitle('Gallery deleted')).closest('[data-sonner-toast]') as HTMLElement;
    // No close "X": dismissing would quietly commit a destructive action.
    await expect(first.querySelector('[data-close-button]')).toBeNull();
    await userEvent.click(within(first).getByRole('button', { name: 'Undo' }));
    await expect(undoSpy).toHaveBeenCalledTimes(1);
    await expect(await toastByTitle('Gallery restored')).toBeInTheDocument();
    await clearToasts();
    await expect(commitSpy).not.toHaveBeenCalled();

    // Keyboard route inside the grace window: Alt+T jumps to the toasts.
    await userEvent.click(trigger);
    await toastByTitle('Gallery deleted');
    await userEvent.keyboard('{Alt>}t{/Alt}');
    await waitFor(() => expect(document.activeElement?.closest('[data-sonner-toaster]')).not.toBeNull());
    const undo = body().getByRole('button', { name: 'Undo' });
    for (let i = 0; i < 5 && document.activeElement !== undo; i++) await userEvent.tab();
    await expect(undo).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(undoSpy).toHaveBeenCalledTimes(2);
    await clearToasts();

    // Letting it go (dismissed) commits exactly once.
    await userEvent.click(trigger);
    await toastByTitle('Gallery deleted');
    toast.dismiss();
    await waitFor(() => expect(commitSpy).toHaveBeenCalledTimes(1));
    await clearToasts();
    await expect(commitSpy).toHaveBeenCalledTimes(1);
    await expect(undoSpy).toHaveBeenCalledTimes(2);
  },
};
