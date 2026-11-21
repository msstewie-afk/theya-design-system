import type { Meta, StoryObj } from '@storybook/react';
import { Bookmark, Search } from 'iconoir-react';
import { Button } from '../../ui/button';
import { BookmarksPreview, DemoMiniLink } from './demo-data';
import { DeviceFrame } from './device-frame';
import { deviceFrameGuidelines } from './device-frame.guidelines';

const meta: Meta<typeof DeviceFrame> = {
  title: 'Patterns: Landing/DeviceFrame',
  component: DeviceFrame,
  tags: ['autodocs'],
  parameters: { guidelines: deviceFrameGuidelines, layout: 'centered' },
  argTypes: { children: { control: false } },
};
export default meta;
type Story = StoryObj<typeof DeviceFrame>;

function PhoneScreen() {
  return (
    <div className="flex h-full flex-col gap-4 px-5 pb-5 pt-14">
      <div className="flex items-center justify-between">
        <h3 className="m-0 font-heading text-heading-s">Reading</h3>
        <Button appearance="ghost" tone="neutral" size="sm" iconOnly aria-label="Search">
          <Search />
        </Button>
      </div>
      <div className="flex flex-col gap-2 [&>*]:w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <DemoMiniLink key={i} index={i} />
        ))}
      </div>
      <Button className="mt-auto" fullWidth>
        <Bookmark aria-hidden />
        Save a link
      </Button>
    </div>
  );
}

/** Live Theya components on the phone screen. Width comes from className. */
export const Phone: Story = {
  render: (args) => (
    <DeviceFrame {...args} className="w-[300px]">
      <PhoneScreen />
    </DeviceFrame>
  ),
};

/** screen="canvas": the theme's gradient on the screen, text and buttons turn white. */
export const PhoneOnCanvas: Story = {
  parameters: { globals: { brand: 'dusk' } },
  render: (args) => (
    <DeviceFrame {...args} screen="canvas" className="w-[300px]">
      <div className="flex h-full flex-col px-6 pb-6 pt-16">
        <p className="m-0 font-heading text-heading-l">Everything you meant to read, in one place</p>
        <p className="m-0 mt-3 font-body text-body-m text-[var(--color-text-text-subtle)]">Save from any app. Find it by a word you remember.</p>
        <div className="mt-auto flex flex-col gap-2">
          <Button fullWidth>Get started</Button>
          <Button appearance="tonal" fullWidth>
            I have an account
          </Button>
        </div>
      </div>
    </DeviceFrame>
  ),
};

/** A web app in a browser window, with the address in the bar. */
export const Browser: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <DeviceFrame {...args} type="browser" url="bookmarks.app/reading" className="mx-auto max-w-3xl">
      <div className="p-6">
        <BookmarksPreview floating={false} />
      </div>
    </DeviceFrame>
  ),
};

/** Three sizes: radius, bezel and island scale with the width. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {[200, 260, 320].map((w) => (
        <DeviceFrame key={w} style={{ width: w }}>
          <div className="size-full bg-[var(--color-bg-primary-bg-primary-subtle)]" />
        </DeviceFrame>
      ))}
    </div>
  ),
};
