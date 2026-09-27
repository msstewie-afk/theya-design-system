import type { Meta, StoryObj } from '@storybook/react';
import { ApiKeys } from './api-keys';
import { Toaster } from '@/components/ui/sonner';

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

export const Default: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <Toaster />
      <ApiKeys />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <Toaster />
      <ApiKeys keys={[]} />
    </div>
  ),
};
