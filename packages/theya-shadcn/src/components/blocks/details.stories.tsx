import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Details } from './details';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { detailsGuidelines } from './details.guidelines';

const meta: Meta<typeof Details> = {
  title: 'Patterns/Details',
  component: Details,
  tags: ['autodocs'],
  parameters: {
    guidelines: detailsGuidelines,
    docs: {
      description: {
        component:
          "The page of one object: a header with its status and actions, a row of key facts and numbers, then the content — usually tabs.",
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text', description: 'The resource name or identifier; rendered mono when it looks like a portal address/id.', table: { category: 'Content' } },
    status: { control: false, description: 'Status indicator shown beside the title, e.g. a StatusDot or Badge.', table: { category: 'Content' } },
    meta: { control: false, description: 'A row of small muted facts, joined by DotSeparator between items.', table: { category: 'Content' } },
    actions: { control: false, description: 'Right-aligned action row; wraps below the title on mobile.', table: { category: 'Content' } },
    stats: { control: false, description: 'Optional KPI factbar: 2-up at base, 4-up from sm.', table: { category: 'Content' } },
    children: { control: false, description: 'Page content rendered below the header.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof Details>;

/** A gallery's page: the title with its status and Share / Export actions, a line of facts, four key numbers, then tabs for the content below. */
export const Default: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
    <Details
      title="Golden hour"
      status={{ tone: 'success', label: 'Published' }}
      meta={['Helios Studio', 'Shot Mar 2026', <span key="portal" className="font-mono">helios.aether.photo</span>]}
      actions={
        <>
          <Button appearance="outlined" tone="secondary">
            Share
          </Button>
          <Button appearance="filled" tone="primary">
            Export
          </Button>
        </>
      }
      stats={[
        { label: 'Photos', value: 248 },
        { label: 'Views', value: '12.8k' },
        { label: 'Downloads', value: 342 },
        { label: 'Storage', value: '4.2 GB', hint: 'of 384 GB' },
      ]}
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Overview content goes here.</p>
        </TabsContent>
        <TabsContent value="photos">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Photos content goes here.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="py-4 font-body text-body-s text-[var(--color-text-text-subtler)]">Settings content goes here.</p>
        </TabsContent>
      </Tabs>
    </Details>
    </div>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Page heading, status as text (not color alone), actions, facts.
    await expect(canvas.getByRole('heading', { level: 1, name: 'Golden hour' })).toBeInTheDocument();
    await expect(canvas.getByText('Published')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    await expect(canvas.getByText('of 384 GB')).toBeInTheDocument();
    // The body's Tabs work by keyboard inside the screen.
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Photos' })).toHaveAttribute('aria-selected', 'true'));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Photos content goes here.');
  },
};
