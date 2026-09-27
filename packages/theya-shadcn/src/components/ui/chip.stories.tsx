import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Check } from 'iconoir-react';
import { Chip, ChipRemove } from './chip';
import { StatusDot } from './status-dot';

/**
 * Chip — a compact pill for one value that can be selected and/or removed.
 * Unlike Badge (a static label), Chip is interactive by default — it renders
 * with the house pressed-state contract (`role="button"`, `data-pressed`)
 * out of the box, toggling on click or Enter/Space with no wiring required.
 * Pass `interactive={false}` for a purely static status pill.
 */
const meta = {
  title: 'Data Display/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'The canonical StatusTone vocabulary (shared with StatusDot/Badge).',
    },
    appearance: {
      control: 'inline-radio',
      options: ['subtle', 'solid'],
      description: 'Tinted background (default) vs full tone background + on-dark text.',
    },
    bordered: {
      control: 'boolean',
      description: 'Adds a tone-colored border on top of `appearance`. Off by default — every tone is borderless at rest.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '24px (sm) / 26px (md) / 32px (lg) — all clear the 24px remove-target floor.',
    },
    icon: { control: false, description: 'Leading icon. Swapped for a checkmark automatically on a selected `appearance="solid"` chip.' },
    interactive: { control: 'boolean', description: 'On by default — a real role="button" with press/keyboard handling.' },
    pressed: { control: 'boolean', description: 'Controlled selected state.' },
    defaultPressed: { control: 'boolean', description: 'Uncontrolled initial selected state.' },
    onPressedChange: { control: false, description: 'Fires with the new pressed state when interactive.' },
    asChild: { control: false, description: 'Renders the child element instead of a span, merging props.' },
    disabled: { control: 'boolean', description: 'Disables interaction and dims the chip.' },
    onClick: { control: false, description: 'Fires on click when interactive.' },
    onKeyDown: { control: false, description: 'Fires on keydown when interactive (handles Enter/Space activation).' },
    children: { control: 'text', description: 'Chip label.' },
  },
  args: { children: 'Chip' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive by default: click or press Enter/Space to toggle — no props needed. */
export const Interactive: Story = {
  args: { children: 'Critical' },
};

/** Controlled: the parent owns `pressed` via `onPressedChange`, same shape as Toggle. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [pressed, setPressed] = useState(false);
    return (
      <Chip pressed={pressed} onPressedChange={setPressed}>
        Critical
      </Chip>
    );
  },
};

/**
 * Selection changes the look, not just via CSS state: a selected `subtle`
 * (tonal) chip switches to the full solid tone coloring — Button's own
 * hover/press shades throughout, not a fixed "primary means selected"
 * override. A selected `solid` chip stays solid but swaps in a checkmark
 * ahead of the label. Click either to toggle.
 */
export const SelectedLooks: Story = {
  name: 'Selected looks',
  parameters: { controls: { disable: true } },
  render: function SelectedLooksExample() {
    const [tonalPressed, setTonalPressed] = useState(true);
    const [solidPressed, setSolidPressed] = useState(true);
    return (
      <div className="flex items-center gap-3">
        <Chip tone="success" appearance="subtle" pressed={tonalPressed} onPressedChange={setTonalPressed}>
          Tonal, selected
        </Chip>
        <Chip tone="success" appearance="solid" pressed={solidPressed} onPressedChange={setSolidPressed}>
          Solid, selected
        </Chip>
      </div>
    );
  },
};

/** A purely static pill (`interactive={false}`) — every tone in the canonical StatusTone vocabulary. */
export const Tones: Story = {
  args: { interactive: false },
  parameters: { controls: { exclude: ['tone', 'interactive'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-1">
      <Chip {...args} tone="neutral">
        Neutral
      </Chip>
      <Chip {...args} tone="primary">
        Primary
      </Chip>
      <Chip {...args} tone="success">
        Success
      </Chip>
      <Chip {...args} tone="warning">
        Warning
      </Chip>
      <Chip {...args} tone="danger">
        Destructive
      </Chip>
      <Chip {...args} tone="info">
        Info
      </Chip>
    </div>
  ),
};

/** `appearance="solid"` — full tone background + on-dark text, next to the default `subtle` tint. */
export const Solid: Story = {
  args: { interactive: false },
  parameters: { controls: { exclude: ['tone', 'appearance', 'interactive'] } },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Chip key={tone} {...args} tone={tone} appearance="subtle">
            {tone}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Chip key={tone} {...args} tone={tone} appearance="solid">
            {tone}
          </Chip>
        ))}
      </div>
    </div>
  ),
};

/** `bordered` — an explicit opt-in, not tied to any one tone: every tone stays
 * borderless at rest (see `Tones`/`Solid` above) unless `bordered` is set. */
export const Bordered: Story = {
  args: { interactive: false },
  parameters: { controls: { exclude: ['tone', 'appearance', 'interactive', 'bordered'] } },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Chip key={tone} {...args} tone={tone} appearance="subtle">
            {tone}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Chip key={tone} {...args} tone={tone} appearance="subtle" bordered>
            {tone}
          </Chip>
        ))}
      </div>
    </div>
  ),
};

/**
 * Each tone, interactive (the default) — at rest next to pressed. Pressed
 * always resolves to the same primary-subtle "selected" look regardless of
 * tone: pressed means "this one is selected", not "this tone is more
 * intense", so a Warning or Destructive chip does not stay yellow/red once
 * pressed.
 */
export const InteractiveTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-2">
      {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
        <div key={tone} className="flex items-center gap-3">
          <span className="w-20 font-body text-body-xs text-[var(--color-text-text-subtler)] capitalize">{tone}</span>
          <Chip tone={tone}>{tone}</Chip>
          <Chip tone={tone} defaultPressed>
            {tone}
          </Chip>
        </div>
      ))}
    </div>
  ),
};

/** With a leading `StatusDot`, another way to pair "dot + label" besides Badge. */
export const WithStatusDot: Story = {
  name: 'With status dot',
  args: { interactive: false },
  render: () => (
    <div className="flex gap-2">
      <Chip interactive={false} tone="success">
        <StatusDot tone="success" /> Running
      </Chip>
      <Chip interactive={false} tone="danger">
        <StatusDot tone="danger" /> Failed
      </Chip>
    </div>
  ),
};

/** `sm` / `md` / `lg` — all clear the 24px remove-target floor. */
export const Sizes: Story = {
  args: { interactive: false },
  parameters: { controls: { exclude: ['size', 'interactive'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-1">
      <Chip {...args} size="sm">
        Small
      </Chip>
      <Chip {...args} size="md">
        Medium
      </Chip>
      <Chip {...args} size="lg">
        Large
      </Chip>
    </div>
  ),
};

/** A leading icon via the `icon` prop (unstyled — sized automatically by the chip's size variant). */
export const WithIcon: Story = {
  name: 'With icon',
  args: {
    interactive: false,
    tone: 'success',
    icon: <Check />,
    children: 'Verified',
  },
};

/** A count-led label: the numeral carries `tabular-nums` (not `font-mono`, which this system reserves for machine identifiers). */
export const WithCount: Story = {
  name: 'With count',
  args: { interactive: false, tone: 'danger' },
  render: (args) => (
    <Chip {...args}>
      <StatusDot tone="danger" />
      <span className="tabular-nums">5</span> critical
    </Chip>
  ),
};

function RemovableDemo() {
  const [chips, setChips] = useState(['Critical', 'Open', 'Assigned to me']);
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((label) => (
        <Chip key={label} interactive={false} aria-label={label}>
          <span className="min-w-0 truncate">{label}</span>
          <ChipRemove aria-label={`Remove ${label}`} onClick={() => setChips((c) => c.filter((x) => x !== label))} />
        </Chip>
      ))}
    </div>
  );
}

/** Removability is independent of selectability: `interactive={false}` here, so only the trailing X is interactive. */
export const Removable: Story = {
  render: () => <RemovableDemo />,
};

/**
 * Interactive + removable together: clicking the X removes the chip without
 * also toggling its pressed state — `ChipRemove` stops the click from
 * bubbling to the chip's own press handler. Note the explicit `aria-label`
 * on the Chip itself: without it, a screen reader would announce the whole
 * chip as "Critical Remove Critical" (accessible-name-from-content recurses
 * into the nested ChipRemove's own label) instead of just "Critical".
 */
export const RemoveDoesNotTogglePressed: Story = {
  name: 'Remove does not toggle pressed',
  parameters: { controls: { disable: true } },
  render: function Example() {
    const [pressed, setPressed] = useState(false);
    const [removed, setRemoved] = useState(false);
    if (removed) {
      return (
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
          Removed (pressed was {pressed ? 'toggled' : 'never toggled'})
        </p>
      );
    }
    return (
      <Chip aria-label="Critical" pressed={pressed} onPressedChange={setPressed}>
        Critical
        <ChipRemove aria-label="Remove Critical" onClick={() => setRemoved(true)} />
      </Chip>
    );
  },
};

/** Simple on/off toggle, no tone or icon involved. */
export const Toggle: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip defaultPressed>Selected</Chip>
      <Chip>Unselected</Chip>
    </div>
  ),
};

/** Disabled blocks interaction and dims, in both the off and on states. */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['disabled'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-1">
      <Chip {...args} disabled>
        Critical
      </Chip>
      <Chip {...args} disabled defaultPressed icon={<Check />}>
        Critical
      </Chip>
    </div>
  ),
};

/** A long value truncates (`min-w-0 truncate` on the label span, `max-w-full` on the chip itself) instead of stretching the pill or its wrapping row. */
export const Truncates: Story = {
  args: { interactive: false },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="w-40">
      <Chip {...args}>
        <span className="min-w-0 truncate">A very long value that should truncate</span>
        <ChipRemove aria-label="Remove value" onClick={() => {}} />
      </Chip>
    </div>
  ),
};
