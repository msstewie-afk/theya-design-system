import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselIndicators, type CarouselApi } from './carousel';
import { Badge } from './badge';
import { StatusDot } from './status-dot';

const meta: Meta<typeof Carousel> = {
  title: 'Layout/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Scroll axis. Drives the track direction and arrow placement.',
    },
    'aria-label': {
      control: 'text',
      description: "Names the region for screen readers (defaults to 'Carousel').",
    },
    opts: { control: false, description: 'Embla carousel options.' },
    plugins: { control: false, description: 'Embla carousel plugins.' },
    setApi: { control: false, description: 'Called with the Embla API instance once mounted.' },
  },
  args: { orientation: 'horizontal', 'aria-label': 'Featured templates' },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

/** Labels of the slides currently exposed (not aria-hidden / inert). */
const visibleSlides = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'))
    .filter((el) => !el.hasAttribute('aria-hidden'))
    .map((el) => el.getAttribute('aria-label') ?? el.textContent?.trim());

const TEMPLATES = ['Starter', 'Business', 'Agency', 'Enterprise'];

const TILE = 'flex h-44 items-center justify-center rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-12';

/** Single-item horizontal track. Tab to the region and page with Left/Right, drag
 * the slides, or use the inset arrows. Slide content is padded (`px-12`) so the
 * arrows never cover it. */
export const Default: Story = {
  render: (args) => (
    <Carousel {...args} className="mx-auto w-full max-w-md">
      <CarouselContent>
        {TEMPLATES.map((name, i) => (
          <CarouselItem key={name} aria-label={`${i + 1} of ${TEMPLATES.length}`}>
            <div className={TILE}>
              <span className="font-body text-body-s font-medium text-[var(--color-text-text)]">{name}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Featured templates' });
    await expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });

    // Only the current slide is exposed; the rest are hidden and inert.
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['1 of 4']));
    await expect(prev).toBeDisabled();

    await userEvent.click(next);
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['2 of 4']));
    await userEvent.click(next);
    await userEvent.click(next);
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['4 of 4']));
    // Next disables on the last slide; focus moves to the region instead
    // of dropping to <body>.
    await waitFor(() => expect(next).toBeDisabled());
    await waitFor(() => expect(region).toHaveFocus());

    // Arrow keys page while the region has focus.
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['3 of 4']));
    await expect(next).toBeEnabled();
  },
};

/** Multi-item track: each slide takes a fractional `basis-*` so two show at once
 * on mobile and three from `lg` up. `opts={{ align: 'start' }}` keeps slides
 * left-aligned as they page. */
export const MultiItem: Story = {
  args: { 'aria-label': 'Regions' },
  render: (args) => (
    <Carousel {...args} opts={{ align: 'start' }} className="w-full">
      <CarouselContent>
        {['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1', 'sa-east-1'].map((region) => (
          <CarouselItem key={region} className="basis-1/2 lg:basis-1/3">
            <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-12 py-4">
              <p className="font-body text-body-s font-medium text-[var(--color-text-text)]">Region</p>
              <p className="mt-1 font-mono text-body-xs text-[var(--color-text-text-subtler)]">{region}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** Vertical orientation: the track flows top-to-bottom, arrows page Up/Down, and
 * the Arrow keys follow suit. A fixed-height viewport bounds the visible slides. */
export const Vertical: Story = {
  args: { orientation: 'vertical', 'aria-label': 'Recent deploys' },
  parameters: { controls: { exclude: ['orientation'] } },
  render: (args) => (
    <Carousel {...args} opts={{ align: 'start' }} className="mx-auto w-full max-w-sm">
      <CarouselContent className="h-64">
        {['v2.4.0', 'v2.3.1', 'v2.3.0', 'v2.2.4', 'v2.2.3'].map((version) => (
          <CarouselItem key={version} className="basis-1/2">
            <div className="flex h-full items-center justify-center rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4">
              <span className="font-mono text-body-s text-[var(--color-text-text)]">{version}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Recent deploys' });
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['v2.4.0', 'v2.3.1']));
    region.focus();
    // Vertical: Up/Down page, Left/Right do nothing.
    await userEvent.keyboard('{ArrowRight}');
    await expect(visibleSlides(canvasElement)).toEqual(['v2.4.0', 'v2.3.1']);
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(visibleSlides(canvasElement)).toContain('v2.3.0'));
  },
};

/** Looping track via `opts={{ loop: true }}`: the arrows never disable at the
 * edges because paging wraps around. */
export const Looping: Story = {
  args: { 'aria-label': 'Plans' },
  render: (args) => (
    <Carousel {...args} opts={{ loop: true }} className="mx-auto w-full max-w-md">
      <CarouselContent>
        {['Starter', 'Pro', 'Scale'].map((plan, i) => (
          <CarouselItem key={plan} aria-label={`${i + 1} of 3`}>
            <div className={TILE}>
              <span className="font-body text-body-s font-medium text-[var(--color-text-text)]">{plan}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['1 of 3']));
    // Looping: never disabled, Previous from the first wraps to the last.
    await expect(prev).toBeEnabled();
    await userEvent.click(prev);
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['3 of 3']));
    await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeEnabled();
  },
};

/** Grab the embla api with `setApi` to build a live slide counter. The readout is
 * `aria-live="polite"` so screen readers hear the position change as you page. */
function CounterCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const notes = ['v2.4.0', 'v2.3.1', 'v2.3.0'];

  return (
    <div className="mx-auto w-full max-w-md">
      <Carousel aria-label="Release notes" setApi={setApi}>
        <CarouselContent>
          {notes.map((version, i) => (
            <CarouselItem key={version} aria-label={`${i + 1} of ${notes.length}`}>
              <div className={`${TILE} flex-col gap-2`}>
                <Badge tone="success">
                  <StatusDot tone="success" />
                  Released
                </Badge>
                <span className="font-mono text-body-s text-[var(--color-text-text)]">{version}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <p className="mt-3 text-center font-body text-body-xs text-[var(--color-text-text-subtler)]" aria-live="polite">
        Slide {current} of {count}
      </p>
    </div>
  );
}

/** Imperative control: a slide counter driven by the embla api (`setApi`). */
export const WithCounter: Story = {
  parameters: { controls: { exclude: ['orientation', 'aria-label'] } },
  render: () => <CounterCarousel />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Slide 1 of 3')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => expect(canvas.getByText('Slide 2 of 3')).toBeInTheDocument());
  },
};

/** CarouselIndicators: a slide picker that stays in sync with arrows, keys and drag. Each dot is a button; the current one carries aria-current. */
export const WithIndicators: Story = {
  args: { 'aria-label': 'Featured templates' },
  render: (args) => (
    <Carousel {...args} className="mx-auto w-full max-w-md">
      <CarouselContent>
        {TEMPLATES.map((name, i) => (
          <CarouselItem key={name} aria-label={`${i + 1} of ${TEMPLATES.length}`}>
            <div className={TILE}>
              <span className="font-body text-body-s font-medium text-[var(--color-text-text)]">{name}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselIndicators className="mt-3 justify-center" />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = within(canvas.getByRole('group', { name: 'Slides' }));
    await waitFor(() => expect(dots.getAllByRole('button')).toHaveLength(4));
    // WCAG 2.5.8: every dot's hit area is at least 24x24, even though
    // the drawn dot is 8px.
    for (const dot of dots.getAllByRole('button')) {
      const { width, height } = dot.getBoundingClientRect();
      await expect(width).toBeGreaterThanOrEqual(24);
      await expect(height).toBeGreaterThanOrEqual(24);
    }
    await expect(dots.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(dots.getByRole('button', { name: 'Go to slide 3' }));
    await waitFor(() => expect(visibleSlides(canvasElement)).toEqual(['3 of 4']));
    await expect(dots.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true');
    await expect(dots.getByRole('button', { name: 'Go to slide 1' })).not.toHaveAttribute('aria-current');

    // The arrows keep the dots in sync.
    await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }));
    await waitFor(() => expect(dots.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true'));
  },
};
