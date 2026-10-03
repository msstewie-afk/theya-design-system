import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from './pagination';
import { paginationGuidelines } from './pagination.guidelines';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    guidelines: paginationGuidelines,
    docs: {
      description: {
        component:
          'Compositional — Pagination itself (<nav>) takes no custom props. Build the row from PaginationContent/PaginationItem/PaginationLink (isActive, size) /PaginationPrevious/PaginationNext/PaginationEllipsis.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(within(canvasElement).getByRole('navigation', { name: 'Pagination' }));
    await expect(nav.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');
    await expect(nav.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute('href');
    await expect(nav.getByText('More pages')).toBeInTheDocument();
  },
};

/** A short, fully-enumerated range — no ellipsis needed when every page fits. The first page is current. */
export const ShortRange: Story = {
  name: 'Short range',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" disabled />
        </PaginationItem>
        {[1, 2, 3, 4].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href="#" isActive={page === 1}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(within(canvasElement).getByRole('navigation', { name: 'Pagination' }));
    // disabled Previous: announced, but not navigable or focusable.
    const prev = nav.getByRole('link', { name: 'Go to previous page' });
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(prev).not.toHaveAttribute('href');
    await userEvent.tab();
    await expect(nav.getByRole('link', { name: '1' })).toHaveFocus();
  },
};

/** A long range with ellipses on both sides of the current page — the common "1 … 6 7 8 … 24" windowed pattern. */
export const LongRangeWithEllipsis: Story = {
  name: 'Long range with ellipsis',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            7
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

function ClientPagingDemo() {
  const total = 5;
  const [page, setPage] = useState(2);
  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious asChild>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
            </PaginationPrevious>
          </PaginationItem>
          {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink asChild isActive={page === p}>
                <button type="button" onClick={() => setPage(p)}>
                  {p}
                </button>
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext asChild>
              <button type="button" onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page === total} />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="font-mono text-body-xs text-[var(--color-text-text-subtler)] tabular-nums">
        Page {page} of {total}
      </p>
    </div>
  );
}

/** Client paging wired to local state via `asChild` over `<button>`s — the pattern a data table would use. */
export const ClientPaging: Story = {
  name: 'Client paging',
  render: () => <ClientPagingDemo />,
};

/** On the first page, "Previous" is disabled (`aria-disabled`) so it reads as unavailable to assistive tech rather than navigating nowhere. */
export const EdgeDisabled: Story = {
  name: 'Edge disabled',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
