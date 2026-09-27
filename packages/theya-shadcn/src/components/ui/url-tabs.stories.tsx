import type { Meta, StoryObj } from '@storybook/react';
import { UrlTabs } from './url-tabs';
import { TabsList, TabsTrigger, TabsContent } from './tabs';

const meta: Meta<typeof UrlTabs> = {
  title: 'Navigation/UrlTabs',
  component: UrlTabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Keeps a Tabs value in a URL query param (?tab=...) via the History API by default. Framework-agnostic.',
      },
    },
  },
  argTypes: {
    param: { control: 'text', description: 'URL query param name that holds the active tab. Default "tab".' },
    defaultValue: { control: 'text', description: 'Tab value used when the param is absent from the URL.' },
    navigate: { control: false, description: 'Override how the param is written (defaults to the History API).' },
  },
};

export default meta;
type Story = StoryObj<typeof UrlTabs>;

export const Default: Story = {
  render: () => (
    <UrlTabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="dns">DNS records</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Overview content — switching tabs updates the URL's ?tab= param.
      </TabsContent>
      <TabsContent value="dns" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        DNS records content.
      </TabsContent>
      <TabsContent value="security" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Security content.
      </TabsContent>
    </UrlTabs>
  ),
};
