import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Disclosure/Accordion',
  component: Accordion,
  tags: ['autodocs'],
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

export const Single: Story = {
  render: () => (
    <Accordion type="single" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a CNAME record?</AccordionTrigger>
        <AccordionContent>A CNAME record maps one domain name to another, used for aliasing.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How long does propagation take?</AccordionTrigger>
        <AccordionContent>DNS changes typically propagate within a few minutes to 48 hours.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I use a wildcard certificate?</AccordionTrigger>
        <AccordionContent>Yes, a wildcard certificate covers all subdomains of a domain.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
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
};

/** No `defaultValue` — every section starts collapsed; `collapsible` still lets the opened item close back to none. */
export const AllClosed: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a CNAME record?</AccordionTrigger>
        <AccordionContent>A CNAME record maps one domain name to another, used for aliasing.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How long does propagation take?</AccordionTrigger>
        <AccordionContent>DNS changes typically propagate within a few minutes to 48 hours.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I use a wildcard certificate?</AccordionTrigger>
        <AccordionContent>Yes, a wildcard certificate covers all subdomains of a domain.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/** A disabled item can't open or close and dims to 50% — its trigger is a native disabled button, so it's also skipped in the Tab order between triggers. */
export const DisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Active plan</AccordionTrigger>
        <AccordionContent>You're on the Pro plan — 184,320 requests today.</AccordionContent>
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
};
