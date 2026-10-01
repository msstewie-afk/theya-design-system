import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { toast } from '@/components/ui/sonner';
import { ApiKeys } from './api-keys';

const meta: Meta<typeof ApiKeys> = {
  title: 'Patterns/ApiKeys',
  component: ApiKeys,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Section heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    keys: { control: false, description: 'API keys to list. Uncontrolled demo data is used when omitted.', table: { category: 'Content' } },
    onCreate: { control: false, description: 'Called with the new key name; return (or resolve to) the plaintext secret to show once.', table: { category: 'Events' } },
    onRevoke: { control: false, description: 'Called with the key being revoked.', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof ApiKeys>;

const body = () => within(document.body);
const toastByTitle = (title: string) => body().findByText(title, { selector: '[data-title]' });

/** Dismiss every toast and wait until none are left (keeps stories isolated). */
async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

/** Key names in table order. */
const keyNames = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);

/** Creates a key through the form and returns the one-time secret shown in the dialog. */
async function createKey(canvasElement: HTMLElement, name: string) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByLabelText('Key name'), name);
  await userEvent.click(canvas.getByRole('button', { name: 'Create key' }));
  const dialog = await body().findByRole('dialog', { name: 'Copy your new key' });
  // Shown exactly once, already revealed.
  await expect(within(dialog).getByRole('button', { name: `Show ${name}` })).toHaveAttribute('aria-pressed', 'true');
  const secret = dialog.querySelector('code')?.textContent ?? '';
  await expect(secret).toMatch(/^[0-9a-f]{48}$/);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
  await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  return secret;
}

/** Create → copy-once dialog → revoke behind a confirm → undo puts the key back in place. */
export const Default: Story = {
  args: { onRevoke: fn() },
  render: (args) => (
    <div className="px-4 py-6 md:px-6">
      <ApiKeys {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(keyNames(canvasElement)).toEqual(['Production deploy', 'CI pipeline', 'Legacy script']);
    await expect(canvas.getByText('active keys', { exact: false })).toHaveTextContent('3 active keys');

    // Whitespace-only names can't be submitted.
    const create = canvas.getByRole('button', { name: 'Create key' });
    await expect(create).toBeDisabled();
    await userEvent.type(canvas.getByLabelText('Key name'), '   ');
    await expect(create).toBeDisabled();
    await userEvent.clear(canvas.getByLabelText('Key name'));

    // Create: the full secret only in the dialog, the masked tail in the table.
    const secret = await createKey(canvasElement, 'Staging');
    await expect(await toastByTitle('Key created')).toBeInTheDocument();
    await expect(keyNames(canvasElement)[0]).toBe('Staging');
    const newRow = canvas.getAllByRole('row')[1];
    await expect(within(newRow).getAllByRole('cell')[1]).toHaveTextContent(`••••••••••${secret.slice(-4)}`);
    await expect(canvasElement).not.toHaveTextContent(secret);
    await expect(canvas.getByLabelText('Key name')).toHaveValue('');
    await expect(canvas.getByText('active keys', { exact: false })).toHaveTextContent('4 active keys');
    await clearToasts();

    // Revoke sits behind a confirm; cancelling changes nothing.
    await userEvent.click(canvas.getByRole('button', { name: 'Revoke CI pipeline' }));
    let confirm = await body().findByRole('alertdialog', { name: 'Revoke "CI pipeline"?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('alertdialog')).toBeNull());
    await expect(keyNames(canvasElement)).toContain('CI pipeline');
    await expect(args.onRevoke).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Revoke CI pipeline' }));
    confirm = await body().findByRole('alertdialog', { name: 'Revoke "CI pipeline"?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Revoke' }));
    await waitFor(() => expect(keyNames(canvasElement)).toEqual(['Staging', 'Production deploy', 'Legacy script']));
    await expect(args.onRevoke).toHaveBeenCalledWith(expect.objectContaining({ name: 'CI pipeline' }));
    // The row that held the trigger is gone — focus lands on the section, not <body>.
    await waitFor(() => expect(document.activeElement).toBe(canvasElement.querySelector('section')));

    // Undo restores it at its old position.
    const revoked = (await toastByTitle('Key revoked')).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(revoked).getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(keyNames(canvasElement)).toEqual(['Staging', 'Production deploy', 'CI pipeline', 'Legacy script']));
    await clearToasts();
  },
};

/** No keys: the empty state gives way to the table once the first key exists. */
export const Empty: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ApiKeys keys={[]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'No API keys yet' })).toBeInTheDocument();
    await expect(canvas.queryByRole('table')).toBeNull();
    await createKey(canvasElement, 'First key');
    await expect(canvas.queryByRole('heading', { name: 'No API keys yet' })).toBeNull();
    await expect(keyNames(canvasElement)).toEqual(['First key']);
    await expect(canvas.getByText('active key', { exact: false })).toHaveTextContent('1 active key');
    await clearToasts();
  },
};
