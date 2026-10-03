import type { Meta, StoryObj } from '@storybook/react';
import { Price } from './price';
import { priceGuidelines } from './price.guidelines';

/**
 * Price — a money amount with period, "From", previous price, discount
 * and "Free". Intl formatting per locale; at lg/xl the symbol and cents
 * step down so the number leads. Screen readers hear one sentence
 * ("From €19.99 per month, was €24.99").
 */
const meta = {
  title: 'Data/Price',
  component: Price,
  tags: ['autodocs'],
  parameters: { layout: 'centered', guidelines: priceGuidelines },
  argTypes: {
    amount: { control: 'number', table: { category: 'Content' } },
    currency: { control: 'text', description: 'ISO 4217, e.g. USD, EUR, BGN, JPY.', table: { category: 'Content' } },
    locale: { control: 'text', description: 'e.g. en-US, de-DE, bg-BG.', table: { category: 'Content' } },
    period: { control: 'text', description: 'mo, year, user, seat…', table: { category: 'Content' } },
    compareAt: { control: 'number', description: 'Previous price, struck through.', table: { category: 'Content' } },
    showDiscount: { control: 'boolean', table: { category: 'Appearance' } },
    from: { control: 'boolean', table: { category: 'Content' } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'], table: { category: 'Appearance' } },
    superscript: { control: 'boolean', description: 'lg/xl: raise symbol and cents, retail price-tag style.', table: { category: 'Appearance' } },
  },
  args: { amount: 19.99, currency: 'EUR', locale: 'en-IE', period: 'mo', size: 'lg' },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** sm → xl. At lg/xl the symbol and cents are a bit smaller, on the same baseline. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Price key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** `superscript` — retail price-tag style with raised symbol and cents. For storefront-like screens; the default baseline style suits pricing pages and locales with a trailing symbol. */
export const Superscript: Story = {
  parameters: { controls: { exclude: ['superscript', 'size'] } },
  render: (args) => (
    <div className="flex items-end gap-10">
      <Price {...args} size="xl" />
      <Price {...args} size="xl" superscript />
    </div>
  ),
};

/** Previous price struck through, with an optional discount badge. */
export const Discounted: Story = {
  args: { amount: 15.99, compareAt: 19.99, showDiscount: true },
};

/** "From" for a starting price; "Free" for zero. */
export const FromAndFree: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Price amount={9} currency="USD" period="mo" from size="lg" />
      <Price amount={0} period="mo" size="lg" />
    </div>
  ),
};

/** Locale decides symbol position and separators — same component everywhere. */
export const Locales: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-[100px_1fr] items-baseline gap-x-6 gap-y-3 font-body text-body-s text-[var(--color-text-text-subtler)]">
      <span>en-US</span>
      <Price amount={1299.5} currency="USD" locale="en-US" size="lg" />
      <span>de-DE</span>
      <Price amount={1299.5} currency="EUR" locale="de-DE" size="lg" />
      <span>bg-BG</span>
      <Price amount={1299.5} currency="BGN" locale="bg-BG" size="lg" />
      <span>ja-JP</span>
      <Price amount={12990} currency="JPY" locale="ja-JP" size="lg" />
    </div>
  ),
};

/** Per-user pricing in a dense row. */
export const InList: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="flex w-[320px] flex-col divide-y divide-[var(--color-border-border-subtler)] font-body text-body-m text-[var(--color-text-text)]">
      {[
        ['Starter', 0],
        ['Team', 12],
        ['Business', 29],
      ].map(([name, amount]) => (
        <li key={name} className="flex items-baseline justify-between py-2">
          <span>{name}</span>
          <Price amount={amount as number} period="user" size="sm" />
        </li>
      ))}
    </ul>
  ),
};
