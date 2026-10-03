import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { FolderSettings, Trash } from 'iconoir-react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Price } from './price';
import { ScrollArea } from './scroll-area';
import { StickyActionBar } from './sticky-action-bar';
import { TextField } from './text-field';
import { stickyActionBarGuidelines } from './sticky-action-bar.guidelines';

/**
 * StickyActionBar — actions pinned to the bottom while content scrolls:
 * Save/Discard for a long form, bulk actions for a selection, a mobile
 * screen's one primary button. `bar` is a full-width strip (sticky inside
 * its scroll container), `floating` a centered card. `open` slides it in;
 * `message` is announced politely when it changes.
 *
 * Demo frames are overlay ScrollAreas, so `position="sticky"` pins to
 * their viewport instead of the Storybook canvas.
 */
const meta = {
  title: 'Actions/StickyActionBar',
  component: StickyActionBar,
  tags: ['autodocs'],
  parameters: { guidelines: stickyActionBarGuidelines, layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['bar', 'floating'], table: { category: 'Layout' } },
    position: { control: 'inline-radio', options: ['sticky', 'fixed'], table: { category: 'Layout' } },
    open: { control: 'boolean', table: { category: 'State' } },
    message: { control: 'text', table: { category: 'Content' } },
    onClose: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof StickyActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Demo frames scroll with Theya's own overlay ScrollArea; sticky pins to its viewport.
const FRAME = 'h-[420px] w-full max-w-[640px] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)]';

/** Edit any field: the bar appears with Discard / Save and stays at the bottom while you scroll the form. */
export const UnsavedChanges: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const initial = { name: 'Seashell storefront', domain: 'shop.seashell.dev', email: 'ops@seashell.dev', region: 'eu-west-1', repo: 'seashell/storefront', branch: 'main' };
    const [values, setValues] = useState(initial);
    const dirty = JSON.stringify(values) !== JSON.stringify(initial);
    return (
      <ScrollArea className={FRAME} aria-label="Site settings">
        <form className="flex flex-col gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
          <h2 className="font-heading text-heading-xs text-[var(--color-text-text)]">Site settings</h2>
          {(Object.keys(initial) as (keyof typeof initial)[]).map((key) => (
            <TextField key={key} label={key[0].toUpperCase() + key.slice(1)} widthSize="full" value={values[key]} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
          ))}
        </form>
        <StickyActionBar open={dirty} message="You have unsaved changes">
          <Button appearance="outlined" tone="secondary" onClick={() => setValues(initial)}>
            Discard
          </Button>
          <Button appearance="filled" tone="primary">
            Save changes
          </Button>
        </StickyActionBar>
      </ScrollArea>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Nothing to save: no bar.
    await expect(canvas.queryByRole('region', { name: 'Actions' })).not.toBeInTheDocument();
    const name = canvas.getByLabelText('Name');
    await userEvent.type(name, ' v2');
    const bar = canvas.getByRole('region', { name: 'Actions' });
    await expect(within(bar).getByText('You have unsaved changes')).toBeInTheDocument();
    // Discard closes the bar; focus goes back to the field it came from, not <body>.
    await userEvent.click(within(bar).getByRole('button', { name: 'Discard' }));
    await expect(canvas.queryByRole('region', { name: 'Actions' })).not.toBeInTheDocument();
    await expect(name).toHaveValue('Seashell storefront');
    await waitFor(() => expect(name).toHaveFocus());
  },
};

/** Select rows: a floating bar shows the count and bulk actions; the close button clears the selection. */
export const BulkSelection: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const sites = Array.from({ length: 14 }, (_, i) => `site-${String(i + 1).padStart(2, '0')}.seashell.dev`);
    const [selected, setSelected] = useState<string[]>(['site-02.seashell.dev', 'site-05.seashell.dev']);
    const toggle = (s: string) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
    return (
      <ScrollArea className={FRAME} aria-label="Sites">
        <ul className="flex flex-col p-2">
          {sites.map((s) => (
            <li key={s}>
              <label className="flex cursor-pointer items-center gap-3 rounded-[var(--size-border-radius-border-radius-lg)] px-3 py-2.5 font-body text-body-m text-[var(--color-text-text)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)]">
                <Checkbox checked={selected.includes(s)} onCheckedChange={() => toggle(s)} />
                {s}
              </label>
            </li>
          ))}
        </ul>
        <StickyActionBar
          variant="floating"
          open={selected.length > 0}
          message={`${selected.length} selected`}
          onClose={() => setSelected([])}
          closeLabel="Clear selection"
          aria-label="Bulk actions"
        >
          <Button appearance="ghost" tone="neutral" size="lg" leftIcon={<FolderSettings />}>
            Move
          </Button>
          <Button appearance="tonal" tone="danger" size="lg" leftIcon={<Trash />}>
            Delete
          </Button>
        </StickyActionBar>
      </ScrollArea>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = () => canvas.queryByRole('region', { name: 'Bulk actions' });
    await expect(within(bar()!).getByText('2 selected')).toBeInTheDocument();
    // The count follows the selection (polite live region).
    const site7 = canvas.getByRole('checkbox', { name: 'site-07.seashell.dev' });
    await userEvent.click(site7);
    await expect(within(bar()!).getByText('3 selected')).toBeInTheDocument();
    await expect(within(bar()!).getByText('3 selected')).toHaveAttribute('aria-live', 'polite');
    // Clear selection empties it and closes the bar; focus returns to the last checkbox used.
    await userEvent.click(within(bar()!).getByRole('button', { name: 'Clear selection' }));
    await expect(bar()).not.toBeInTheDocument();
    await expect(canvas.queryAllByRole('checkbox', { checked: true })).toHaveLength(0);
    await waitFor(() => expect(site7).toHaveFocus());
  },
};

/** A phone screen's single primary action: full width, with the total next to it. */
export const MobilePrimary: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ScrollArea className={`${FRAME} max-w-[360px]`} aria-label="Plan details">
      <div className="flex flex-col gap-3 p-5 font-body text-body-m text-[var(--color-text-text)]">
        <h2 className="font-heading text-heading-xs">Business plan</h2>
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="text-[var(--color-text-text-subtle)]">
            Feature {i + 1}: daily backups, staging sites and priority support included.
          </p>
        ))}
      </div>
      <StickyActionBar message={<Price amount={29} currency="EUR" locale="en-IE" period="mo" size="md" />}>
        <Button appearance="filled" tone="primary" size="xl">
          Continue
        </Button>
      </StickyActionBar>
    </ScrollArea>
  ),
};
