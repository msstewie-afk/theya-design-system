import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import { SwipeDeck } from './swipe-deck';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Badge } from './badge';
import { swipeDeckGuidelines } from './swipe-deck.guidelines';

const TEMPLATES = [
  { id: 'portfolio', name: 'Portfolio', text: 'A one-page site for your work, with a contact form.', tag: 'Personal' },
  { id: 'shop', name: 'Small shop', text: 'Catalog, cart and checkout for up to 50 products.', tag: 'Commerce' },
  { id: 'docs', name: 'Docs', text: 'Searchable docs with a sidebar and versioning.', tag: 'Product' },
  { id: 'blog', name: 'Blog', text: 'Posts, tags and an RSS feed out of the box.', tag: 'Content' },
];
type Template = (typeof TEMPLATES)[number];

const TemplateCard = ({ item }: { item: Template }) => (
  <Card className="min-h-56">
    <CardHeader>
      <div>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.text}</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      <Badge tone="neutral">{item.tag}</Badge>
    </CardContent>
  </Card>
);

/** SwipeDeck — swipe cards away one by one; buttons and arrow keys do the same. */
const meta = {
  title: 'Motion/SwipeDeck',
  component: SwipeDeck,
  tags: ['autodocs'],
  parameters: { layout: 'centered', guidelines: swipeDeckGuidelines },
  argTypes: {
    items: { control: false, description: 'The cards, top first.' },
    getKey: { control: false, description: 'Stable key for an item.' },
    renderCard: { control: false, description: 'Renders one item as a card.' },
    onSwipe: { control: false, description: 'Called with the item and `left` (skip) or `right` (keep) when a card leaves.' },
    empty: { control: false, description: 'Shown when every card is gone.' },
    depth: { control: { type: 'number', min: 0, max: 4 }, description: 'Cards visible behind the top one.' },
    skipLabel: { control: 'text', description: 'Skip button label (default from the locale).' },
    keepLabel: { control: 'text', description: 'Keep button label (default from the locale).' },
    hideButtons: { control: 'boolean', description: 'Hide Skip / Keep (arrow keys still work). Only with another non-drag way to decide.' },
  },
} satisfies Meta<typeof SwipeDeck>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const [kept, setKept] = useState<string[]>([]);
  return (
    <div className="flex w-[min(22rem,calc(100vw-2rem))] flex-col items-center gap-4">
      <SwipeDeck
        aria-label="Templates"
        items={TEMPLATES}
        getKey={(t) => t.id}
        renderCard={(t) => <TemplateCard item={t} />}
        onSwipe={(t, dir) => dir === 'right' && setKept((k) => [...k, t.name])}
        empty={
          <Card className="min-h-56">
            <CardHeader>
              <div>
                <CardTitle>All done</CardTitle>
                <CardDescription>You picked {kept.length ? kept.join(', ') : 'nothing'}.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        }
      />
      <p className="font-body text-body-s text-[var(--color-text-text-subtler)]" data-testid="kept">
        Kept: {kept.join(', ') || '—'}
      </p>
    </div>
  );
}

/** Drag the top card left or right, use the buttons, or focus the deck and press ← / →. */
export const Default: Story = {
  args: { items: TEMPLATES, getKey: (t: Template) => t.id, renderCard: (t: Template) => <TemplateCard item={t} /> } as never,
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Keep' }));
    await waitFor(() => expect(canvas.getByTestId('kept')).toHaveTextContent('Portfolio'));
    await expect(canvas.getByRole('status')).toHaveTextContent('3 cards left');

    // Keyboard: ← skips the next one.
    canvas.getByRole('group', { name: 'Templates' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('2 cards left'));
    await expect(canvas.getByTestId('kept')).toHaveTextContent('Kept: Portfolio');

    // Only the top card is exposed.
    const exposed = (text: string) => canvas.queryAllByText(text).filter((el) => !el.closest('[aria-hidden="true"]'));
    await expect(exposed('Docs')).toHaveLength(1);
    await expect(exposed('Blog')).toHaveLength(0);
  },
};
