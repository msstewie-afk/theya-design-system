import type { Meta, StoryObj } from '@storybook/react';
import { AvatarGroup } from './avatar-group';
import { Avatar, AvatarFallback } from './avatar';

/**
 * AvatarGroup — a stack of overlapping Avatars with a trailing "+N" overflow.
 * Pass Avatar children; the group owns the overlap, the separating border,
 * and the neutral count past `max`. `size` (Avatar's own `sm`/`md`/`lg`
 * scale) themes every avatar and the count chip together.
 */
const meta = {
  title: 'Labels/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    max: { control: { type: 'number', min: 1 }, description: 'Max avatars to show before collapsing the rest into a "+N" count.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Size applied to every Avatar child.' },
    children: { control: false, description: 'Avatar elements to group.' },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const initials = ['AL', 'GH', 'AT', 'MH', 'KJ', 'EF'];

// Return an ARRAY of Avatar elements (not a wrapper component) so
// AvatarGroup sees each avatar as a direct child and can count / cap them.
const members = (names: string[]) => names.map((name) => <Avatar key={name} type="text" initials={name} />);

/** Four collaborators, no overflow: each disc separated by a background-colored border. */
export const Default: Story = {
  args: { 'aria-label': 'Project collaborators' },
  render: (args) => <AvatarGroup {...args}>{members(initials.slice(0, 4))}</AvatarGroup>,
};

/** Past `max`, the remainder collapses into a neutral "+N" count chip — here,
 * the first four show and the last two collapse into "+2". */
export const Overflow: Story = {
  args: { max: 4, 'aria-label': 'Project collaborators' },
  render: (args) => <AvatarGroup {...args}>{members(initials)}</AvatarGroup>,
};

/** Real images with initials fallbacks; a missing/broken image falls back in place. */
export const WithImages: Story = {
  name: 'With images',
  args: { max: 3, 'aria-label': 'Reviewers' },
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar type="image" src="/asset-examples/panda-avatar.png" alt="Panda bot" initials="AL" />
      <Avatar type="text" initials="GH" />
      <Avatar type="text" initials="AT" />
      <Avatar type="text" initials="MH" />
      <Avatar type="text" initials="KJ" />
    </AvatarGroup>
  ),
};

/** The three sizes — Avatar's own `sm`/`md`/`lg` scale (32/48/64px); overlap and the count chip scale with them. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <AvatarGroup size="sm" max={4} aria-label="Team, small">
        {members(initials)}
      </AvatarGroup>
      <AvatarGroup size="md" max={4} aria-label="Team, medium">
        {members(initials)}
      </AvatarGroup>
      <AvatarGroup size="lg" max={4} aria-label="Team, large">
        {members(initials)}
      </AvatarGroup>
    </div>
  ),
};
