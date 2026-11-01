import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { ResourceForm } from './resource-form';
import { resourceFormGuidelines } from './resource-form.guidelines';

const meta: Meta<typeof ResourceForm> = {
  title: 'Patterns/ResourceForm',
  component: ResourceForm,
  tags: ['autodocs'],
  parameters: {
    guidelines: resourceFormGuidelines,
    docs: {
      description: {
        component:
          "A create or edit form built from a list of fields in sections, with validation and an error summary on submit.",
      },
    },
    layout: 'fullscreen',
  },
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
  name: 'Create gallery',
  args: { onSubmit: fn(), onCancel: fn() },
  render: (args) => (
    <div className="p-6">
      <ResourceForm
        title="Create gallery"
        description="Set up a new gallery to share with a client."
        sections={[
          {
            fields: [
              { name: 'name', label: 'Name', required: true, placeholder: 'Golden hour' },
              {
                name: 'studio',
                label: 'Studio',
                kind: 'select',
                required: true,
                placeholder: 'Select a studio',
                options: [
                  { value: 'helios', label: 'Helios Studio' },
                  { value: 'selene', label: 'Selene Weddings' },
                  { value: 'eos', label: 'Eos Portraits' },
                ],
              },
              { name: 'storage', label: 'Storage (GB)', kind: 'number', required: true, min: 1, max: 384, defaultValue: 10 },
              { name: 'description', label: 'Description', kind: 'textarea', placeholder: 'What is this gallery for?', description: 'Shown to teammates on the galleries list.' },
              { name: 'allowDownloads', label: 'Allow downloads', kind: 'checkbox', description: 'Clients can download full-resolution files from the portal.' },
            ],
          },
        ]}
        onSubmit={args.onSubmit}
        onCancel={args.onCancel}
        submitLabel="Create gallery"
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole('button', { name: 'Create gallery' });
    const name = canvas.getByRole('textbox', { name: /^Name/ });
    // Three studios: radios, not a Select (up to 5 options show them all).
    const studio = canvas.getByRole('radiogroup', { name: /^Studio/ });

    await userEvent.click(submit);
    await waitFor(() => expect(name).toHaveAccessibleDescription('Name is required.'));
    await expect(studio).toHaveAccessibleDescription('Select a studio.');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onSubmit).not.toHaveBeenCalled();

    // Two errors -> focus lands on the summary at the top; its links jump
    // to the fields.
    const summary = (await canvas.findByText('Fix 2 fields to continue')).closest('[role="alert"]') as HTMLElement;
    await expect(summary).not.toBeNull();
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(within(summary).getByRole('link', { name: 'Name is required.' }));
    await expect(name).toHaveFocus();

    // Name fixed -> one error left: no summary, focus goes to the Studio radios.
    await userEvent.type(name, 'Golden hour');
    await userEvent.click(submit);
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Helios Studio' })).toHaveFocus());
    await expect(canvas.queryByText(/Fix \d+ fields/)).toBeNull();
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');

    await userEvent.click(canvas.getByRole('radio', { name: 'Helios Studio' }));
    await waitFor(() => expect(studio).not.toHaveAccessibleDescription('Select a studio.'));
    await userEvent.click(canvas.getByRole('checkbox', { name: /^Allow downloads/ }));
    await userEvent.click(submit);
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({ name: 'Golden hour', studio: 'helios', storage: 10, description: '', allowDownloads: true }),
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
              { name: 'email', label: 'Email', kind: 'email', required: true, placeholder: 'you@aether.photo' },
              { name: 'password', label: 'Password', kind: 'password', required: true },
              { name: 'recoveryEmail', label: 'Recovery email', kind: 'email', placeholder: 'personal@example.com' },
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
    await userEvent.type(canvas.getByRole('textbox', { name: /^Email/ }), 'elio@aether.photo');
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
      expect(args.onSubmit).toHaveBeenCalledWith({ email: 'elio@aether.photo', password: 'hunter2-hunter2', recoveryEmail: '', role: 'viewer' }),
    );
  },
};
