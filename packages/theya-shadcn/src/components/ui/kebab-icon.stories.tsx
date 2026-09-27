import type { Meta, StoryObj } from '@storybook/react';
import { KebabIconVertical, KebabIconHorizontal } from './kebab-icon';
import { Button } from './button';

/**
 * Custom kebab/overflow-menu glyphs (vertical + horizontal dots) —
 * replaces iconoir's MoreVert/MoreHoriz, which read as too thin/small
 * even at the darkest available text token. Use ONLY where the icon is
 * a real interactive kebab/overflow-menu trigger — non-interactive
 * ellipsis indicators (pagination, breadcrumb truncation) are a
 * different case.
 */
const meta: Meta<typeof KebabIconVertical> = {
  title: 'Actions/KebabIcon',
  component: KebabIconVertical,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'], description: 'Icon size: sm (12px) / md (16px, default) / lg (20px).' },
    className: { control: false, description: 'Extra classes — color comes from `currentColor`, so this is typically just a text-color token.' },
  },
  args: { size: 'md' },
};

export default meta;
type Story = StoryObj<typeof KebabIconVertical>;

/** Vertical (the more common orientation — row/card overflow menus). Switch `size` in Controls. */
export const Default: Story = {
  render: (args) => <KebabIconVertical {...args} className="text-[var(--color-text-text)]" />,
};

/** Horizontal — used where the trigger sits in a horizontal rail (Sidebar, NotificationsInbox). */
export const Horizontal: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => <KebabIconHorizontal {...args} className="text-[var(--color-text-text)]" />,
};

/** `sm` / `md` (default) / `lg` side by side, both orientations. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <KebabIconVertical size={size} className="text-[var(--color-text-text)]" />
            <span className="font-mono text-[0.6875rem] text-[var(--color-text-text-subtler)]">{size}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <KebabIconHorizontal size={size} className="text-[var(--color-text-text)]" />
            <span className="font-mono text-[0.6875rem] text-[var(--color-text-text-subtler)]">{size}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

/** As a real kebab-trigger button (its usual context) — side-by-side against the
 * previous iconoir MoreVert/MoreHoriz at the same text-text token, to compare weight and legibility. */
export const AsButtonTrigger: Story = {
  parameters: { controls: { exclude: ['size', 'className'] } },
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Button type="outlined" iconOnly aria-label="Kebab (vertical, custom)" leftIcon={<KebabIconVertical className="text-[var(--color-text-text)]" />} />
        <span className="text-body-s text-[var(--color-text-text-subtler)]">vertical</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button type="outlined" iconOnly aria-label="Kebab (horizontal, custom)" leftIcon={<KebabIconHorizontal className="text-[var(--color-text-text)]" />} />
        <span className="text-body-s text-[var(--color-text-text-subtler)]">horizontal</span>
      </div>
    </div>
  ),
};
