import type { Meta, StoryObj } from '@storybook/react';
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

export const CreateDatabase: Story = {
  name: 'Create database',
  render: () => (
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
              { name: 'description', label: 'Description', kind: 'textarea', placeholder: 'What is this database for?', description: 'Optional — shown to teammates on the databases list.' },
              { name: 'publicAccess', label: 'Public access', kind: 'switch', description: 'Allow connections from outside the private network.' },
            ],
          },
        ]}
        onSubmit={async (values) => alert(JSON.stringify(values, null, 2))}
        onCancel={() => alert('Cancelled')}
        submitLabel="Create database"
      />
    </div>
  ),
};

export const Sectioned: Story = {
  render: () => (
    <div className="p-6">
      <ResourceForm
        title="Create user"
        sections={[
          {
            title: 'Account',
            fields: [
              { name: 'email', label: 'Email', kind: 'email', required: true, placeholder: 'you@seashell.dev' },
              { name: 'password', label: 'Password', kind: 'password', required: true },
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
        onSubmit={async (values) => alert(JSON.stringify(values, null, 2))}
      />
    </div>
  ),
};
