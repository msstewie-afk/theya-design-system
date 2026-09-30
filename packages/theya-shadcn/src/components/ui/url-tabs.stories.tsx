import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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
    values: { control: false, description: 'Valid tab values; an unknown ?tab= falls back to defaultValue.' },
  },
};

export default meta;
type Story = StoryObj<typeof UrlTabs>;

const tabParam = () => new URLSearchParams(window.location.search).get('tab');

/** Rewrite the iframe URL's ?tab= / #hash and tell listeners, like Back would. */
function visit(tab: string | null, hash = '') {
  const params = new URLSearchParams(window.location.search);
  if (tab == null) params.delete('tab');
  else params.set('tab', tab);
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${hash}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const Default: Story = {
  render: () => (
    <UrlTabs defaultValue="overview" values={['overview', 'dns', 'security']} className="w-[400px]">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = window.location.href;
    try {
      visit(null);
      await waitFor(() => expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true'));

      // Switching writes ?tab= and keeps other params and the #fragment.
      visit(null, '#billing');
      await userEvent.click(canvas.getByRole('tab', { name: 'DNS records' }));
      await expect(tabParam()).toBe('dns');
      await expect(new URLSearchParams(window.location.search).get('id')).not.toBeNull();
      await expect(window.location.hash).toBe('#billing');

      // The default tab keeps the URL clean.
      await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
      await expect(tabParam()).toBeNull();

      // Back/forward (popstate) and deep links select the tab from the URL.
      visit('security');
      await waitFor(() => expect(canvas.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true'));
      await expect(canvas.getByText('Security content.')).toBeVisible();

      // An unknown value falls back to the default instead of a blank panel.
      visit('billing-old');
      await waitFor(() => expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true'));
      await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Overview content');
    } finally {
      window.history.replaceState(null, '', original);
    }
  },
};
