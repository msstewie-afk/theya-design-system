import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
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
  parameters: { layout: 'centered', guidelines: cardFanGuidelines },
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
    // target-size off: an open fan overlaps the cards by design, so a back
    // card's visible strip can be thinner than 24px. Hover or focus lifts
    // that card to the front at full size, which is the target people use.
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
  },
};
