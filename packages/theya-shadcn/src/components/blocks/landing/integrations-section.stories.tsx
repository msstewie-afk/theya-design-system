import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Archive, Bell, Bookmark, Calendar, ChatBubble, Cloud, Database, Folder, Mail, Notes, Send, Table2Columns } from 'iconoir-react';
import { Button } from '../../ui/button';
import { IntegrationsSection, type Integration } from './integrations-section';
import { integrationsSectionGuidelines } from './integrations-section.guidelines';

// Made-up services (no real brands in Theya's stories).
const INTEGRATIONS: Integration[] = [
  { id: 'postbox', name: 'Postbox', icon: <Mail />, category: 'Email', description: 'Forward a newsletter, read it later.', href: '#postbox' },
  {
    id: 'driftdesk',
    name: 'Driftdesk',
    icon: <ChatBubble />,
    category: 'Chat',
    description: 'Save a link from any channel with one emoji.',
    href: '#driftdesk',
  },
  { id: 'cloudlet', name: 'Cloudlet', icon: <Cloud />, category: 'Storage', description: 'Keep a copy of every saved page.', href: '#cloudlet' },
  { id: 'calendo', name: 'Calendo', icon: <Calendar />, category: 'Productivity', description: 'Block reading time on your calendar.', href: '#calendo' },
  { id: 'sheetline', name: 'Sheetline', icon: <Table2Columns />, category: 'Productivity', description: 'Export a folder as a table.', href: '#sheetline' },
  { id: 'notecraft', name: 'Notecraft', icon: <Notes />, category: 'Productivity', description: 'Send highlights to your notes.', href: '#notecraft' },
  { id: 'relay', name: 'Relay', icon: <Send />, category: 'Chat', description: 'Share a reading list with a team channel.', href: '#relay' },
  { id: 'vaultbox', name: 'Vaultbox', icon: <Archive />, category: 'Storage', description: 'Archive pages that go offline.', href: '#vaultbox' },
  { id: 'pingly', name: 'Pingly', icon: <Bell />, category: 'Email', description: 'A Monday digest of what you saved.', href: '#pingly' },
];

const meta: Meta<typeof IntegrationsSection> = {
  title: 'Patterns: Landing/IntegrationsSection',
  component: IntegrationsSection,
  tags: ['autodocs'],
  parameters: { guidelines: integrationsSectionGuidelines, layout: 'fullscreen' },
  args: {
    eyebrow: 'Integrations',
    title: 'Works with the tools you already use',
    description: 'Save from where you read, send to where you work.',
    integrations: INTEGRATIONS,
    action: (
      <Button appearance="outlined" tone="secondary" asChild>
        <a href="#all">Browse all integrations</a>
      </Button>
    ),
  },
  argTypes: { integrations: { control: false }, product: { control: false }, action: { control: false } },
};
export default meta;
type Story = StoryObj<typeof IntegrationsSection>;

/** Cards filtered by category: All, Email, Chat, Storage, Productivity. */
export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('tab', { name: 'Chat' }));
    const panel = c.getByRole('tabpanel');
    await expect(within(panel).getAllByRole('listitem')).toHaveLength(2);
  },
};

/** The services on a ring around the product's mark. Names are for screen readers; the grid belongs on the integrations page. */
export const Hub: Story = {
  args: { layout: 'hub', integrations: INTEGRATIONS.slice(0, 8), product: <Bookmark aria-label="Bookmarks" role="img" /> },
};

/** Without categories: just the grid. */
export const WithoutFilter: Story = {
  args: { integrations: INTEGRATIONS.slice(0, 6).map(({ category: _c, ...i }) => i), action: undefined },
};

/** A stand-in for a missing mark: any icon works. */
export const Few: Story = {
  args: {
    integrations: [
      INTEGRATIONS[0],
      INTEGRATIONS[2],
      { id: 'db', name: 'Tablebase', icon: <Database />, description: 'Query your saved pages.' },
      { id: 'f', name: 'Foldr', icon: <Folder /> },
    ],
  },
};
