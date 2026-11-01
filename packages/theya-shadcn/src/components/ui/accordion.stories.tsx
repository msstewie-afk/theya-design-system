import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { accordionGuidelines } from './accordion.guidelines';

const meta: Meta<typeof Accordion> = {
  title: 'Layout/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Sections people scan by heading and open one or two of: FAQs, settings groups, long details.",
      },
    },
    guidelines: accordionGuidelines,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether one panel or several panels can be open at once.',
      table: { category: 'Behavior' },
    },
    collapsible: {
      control: 'boolean',
      description: '`type="single"` only — lets the open panel be closed again by clicking its own trigger.',
      table: { category: 'Behavior' },
    },
    defaultValue: {
      control: false,
      description: 'Uncontrolled initial open item (string for `single`, string[] for `multiple`).',
      table: { category: 'State' },
    },
    value: {
      control: false,
      description: 'Controlled open item — pair with `onValueChange`.',
      table: { category: 'State' },
    },
    onValueChange: {
      control: false,
      description: 'Fires with the new open value whenever the user opens or closes a panel.',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every item in the accordion.',
      table: { category: 'Behavior' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

/** `type="single"`: opening a section closes the one that was open, and the open section can be closed again. */
export const Single: Story = {
  render: () => (
    <Accordion type="single" className="w-full max-w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a client portal?</AccordionTrigger>
        <AccordionContent>A private page where a client views, picks and downloads the photos from their shoot.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How long are galleries kept?</AccordionTrigger>
        <AccordionContent>Galleries stay online for 90 days after delivery, then move to the archive.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can clients print the photos?</AccordionTrigger>
        <AccordionContent>Yes, with a print license: it covers every photo in the gallery.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('button', { name: 'What is a client portal?' });
    const two = canvas.getByRole('button', { name: 'How long are galleries kept?' });
    await expect(one).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(one);
    await expect(one).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'What is a client portal?' })).toBeVisible();

    // Single: opening another closes the first.
    await userEvent.click(two);
    await expect(two).toHaveAttribute('aria-expanded', 'true');
    await expect(one).toHaveAttribute('aria-expanded', 'false');

    // collapsible defaults to true: the open item closes on its own trigger.
    await userEvent.click(two);
    await expect(two).toHaveAttribute('aria-expanded', 'false');

    // Arrow keys move between triggers; Home/End jump.
    one.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(two).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: 'Can clients print the photos?' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(one).toHaveFocus();
  },
};

/** `type="multiple"`: any number of sections can stay open at once. */
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section one</AccordionTrigger>
        <AccordionContent>Content for section one.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section two</AccordionTrigger>
        <AccordionContent>Content for section two.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('button', { name: 'Section one' });
    const two = canvas.getByRole('button', { name: 'Section two' });
    await userEvent.click(one);
    await userEvent.click(two);
    // Multiple: both stay open.
    await expect(one).toHaveAttribute('aria-expanded', 'true');
    await expect(two).toHaveAttribute('aria-expanded', 'true');
  },
};

/** No `defaultValue` — every section starts collapsed; `collapsible` still lets the opened item close back to none. */
export const AllClosed: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a client portal?</AccordionTrigger>
        <AccordionContent>A private page where a client views, picks and downloads the photos from their shoot.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How long are galleries kept?</AccordionTrigger>
        <AccordionContent>Galleries stay online for 90 days after delivery, then move to the archive.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can clients print the photos?</AccordionTrigger>
        <AccordionContent>Yes, with a print license: it covers every photo in the gallery.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/** A disabled item can't open or close and dims to 50% — its trigger is a native disabled button, so it's also skipped in the Tab order between triggers. */
export const DisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Active plan</AccordionTrigger>
        <AccordionContent>You're on the Pro plan — 1,284 photos delivered this month.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Enterprise add-ons (contact sales)</AccordionTrigger>
        <AccordionContent>Available on Enterprise plans.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Billing history</AccordionTrigger>
        <AccordionContent>Invoices for the last 12 months.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'Active plan' });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Enterprise add-ons (contact sales)' })).toBeDisabled();
    // Arrow navigation skips the disabled trigger.
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Billing history' })).toHaveFocus();
  },
};
