import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { DiffViewer, type DiffView } from './diff-viewer';
import { Button } from './button';
import { diffViewerGuidelines } from './diff-viewer.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * DiffViewer — read-only comparison of two texts in the CodeBlock frame.
 * Unified (git-style) or split view, word-level highlights inside changed
 * lines, and long unchanged runs collapsed to an expander row.
 */

const OLD_CONFIG = `preset:
  quality: 82
  name: web-2048

  format: jpg
  long_edge: 2048

  color:
    profile: sRGB
    embed_profile: true

  metadata:
    keep_copyright: true
    keep_location: false
    keep_camera: true

  watermark:
    image: selene-mark.png
    opacity: 0.4

  naming: "{album}_{sequence}"
  notify_client: false
  folder: exports/web
`;

const NEW_CONFIG = `preset:
  quality: 90
  name: web-2048

  max_file_size: 4MB
  progressive: true

  format: jpg
  long_edge: 2048

  color:
    profile: sRGB
    embed_profile: true

  metadata:
    keep_copyright: true
    keep_location: false
    keep_camera: true
    keep_keywords: true

  watermark:
    image: selene-mark.png
    opacity: 0.4

  naming: "{album}_{sequence}"
  notify_client: true
  folder: exports/web
`;

const OLD_POLICY = `Originals are archived to Mnemosyne every night at 02:00.
Each archive snapshot is kept for 7 days.
Restores can be requested through support.`;

const NEW_POLICY = `Originals are archived to Mnemosyne every night at 03:00 studio time.
Each archive snapshot is kept for 30 days.
Restores can be started from the dashboard.`;

const meta = {
  title: 'Code/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Shows what changed between two versions before people apply it: an export preset, a template, a file restored from the archive.",
      },
    },
    layout: 'padded', guidelines: diffViewerGuidelines,
  },
  argTypes: {
    oldValue: { control: 'text', description: 'Original text.' },
    newValue: { control: 'text', description: 'Changed text.' },
    view: { control: 'inline-radio', options: ['unified', 'split'], description: 'Controlled view.' },
    defaultView: { control: 'inline-radio', options: ['unified', 'split'], description: 'Initial view when uncontrolled.' },
    viewToggle: { control: 'boolean', description: 'Renders a Unified/Split switch in the header.' },
    filename: { control: 'text', description: 'New file name, shown mono in the header.' },
    oldFilename: { control: 'text', description: 'Previous file name; when it differs the header shows a rename.' },
    language: { control: 'text', description: 'Language hint shown as a tag in the header.' },
    context: { control: { type: 'number', min: 0 }, description: 'Unchanged lines kept around each change; longer runs collapse.' },
    wordDiff: { control: 'boolean', description: 'Highlights changed words inside paired lines.' },
    lineNumbers: { control: 'boolean', description: 'Shows old/new line numbers.' },
    stats: { control: 'boolean', description: 'Shows the +added −removed counter.' },
    wrap: { control: 'boolean', description: 'Wraps long lines instead of scrolling. Defaults to true in split view.' },
    actions: { control: false, description: 'Extra header content placed at the end.' },
    label: { control: 'text', description: 'Accessible name of the scrollable region. Defaults to the filename.' },
    expandLabel: { control: false, description: 'Text of the expander row.' },
    emptyMessage: { control: 'text', description: 'Shown when both texts are identical.' },
    onViewChange: { control: false },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    oldValue: OLD_CONFIG,
    newValue: NEW_CONFIG,
    filename: 'presets/web-2048.yml',
    language: 'yaml',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[760px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiffViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unified view: removals above additions, unchanged runs collapsed around the changes. */
export const Default: Story = {};

/** Split view: old on the left, new on the right. Long lines wrap by default. */
export const Split: Story = {
  args: { defaultView: 'split' },
};

/** The header switch lets the reader pick the view. */
export const WithViewToggle: Story = {
  name: 'With view toggle',
  args: { viewToggle: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unified = canvas.getByRole('radio', { name: 'Unified' });
    const split = canvas.getByRole('radio', { name: 'Split' });
    await expect(unified).toBeChecked();
    // Keyboard: the switch is one tab stop; the arrow moves to Split, Space picks it.
    resetFocus();
    await tabTo(unified);
    await userEvent.keyboard('{ArrowRight}');
    await expect(split).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(split).toBeChecked();
    // Split rows have two halves separated by a border.
    await expect(canvasElement.querySelector('[data-diff-body] .border-s')).not.toBeNull();
  },
};

/** Controlled view, e.g. remembered per user. */
export const Controlled: Story = {
  render: (args) => {
    const [view, setView] = useState<DiffView>('split');
    return <DiffViewer {...args} view={view} onViewChange={setView} viewToggle />;
  },
};

/** Plain-text comparison: no filename, no line numbers — e.g. a policy or template change. */
export const PlainText: Story = {
  args: {
    oldValue: OLD_POLICY,
    newValue: NEW_POLICY,
    filename: undefined,
    language: undefined,
    lineNumbers: false,
    wrap: true,
    label: 'Archive policy changes',
  },
};

/** Renamed file: the header shows old → new. */
export const Renamed: Story = {
  args: { oldFilename: 'presets/default.yml', filename: 'presets/web-2048.yml' },
};

/** `context={Infinity}` shows every line, nothing collapses. */
export const FullFile: Story = {
  name: 'Full file',
  args: { context: Infinity },
};

/** With extra header actions. */
export const WithActions: Story = {
  name: 'With actions',
  args: {
    actions: (
      <Button size="sm" appearance="tonal">
        Apply changes
      </Button>
    ),
  },
};

/** Long lines scroll horizontally in unified view (or set `wrap`). Height is capped by the caller. */
export const LongLinesAndHeight: Story = {
  name: 'Long lines, capped height',
  args: {
    className: 'max-h-80',
    filename: '.env',
    language: undefined,
    oldValue: `AETHER_PORTAL=https://selene-weddings.aether.photo\nAETHER_WEBHOOK_URL=https://hooks.example.com/aether?events=gallery.published,gallery.downloaded&studio=selene-weddings&timeout=10\nPREVIEW_TTL=300\n`,
    newValue: `AETHER_PORTAL=https://selene-weddings.aether.photo\nAETHER_WEBHOOK_URL=https://hooks.example.com/aether?events=gallery.published,gallery.downloaded,order.paid&studio=selene-weddings&timeout=5\nPREVIEW_TTL=600\nEXPORT_QUEUE=priority\n`,
  },
};

/** Identical texts show the empty message. */
export const NoChanges: Story = {
  name: 'No changes',
  args: { newValue: OLD_CONFIG },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No changes')).toBeInTheDocument();
    await expect(canvasElement).not.toHaveTextContent(/lines added/);
  },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Changes in presets/web-2048.yml' });
    // Stats are spoken in words, not only "+N −M".
    await expect(canvasElement).toHaveTextContent(/\(\d+ lines added, \d+ removed\)/);
    // Changed lines carry a spoken prefix; word-level changes are <ins>/<del>.
    await expect(region).toHaveTextContent('Added:');
    await expect(region).toHaveTextContent('Removed:');
    await expect(region.querySelector('ins')).not.toBeNull();
    // A collapsed run expands in place and its button goes away.
    const gaps = within(region).getAllByRole('button', { name: /^Show \d+ unchanged lines?$/ });
    const lines = () => region.querySelectorAll('.flex').length;
    const before = lines();
    const hidden = Number(gaps[0].textContent!.match(/\d+/)![0]);
    // From the keyboard: Tab to the collapsed run, Enter expands it.
    resetFocus();
    await tabTo(gaps[0]);
    await userEvent.keyboard('{Enter}');
    await expect(within(region).queryAllByRole('button', { name: /^Show \d+ unchanged/ })).toHaveLength(gaps.length - 1);
    await expect(lines()).toBe(before - 1 + hidden);
  },
};
