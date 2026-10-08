import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { Link } from './link';

const TEXT = 'max-w-xs font-body text-body-m text-[var(--color-text-text)]';

export const linkGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Going somewhere: another page, a section, a document, an external site.',
    'Inside a sentence (no `size`, so it takes the text’s size) or as a standalone line with `size`.',
  ],
  whenNotToUse: [
    { text: 'Doing something: save, delete, open a dialog', instead: 'Button (ghost for a quiet one)' },
    { text: 'A navigation item in a menu or sidebar', instead: 'SidebarItem, DropdownMenuItem, Tabs' },
    { text: 'A whole card that leads somewhere', instead: 'CardLink' },
  ],
  anatomy: [
    { part: 'Label', description: <>says where it goes: “Billing settings”, not “click here”. <C>size</C> xs–lg, or inherited.</> },
    { part: 'Underline', description: <>on hover by default; always with <C>underline</C>, thicker on hover.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <p className={TEXT}>
            Read the <Link href="#gl-link" underline>refund policy</Link> before you cancel.
          </p>
        ),
        caption: 'In running text the link is underlined, so it doesn’t rely on color alone.',
      },
      dont: {
        example: (
          <p className={TEXT}>
            Read the <Link href="#gl-link">refund policy</Link> before you cancel.
          </p>
        ),
        caption: 'Without the underline the link is just a blue word to anyone who can’t tell the colors apart.',
      },
    },
    {
      do: {
        example: <Button appearance="ghost" tone="danger" size="md">Delete project</Button>,
        caption: 'An action is a Button, even a quiet one.',
      },
      dont: {
        example: <Link href="#gl-link" size="md">Delete project</Link>,
        caption: 'A link that deletes: screen readers announce “link”, and people expect it to navigate.',
      },
    },
  ],
  a11y: [
    'The text says where the link goes; “here”, “more” and “link” don’t make sense read out of context in a links list.',
    <>Use <C>underline</C> inside running text (WCAG 1.4.1).</>,
    <>On a dark or primary surface use <C>inverse</C>: the default link color and focus ring don’t have the contrast there.</>,
    <>A link that opens a new tab says so in its text, e.g. “Pricing (opens in a new tab)”.</>,
  ],
};
