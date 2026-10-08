import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { ResourceForm } from './resource-form';

const meta: Meta<typeof ResourceForm> = {
  title: 'Patterns/ResourceForm',
  component: ResourceForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Form heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    sections: { control: false, description: 'Field-group sections, each with its own title/description and a list of field configs.', table: { category: 'Content' } },
    onSubmit: { control: false, description: 'Called with the validated form values.', table: { category: 'Events' } },
    onCancel: { control: false, description: 'Called when the cancel action is activated.', table: { category: 'Events' } },
    submitLabel: { control: 'text', description: 'Label for the submit button.', table: { category: 'Content' } },
    cancelLabel: { control: 'text', description: 'Label for the cancel button.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceForm>;

/**
 * Submitting empty: every required field reports, the error is part of
 * each control's description, focus goes to the first invalid field —
 * including a Select, which react-hook-form alone couldn't focus.
 */
export const CreateDatabase: Story = {
  name: 'Create database',
  args: { onSubmit: fn(), onCancel: fn() },
  render: (args) => (
    <div className="p-6">
      <ResourceForm
        title="Create database"
        description="Provision a new managed database for this project."
        sections={[
          {
            fields: [
              { name: 'name', label: 'Name', required: true, placeholder: 'acme_prod', mono: true },
              {
                name: 'engine',
                label: 'Engine',
                kind: 'select',
                required: true,
                placeholder: 'Select an engine',
                options: [
                  { value: 'postgres', label: 'PostgreSQL 16' },
                  { value: 'mysql', label: 'MySQL 8' },
                  { value: 'redis', label: 'Redis 7' },
                ],
              },
              { name: 'storage', label: 'Storage (GB)', kind: 'number', required: true, min: 1, max: 500, defaultValue: 10 },
              { name: 'description', label: 'Description', kind: 'textarea', placeholder: 'What is this database for?', description: 'Shown to teammates on the databases list.' },
              { name: 'publicAccess', label: 'Public access', kind: 'checkbox', description: 'Allow connections from outside the private network.' },
            ],
          },
        ]}
        onSubmit={args.onSubmit}
        onCancel={args.onCancel}
        submitLabel="Create database"
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole('button', { name: 'Create database' });
    const name = canvas.getByRole('textbox', { name: /^Name/ });
    // Three engines: radios, not a Select (up to 5 options show them all).
    const engine = canvas.getByRole('radiogroup', { name: /^Engine/ });

    await userEvent.click(submit);
    await waitFor(() => expect(name).toHaveAccessibleDescription('Name is required.'));
    await expect(engine).toHaveAccessibleDescription('Select an engine.');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onSubmit).not.toHaveBeenCalled();

    // Two errors -> focus lands on the summary at the top; its links jump
    // to the fields.
    const summary = (await canvas.findByText('Fix 2 fields to continue')).closest('[role="alert"]') as HTMLElement;
    await expect(summary).not.toBeNull();
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(within(summary).getByRole('link', { name: 'Name is required.' }));
    await expect(name).toHaveFocus();

    // Name fixed -> one error left: no summary, focus goes to the Engine radios.
    await userEvent.type(name, 'acme_prod');
    await userEvent.click(submit);
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'PostgreSQL 16' })).toHaveFocus());
    await expect(canvas.queryByText(/Fix \d+ fields/)).toBeNull();
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');

    await userEvent.click(canvas.getByRole('radio', { name: 'PostgreSQL 16' }));
    await waitFor(() => expect(engine).not.toHaveAccessibleDescription('Select an engine.'));
    await userEvent.click(canvas.getByRole('checkbox', { name: /^Public access/ }));
    await userEvent.click(submit);
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({ name: 'acme_prod', engine: 'postgres', storage: 10, description: '', publicAccess: true }),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

/** An optional email may stay empty, but a filled one must be valid. */
export const Sectioned: Story = {
  args: { onSubmit: fn() },
  render: (args) => (
    <div className="p-6">
      <ResourceForm
        title="Create user"
        sections={[
          {
            title: 'Account',
            fields: [
              { name: 'email', label: 'Email', kind: 'email', required: true, placeholder: 'you@seashell.dev' },
              { name: 'password', label: 'Password', kind: 'password', required: true },
              { name: 'recoveryEmail', label: 'Recovery email', kind: 'email', placeholder: 'backup@example.com' },
            ],
          },
          {
            title: 'Access',
            description: 'What this user can do.',
            fields: [
              {
                name: 'role',
                label: 'Role',
                kind: 'select',
                required: true,
                options: [
                  { value: 'admin', label: 'Admin' },
                  { value: 'member', label: 'Member' },
                  { value: 'viewer', label: 'Viewer' },
                ],
              },
            ],
          },
        ]}
        onSubmit={args.onSubmit}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /^Email/ }), 'new@seashell.dev');
    await userEvent.type(canvas.getByLabelText(/^Password/), 'hunter2-hunter2');
    await userEvent.click(canvas.getByRole('radio', { name: 'Viewer' }));

    const recovery = canvas.getByRole('textbox', { name: /^Recovery email/ });
    await userEvent.type(recovery, 'not-an-email');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(recovery).toHaveAccessibleDescription('An email address needs an @, e.g. name@example.com.'));
    await expect(recovery).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    // Empty optional email is fine (it used to fail .email() on '').
    await userEvent.clear(recovery);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({ email: 'new@seashell.dev', password: 'hunter2-hunter2', recoveryEmail: '', role: 'viewer' }),
    );
  },
};
