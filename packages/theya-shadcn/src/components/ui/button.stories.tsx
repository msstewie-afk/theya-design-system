import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Star, Check, ArrowRight, Xmark, Trash, Plus } from 'iconoir-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Rebuilt on shadcn/ui conventions (Radix Slot + cva + Tailwind v4) — ' +
          'same prop API as the original CSS-modules Button, same tokens, same ' +
          'visual result. Three independent axes: `type` × `intent` × `size`.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'ghost'],
      description:
        'Surface treatment: solid fill, softly-tinted fill, outlined, or borderless.',
      table: { category: 'Appearance', defaultValue: { summary: 'filled' } },
    },
    intent: {
      control: 'select',
      options: ['primary', 'secondary', 'default', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color intent.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Controls height, padding, and typography together. 28 / 32 / 36 / 40 / 48px — 40px (xl) is the shared default row height, aligned with TextField/Select/Filter.',
      table: { category: 'Appearance', defaultValue: { summary: 'xl' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the button to the width of its container.',
      table: { category: 'Layout' },
    },
    iconOnly: {
      control: 'boolean',
      description: 'Renders as a square icon-only button (no label). Provide the icon via leftIcon.',
      table: { category: 'Layout' },
    },
    asChild: {
      control: 'boolean',
      description:
        "Renders Button's styles onto its child element via Radix Slot instead of " +
        'a <button> — e.g. to make a router <Link> look like a Button.',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Hard-disables the button (removed from the tab order, no events). See softDisabled for the focusable variant.',
      table: { category: 'Behavior' },
    },
    softDisabled: {
      control: 'boolean',
      description:
        'Looks disabled and ignores clicks/Enter/Space, but stays focusable and hoverable (aria-disabled). ' +
        'Pair it with a Tooltip that explains why the action is unavailable.',
      table: { category: 'Behavior' },
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner in place of leftIcon and disables the button.',
      table: { category: 'Behavior' },
    },
    // ReactNode props (JSX icons) can't be meaningfully edited via the
    // Controls panel — Storybook falls back to an auto-generated "object"
    // editor for them by default, which breaks the moment you interact
    // with it. Disable the control explicitly; set these via code instead
    // (a render function, like WithIcons/InteractiveLoading below).
    leftIcon: { control: false, description: 'Icon before the label.', table: { category: 'Content' } },
    rightIcon: { control: false, description: 'Icon after the label.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// A "pick an icon" select for the Playground only — leftIcon/rightIcon are
// real ReactNode props (disabled above for Controls), so this is a synthetic
// arg, not a Button prop: the render function below maps the chosen name to
// a real icon element and passes it into leftIcon/rightIcon for you.
const ICONS = { none: undefined, star: <Star />, check: <Check />, arrowRight: <ArrowRight />, close: <Xmark />, trash: <Trash />, plus: <Plus /> } as const;
type IconName = keyof typeof ICONS;

export const Playground: Story = {
  args: {
    children: 'Button',
    type: 'filled',
    intent: 'primary',
    size: 'xl',
    // @ts-expect-error — synthetic args below aren't real Button props
    leftIconName: 'none',
    rightIconName: 'none',
  },
  argTypes: {
    leftIconName: { control: 'select', options: Object.keys(ICONS), description: 'Preview only — picks an icon for leftIcon.', table: { category: 'Content' } },
    rightIconName: { control: 'select', options: Object.keys(ICONS), description: 'Preview only — picks an icon for rightIcon.', table: { category: 'Content' } },
  } as Partial<Record<string, unknown>>,
  render: ({ leftIconName, rightIconName, ...args }: React.ComponentProps<typeof Button> & { leftIconName?: IconName; rightIconName?: IconName }) => (
    <Button {...args} leftIcon={leftIconName ? ICONS[leftIconName] : undefined} rightIcon={rightIconName ? ICONS[rightIconName] : undefined} />
  ),
};

export const AllIntentsFilled: Story = {
  name: 'All intents (Filled)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'default', 'success', 'warning', 'danger', 'info'] as const).map(
        (intent) => (
          <Button key={intent} type="filled" intent={intent}>
            {intent}
          </Button>
        ),
      )}
    </div>
  ),
};

export const AllIntentsTonal: Story = {
  name: 'All intents (Tonal)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'default', 'success', 'warning', 'danger', 'info'] as const).map(
        (intent) => (
          <Button key={intent} type="tonal" intent={intent}>
            {intent}
          </Button>
        ),
      )}
    </div>
  ),
};

export const AllIntentsOutlined: Story = {
  name: 'All intents (Outlined)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'default', 'success', 'warning', 'danger', 'info'] as const).map(
        (intent) => (
          <Button key={intent} type="outlined" intent={intent}>
            {intent}
          </Button>
        ),
      )}
    </div>
  ),
};

export const AllIntentsGhost: Story = {
  name: 'All intents (Ghost)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'default', 'success', 'warning', 'danger', 'info'] as const).map(
        (intent) => (
          <Button key={intent} type="ghost" intent={intent}>
            {intent}
          </Button>
        ),
      )}
    </div>
  ),
};

export const AllTypesPrimary: Story = {
  name: 'All types (Primary)',
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button type="filled" intent="primary">
        Filled
      </Button>
      <Button type="tonal" intent="primary">
        Tonal
      </Button>
      <Button type="outlined" intent="primary">
        Outlined
      </Button>
      <Button type="ghost" intent="primary">
        Ghost
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">SM · 28</Button>
      <Button size="md">MD · 32</Button>
      <Button size="lg">LG · 36</Button>
      <Button size="xl">XL · 40 (default)</Button>
      <Button size="2xl">2XL · 48</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button leftIcon={<Star />}>Left icon</Button>
      <Button rightIcon={<Star />}>Right icon</Button>
      <Button iconOnly leftIcon={<Star />} aria-label="Favorite" />
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Button fullWidth>Full width</Button>
    </div>
  ),
};

export const AsChild: Story = {
  name: 'asChild — button-styled link',
  parameters: {
    docs: {
      description: {
        story:
          'With `asChild`, Button styles apply to the child element directly instead ' +
          'of wrapping it in a <button> — useful for router links that need to look ' +
          'like a Button but keep their own semantics/navigation behavior. Note this ' +
          'is `asChild` + Button\'s default `type="filled"` look — see the next story ' +
          'for `asChild` used without any Button visual styling.',
      },
    },
  },
  render: () => (
    <Button asChild>
      <a href="#">I am an &lt;a&gt;, styled as a Button</a>
    </Button>
  ),
};

export const AsChildPlainLink: Story = {
  name: 'asChild — mechanism only, no Button look',
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` only decides *what element renders* (Slot clones Button\'s ' +
          'classes onto your child instead of wrapping it in a <button>) — it has ' +
          'no opinion on visual style. Here `className` overrides Button\'s own ' +
          'classes entirely, so the result reads as an ordinary text link (color, ' +
          'hover underline) rather than a button-shaped one. Use this when you want ' +
          'a real <a> in the DOM without inheriting Button\'s look at all.',
      },
    },
  },
  render: () => (
    <Button
      asChild
      className="h-auto! w-auto! bg-transparent! border-none! p-0! text-[var(--color-text-text-link)]! underline-offset-4 hover:underline"
    >
      <a href="#">Plain text link, via asChild</a>
    </Button>
  ),
};

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

// Soft-disable: the button stays in the tab order, so keyboard and
// screen-reader users can reach it and hear the tooltip's reason.
export const SoftDisabledWithReason: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button softDisabled onClick={() => console.warn('softDisabled click leaked through')}>
          Publish
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add a title before publishing</TooltipContent>
    </Tooltip>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button loading>Filled</Button>
      <Button type="tonal" loading>
        Tonal
      </Button>
      <Button type="outlined" loading>
        Outlined
      </Button>
      <Button iconOnly loading aria-label="Loading" />
    </div>
  ),
};

function InteractiveLoadingDemo() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = () => {
    if (status !== 'idle') return;
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1600);
    setTimeout(() => setStatus('idle'), 3200);
  };

  return (
    <>
      {/* Scoped keyframe for the checkmark's entrance — a quick scale+fade
          pop, not just an instant swap. Kept local to this story; if this
          feels right, it's a good candidate to promote into globals.css
          as a reusable `animate-pop-in` utility. */}
      <style>{`
        @keyframes button-check-pop {
          0% { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
      <Button
        onClick={handleClick}
        loading={status === 'loading'}
        intent={status === 'success' ? 'success' : 'primary'}
        className="w-[160px]" // fixed to fit the widest label ("Save changes") so width doesn't jump between states — content stays centered via Button's own justify-center
        leftIcon={
          status === 'success' ? (
            <Check style={{ animation: 'button-check-pop 320ms cubic-bezier(0.34,1.56,0.64,1)' }} />
          ) : undefined
        }
      >
        {status === 'idle' && 'Save changes'}
        {status === 'loading' && 'Saving…'}
        {status === 'success' && 'Saved'}
      </Button>
    </>
  );
}

export const InteractiveLoading: Story = {
  name: 'Interactive: loading → success',
  parameters: {
    docs: {
      description: {
        story:
          'Click to trigger a simulated async action: Filled Primary → loading ' +
          'spinner → Filled Success with an animated checkmark → back to idle. ' +
          'The intent color transition (primary → success) rides the same ' +
          'background-color transition every Button already has, so it crossfades ' +
          'smoothly on its own — only the checkmark needed its own pop-in keyframe.',
      },
    },
  },
  render: () => <InteractiveLoadingDemo />,
};
