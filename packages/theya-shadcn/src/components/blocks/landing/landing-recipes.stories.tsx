import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { AppleMac, Google } from "iconoir-react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { CountUp } from "../../ui/count-up";
import { TextEffect } from "../../ui/text-effect";
import { SiteFooter } from "../navigation/site-footer";
import { Hero } from "./hero";
import { LandingCard, type LandingCardHue } from "./landing-cards";
import { StickyStack } from "./landing-scroll";
import { CtaBand, FaqSection, TestimonialCase } from "./landing-sections";
import { StatsRow } from "./landing-stats";
import { ScrollHighlight } from "./scroll-effects";
import { SiteHeader } from "./site-header";
import { Wordmark } from "./wordmark";

/**
 * Recipes from the Awwwards 2026 atlas (project doc landing-trends-2026-11-15,
 * ld-02) as whole pages built from Theya blocks.
 */
const meta: Meta = {
  title: "Patterns: Landing/Recipes",
  parameters: { layout: "fullscreen", docs: { source: { type: "code" } } },
};
export default meta;
type Story = StoryObj;

/** A phone screen drawn with Theya: a recipe list, a stage, a shopping list. */
function Screen({ kind }: { kind: "today" | "stage" | "list" }) {
  const rows =
    kind === "today"
      ? [
          ["Rice congee with ginger", "25 min", "Soft"],
          ["Poached chicken, carrots", "30 min", "Soft"],
          ["Banana oat smoothie", "5 min", "Liquid"],
        ]
      : kind === "stage"
        ? [
            ["Week 1–2", "Clear and full liquids", "Now"],
            ["Week 3–4", "Soft, low fibre", "Next"],
            ["Week 5+", "Back to your usual food", ""],
          ]
        : [
            ["White rice", "500 g", ""],
            ["Chicken breast", "2", ""],
            ["Carrots", "4", ""],
          ];
  const title =
    kind === "today"
      ? "Today"
      : kind === "stage"
        ? "Your stage"
        : "Shopping list";
  return (
    <div
      data-surface="card"
      className="mx-auto w-full max-w-[18rem] overflow-hidden rounded-[2rem] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 shadow-[var(--shadow-lg,0_12px_32px_-12px_rgb(0_0_0/0.25))]"
    >
      <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">
        PlateCovery
      </p>
      <p className="m-0 mt-1 font-heading text-heading-s text-[var(--color-text-text)]">
        {title}
      </p>
      <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        {rows.map(([a, b, c]) => (
          <li
            key={a}
            className="flex items-center justify-between gap-2 rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-3 py-2"
          >
            <span className="min-w-0">
              <span className="block truncate font-body text-body-s font-medium text-[var(--color-text-text)]">
                {a}
              </span>
              <span className="block font-body text-body-xs text-[var(--color-text-text-subtle)]">
                {b}
              </span>
            </span>
            {c && (
              <Badge
                size="sm"
                appearance="tonal"
                tone={c === "Now" ? "primary" : "neutral"}
              >
                {c}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A screen on a colored ground, the atlas's mosaic tile. */
function Tile({
  hue,
  kind,
  className,
}: {
  hue: LandingCardHue;
  kind: "today" | "stage" | "list";
  className?: string;
}) {
  return (
    <LandingCard
      surface="tonal"
      hue={hue}
      className={`flex items-center justify-center p-6 ${className ?? ""}`}
    >
      <Screen kind={kind} />
    </LandingCard>
  );
}

function StoreButtons() {
  return (
    <>
      <Button size="2xl" leftIcon={<AppleMac />}>
        App Store
      </Button>
      <Button size="2xl" appearance="outlined" leftIcon={<Google />}>
        Google Play
      </Button>
    </>
  );
}

const SCENARIOS = [
  {
    hue: "primary" as const,
    kind: "stage" as const,
    title: "A plan for each stage",
    text: "Tell the app where you are in recovery, and it shows only the recipes that fit: liquids first, then soft food, then your usual meals.",
  },
  {
    hue: "secondary" as const,
    kind: "today" as const,
    title: "Three gentle meals a day",
    text: "Short recipes with plain ingredients, cooking times and what to swap when something does not agree with you.",
  },
  {
    hue: "success" as const,
    kind: "list" as const,
    title: "One list for the shop",
    text: "Pick the week’s recipes and the shopping list writes itself, grouped the way the supermarket is.",
  },
];

/**
 * The restrained app landing (atlas recipe): a split hero with a mosaic of
 * screens on colored grounds and store buttons, one statement that lights
 * up on scroll, three scenarios in a sticky stack, numbers, a story, the
 * questions, a closing call and a footer that stands on a cut wordmark.
 * Budget: smooth scroll, reveals, one sticky scene; no preloader, WebGL or
 * custom cursor. The starting point for the PlateCovery site; the copy is a
 * placeholder.
 */
export const AppRestrained: Story = {
  name: "App, restrained",
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <SiteHeader
        skipToId="main-app"
        logo={
          <span className="font-heading text-heading-s text-[var(--color-text-text)]">
            PlateCovery
          </span>
        }
        actions={<Button>Get the app</Button>}
      />
      <main id="main-app" tabIndex={-1} className="outline-none">
        <Hero
          layout="split"
          className="pt-12 lg:pt-16"
          eyebrow={
            <span className="caption-mono text-[var(--color-text-text-subtle)]">
              Recipes for recovery
            </span>
          }
          title={
            <TextEffect effect="split">
              Gentle food for the weeks after surgery
            </TextEffect>
          }
          description="Recipes sorted by recovery stage, with times, swaps and a shopping list. Check with your care team what fits your recovery."
          actions={<StoreButtons />}
          note="Free on iPhone and Android"
          media={
            <div
              className="grid grid-cols-2 gap-3"
              aria-label="PlateCovery screens: today’s recipes, recovery stages and a shopping list"
              role="img"
            >
              <Tile hue="primary" kind="today" className="row-span-2" />
              <Tile hue="warning" kind="stage" />
              <Tile hue="success" kind="list" />
            </div>
          }
        />
        <section
          data-scale="display"
          className="section-display"
          aria-label="Why"
        >
          <div className="container-display">
            <ScrollHighlight className="m-0 max-w-[22ch] font-heading text-heading-2xl">
              Eating well after surgery should not mean reading forums at
              midnight.
            </ScrollHighlight>
          </div>
        </section>
        <section
          data-scale="display"
          className="section-display !pt-0"
          aria-label="How it works"
        >
          <div className="container-display">
            <StickyStack>
              {SCENARIOS.map((s, i) => (
                <LandingCard
                  key={s.title}
                  surface="tonal"
                  hue={s.hue}
                  className="grid min-h-[26rem] items-center gap-8 p-6 lg:grid-cols-2 lg:p-12"
                >
                  <div className="flex flex-col gap-4">
                    <p className="m-0 caption-mono">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="m-0 font-heading text-heading-xl">
                      {s.title}
                    </h2>
                    <p className="m-0 font-body text-body-l">{s.text}</p>
                  </div>
                  <Screen kind={s.kind} />
                </LandingCard>
              ))}
            </StickyStack>
          </div>
        </section>
        <section
          data-scale="display"
          className="section-display !pt-0"
          aria-label="In numbers"
        >
          <div className="container-display">
            <StatsRow
              items={[
                {
                  value: <CountUp to={240} suffix="+" />,
                  label: "recipes, sorted by stage",
                },
                { value: "3", label: "stages, from liquids to usual food" },
                {
                  value: <CountUp to={15} suffix=" min" />,
                  label: "average cooking time",
                },
              ]}
            />
          </div>
        </section>
        <section
          data-scale="display"
          className="section-display !pt-0"
          aria-label="A story"
        >
          <div className="container-display">
            <TestimonialCase
              quote="The first weeks I was afraid to eat anything. Having a short list of what fits my stage took that fear away."
              name="Anna K."
              role="Six weeks after surgery"
              avatar={
                <Avatar>
                  <AvatarFallback>AK</AvatarFallback>
                </Avatar>
              }
              media={<img src="/asset-examples/silk/2.webp" alt="" />}
            />
          </div>
        </section>
        <FaqSection
          title="Questions"
          items={[
            {
              question: "Is this medical advice?",
              answer:
                "No. The recipes follow common recovery guidance; your surgeon or dietitian decides what fits you.",
            },
            {
              question: "Which surgeries is it for?",
              answer:
                "Bowel surgery, for now. Each recipe says which stage it fits.",
            },
            {
              question: "Does it cost anything?",
              answer:
                "The recipes are free. A paid plan adds meal plans and a shared shopping list.",
            },
          ]}
        />
        <CtaBand
          title="Start with today’s three meals"
          actions={<StoreButtons />}
          note="Free on iPhone and Android."
        />
      </main>
      {/* The footer stands on the cut wordmark: one ground for both. */}
      <div className="bg-[var(--color-bg-surface-bg-surface-sunken)]">
        <SiteFooter
          appName="PlateCovery"
          logo={
            <span className="font-heading text-heading-s text-[var(--color-text-text)]">
              PlateCovery
            </span>
          }
          tagline="Gentle food for recovery."
          columns={[
            {
              title: "App",
              links: [
                { label: "Recipes", href: "#recipes" },
                { label: "Stages", href: "#stages" },
                { label: "Pricing", href: "#pricing" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ],
            },
          ]}
          legal={[
            { label: "Terms", href: "#terms" },
            { label: "Privacy", href: "#privacy" },
          ]}
          year={2026}
          className="border-t-0 bg-transparent"
          contentClassName="container-display"
        />
        <div className="container-display-wide">
          <Wordmark
            crop="bottom"
            aria-hidden
            className="text-[var(--color-text-text)]"
          >
            PlateCovery
          </Wordmark>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole("main")).toBeInTheDocument();
  },
};
