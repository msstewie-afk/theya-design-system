import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { toast } from './sonner';
import { Button } from './button';
import { toasterGuidelines } from './sonner.guidelines';

/**
 * Toaster (sonner) — mounted once globally in `.storybook/preview.ts`
 * (see its own comment for why), so these stories just fire `toast()` and
 * don't mount their own `<Toaster/>` — a second instance doesn't add a
 * second visible toaster, it silently steals the toast() calls meant for
 * the global one (sonner only delivers to the MOST RECENTLY MOUNTED
 * instance when more than one exists).
 *
 * The toast surface (light, theme-reactive, vs. the fixed dark overlay) is
 * a toolbar control ("Toast theme", top toolbar) wired to the global
 * instance — switch it there to preview `dark`. The `Dark` story below
 * pins it via `parameters.toastTheme` so it always previews dark
 * regardless of the toolbar's current setting.
 *
 * Trigger buttons: `outlined`/`secondary` for a single, neutral toast call
 * (Success, ErrorWithRetry aside, Undo, Promise, Progress, Accented) — the
 * button's own color doesn't try to preview which toast it fires there,
 * only its label does. The multi-kind demos (AllKinds, Dark, Playground,
 * ErrorPersistsUntilDismissed) use `tonal` buttons matched to each toast's
 * own tone instead, so the row of triggers previews the tones at a
 * glance. A `filled`/`danger` button next to an unrelated `success` toast
 * was a real mismatch fixed in this file.
 */
const meta: Meta = {
  title: 'Status & Feedback/Toaster',
  tags: ['autodocs'],
  parameters: {
    guidelines: toasterGuidelines,
    docs: { description: { component: 'Mount <Toaster /> once near the app root (already done globally for this Storybook), then trigger toasts with `toast` from this module.' } },
  },
  argTypes: {
    dark: {
      control: 'boolean',
      description:
        'Forces the fixed dark-overlay surface regardless of the page\'s own light/dark theme — the toast always reads the same, like a floating notification. Default false (theme-reactive surface).',
    },
    position: { control: 'select', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'], description: 'Defaults to "bottom-right".' },
    closeButton: { control: 'boolean', description: 'Every toast gets a close button. Default true.' },
    toastOptions: { control: false, description: 'Default options applied to every toast (className, duration, etc).' },
  },
};

export default meta;
type Story = StoryObj;

/** Success toast with a description. */
const page = () => within(document.body);

async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

export const Success: Story = {
  render: () => (
    <Button appearance="outlined" tone="secondary" onClick={() => toast.success('Certificate issued', { description: 'shop.seashell.dev · valid 90 days' })}>
      Issue certificate
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Issue certificate' }));
    await expect(await page().findByText('Certificate issued')).toBeInTheDocument();
    await expect(page().getByText('shop.seashell.dev · valid 90 days')).toBeInTheDocument();
    // Toasts land in a polite live region.
    await expect(page().getByText('Certificate issued').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    await clearToasts();
  },
};

/** Error toast with a retry action. Persists until dismissed (see toast.error's own JSDoc). */
export const ErrorWithRetry: Story = {
  name: 'Error with retry',
  render: () => (
    <Button
      appearance="outlined"
      tone="danger"
      onClick={() =>
        toast.error("Couldn't reissue certificate", {
          description: 'api.seashell.dev · DNS lookup failed',
          action: { label: 'Retry', onClick: () => toast.message('Retrying…') },
        })
      }
    >
      Reissue (will fail)
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Reissue (will fail)' }));
    const title = await page().findByText("Couldn't reissue certificate");
    const item = title.closest('[data-sonner-toast]') as HTMLElement;
    // Errors persist and always carry a close button.
    await expect(within(item).getByRole('button', { name: /close/i })).toBeInTheDocument();
    await userEvent.click(within(item).getByRole('button', { name: 'Retry' }));
    await expect(await page().findByText('Retrying…')).toBeInTheDocument();
    await clearToasts();
  },
};

/** Optimistic action with an Undo button — see undoToast for the packaged version of this pattern. */
export const Undo: Story = {
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        toast('Site deleted', {
          description: 'legacy.seashell.dev · recoverable for 30 days',
          action: { label: 'Undo', onClick: () => toast.success('Restored') },
        })
      }
    >
      Delete site
    </Button>
  ),
};

/** Promise toast: loading → success / error. */
export const PromiseToast: Story = {
  name: 'Promise',
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
          loading: 'Deploying…',
          success: 'Deploy complete',
          error: 'Deploy failed',
        })
      }
    >
      Deploy site
    </Button>
  ),
};

/**
 * Progress toast: reserved for long-running operations (>10s) that report a
 * percentage. See `toast.progress` in sonner.tsx — throttle real updates to
 * ~every 10%, not every tick (the interval below stands in for that).
 */
export const Progress: Story = {
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() => {
        const id = toast.progress('Exporting sites…', { value: 0, description: 'shop.seashell.dev · 12 sites' });
        let pct = 0;
        const tick = () => {
          pct += 20;
          if (pct >= 100) {
            toast.success('Export complete', { id, description: '12 sites · shop.seashell.dev' });
            return;
          }
          toast.progress('Exporting sites…', { id, value: pct, description: 'shop.seashell.dev · 12 sites' });
          setTimeout(tick, 600);
        };
        setTimeout(tick, 600);
      }}
    >
      Export sites (progress)
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Export sites (progress)' }));
    // The bar is named after the toast, not an anonymous progressbar.
    const bar = await page().findByRole('progressbar', { name: 'Exporting sites…' });
    await expect(bar).toBeInTheDocument();
    await expect(await page().findByText('Export complete', {}, { timeout: 6000 })).toBeInTheDocument();
    await clearToasts();
  },
};

/**
 * Progress toast with an opt-in ghost action, pinned top-right — the one
 * case that needs a button on a progress toast (a test-mode timer where
 * "Confirm" keeps a change before it auto-reverts).
 */
export const ProgressWithConfirm: Story = {
  name: 'Progress with confirm',
  render: () => (
    <Button
      appearance="outlined"
      tone="secondary"
      onClick={() =>
        toast.progress('Reverting test-mode config in 40s…', {
          value: 40,
          description: 'Confirm to keep it — otherwise it rolls back automatically.',
          action: { label: 'Confirm', onClick: () => toast.success('Configuration kept') },
        })
      }
    >
      Apply config (test mode)
    </Button>
  ),
};

/**
 * `toast.accent` — the sixth, odd-one-out kind from the Figma spec: a fixed
 * light-blue surface for a message worth noticing rather than a status
 * about an action just taken. Stays light-blue even with the Toaster's
 * `dark` mode on.
 */
export const Accented: Story = {
  render: () => (
    <Button appearance="outlined" tone="secondary" onClick={() => toast.accent('Accented message subject', { description: 'Accented message text.' })}>
      Show accented toast
    </Button>
  ),
};

/**
 * The six kinds from the Figma spec node (Feedback/Toaster), triggered
 * together for comparison: progress, error, success, warning, info,
 * accented.
 */
export const AllKinds: Story = {
  name: 'All kinds (Figma spec)',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        appearance="tonal"
        tone="primary"
        onClick={() => toast.progress('Running step with progress indication', { value: 75, description: 'detailed progress' })}
      >
        Progress
      </Button>
      <Button appearance="tonal" tone="danger" onClick={() => toast.error('Failed step with error', { description: 'Error message text.' })}>
        Error
      </Button>
      <Button appearance="tonal" tone="success" onClick={() => toast.success('Finished step with success (done)', { description: 'Success message text.' })}>
        Success
      </Button>
      <Button appearance="tonal" tone="warning" onClick={() => toast.warning('Step with warning', { description: 'Warning message text.' })}>
        Warning
      </Button>
      <Button appearance="tonal" tone="info" onClick={() => toast.info('Step with info', { description: 'Info message text.' })}>
        Info
      </Button>
      <Button appearance="tonal" tone="primary" onClick={() => toast.accent('Accented message subject', { description: 'Accented message text.' })}>
        Accented
      </Button>
    </div>
  ),
};

/**
 * Pins the global Toaster to `dark` for this story via `parameters.toastTheme`
 * (see the file-level comment) — the fixed dark-overlay surface, same idea as
 * Tooltip's always-dark surface: the toast reads the same regardless of the
 * page's own theme, rather than following it.
 */
export const Dark: Story = {
  parameters: { toastTheme: 'dark' },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button appearance="tonal" tone="success" onClick={() => toast.success('Certificate issued', { description: 'shop.seashell.dev · 90 days' })}>
        Success
      </Button>
      <Button appearance="tonal" tone="danger" onClick={() => toast.error("Couldn't reissue certificate")}>
        Error
      </Button>
      <Button appearance="tonal" tone="warning" onClick={() => toast.warning('Approaching quota')}>
        Warning
      </Button>
      <Button appearance="tonal" tone="secondary" onClick={() => toast('Site deleted', { description: 'legacy.seashell.dev · recoverable for 30 days', action: { label: 'Undo', onClick: () => toast.success('Restored') } })}>
        Undo
      </Button>
    </div>
  ),
};

/** Every toast kind in one place, for a quick visual sweep. */
export const Playground: Story = {
  render: () => (
    <div className="flex min-h-[220px] flex-wrap items-center gap-3">
      <Button appearance="tonal" tone="secondary" onClick={() => toast('Saved')}>
        Show toast
      </Button>
      <Button appearance="tonal" tone="success" onClick={() => toast.success('Certificate issued')}>
        Show success
      </Button>
      <Button appearance="tonal" tone="warning" onClick={() => toast.warning('Disk almost full')}>
        Show warning
      </Button>
      <Button appearance="tonal" tone="danger" onClick={() => toast.error('Deploy failed')}>
        Show error
      </Button>
      <Button appearance="tonal" tone="info" onClick={() => toast.info('New region available')}>
        Show info
      </Button>
      <Button appearance="tonal" tone="primary" onClick={() => toast.accent('Accented message subject')}>
        Show accented
      </Button>
    </div>
  ),
};

/**
 * The Toaster now shows a close button on every toast by default (pass
 * `closeButton={false}` on `<Toaster/>` to turn it off globally). What
 * still sets `error`/`warning` apart: `toast.error` persists until
 * dismissed rather than expiring on a timer, since an error scrolled past
 * is an error hit again — everything else (including this story's
 * `success`) still auto-dismisses on its own timer, close button or not.
 */
export const ErrorPersistsUntilDismissed: Story = {
  name: 'Error persists until dismissed',
  render: () => (
    <div className="flex min-h-[260px] flex-wrap items-center gap-3">
      <Button appearance="tonal" tone="danger" onClick={() => toast.error('Couldn’t reissue certificate', { description: 'shop.seashell.dev — the CA rejected the request.' })}>
        Show persistent error
      </Button>
      <Button appearance="tonal" tone="danger" onClick={() => toast.error('Retrying…', { duration: 3000, description: 'Expires on its own.' })}>
        Show transient error
      </Button>
      <Button appearance="tonal" tone="warning" onClick={() => toast.warning('Disk almost full')}>
        Show warning (auto-dismisses, still closeable)
      </Button>
      <Button appearance="tonal" tone="success" onClick={() => toast.success('Saved')}>
        Show success (auto-dismisses, still closeable)
      </Button>
    </div>
  ),
};
