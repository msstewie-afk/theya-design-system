import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  ArrowRight,
  NavArrowRight,
  Sparks,
  Upload,
} from "iconoir-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { TextField } from "../components/ui/text-field";
import { SectionPanel } from "../components/blocks/landing/section-panel";

/**
 * gr-01 prototype: the gradient canvas (data-canvas="gradient") with white
 * text, glass and white cards on it. The theme's gradient comes from its
 * profile (Dusk); any other theme falls back to its flat primary fill.
 */
const meta: Meta = {
  title: "Design System/Gradient canvas",
  parameters: { layout: "fullscreen" },
  globals: { brand: "dusk" },
};
export default meta;
type Story = StoryObj;

/** A phone-sized screen; the canvas is the screen itself. */
function Phone({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={label}
      data-canvas="gradient"
      className="flex h-[760px] w-[360px] shrink-0 flex-col overflow-hidden rounded-[40px] px-5 pt-6 pb-5"
    >
      {children}
    </section>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button appearance="outlined" tone="neutral" iconOnly aria-label="Back">
        <ArrowLeft />
      </Button>
      <h2 className="text-heading-xs">{title}</h2>
      <Button
        appearance="outlined"
        tone="neutral"
        iconOnly
        aria-label="Suggestions"
      >
        <Sparks />
      </Button>
    </div>
  );
}

function Onboarding() {
  return (
    <Phone label="Onboarding">
      <p className="text-heading-xs">Fieldnotes</p>
      <p className="mt-2 max-w-[220px] text-body-m text-[var(--color-text-text-subtle)]">
        Turn your notes into a calm daily practice
      </p>
      <div className="mt-auto" />
      <h1 className="text-heading-xl">Write a little. Notice a lot.</h1>
      <p className="mt-3 text-body-l text-[var(--color-text-text-subtle)]">
        Three short prompts a day, and a weekly look back at what changed.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Button
          size="lg"
          appearance="filled"
          tone="primary"
          rightIcon={<ArrowRight />}
        >
          Get started
        </Button>
        <Button size="lg" appearance="outlined" tone="neutral">
          I have an account
        </Button>
      </div>
    </Phone>
  );
}

const MOODS = [
  { name: "Focus", value: 7 },
  { name: "Energy", value: 5 },
  { name: "Calm", value: 8 },
  { name: "Gratitude", value: 4 },
];

function Week({ suffix = '' }: { suffix?: string }) {
  return (
    <Phone label={`Your week${suffix}`}>
      <TopBar title="Your week" />
      <div className="mt-8 text-center">
        <p className="text-body-m text-[var(--color-text-text-subtle)]">
          Average this week
        </p>
        <p className="text-[64px] leading-none font-[var(--typography-weight-light,300)] tabular-nums">
          6.4
        </p>
      </div>
      <ul className="mt-8 flex flex-col gap-2">
        {MOODS.map(({ name, value }) => (
          <li
            key={name}
            className="glass rounded-[var(--size-border-radius-border-radius-2xl)] px-4 py-3"
          >
            <div className="flex items-baseline justify-between text-body-m">
              <span>{name}</span>
              <span className="tabular-nums">{value}</span>
            </div>
            <Progress
              className="mt-2"
              value={value * 10}
              aria-label={`${name}, ${value} of 10`}
            />
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-3">
        <Button
          className="flex-1"
          size="lg"
          appearance="outlined"
          tone="neutral"
        >
          Share
        </Button>
        <Button className="flex-1" size="lg" appearance="filled" tone="primary">
          New entry
        </Button>
      </div>
    </Phone>
  );
}

function Entry() {
  return (
    <Phone label="New entry">
      <TopBar title="New entry" />
      <p className="mt-8 text-heading-l">What gave you energy today?</p>
      <p className="mt-2 text-body-m text-[var(--color-text-text-subtle)]">
        Prompt 2 of 3
      </p>
      <Progress className="mt-3" value={66} aria-label="Prompt 2 of 3" />
      <Card className="mt-auto -mx-1">
        <CardContent className="flex flex-col gap-4 pt-5">
          <CardTitle>Your answer</CardTitle>
          {/* Inside a white card everything is the regular light theme. */}
          <TextField
            widthSize="full"
            label="A few words"
            placeholder="A walk before work"
            description="Two or three words are enough"
          />
          <Button size="lg" appearance="filled" tone="primary">
            Save and continue
          </Button>
        </CardContent>
      </Card>
    </Phone>
  );
}

export const MobileScreens: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 bg-[var(--color-bg-surface-bg-surface-base)] p-8">
      <Onboarding />
      <Week />
      <Entry />
    </div>
  ),
};

function Hero({ suffix = '' }: { suffix?: string }) {
  return (
    <SectionPanel
      tone="gradient"
      className="rounded-[var(--size-border-radius-border-radius-5xl)] px-6"
    >
      {/* Kept to the dark center: the framed canvas fades to a light edge at the sides. */}
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[760px] items-center justify-between gap-4"
      >
        <span className="text-heading-s">Fieldnotes</span>
        <ul className="glass hidden gap-1 rounded-full p-1 md:flex">
          {["Product", "Pricing", "Teams", "Journal"].map((item) => (
            <li key={item}>
              <Button appearance="ghost" tone="neutral" size="sm">
                {item}
              </Button>
            </li>
          ))}
        </ul>
        <Button appearance="filled" tone="primary" size="sm">
          Sign in
        </Button>
      </nav>
      <div className="mx-auto mt-16 max-w-[760px] text-center">
        <h1 className="text-display-s">
          Turn your notes into a calm daily practice
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-body-xl text-[var(--color-text-text-subtle)]">
          Three short prompts a day and a weekly look back. Private by default,
          on every device.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            appearance="filled"
            tone="primary"
            rightIcon={<ArrowRight />}
          >
            Start free
          </Button>
          <Button size="lg" appearance="outlined" tone="neutral">
            See how it works
          </Button>
        </div>
      </div>
      <Card className="mx-auto mt-14 max-w-[560px]">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Upload
            className="size-8 text-[var(--color-icon-icon-primary)]"
            aria-hidden="true"
          />
          <p className="text-heading-s">Import your old notes</p>
          <p className="text-body-m text-[var(--color-text-text-subtle)]">
            Markdown, Apple Notes or a PDF. We sort them into prompts.
          </p>
          <Button
            appearance="tonal"
            tone="primary"
            rightIcon={<NavArrowRight />}
          >
            Choose files
          </Button>
        </CardContent>
      </Card>
    </SectionPanel>
  );
}

export const LandingHero: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface-base)] p-4">
      <Hero />
    </div>
  ),
};

/** The three gradient themes side by side: the same components, three profiles. */
export const Presets: Story = {
  render: () => (
    <div className="flex flex-col gap-10 bg-[var(--color-bg-surface-bg-surface-base)] p-6">
      {(["dusk", "lagoon", "ochre"] as const).map((brand) => (
        <div key={brand} data-brand={brand} className="flex flex-col gap-4">
          <h2 className="text-heading-m capitalize text-[var(--color-text-text)]">
            {brand}
          </h2>
          <div className="flex gap-6">
            <Week suffix={`, ${brand}`} />
            <div className="min-w-0 flex-1">
              <Hero suffix={`, ${brand}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
