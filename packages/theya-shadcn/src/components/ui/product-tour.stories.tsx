import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Bell, Plus, Search } from 'iconoir-react';
import { ProductTour, type TourStep } from './product-tour';
import { Button } from './button';
import { Card } from './card';

/**
 * ProductTour — spotlight + card walkthrough. Steps point at elements by
 * selector, ref or getter; a step without a target shows a centered card.
 * Esc / close skips, ←/→ move between steps, Tab stays inside the card.
 */

function MockApp({ onStart }: { onStart?: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-3 p-3">
        <span className="text-heading-2xs font-medium">Sites</span>
        <div
          data-tour="search"
          className="ms-4 flex h-9 flex-1 items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-default)] px-3 text-body-m text-[var(--color-text-text-subtle)]"
        >
          <Search width={16} height={16} aria-hidden />
          Search sites, domains and databases
        </div>
        <Button data-tour="notifications" appearance="ghost" tone="neutral" size="md" iconOnly leftIcon={<Bell />} aria-label="Notifications" />
        <Button data-tour="new-site" size="md" leftIcon={<Plus />}>
          New site
        </Button>
      </Card>
      <div className="grid grid-cols-3 gap-4">
        {['example.com', 'shop.example.com', 'blog.example.com'].map((name, i) => (
          <Card key={name} data-tour={i === 0 ? 'site-card' : undefined} className="flex flex-col gap-1 p-4">
            <span className="text-body-m font-medium">{name}</span>
            <span className="text-body-s text-[var(--color-text-text-subtle)]">Updated 2 days ago</span>
          </Card>
        ))}
      </div>
      {onStart && (
        <Button appearance="outlined" tone="neutral" size="md" onClick={onStart} className="self-start">
          Start tour
        </Button>
      )}
    </div>
  );
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to the new Sites page',
    content: 'A quick look at what changed — it takes under a minute.',
    media: <img src="/asset-examples/login-carousel-01.jpg" alt="" className="h-36 object-cover" />,
  },
  { target: '[data-tour="search"]', title: 'Search everything', content: 'Find sites, domains and databases from one field.' },
  { target: '[data-tour="new-site"]', title: 'Create a site', content: 'Start from a template or an empty site.', side: 'bottom', align: 'end' },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content: 'Deploys, renewals and alerts land here. Go ahead, click it.',
    interactive: true,
  },
  { target: '[data-tour="site-card"]', title: 'Your sites', content: 'Open a card to manage domains, backups and logs.', side: 'right' },
];

const meta = {
  title: 'Overlays/ProductTour',
  component: ProductTour,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    steps: { control: false, description: 'target (selector/ref/getter), title, content, media, side, align, spotlightPadding, interactive.' },
    open: { control: false },
    onOpenChange: { control: false },
    step: { control: false, description: 'Controlled step index.' },
    defaultStep: { control: 'number' },
    onStepChange: { control: false },
    onComplete: { control: false, description: 'Done on the last step.' },
    onSkip: { control: false, description: 'Closed early; receives the step index.' },
    labels: { control: false, description: 'Button texts and the progress formatter.' },
    hideSkip: { control: 'boolean', description: 'Hides the Skip button.' },
  },
  args: { steps: STEPS, open: false, onOpenChange: () => {} },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductTour>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start from a button; the result line shows how the tour ended. */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState('');
    return (
      <>
        <MockApp onStart={() => setOpen(true)} />
        {result && <p className="mt-3 text-body-s text-[var(--color-text-text-subtle)]">{result}</p>}
        <ProductTour
          {...args}
          open={open}
          onOpenChange={setOpen}
          onComplete={() => setResult('Completed')}
          onSkip={(i) => setResult(`Skipped at step ${i + 1}`)}
        />
      </>
    );
  },
};

/** Open on a targeted step — spotlight + card. */
export const OnStep: Story = {
  name: 'On a step',
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <MockApp onStart={() => setOpen(true)} />
        <ProductTour {...args} open={open} onOpenChange={setOpen} defaultStep={2} />
      </>
    );
  },
};

/** Two-step "what's new" without a welcome, no Skip button. */
export const Short: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <MockApp onStart={() => setOpen(true)} />
        <ProductTour {...args} steps={STEPS.slice(1, 3)} hideSkip open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
