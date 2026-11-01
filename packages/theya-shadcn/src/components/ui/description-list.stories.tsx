import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList, DescriptionItem, DescriptionTerm, DescriptionDetails } from './description-list';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { descriptionListGuidelines } from './description-list.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Compositional — DescriptionList (<dl>) itself takes only standard HTML
//   props. Build entries from
//   DescriptionItem/DescriptionTerm/DescriptionDetails.
const meta: Meta<typeof DescriptionList> = {
  title: 'Data/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    guidelines: descriptionListGuidelines,
    docs: {
      description: {
        component: "Label and value pairs about one object: gallery details, an invoice header, a review step before confirming.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

/** The read-only attributes of a single gallery. Identifiers use `font-mono`. */
export const Default: Story = {
  render: () => (
    <DescriptionList className="w-full max-w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Client portal</DescriptionTerm>
        <DescriptionDetails className="font-mono">selene-weddings.aether.photo</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Studio</DescriptionTerm>
        <DescriptionDetails>Selene Weddings</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Description</DescriptionTerm>
        <DescriptionDetails>Wedding of Rhea Okafor and Theo Amari, 412 edited photos delivered in two sets.</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * A status row carries a non-text value, so it pairs StatusDot with a text
 * label inside a Badge (status is never color alone) and overrides the row
 * to `sm:items-start` so the badge aligns to the top of the value track
 * rather than sitting on the term's text baseline.
 */
export const WithStatus: Story = {
  name: 'With status',
  render: () => (
    <DescriptionList className="w-full max-w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Client portal</DescriptionTerm>
        <DescriptionDetails className="font-mono">eos-portraits.aether.photo</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:items-start">
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>
          <Badge tone="danger">
            <StatusDot tone="danger" />
            Export failed
          </Badge>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Plan</DescriptionTerm>
        <DescriptionDetails>Business</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * A long unbreakable identifier (an export ID, a full URL) wraps inside
 * the value track instead of forcing horizontal page scroll at 360px —
 * both tracks are `min-w-0` and the value carries `break-words`.
 */
export const LongIdentifier: Story = {
  name: 'Long identifier',
  render: () => (
    <DescriptionList className="w-full max-w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Export ID</DescriptionTerm>
        <DescriptionDetails className="font-mono">9f3c1a7e8b4d2f0c6a59e3d71b8c4f02a1d6e9b3</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Download link</DescriptionTerm>
        <DescriptionDetails className="font-mono">https://selene-weddings.aether.photo/galleries/golden-hour/download/9f3c1a7e</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * DescriptionList passes `className` through, so consumers can lay the
 * items out in their own multi-column grid (here two-up on sm+) — each
 * DescriptionItem overrides back to a single-column stack for its own
 * term/value pair so the outer grid, not the item, owns the columns.
 */
export const TwoUpGrid: Story = {
  name: 'Two-up grid',
  render: () => (
    <DescriptionList className="grid w-full max-w-[560px] grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Created</DescriptionTerm>
        <DescriptionDetails>Mar 12, 2026</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Studio</DescriptionTerm>
        <DescriptionDetails>Helios Studio</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Storage used</DescriptionTerm>
        <DescriptionDetails>212 GB of 384 GB</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Downloads / month</DescriptionTerm>
        <DescriptionDetails>9,254</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};
