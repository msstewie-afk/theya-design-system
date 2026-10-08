import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { CardStack } from './card-stack';
import { Card, CardHeader, CardTitle, CardDescription } from './card';
import { cardStackGuidelines } from './card-stack.guidelines';

const QUOTES = [
  { who: 'Ana, studio owner', text: 'We moved twelve client sites in an afternoon.' },
  { who: 'Ivo, developer', text: 'Staging and rollbacks without asking ops.' },
  { who: 'Lena, shop owner', text: 'Checkout got faster and support got quieter.' },
  { who: 'Marco, agency', text: 'One dashboard for every client, finally.' },
];

/** CardStack — a deck that cycles its cards on a timer, with Pause and Next. */
const meta = {
  title: 'Motion/CardStack',
  component: CardStack,
  tags: ['autodocs'],
  parameters: { layout: 'centered', guidelines: cardStackGuidelines },
  argTypes: {
    interval: { control: { type: 'number', min: 1500, step: 500 }, description: 'Time each card stays in front, ms.' },
    depth: { control: { type: 'number', min: 0, max: 4 }, description: 'Cards visible behind the front one.' },
    hideControls: { control: 'boolean', description: 'Hide Pause / Next — only with another way to stop the motion.' },
    layout: { control: 'inline-radio', options: ['stack', 'fan'], description: '`stack`: cards behind sit higher and smaller; `fan`: they spread to the side like a hand of cards.' },
    children: { control: false, description: 'The cards.' },
  },
  args: { interval: 4000, depth: 2 },
} satisfies Meta<typeof CardStack>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cycles every 4 s; hover or focus pauses it. */
export const Default: Story = {
  render: (args) => (
    <div className="w-[min(22rem,calc(100vw-2rem))] pt-8">
      <CardStack {...args} aria-label="What customers say">
        {QUOTES.map((q) => (
          <Card key={q.who} className="min-h-40">
            <CardHeader>
              <div>
                <CardTitle>“{q.text}”</CardTitle>
                <CardDescription>{q.who}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </CardStack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // CardTitle is a div; count only text outside the aria-hidden back cards.
    const exposed = (re: RegExp) => canvas.queryAllByText(re).filter((el) => !el.closest('[aria-hidden="true"]'));
    await expect(exposed(/twelve client sites/)).toHaveLength(1);
    // Only the front card is exposed.
    await expect(exposed(/Staging and rollbacks/)).toHaveLength(0);

    await userEvent.click(canvas.getByRole('button', { name: 'Next card' }));
    await waitFor(() => expect(exposed(/Staging and rollbacks/)).toHaveLength(1));

    // Under prefers-reduced-motion nothing moves, so there is no Pause.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    } else {
      await userEvent.click(canvas.getByRole('button', { name: 'Pause' }));
      await expect(canvas.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'true');
    }
  },
};

/** `layout="fan"`: the cards behind spread to the side; the front one still drops away and returns to the back. */
export const Fan: Story = {
  args: { layout: 'fan' },
  render: (args) => (
    <div className="w-[20rem] max-w-full px-4 pb-10 pt-4">
      <CardStack {...args} aria-label="Highlights">
        {QUOTES.map((q) => (
          <Card key={q.who} className="min-h-56">
            <CardHeader>
              <div>
                <CardTitle>“{q.text}”</CardTitle>
                <CardDescription>{q.who}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </CardStack>
    </div>
  ),
};
