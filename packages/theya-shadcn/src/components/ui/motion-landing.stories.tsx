import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { CountUp } from './count-up';
import { Marquee } from './marquee';
import { Reveal, RevealGroup } from './reveal';
import { Aurora, SurfaceEffect } from './surface-effect';
import { TextEffect } from './text-effect';

/**
 * The Motion presets together on one landing page, the way they're meant
 * to be dosed: one animated headline, one logo strip, one stats row, one
 * recommended plan with a beam. Scroll the canvas.
 */
const meta = {
  title: 'Motion/Landing example',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const CARD = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5';

export const Landing: Story = {
  render: () => (
    <div className="flex flex-col gap-16 px-4 py-10 md:px-6">
      <section className="relative isolate flex flex-col items-center gap-4 overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] px-6 py-20 text-center">
        <Aurora />
        <TextEffect effect="split" as="h1" trigger="mount" className="font-body text-heading-xl font-semibold text-[var(--color-text-text)]">
          Hosting that gets out of the way
        </TextEffect>
        <p className="text-body-l text-[var(--color-text-text-subtle)]">
          Built for <TextEffect effect="typewriter" phrases={['your shop.', 'your blog.', 'your docs.']} />
        </p>
        <Button size="xl">Start free</Button>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-body-s text-[var(--color-text-text-subtler)]">Trusted by teams at</p>
        <Marquee className="w-full max-w-4xl">
          {['Northwind', 'Kestrel', 'Quartz', 'Lumen', 'Babel', 'Harbor', 'Fieldnote'].map((n) => (
            <span key={n} className="font-body text-heading-xs font-semibold whitespace-nowrap text-[var(--color-text-text-subtle)]">
              {n}
            </span>
          ))}
        </Marquee>
      </section>

      <Reveal>
        <dl className="mx-auto grid max-w-3xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {[
            { label: 'Sites hosted', value: <CountUp to={12400} /> },
            { label: 'Uptime', value: <CountUp to={99.98} suffix="%" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> },
            { label: 'Average support reply', value: <CountUp to={4} suffix=" min" /> },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <dd className="font-body text-heading-l font-semibold text-[var(--color-text-text)]">{s.value}</dd>
              <dt className="order-first text-body-s text-[var(--color-text-text-subtler)]">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <RevealGroup className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        <div className={CARD}>
          <p className="text-body-l font-semibold">Starter</p>
          <p className="text-body-m text-[var(--color-text-text-subtle)]">One site, daily backups.</p>
        </div>
        <SurfaceEffect effect="beam" className="rounded-[var(--size-border-radius-border-radius-2xl)]">
          <div className="p-5">
            <p className="text-body-l font-semibold">Pro — recommended</p>
            <p className="text-body-m text-[var(--color-text-text-subtle)]">Five sites, hourly backups, staging.</p>
          </div>
        </SurfaceEffect>
        <div className={CARD}>
          <p className="text-body-l font-semibold">Scale</p>
          <p className="text-body-m text-[var(--color-text-text-subtle)]">Unlimited sites, priority support.</p>
        </div>
      </RevealGroup>
    </div>
  ),
};
