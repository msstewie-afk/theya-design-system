import type { Meta, StoryObj } from '@storybook/react';
import { AuditLog } from './audit-log';

const meta: Meta<typeof AuditLog> = {
  title: 'Patterns/AuditLog',
  component: AuditLog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Section heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    events: { control: false, description: 'The events, newest first. Defaults to a seeded feed.', table: { category: 'Content' } },
    categories: { control: false, description: 'Category facet options for the filter.', table: { category: 'Content' } },
    loading: { control: 'boolean', description: 'Shows a loading skeleton instead of the event list.', table: { category: 'State' } },
    searchPlaceholder: { control: 'text', description: 'Placeholder for the search input.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof AuditLog>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog loading />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog events={[]} />
    </div>
  ),
};
