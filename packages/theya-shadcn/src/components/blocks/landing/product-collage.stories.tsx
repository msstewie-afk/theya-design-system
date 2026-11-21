import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight } from 'iconoir-react';
import { Avatar } from '../../ui/avatar';
import { AvatarGroup } from '../../ui/avatar-group';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { CountUp } from '../../ui/count-up';
import { Sparkline } from '../../ui/sparkline';
import { Switch } from '../../ui/switch';
import { DemoMiniLink } from './demo-data';
import { Hero } from './hero';
import { CollageItem, ProductCollage } from './product-collage';
import { productCollageGuidelines } from './product-collage.guidelines';

const meta: Meta<typeof ProductCollage> = {
  title: 'Patterns: Landing/ProductCollage',
  component: ProductCollage,
  tags: ['autodocs'],
  parameters: { guidelines: productCollageGuidelines, layout: 'padded' },
  argTypes: { children: { control: false }, image: { control: false } },
};
export default meta;
type Story = StoryObj<typeof ProductCollage>;

function SavedCard() {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">Saved this week</p>
      <div className="flex items-end justify-between gap-4">
        <CountUp to={128} className="font-heading text-heading-2xl" />
        <Sparkline data={[4, 9, 7, 14, 12, 19, 24]} area ariaLabel="Links saved per day, rising from 4 to 24" width={120} />
      </div>
    </Card>
  );
}

function ReadingCard() {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between px-1">
        <p className="m-0 font-body text-body-m font-semibold">Reading list</p>
        <Badge tone="info">3 new</Badge>
      </div>
      <div className="flex flex-col gap-2 [&>*]:w-full">
        <DemoMiniLink index={0} />
        <DemoMiniLink index={1} />
        <DemoMiniLink index={2} />
      </div>
    </Card>
  );
}

function SharedCard() {
  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex flex-col gap-1">
        <p className="m-0 font-body text-body-m font-semibold">Design reading</p>
        <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">Shared with 6 people</p>
      </div>
      <AvatarGroup max={3} aria-label="People in Design reading">
        {['AM', 'JK', 'LS', 'RT', 'NB', 'OP'].map((n) => (
          <Avatar key={n} type="text" initials={n} />
        ))}
      </AvatarGroup>
    </Card>
  );
}

function DigestCard() {
  return (
    <Card className="p-5">
      <Switch label="Morning digest" description="Five unread links at 8:00" defaultChecked />
    </Card>
  );
}

const items = (
  <>
    <CollageItem x={6} y={10} width={46} depth={0.3}>
      <ReadingCard />
    </CollageItem>
    <CollageItem x={56} y={14} width={38} depth={0.8}>
      <SavedCard />
    </CollageItem>
    <CollageItem x={50} y={50} width={44} depth={0.5} hideNarrow>
      <SharedCard />
    </CollageItem>
    <CollageItem x={10} y={72} width={40} depth={1} hideNarrow>
      <DigestCard />
    </CollageItem>
  </>
);

/** Four Theya cards over the theme's gradient. Scroll the canvas: the cards drift at their own depth. */
export const OnGradient: Story = {
  parameters: { globals: { brand: 'dusk' } },
  render: (args) => (
    <div className="mx-auto max-w-5xl">
      <ProductCollage {...args}>{items}</ProductCollage>
    </div>
  ),
};

/** A photo as the ground (alt "" when it is mood only). Photos for the SaaS templates come later. */
export const OnPhoto: Story = {
  render: (args) => (
    <div className="mx-auto max-w-5xl">
      <ProductCollage {...args} image={{ src: '/asset-examples/silk/1.webp', alt: '' }}>
        {items}
      </ProductCollage>
    </div>
  ),
};

/** In the Hero's media slot. */
export const InHero: Story = {
  parameters: { layout: 'fullscreen', globals: { brand: 'lagoon' } },
  render: (args) => (
    <Hero
      layout="split"
      eyebrow="Bookmarks for teams"
      title="Everything your team meant to read"
      description="Save from any app, share a folder in a click, and find any page by a word you remember."
      actions={
        <>
          <Button size="xl">
            Start for free
            <ArrowRight aria-hidden />
          </Button>
          <Button size="xl" appearance="tonal" tone="secondary">
            See pricing
          </Button>
        </>
      }
      media={
        <ProductCollage {...args} ratio="4 / 5">
          <CollageItem x={6} y={8} width={70} depth={0.3}>
            <ReadingCard />
          </CollageItem>
          <CollageItem x={36} y={50} width={58} depth={0.8}>
            <SavedCard />
          </CollageItem>
          <CollageItem x={10} y={76} width={66} depth={1} hideNarrow>
            <SharedCard />
          </CollageItem>
        </ProductCollage>
      }
    />
  ),
};
