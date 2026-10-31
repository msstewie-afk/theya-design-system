import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './code-block';
import { codeBlockGuidelines } from './code-block.guidelines';
import { expect, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * CodeBlock — a static, read-only snippet in a mono surface box with a copy
 * button wired to the exact `code` string. No syntax highlighting. With a
 * `filename`/`language` it grows a header bar; without one the copy button
 * floats in the top-right. Long lines scroll inside the block, never the page.
 *
 * Copy relies on `navigator.clipboard`, which needs a secure context; in the
 * Storybook iframe the write may be blocked.
 */
const CONFIG_SAMPLE = `export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}"],
}`;

const SNIPPET = `pnpm add @radix-ui/react-dialog\npnpm add iconoir-react`;

const meta = {
  title: 'Code/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Code people read and copy: install steps, a DNS record, an API example. Monospaced, with a copy button.",
      },
    },
    layout: 'padded', guidelines: codeBlockGuidelines,
  },
  argTypes: {
    code: { control: 'text', description: 'Source text shown in the block.' },
    language: { control: 'text', description: 'Language hint shown as a muted label in the header (no highlighting applied).' },
    filename: { control: 'text', description: 'Filename shown mono in the header (takes visual priority over language).' },
    copy: { control: 'boolean', description: 'Shows a copy-to-clipboard button.' },
    copyLabel: { control: 'text', description: 'Accessible label for the copy button.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    code: SNIPPET,
    copy: true,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[560px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bare block: no header, copy button floats in the top-right. */
export const Plain: Story = {};

/** With a filename and language, the block grows a header bar (copy sits in it). */
export const WithHeader: Story = {
  name: 'With header',
  args: { code: CONFIG_SAMPLE, filename: 'tailwind.config.ts', language: 'ts' },
};

/** A single long line that scrolls horizontally instead of wrapping or overflowing the page. */
export const LongLines: Story = {
  name: 'Long lines',
  args: {
    filename: 'deploy.sh',
    language: 'bash',
    code: 'curl -fsSL https://get.example.com/install.sh | sh -s -- --channel stable --region eu-west-1 --token $WP_TOKEN',
  },
  // Keyboard: Copy, then the code itself.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pre = canvasElement.querySelector('pre')!;
    resetFocus();
    await tabTo(canvas.getByRole('button', { name: 'Copy code' }));
    // The code is a tab stop when it overflows, so the arrow keys can scroll
    // it (synthetic key events don't scroll, so that part isn't asserted).
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
    await tabTo(pre);
  },
};

/** Read-only, copy disabled. */
export const NoCopy: Story = {
  name: 'No copy',
  args: { code: 'GET /v2/sites/shop.seashell.dev', copy: false },
};
