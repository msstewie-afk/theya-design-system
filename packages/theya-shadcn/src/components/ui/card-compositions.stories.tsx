import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, BadgeCheck, ClipboardCheck, Community, Download, Globe, Group, Headset, Medal, Sparks, StarSolid } from 'iconoir-react';
import { Card, CardAction, CardAvatar, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle } from './card';
import { Avatar } from './avatar';
import { AvatarGroup } from './avatar-group';
import { Badge } from './badge';
import { Button } from './button';
import { DotSeparator } from './dot-separator';
import { Rating } from './rating';
import { Sparkline } from './sparkline';

/**
 * Card compositions — ready-made layouts assembled from the regular Card
 * parts (and Rating, Sparkline, AvatarGroup, Badge…). Nothing here is a new
 * component: copy the story source and adapt. Product names are fictional
 * (Solarge, Seashell). Leading icons align to the title line, not the
 * middle of the text block.
 */
const meta: Meta<typeof Card> = {
  title: 'Layout/Card Compositions',
  component: Card,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Card>;

const revenue = [12, 11.5, 11, 10.6, 10.4, 10.5, 10.3, 10.6, 10.4, 10.9, 12.8, 16.2, 21.5];

function LogoTile({ letter, className }: { letter: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        'grid size-10 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary-subtle)] font-body text-body-m font-semibold text-[var(--color-text-text-link-on-tonal)] ' +
        (className ?? '')
      }
    >
      {letter}
    </span>
  );
}

/** Metric with a trend: label, value, delta badge and an area sparkline. */
export const Metric: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <Card className="w-[280px]">
        <CardContent className="flex flex-col gap-3">
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Net revenue</span>
          <div className="flex items-center gap-2">
            <span className="font-body text-heading-s font-semibold tabular-nums">$0.58</span>
            <Badge tone="success">+$0.58</Badge>
          </div>
          <Sparkline data={revenue} area height={72} ariaLabel="Net revenue over the last 13 weeks, rising sharply at the end" />
        </CardContent>
      </Card>
      <Card className="w-[280px]">
        <CardContent className="flex flex-col gap-3">
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Net revenue</span>
          <span className="font-body text-body-xl font-semibold tabular-nums">+$34.58M</span>
          <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtler)]">With Solarge, every customer idea becomes a site or app in seconds.</p>
          <Sparkline data={revenue} area height={96} ariaLabel="Net revenue trend, rising sharply at the end" />
        </CardContent>
        <CardFooter>
          <Button appearance="filled" size="sm">View report</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/** Marketplace listing: icon tile, status markers, meta row, clamped description, vendor + price. */
export const Marketplace: Story = {
  render: () => (
    <Card className="w-[300px]" action={{ type: 'link', href: '#solarge', ariaLabel: 'Solarge and Solarge for WordPress' }}>
      <CardHeader divider={false} className="flex-col gap-3">
        <div className="flex w-full items-start justify-between">
          <LogoTile letter="S" />
          <div className="flex items-center gap-1">
            <span role="img" aria-label="Featured" className="grid size-6 place-items-center rounded-full bg-[var(--color-bg-warning-bg-warning)] text-[var(--color-text-text-warning)] [&_svg]:size-3 [[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]">
              <StarSolid />
            </span>
            <span role="img" aria-label="Includes support" className="grid size-6 place-items-center rounded-full bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)] [&_svg]:size-3">
              <Headset />
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <CardTitle>Solarge and Solarge for WordPress</CardTitle>
          <CardDescription className="flex items-center gap-1 [&_svg]:size-3.5">
            <Group aria-hidden="true" /> Agents
            <DotSeparator />
            <Sparks aria-hidden="true" /> 9 skills
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="m-0 line-clamp-3 font-body text-body-s text-[var(--color-text-text-subtle)]">
          With Solarge, every customer idea becomes a site or app in seconds, creating new revenue streams you didn’t have before — from landing pages to full stores.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">Seashell</span>
        <Badge tone="success">Free</Badge>
      </CardFooter>
    </Card>
  ),
};

/** App listing with a read-only rating and install count. */
export const WithRating: Story = {
  name: 'With rating',
  render: () => (
    <Card className="w-[320px]">
      <CardHeader divider={false}>
        <div className="flex min-w-0 items-start gap-3">
          <LogoTile letter="W" />
          <div className="min-w-0">
            <CardTitle>Send email via Webmail</CardTitle>
            <div className="mt-1 flex items-center gap-2 font-body text-body-xs text-[var(--color-text-text-subtler)]">
              <Rating readOnly value={5} size="sm" aria-label="Rating" />
              <span className="tabular-nums">5.0 (294)</span>
              <DotSeparator />
              <span className="flex items-center gap-1 tabular-nums [&_svg]:size-3.5">
                <Download aria-hidden="true" />623<span className="sr-only"> installs</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 font-body text-body-s text-[var(--color-text-text-subtle)]">Send an email with your Seashell account.</CardContent>
    </Card>
  ),
};

/** Person profile on a media card; clicking toggles it as a selected filter. */
export const Profile: Story = {
  render: function ProfileExample() {
    const [active, setActive] = useState(true);
    return (
      <Card className="w-[300px]" action={{ type: 'filter', active, onChange: setActive, ariaLabel: 'Becca Williams' }}>
        <CardMedia src="/asset-examples/nova-web.jpg" alt="" height={140} />
        <CardAvatar type="text" initials="BW" />
        <CardHeader divider={false}>
          <div className="min-w-0">
            <CardTitle className="gap-2">
              Becca Williams
              <Badge tone="primary" className="[&_svg]:size-3">
                <Medal aria-hidden="true" /> Top builder
              </Badge>
            </CardTitle>
            <CardDescription>I build agents and workforces at Solarge in the AI Ops team. Two main focuses: marketing and AI bots.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  },
};

/** Company card with headline stats and a team avatar stack. */
export const StatsAndPeople: Story = {
  name: 'Stats and people',
  render: () => (
    <Card className="w-[320px]">
      <CardHeader divider={false}>
        <div className="flex min-w-0 items-start gap-3">
          <LogoTile letter="S" />
          <div className="min-w-0">
            <CardTitle>Seashell</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 [&_svg]:size-3.5">
              <span className="flex items-center gap-1 tabular-nums"><Community aria-hidden="true" /><b className="font-semibold">27M</b> users</span>
              <span className="flex items-center gap-1 tabular-nums"><Globe aria-hidden="true" /><b className="font-semibold">60M</b> domains</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">The global standard in web enablement.</p>
        <AvatarGroup max={3} aria-label="Team: 12 people">
          {['AL', 'MK', 'JS', 'RT', 'EV', 'NP', 'OD', 'CB', 'HW', 'LM', 'SG', 'TF'].map((i) => (
            <Avatar key={i} type="text" initials={i} />
          ))}
        </AvatarGroup>
      </CardContent>
    </Card>
  ),
};

/** Product on a media card with price and category tags. */
export const MediaWithTags: Story = {
  name: 'Media with tags',
  render: () => (
    <Card className="w-[300px]">
      <CardMedia src="/asset-examples/nova-web.jpg" alt="" height={140} />
      <CardHeader divider={false}>
        <div className="min-w-0">
          <CardTitle>Seashell Sites</CardTitle>
          <CardDescription>Website builder</CardDescription>
        </div>
        <Badge tone="primary">$19/mo</Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        <Badge tone="neutral">App builders</Badge>
        <Badge tone="neutral">AI websites</Badge>
      </CardContent>
    </Card>
  ),
};

/** Single-choice option with an icon tile, clamped description and a vendor footer. */
export const RadioWithFooter: Story = {
  name: 'Radio with footer',
  render: function RadioWithFooterExample() {
    const [picked, setPicked] = useState<string>('success');
    const options = [
      { id: 'success', title: 'Customer success', desc: 'Score customer health, plan onboarding, prepare renewals, and build quarterly business reviews.', skills: 9 },
      { id: 'sales', title: 'Sales assistant', desc: 'Qualify leads, draft follow-ups and keep the pipeline current.', skills: 6 },
    ];
    return (
      // Each selectable Card owns its control; single choice is the caller's state.
      <div className="flex flex-wrap items-start gap-4">
        {options.map((o) => (
          <Card
            key={o.id}
            className="w-[300px]"
            selectable="radio"
            selected={picked === o.id}
            onSelectedChange={() => setPicked(o.id)}
            selectLabel={o.title}
          >
            <CardHeader divider={false}>
              <div className="flex min-w-0 items-start gap-2.5">
                <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center text-body-l text-[var(--color-icon-icon-subtle)]">
                  <ClipboardCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <CardTitle>{o.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{o.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="gap-3 font-body text-body-xs text-[var(--color-text-text-subtle)]">
              <span className="flex items-center gap-1 [&_svg]:size-3.5">
                by Seashell <BadgeCheck aria-label="Verified" role="img" className="text-[var(--color-icon-icon-success)]" />
              </span>
              <span className="tabular-nums">{o.skills} skills</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  },
};

/** Whole-card link with the arrow as its affordance in the bottom-right corner. */
export const LinkWithArrow: Story = {
  name: 'Link with arrow',
  render: () => (
    <Card className="w-[280px]" action={{ type: 'link', href: '#seashell', ariaLabel: 'Seashell — the global standard in web enablement' }}>
      <CardHeader divider={false} className="flex-col gap-3">
        <LogoTile letter="S" className="size-8" />
        <div className="min-w-0">
          <CardTitle>Seashell</CardTitle>
          <CardDescription>The global standard in web enablement.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-end pt-0 text-[var(--color-icon-icon-subtle)] [&_svg]:size-5">
        <ArrowRight aria-hidden="true" />
      </CardContent>
    </Card>
  ),
};
