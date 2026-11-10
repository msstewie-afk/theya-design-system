import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Globe, ShieldCheck, Settings } from 'iconoir-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { tabsGuidelines } from './tabs.guidelines';
import { testOnly } from '../../lib/test-only';

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
  // Roving focus: one Tab stop, arrows/Home/End move and activate (automatic mode), wraps.,
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
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const picks = canvas.getByRole('tab', { name: 'Client picks' });

    await expect(picks).toHaveAttribute('aria-disabled', 'true');
    // A real button (T7): browsers keep :focus-visible off a button focused by a
    // click or tap, so the focus ring shows for the keyboard only. A div role="tab"
    // matched :focus-visible after a pointer click in Chrome.
    await expect(picks.tagName).toBe('BUTTON');
    await expect(picks).toHaveAttribute('type', 'button');
    await expect(picks).toBeDisabled();

    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveFocus();
    await expect(picks).toHaveAttribute('aria-selected', 'false');
  }),
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
  play: testOnly(async ({ canvasElement }) => {
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
  }),
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

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
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

/**
 * Interaction test for the focus ring: a click or tap on a tab leaves it
 * focused (Radix focuses it on mouse down) but draws no ring; a key shows it.
 * The real-pointer check in Chrome is in scripts (CDP mouse events); here the
 * modality attribute and the computed shadow are asserted.
 */
export const TestPointerFocus: Story = {
  ...Chips,
  name: 'Test: pointer focus',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const picks = canvas.getByRole('tab', { name: 'Client picks' });
    const ring = (el: HTMLElement) => getComputedStyle(el).boxShadow.includes('0px 0px 0px 4px');
    await userEvent.click(picks);
    await expect(picks).toHaveFocus();
    await expect(picks).toHaveAttribute('aria-selected', 'true');
    await expect(document.documentElement).toHaveAttribute('data-theya-input', 'pointer');
    await expect(ring(picks)).toBe(false);
    // Arrow key: keyboard modality, the next tab gets the ring.
    await userEvent.keyboard('{ArrowRight}');
    const security = canvas.getByRole('tab', { name: 'Security' });
    await expect(security).toHaveFocus();
    await expect(document.documentElement).toHaveAttribute('data-theya-input', 'keyboard');
    await waitFor(() => expect(ring(security)).toBe(true));
  },
};

const CATEGORIES = ['Breakfast', 'Soups', 'Mains', 'Sides', 'Snacks', 'Desserts', 'Drinks'];

/**
 * More chips than fit: the scroll button fades from the track's own colour.
 * Set `--tabs-track-bg` on `Tabs` (or any ancestor, e.g. a tinted page) and
 * both the track and the fade use it.
 */
export const ChipsOverflow: Story = {
  name: 'Chips overflow',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-full max-w-[320px] flex-col gap-4">
      {[
        { label: 'Recipe categories', className: undefined },
        { label: 'Recipe categories, tinted track', className: '[--tabs-track-bg:var(--color-bg-primary-bg-primary-subtle)]' },
      ].map(({ label, className }) => (
        <Tabs key={label} defaultValue="Breakfast" className={className}>
          <TabsList variant="chips" aria-label={label}>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((c) => (
            <TabsContent key={c} value={c} className="pt-3 font-body text-body-s text-[var(--color-text-text-subtle)]">
              {c} recipes.
            </TabsContent>
          ))}
        </Tabs>
      ))}
    </div>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const lists = Array.from(canvasElement.querySelectorAll<HTMLElement>('[role=tablist]'));
    for (const list of lists) {
      const frame = list.parentElement!;
      await waitFor(() => expect(frame.querySelector('[data-slot=tabs-scroll]')).not.toBeNull());
      const fade = getComputedStyle(frame.querySelector('[data-slot=tabs-scroll]')!).backgroundImage;
      const track = getComputedStyle(list).backgroundColor;
      // The gradient starts with the track's colour.
      await expect(fade.replace(/\s/g, '')).toContain(track.replace(/\s/g, ''));
    }
    // The two tracks differ, so the check isn't trivially true.
    await expect(getComputedStyle(lists[0]).backgroundColor).not.toBe(getComputedStyle(lists[1]).backgroundColor);
  }),
};
