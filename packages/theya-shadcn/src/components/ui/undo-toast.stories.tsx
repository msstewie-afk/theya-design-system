import type { Meta, StoryObj } from '@storybook/react';
import { Undo } from 'iconoir-react';
import { toast } from './sonner';
import { undoToast } from './undo-toast';
import { Button } from './button';

/**
 * undoToast — the optimistic-destructive pattern over sonner. Apply the
 * change immediately, then call `undoToast({...})` to pop a toast with an
 * "Undo" action and a grace window: clicking Undo runs `onUndo` (roll
 * back); otherwise, when the toast auto-closes after `duration` (10s) or is
 * dismissed, `onCommit` runs once to finalise. It is a function, not a
 * component — these stories are Buttons that call it. The global
 * `<Toaster/>` (mounted in `.storybook/preview.ts`) renders the toast, so
 * these stories don't mount their own (see Feedback/Toaster's own comment
 * for why a second instance would just eat the calls). Use for reversible
 * deletes (sites, DNS records, files); for high-stakes/irreversible actions
 * use a typed-confirm Dialog instead.
 */
const meta = {
  title: 'Feedback/Undo toast',
  component: Button,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default flow: delete optimistically, then offer a 10s undo. Undo
 * confirms a restore; letting it lapse commits.
 */
export const Default: Story = {
  render: () => (
    <Button
      type="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Site deleted',
          description: 'legacy.seashell.dev · recoverable for 30 days',
          onUndo: () => toast.success('Site restored'),
          onCommit: () => toast('Delete committed'),
        })
      }
    >
      Delete site
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
      type="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Backup deleted',
          onCommit: () => toast('Backup removed'),
        })
      }
    >
      Delete backup
    </Button>
  ),
};

/**
 * Override `undoLabel`, `icon`, and shorten the grace window. Here a DNS
 * record is removed with a 6s window, a restore label, and a non-trash
 * glyph.
 */
export const CustomLabelAndIcon: Story = {
  name: 'Custom label and icon',
  render: () => (
    <Button
      type="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'Record removed',
          description: 'MX · mail.seashell.dev',
          duration: 6000,
          undoLabel: 'Restore',
          icon: <Undo width={16} height={16} />,
          onUndo: () => toast.success('Record restored'),
          onCommit: () => toast('Record removed'),
        })
      }
    >
      Remove DNS record
    </Button>
  ),
};

/**
 * Pass `icon={null}` to drop the leading glyph entirely — useful when the
 * title already names the object and you want the most compact toast.
 */
export const WithoutIcon: Story = {
  name: 'Without icon',
  render: () => (
    <Button
      type="outlined"
      tone="secondary"
      onClick={() =>
        undoToast({
          title: 'File moved to trash',
          description: 'public_html/old-index.php',
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
      type="outlined"
      tone="danger"
      onClick={() =>
        undoToast({
          title: 'Database dropped',
          description: 'acme_prod · keep 30s to undo',
          duration: 30000,
          onUndo: () => toast.success('Database restored'),
          onCommit: () => toast('Database drop committed'),
        })
      }
    >
      Drop database
    </Button>
  ),
};

/** Every variation in one canvas — trigger them and compare the toasts. */
export const Playground: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="outlined"
        tone="secondary"
        onClick={() =>
          undoToast({
            title: 'Site deleted',
            description: 'legacy.seashell.dev · recoverable for 30 days',
            onUndo: () => toast.success('Site restored'),
          })
        }
      >
        Delete site
      </Button>
      <Button
        type="outlined"
        tone="secondary"
        onClick={() =>
          undoToast({
            title: 'Record removed',
            undoLabel: 'Restore',
            icon: <Undo width={16} height={16} />,
            duration: 6000,
          })
        }
      >
        Remove DNS record
      </Button>
      <Button type="outlined" tone="secondary" onClick={() => undoToast({ title: 'File moved to trash', icon: null })}>
        Move to trash
      </Button>
    </div>
  ),
};
