import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Globe, ShieldCheck, Settings } from 'iconoir-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { tabsGuidelines } from './tabs.guidelines';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Switches between views of the same object — Overview, Settings, Logs — two to about six sections people move between in any order.",
      },
    },
    guidelines: tabsGuidelines,
  },
  argTypes: {
    value: { control: false, description: 'Controlled active tab value.' },
    defaultValue: { control: false, description: 'Uncontrolled initial active tab value.' },
    onValueChange: { control: false, description: 'Fires with the new value when the active tab changes.' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Layout direction of the tab list.' },
    activationMode: { control: 'inline-radio', options: ['automatic', 'manual'], description: 'automatic activates a focused tab immediately; manual requires Enter/Space.' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/** Underline tabs, with the active one underlined. The list is one Tab stop; the arrow keys, Home and End move between tabs and switch the panel. */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="picks">Client picks</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Overview content.
      </TabsContent>
      <TabsContent value="picks" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Client picks content.
      </TabsContent>
      <TabsContent value="security" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Security content.
      </TabsContent>
    </Tabs>
  ),
  // Roving focus: one Tab stop, arrows/Home/End move and activate (automatic mode), wraps.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [overview, picks, security] = ['Overview', 'Client picks', 'Security'].map((name) =>
      canvas.getByRole('tab', { name }),
    );

    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');
    await expect(picks).toHaveFocus();
    await expect(picks).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Client picks content.');

    await userEvent.keyboard('{End}');
    await expect(security).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(security).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(overview).toHaveFocus();

    // Tab leaves the tablist and lands on the panel, not the next tab.
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

/** A `disabled` tab stays visible but is skipped by the arrow keys and can't be opened. */
export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="picks" disabled>
          Client picks
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Overview content.
      </TabsContent>
    </Tabs>
  ),
  // Disabled tab: announced as disabled, skipped by arrow keys, never activated.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const picks = canvas.getByRole('tab', { name: 'Client picks' });

    await expect(picks).toHaveAttribute('aria-disabled', 'true');
    // Radix's button-only attributes must not leak onto the div (nested-interactive fix).
    await expect(picks).not.toHaveAttribute('type');
    await expect(picks).not.toHaveAttribute('disabled');

    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveFocus();
    await expect(picks).toHaveAttribute('aria-selected', 'false');
  },
};

/** A leading icon per trigger. */
export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-[400px]">
      <TabsList>
        <TabsTrigger value="overview" icon={<Globe />}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="licenses" icon={<ShieldCheck />}>
          Licenses
        </TabsTrigger>
        <TabsTrigger value="picks" icon={<Settings />}>
          Access
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Selene Weddings · 48 photos.
      </TabsContent>
      <TabsContent value="licenses" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Print license valid for 74 days.
      </TabsContent>
      <TabsContent value="picks" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        4 clients have access.
      </TabsContent>
    </Tabs>
  ),
};

/** A count Badge composed directly after the label — no dedicated prop needed, TabsTrigger is a plain flex row. */
export const WithBadge: Story = {
  name: 'With badge',
  render: () => (
    <Tabs defaultValue="logs" className="w-full max-w-[400px]">
      <TabsList>
        <TabsTrigger value="logs">
          Logs
          <Badge tone="neutral">128</Badge>
        </TabsTrigger>
        <TabsTrigger value="alerts">
          Alerts
          <Badge tone="danger">
            <StatusDot tone="danger" />3 firing
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="logs" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        128 request log lines in the last hour.
      </TabsContent>
      <TabsContent value="alerts" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        3 alerts firing · oldest 12 minutes ago.
      </TabsContent>
    </Tabs>
  ),
};

/** `onClose` renders a trailing close control (e.g. browser-style closable tabs). Removing the active tab falls back to the first remaining one. */
function ClosableDemo() {
  const [tabs, setTabs] = useState([
    { value: 'draft-1', label: 'Draft 1' },
    { value: 'draft-2', label: 'Draft 2' },
    { value: 'draft-3', label: 'Draft 3' },
  ]);
  const [active, setActive] = useState('draft-1');

  const close = (value: string) => {
    const next = tabs.filter((t) => t.value !== value);
    setTabs(next);
    if (active === value && next.length > 0) setActive(next[0].value);
  };

  if (tabs.length === 0) return <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">All tabs closed.</p>;

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full max-w-[400px]">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} onClose={() => close(tab.value)} closeLabel={`Close ${tab.label}`}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="p-3 font-body text-body-s text-[var(--color-text-text)]">
          {tab.label} content.
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** `onClose` adds a close button to each tab; Delete or Backspace on a focused tab closes it too, and focus moves to the next tab. */
export const Closable: Story = {
  render: () => <ClosableDemo />,
  // APG deletable tabs: pointer "×" closes; Delete on the focused tab closes
  // it and moves focus to the neighbouring tab (not <body>).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const draft1 = canvas.getByRole('tab', { name: 'Draft 1' });
    await expect(draft1).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace');

    await userEvent.click(canvas.getByTitle('Close Draft 1'));
    await expect(canvas.queryByRole('tab', { name: 'Draft 1' })).toBeNull();
    await expect(canvas.getByRole('tab', { name: 'Draft 2' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.tab();
    await expect(canvas.getByRole('tab', { name: 'Draft 2' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    await expect(canvas.queryByRole('tab', { name: 'Draft 2' })).toBeNull();
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Draft 3' })).toHaveFocus());
    await expect(canvas.getAllByRole('tab')).toHaveLength(1);
  },
};

/** Icon-only triggers still need an accessible name — each carries an `aria-label`. */
export const IconOnly: Story = {
  name: 'Icon only',
  render: () => (
    <Tabs defaultValue="overview" className="w-[200px]">
      <TabsList aria-label="Gallery sections">
        <TabsTrigger value="overview" aria-label="Overview">
          <Globe />
        </TabsTrigger>
        <TabsTrigger value="licenses" aria-label="Licenses">
          <ShieldCheck />
        </TabsTrigger>
        <TabsTrigger value="picks" aria-label="Access">
          <Settings />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Selene Weddings · 48 photos.
      </TabsContent>
      <TabsContent value="licenses" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        Print license valid for 74 days.
      </TabsContent>
      <TabsContent value="picks" className="p-3 font-body text-body-s text-[var(--color-text-text)]">
        4 clients have access.
      </TabsContent>
    </Tabs>
  ),
};

/**
 * `variant="chips"`: segmented tabs on a soft track. A raised pill marks the active
 * tab and springs to the tab under the mouse.
 */
export const Chips: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-[400px]">
      <TabsList variant="chips" aria-label="Gallery sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="picks">Client picks</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-4 font-body text-body-m text-[var(--color-text-text-subtle)]">Views and downloads for the last 30 days.</TabsContent>
      <TabsContent value="picks" className="pt-4 font-body text-body-m text-[var(--color-text-text-subtle)]">Photos the client marked for print.</TabsContent>
      <TabsContent value="security" className="pt-4 font-body text-body-m text-[var(--color-text-text-subtle)]">Licenses and access rules.</TabsContent>
    </Tabs>
  ),
};
