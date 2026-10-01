import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { DetailScreen } from './detail-screen';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const meta: Meta<typeof DetailScreen> = {
  title: 'Patterns/DetailScreen',
  component: DetailScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'The resource identifier; rendered mono when it looks like a domain/id.', table: { category: 'Content' } },
    status: { control: false, description: 'Status indicator shown beside the title, e.g. a StatusDot or Badge.', table: { category: 'Content' } },
    meta: { control: false, description: 'A row of small muted facts, joined by DotSeparator between items.', table: { category: 'Content' } },
    actions: { control: false, description: 'Right-aligned action row; wraps below the title on mobile.', table: { category: 'Content' } },
    stats: { control: false, description: 'Optional KPI factbar: 2-up at base, 4-up from sm.', table: { category: 'Content' } },
    children: { control: false, description: 'Page content rendered below the header.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof DetailScreen>;

export const Default: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
    <DetailScreen
      title="shop.seashell.dev"
      status={{ tone: 'success', label: 'Running' }}
      meta={['eu-west-1', 'Created Mar 2026', 'v2.4.0']}
      actions={
        <>
          <Button appearance="outlined" tone="secondary">
            Restart
          </Button>
          <Button appearance="filled" tone="primary">
            Deploy
          </Button>
        </>
      }
      stats={[
        { label: 'Visits', value: '128k' },
        { label: 'Uptime', value: '99.98%', tone: 'success' },
        { label: 'Replicas', value: 3 },
        { label: 'Storage', value: '4.2 GB', hint: 'of 10 GB' },
      ]}
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Overview content goes here.</p>
        </TabsContent>
        <TabsContent value="logs">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Logs content goes here.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Settings content goes here.</p>
        </TabsContent>
      </Tabs>
    </DetailScreen>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Page heading, status as text (not color alone), actions, facts.
    await expect(canvas.getByRole('heading', { level: 1, name: 'shop.seashell.dev' })).toBeInTheDocument();
    await expect(canvas.getByText('Running')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Deploy' })).toBeInTheDocument();
    await expect(canvas.getByText('of 10 GB')).toBeInTheDocument();
    // The body's Tabs work by keyboard inside the screen.
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Logs' })).toHaveAttribute('aria-selected', 'true'));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Logs content goes here.');
  },
};
