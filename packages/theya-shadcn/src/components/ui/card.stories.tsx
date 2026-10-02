import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Globe, InfoCircle, CheckCircle, WarningTriangle, WarningCircle, Plus, OpenBook, OpenNewWindow, ArrowRight } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter, CardLink, CardMedia, CardAvatar, type CardSeverity } from './card';
import { DotSeparator } from './dot-separator';
import { Button } from './button';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { TextField } from './text-field';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';

const meta: Meta<typeof Card> = {
  title: 'Layout/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'inline-radio', options: [undefined, 'sm', 'md', 'lg'], description: 'Padding scale.' },
    severity: { control: 'inline-radio', options: ['default', 'info', 'success', 'warning', 'danger'], description: 'Tinted border/surface for a status card.' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/** The full composition: header (title + description), content, and a footer action. */
export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Site details</CardTitle>
          <CardDescription>Primary domain and region for this site.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-mono text-body-m text-[var(--color-text-text)]">shop.seashell.dev</p>
        <p className="flex items-center text-body-s text-[var(--color-text-text-subtler)]">eu-west-1<DotSeparator />PHP 8.3</p>
      </CardContent>
      <CardFooter>
        <Button appearance="filled" tone="primary" size="md">
          Save changes
        </Button>
        <Button appearance="outlined" size="md">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** Content-only summary tile — no divider rules, just a padded surface. */
export const ContentOnly: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardContent>
        <CardTitle>Active sites</CardTitle>
        <p className="mt-1 font-body text-heading-m font-semibold tabular-nums text-[var(--color-text-text)]">24</p>
      </CardContent>
    </Card>
  ),
};

/** A header action sits opposite the title (the header is a justified flex row). */
export const WithHeaderAction: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Certificates</CardTitle>
          <CardDescription>TLS coverage across your domains.</CardDescription>
        </div>
        <CardAction>
          <Button appearance="outlined" size="md">
            Issue certificate
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="font-mono text-body-m text-[var(--color-text-text)]">shop.seashell.dev</span>
        <Badge tone="success">
          <StatusDot tone="success" />
          Valid<DotSeparator className="mx-1" />87 days
        </Badge>
      </CardContent>
    </Card>
  ),
};

/**
 * Clickable cards: use `action={{ type: 'link', href }}`. The whole card is
 * the navigation target while nested actions keep their own behavior. Works
 * header-only, header + content, or header + content + a footer action.
 */
export const InteractiveCard: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Card action={{ type: 'link', href: '/sites/settings.seashell.dev' }} className="w-fit">
        <CardHeader>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate font-mono">settings.seashell.dev</CardTitle>
            <CardDescription className="flex items-center">Pro<DotSeparator />eu-west-1</CardDescription>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button appearance="ghost" iconOnly size="md" aria-label="Actions for settings.seashell.dev" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Restart</DropdownMenuItem>
                <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
      </Card>
      <Card action={{ type: 'link', href: '/sites/shop.seashell.dev' }} className="w-fit">
        <CardHeader>
          {/* Icon aligns to the title line, not the middle of title + description:
              items-start, and a wrapper one title-line tall (same text size). */}
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center text-body-l">
              <Globe className="text-[var(--color-icon-icon-subtle)]" />
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate font-mono">shop.seashell.dev</CardTitle>
              <CardDescription className="flex items-center">Pro<DotSeparator />eu-west-1</CardDescription>
            </div>
          </div>
          <Badge tone="success">
            <StatusDot tone="success" />
            Running
          </Badge>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">184,320 requests today.</CardContent>
      </Card>
      <Card action={{ type: 'link', href: '/sites/docs.seashell.dev' }} className="w-fit">
        <CardHeader>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate font-mono">docs.seashell.dev</CardTitle>
            <CardDescription className="flex items-center">Free<DotSeparator />eu-west-1</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Suspended, payment failed.</CardContent>
        <CardFooter>
          <Button appearance="filled" tone="primary" size="md">
            Resolve billing
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

function ActionKindsExample() {
  const [filterActive, setFilterActive] = useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Card action={{ type: 'link', href: '/email/catch-all' }}>
        <CardHeader size="md">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">Catch all</CardTitle>
            <CardDescription>in catch-all@seashell.dev</CardDescription>
          </div>
          <CardAction>
            <Button appearance="ghost" iconOnly size="md" aria-label="Add catch-all address" leftIcon={<Plus />} />
          </CardAction>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Handle mail sent to unknown addresses.</CardContent>
      </Card>
      <Card action={{ type: 'filter', active: filterActive, onChange: setFilterActive, ariaLabel: 'Filter mail sent to unknown addresses' }} severity="warning">
        <CardHeader size="md">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">Quarantine</CardTitle>
            <CardDescription>{filterActive ? 'Filter selected.' : '18 messages need review.'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Review suspicious mail before it expires.</CardContent>
      </Card>
      <Card action={{ type: 'external-link', href: 'https://seashell.dev', ariaLabel: 'Open Theya Seashell' }}>
        <CardHeader size="md">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">Theya Seashell</CardTitle>
            <CardDescription>Open a destination outside the control panel.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

/** The three `action` kinds side by side — `link` (same-context navigation), `filter`
 * (a pressed toggle, `aria-pressed`), and `external-link` (opens in a new tab). Each
 * uses `CardHeader size="md"` for the denser, fixed-size header treatment. */
export const ActionKinds: Story = {
  render: () => <ActionKindsExample />,
};

function ProgrammaticCardLinkExample() {
  const [openedSite, setOpenedSite] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-3">
      <Card interactive className="w-full max-w-sm">
        <CardHeader>
          <div className="min-w-0 flex-1">
            <CardTitle>
              <CardLink asChild>
                <button type="button" className="block truncate text-left font-mono" onClick={() => setOpenedSite('shield.seashell.dev')}>
                  shield.seashell.dev
                </button>
              </CardLink>
            </CardTitle>
            <CardDescription>Navigation is handled with router state.</CardDescription>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button appearance="ghost" iconOnly size="md" aria-label="Actions for shield.seashell.dev" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Restart</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">The stretched CardLink makes the entire widget clickable without a URL.</CardContent>
      </Card>
      <p className="text-body-s text-[var(--color-text-text-subtler)]" aria-live="polite">
        {openedSite ? `Opened ${openedSite}` : 'Activate the card to open the widget.'}
      </p>
    </div>
  );
}

/** Legacy `interactive` + `CardLink` composition for router/programmatic navigation
 * (no real `href`). Retained alongside `action` for cases that need to call code,
 * not just navigate to a URL. */
export const InteractiveCardWithCardLink: Story = {
  render: () => <ProgrammaticCardLinkExample />,
};

/** A settings section: a labelled form control inside the content region. */
export const FormSection: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Primary domain</CardTitle>
          <CardDescription>The domain visitors use to reach this site.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <TextField label="Domain" placeholder="shop.seashell.dev" widthSize="md" />
      </CardContent>
      <CardFooter>
        <Button appearance="filled" tone="primary" size="md">
          Save changes
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** Stack of summary cards — collapses to one column at 360px, two from `sm`. */
export const Grid: Story = {
  render: () => (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardContent>
          <CardTitle>Active sites</CardTitle>
          <p className="mt-1 font-body text-heading-m font-semibold tabular-nums text-[var(--color-text-text)]">24</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Requests today</CardTitle>
          <p className="mt-1 font-body text-heading-m font-semibold tabular-nums text-[var(--color-text-text)]">1,925,460</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Needs attention</CardTitle>
          <p className="mt-1 font-body text-heading-m font-semibold tabular-nums text-[var(--color-text-text-warning)]">3</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Certificates expiring</CardTitle>
          <p className="mt-1 font-body text-heading-m font-semibold tabular-nums text-[var(--color-text-text)]">1</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/** Optional size changes the density of every composed Card part. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 sm:flex-row">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Card key={size} size={size} className="w-full max-w-xs">
          <CardHeader>
            <CardTitle>Size {size}</CardTitle>
          </CardHeader>
          <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Padding and title scale together.</CardContent>
        </Card>
      ))}
    </div>
  ),
};

const SEVERITY_COPY: Record<CardSeverity, { icon: typeof InfoCircle | null; label: string; note: string }> = {
  default: { icon: null, label: 'Bandwidth', note: 'Nominal' },
  info: { icon: InfoCircle, label: 'Maintenance scheduled', note: 'Sat 02:00 UTC' },
  success: { icon: CheckCircle, label: 'Backup completed', note: 'All sites' },
  warning: { icon: WarningTriangle, label: 'Quota nearing limit', note: '92% used' },
  danger: { icon: WarningCircle, label: 'DNS records not propagated', note: 'seashell.dev' },
};

const SEVERITY_ICON_CLASS: Record<CardSeverity, string> = {
  default: '',
  info: 'text-[var(--color-icon-icon-info)]',
  success: 'text-[var(--color-icon-icon-success)]',
  warning: 'text-[var(--color-icon-icon-warning)]',
  danger: 'text-[var(--color-icon-icon-danger)]',
};

/** Severity tints the surface and supplies matching interactive hover/focus colors. */
export const Severity: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(SEVERITY_COPY) as CardSeverity[]).map((severity) => {
        const { icon: Icon, label, note } = SEVERITY_COPY[severity];
        return (
          <Card key={severity} severity={severity} action={{ type: 'link', href: `#${severity}` }}>
            <CardHeader>
              <div className="flex min-w-0 items-start gap-2">
                {Icon && <Icon className={`mt-0.5 size-4 shrink-0 ${SEVERITY_ICON_CLASS[severity]}`} />}
                <div className="min-w-0">
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>{note}</CardDescription>
                </div>
              </div>
              <CardAction>
                <Button appearance="ghost" iconOnly size="md" aria-label={`More actions for ${label}`} leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />
              </CardAction>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  ),
};

/**
 * Header-only and footer-only cards do not paint a divider against nothing.
 * `CardHeader` drops its `border-b` when it is the last child, and `CardFooter`
 * drops its `border-t` when it is first — or when it directly follows a header,
 * where the header's rule already owns the boundary.
 */
export const DividerEdgeCases: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Header only</CardTitle>
            <CardDescription>No rule underneath — nothing follows it.</CardDescription>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Header, then footer</CardTitle>
        </CardHeader>
        <CardFooter>
          <Button appearance="filled" tone="primary" size="md">
            Confirm
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardFooter>
          <Button appearance="outlined" size="md">
            Footer only
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/**
 * `CardHeader`'s `divider` prop overrides the automatic drop for one header
 * explicitly — the left card forces the rule back on for an interactive card
 * that has enough content below it to warrant one; the right card forces it
 * off on a plain, non-interactive card where the default would otherwise keep it.
 */
export const HeaderDividerOverride: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <Card action={{ type: 'link', href: '/infrastructure' }} className="w-64">
        <CardHeader divider>
          <CardTitle>Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-body-s">
          <div className="flex items-baseline justify-between">
            <span className="text-[var(--color-text-text-subtler)]">GPUs</span>
            <span className="tabular-nums text-[var(--color-text-text)]">8 / 12</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[var(--color-text-text-subtler)]">RAM</span>
            <span className="tabular-nums text-[var(--color-text-text)]">210 / 256 GB</span>
          </div>
        </CardContent>
      </Card>
      <Card className="w-64">
        <CardHeader divider={false}>
          <CardTitle>Quiet header</CardTitle>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">
          Plain card — the default would keep this header's rule since it isn't the only child, but `divider={false}` forces it off anyway.
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * A bare one-line `CardTitle` (no `CardDescription`) paired with a header action,
 * across every Button size. `CardHeader` is overridden to `items-center` here
 * (Мария's call) — with no description below to anchor against, the title
 * should sit centered against the action's own height, not flush with the
 * card's top edge the way a title+description header does.
 */
export const TitleOnlyWithAction: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4">
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Allowlist</CardTitle>
          <CardAction>
            <Button appearance="ghost" iconOnly size="md" aria-label="Actions for Allowlist" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Port Rules</CardTitle>
          <CardAction>
            <Button appearance="outlined" size="md">
              Manage
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Country and ASN Rules</CardTitle>
          <CardAction>
            <Button appearance="outlined" size="lg">
              Add rule
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  ),
};

function SelectableCardsExample() {
  const [checked, setChecked] = useState<Record<string, boolean>>({ standard: false, pro: true, enterprise: false });
  const [radioValue, setRadioValue] = useState('pro');
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-body-s font-medium text-[var(--color-text-text-subtler)]">Multi-choice (checkbox)</p>
        <div className="flex flex-wrap gap-3">
          {(['standard', 'pro', 'enterprise'] as const).map((plan) => (
            <Card
              key={plan}
              className="w-[220px]"
              selectable="checkbox"
              selected={checked[plan]}
              onSelectedChange={(next) => setChecked((c) => ({ ...c, [plan]: next }))}
              selectLabel={`Select ${plan} plan`}
            >
              <CardHeader>
                <CardTitle className="capitalize">{plan}</CardTitle>
              </CardHeader>
              <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Up to 5 sites, daily backups.</CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-body-s font-medium text-[var(--color-text-text-subtler)]">Single choice (radio) — caller coordinates `selected` across the group, same as corp's own reference.</p>
        <div className="flex flex-wrap gap-3">
          {(['standard', 'pro', 'enterprise'] as const).map((plan) => (
            <Card key={plan} className="w-[220px]" selectable="radio" selected={radioValue === plan} onSelectedChange={() => setRadioValue(plan)} selectLabel={`Select ${plan} plan`}>
              <CardHeader>
                <CardTitle className="capitalize">{plan}</CardTitle>
              </CardHeader>
              <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Up to 5 sites, daily backups.</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Ported from corp's `choice`/`choice1` — a Radio or Checkbox pinned to the
 * card's top-left corner. `CardHeader`/`CardContent`/`CardFooter` reserve
 * matching left padding automatically (`data-selectable` on the root). */
export const Selectable: Story = {
  render: () => <SelectableCardsExample />,
};

/** Ported from corp's `state="Disabled"` — dims the card, blocks pointer
 * events, and disables `action`/`selectable` regardless of what's passed. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Card className="w-[220px]" disabled href="/plans/legacy">
        <CardHeader>
          <CardTitle>Legacy plan</CardTitle>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">No longer available for new sites.</CardContent>
      </Card>
      <Card className="w-[220px]" disabled selectable="checkbox" selected selectLabel="Select legacy plan">
        <CardHeader>
          <CardTitle>Legacy plan</CardTitle>
        </CardHeader>
        <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">Selection is disabled along with the rest of the card.</CardContent>
      </Card>
    </div>
  ),
};

/** `CardMedia` — a full-bleed image banner, placed as the first child before
 * `CardHeader` (Card has no padding of its own, so it sits flush edge-to-edge).
 * Uses the house placeholder image (same one Attachment's stories use), not a
 * stock-photo URL. */
export const WithMedia: Story = {
  render: () => (
    <Card className="w-[280px]">
      <CardMedia src="/asset-examples/nova-web.jpg" alt="" />
      <CardHeader>
        <CardTitle>Solarge</CardTitle>
        <CardDescription>Agentic AI builder for websites & apps.</CardDescription>
      </CardHeader>
      <CardContent className="text-body-s text-[var(--color-text-text-subtler)]">$54.99 per month</CardContent>
    </Card>
  ),
};

/** `CardAvatar` — straddles the card's top edge (or a preceding `CardMedia`),
 * centered on that boundary line; the offset scales with `size`, so `size="md"`
 * here still centers correctly, not just the `lg` default. `outline="solid"`
 * gives it a separator ring by default. */
export const WithAvatar: Story = {
  render: () => (
    <Card className="w-[280px]">
      <CardMedia src="/asset-examples/nova-web.jpg" alt="" height={96} />
      {/* Direct child of Card, not nested inside CardHeader — see the doc
       * comment on CardAvatar for why nesting it fights the overlap. */}
      <CardAvatar size="md" type="image" src="/asset-examples/panda-avatar.png" alt="Becca Williams" />
      <CardContent className="flex flex-col gap-1">
        <p className="text-body-m font-semibold text-[var(--color-text-text)]">Becca Williams</p>
        <p className="text-body-s text-[var(--color-text-text-subtler)]">I build agents/workforces at Relevance AI in the AI Ops team.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * `appearance="filled"` — the brand card on the primary fill. Titles,
 * descriptions, icons and dividers adapt through re-pointed tokens; Buttons
 * and Checkboxes inside switch to their on-primary treatment
 * (`data-surface="primary"`). Every appearance of Button is shown so the
 * on-primary set can be checked in both themes.
 */
export const Filled: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <Card appearance="filled" className="w-[300px]">
        <CardHeader divider={false}>
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--white-a200)] [&_svg]:size-5"
          >
            <OpenBook />
          </span>
          <CardAction>
            <Button appearance="ghost" size="sm" iconOnly aria-label="Open documentation in a new tab" leftIcon={<OpenNewWindow />} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Explore comprehensive guides, tutorials, FAQs, and best practices for building with Solarge.</CardDescription>
        </CardContent>
        <CardFooter>
          <Button appearance="tonal" size="md" rightIcon={<ArrowRight />}>Get started</Button>
        </CardFooter>
      </Card>
      <Card appearance="filled" className="w-[300px]">
        <CardHeader>
          <div>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlimited sites, staging and daily backups.</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button appearance="filled" size="md">Upgrade</Button>
          <Button appearance="outlined" size="md">Compare plans</Button>
          <Button appearance="ghost" size="md">Later</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
