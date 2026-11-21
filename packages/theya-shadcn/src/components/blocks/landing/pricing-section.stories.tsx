import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { PricingSection, type PricingPlan } from './pricing-section';
import { pricingSectionGuidelines } from './pricing-section.guidelines';
import { SectionPanel } from './section-panel';

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For one person and a few folders.',
    monthly: 0,
    yearly: 0,
    cta: 'Start for free',
    features: ['Up to 500 links', '3 shared folders', 'Browser extension', 'Search by title and tag'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For people who read and save every day.',
    monthly: 9,
    yearly: 7,
    recommended: true,
    featuresIntro: 'Everything in Free, plus:',
    features: ['Unlimited links and folders', 'Full-text search of saved pages', 'Highlights and notes', 'Reading list on every device'],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams that share their reading.',
    monthly: 15,
    yearly: 12,
    cta: 'Try Team for 14 days',
    featuresIntro: 'Everything in Pro, plus:',
    features: ['Shared spaces with roles', 'Comments on any link', 'Admin and SSO', 'Priority support'],
  },
];

const meta: Meta<typeof PricingSection> = {
  title: 'Patterns: Landing/PricingSection',
  component: PricingSection,
  tags: ['autodocs'],
  parameters: { guidelines: pricingSectionGuidelines, layout: 'fullscreen' },
  args: {
    eyebrow: 'Pricing',
    title: 'Pay for what you read',
    description: 'Start free. Upgrade when your library outgrows it.',
    plans: PLANS,
    footnote: 'Prices in US dollars, without VAT. Cancel anytime.',
  },
};
export default meta;
type Story = StoryObj<typeof PricingSection>;

/** Three plans on the page; Pro is recommended. The yearly prices show first. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: 'Monthly' }));
    // CountUp keeps the final value for screen readers at once.
    await expect(await c.findByText('$9', { selector: '.sr-only' })).toBeInTheDocument();
    await expect(c.getAllByText('Billed monthly, cancel anytime').length).toBe(2);
  },
};

/** Inside SectionPanel tone="gradient": the cards turn to frosted white, the switch lies on the canvas. */
export const OnGradient: Story = {
  render: (args) => (
    <div className="p-4 sm:p-6">
      <SectionPanel tone="gradient" padding="none" className="rounded-[var(--size-border-radius-border-radius-5xl)]">
        <PricingSection {...args} />
      </SectionPanel>
    </div>
  ),
};

/** A fourth plan without a list price. */
export const WithEnterprise: Story = {
  args: {
    plans: [
      ...PLANS,
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For companies with their own rules.',
        monthly: 0,
        yearly: 0,
        priceLabel: "Let's talk",
        cta: 'Contact sales',
        featuresIntro: 'Everything in Team, plus:',
        features: ['Data residency', 'Audit log export', 'A named success manager'],
      },
    ],
  },
};
