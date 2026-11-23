import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Button } from '../../ui/button';
import { BlogTeaser, type BlogPost } from './blog-teaser';
import { blogTeaserGuidelines } from './blog-teaser.guidelines';

const P = '/asset-examples/photos';
const POSTS: BlogPost[] = [
  {
    id: 'slow',
    title: 'Why we read less than we save',
    href: '#post-1',
    excerpt: 'Six months of reading data, and the three habits that turned a pile of links into a list people finish.',
    cover: `${P}/abstract-dawn.webp`,
    category: 'Research',
    date: '2026-11-18',
    readingTime: '7 min read',
  },
  {
    id: 'search',
    title: 'Full-text search, from 2 seconds to 80 ms',
    href: '#post-2',
    excerpt: 'How we rebuilt the index so a word you half remember finds the page.',
    cover: `${P}/abstract-glass.webp`,
    category: 'Engineering',
    date: '2026-11-04',
    readingTime: '11 min read',
  },
  {
    id: 'teams',
    title: 'Shared spaces: reading together without a meeting',
    href: '#post-3',
    excerpt: 'Folders with roles, comments on any link, and a Monday digest for the whole team.',
    cover: `${P}/abstract-pink.webp`,
    category: 'Product',
    date: '2026-10-21',
    readingTime: '4 min read',
  },
];

const meta: Meta<typeof BlogTeaser> = {
  title: 'Patterns: Landing/BlogTeaser',
  component: BlogTeaser,
  tags: ['autodocs'],
  parameters: { guidelines: blogTeaserGuidelines, layout: 'fullscreen' },
  args: {
    eyebrow: 'Blog',
    title: 'Fresh from the blog',
    posts: POSTS,
    action: (
      <Button appearance="outlined" tone="secondary" asChild>
        <a href="#blog">All articles</a>
      </Button>
    ),
  },
  argTypes: { posts: { control: false }, action: { control: false } },
};
export default meta;
type Story = StoryObj<typeof BlogTeaser>;

/** Three posts with abstract covers. On a phone they sit in a row you swipe through. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // One link per card (the title), plus the action.
    await expect(c.getByRole('link', { name: 'Why we read less than we save' })).toHaveAttribute('href', '#post-1');
    await expect(c.getAllByRole('link')).toHaveLength(4);
  },
};

/** Two posts: two columns. */
export const Two: Story = {
  args: { posts: POSTS.slice(0, 2) },
};

/** No covers: the text carries the card. */
export const WithoutCovers: Story = {
  args: { posts: POSTS.map(({ cover: _c, ...p }) => p) },
};
