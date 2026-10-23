import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { CardFan } from './card-fan';
import { Card, CardTitle, CardDescription, CardContent } from './card';
import { Avatar } from './avatar';
import { cardFanGuidelines } from './card-fan.guidelines';

const TEAM = [
  { name: 'Ana Petrova', role: 'Design' },
  { name: 'Ivo Marinov', role: 'Engineering' },
  { name: 'Lena Novak', role: 'Support' },
  { name: 'Marco Rossi', role: 'Sales' },
];

/** CardFan — a stack that fans out on hover or focus; the active card lifts. */
const meta = {
  title: 'Motion/CardFan',
  component: CardFan,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A group of 3–5 cards that fans out on hover or focus, the active one lifting. For a hero or an about page.",
      },
    },
    layout: 'centered', guidelines: cardFanGuidelines,
  },
  argTypes: {
    spread: { control: { type: 'number', min: 0, max: 20 }, description: 'Rotation between neighbouring cards when open, degrees.' },
    offset: { control: { type: 'number', min: 16, max: 120 }, description: 'Horizontal distance between neighbouring cards when open, px.' },
    children: { control: false, description: 'The cards (3–5).' },
  },
  args: { spread: 8, offset: 88 },
} satisfies Meta<typeof CardFan>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Hover the stack (or Tab into it): the cards fan out and the one under the pointer lifts. */
export const Default: Story = {
  parameters: {
    // axe target-size off: it measures the rotated cards by their bounding
    // boxes, which overlap far more than the cards do. The real check is in
    // the play test: every card's visible strip is at least 24px (WCAG 2.5.8).
    a11y: { config: { rules: [{ id: 'target-size', enabled: false }] } },
  },
  render: (args) => (
    <div className="flex w-[min(36rem,calc(100vw-2rem))] justify-center px-4 py-10">
      <CardFan {...args}>
        {TEAM.map((p) => (
          <Card key={p.name} href="#" aria-label={p.name} className="w-44">
            <CardContent className="flex flex-col gap-3">
              <Avatar size="lg" type="text" initials={p.name.split(' ').map((w) => w[0]).join('')} />
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.role}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </CardFan>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fan = canvasElement.querySelector('[data-slot=card-fan]')!;
    await expect(fan).not.toHaveAttribute('data-open');
    // Keyboard focus opens the fan; every card stays reachable.
    await userEvent.tab();
    await expect(fan).toHaveAttribute('data-open');
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
    // Open fan: each card shows at least a 24px strip next to the one before it.
    await waitFor(
      () => {
        const lefts = [...canvasElement.querySelectorAll('[data-slot=card-fan-item]')].map((el) => el.getBoundingClientRect().left);
        for (let i = 1; i < lefts.length; i++) expect(lefts[i] - lefts[i - 1]).toBeGreaterThanOrEqual(24);
      },
      { timeout: 2000 },
    );
  },
};
