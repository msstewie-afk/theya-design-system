import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const FAQ = [
  ['How long are backups kept?', 'Nightly backups are kept for 14 days.'],
  ['Can I restore a single file?', 'Yes — open the backup and pick the files.'],
  ['Do backups count toward storage?', 'No, they’re stored separately.'],
];

export const accordionGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Several sections people scan by heading and open one or two of: FAQs, settings groups, long details.', <><C>type="single"</C> + <C>collapsible</C> for FAQs; <C>multiple</C> when comparing sections.</>],
  whenNotToUse: [
    { text: 'One show/hide toggle', instead: 'Collapsible' },
    { text: 'Content everyone needs', instead: 'show it — don’t hide the main path' },
    { text: 'Switching between parallel views', instead: 'Tabs' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'the section heading as a button, chevron on the right.' },
    { part: 'Content', description: 'animates open; any content.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map(([q, a]) => (
              <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        ),
        caption: 'Questions people scan; they open the one they care about.',
      },
      dont: {
        example: (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="plan"><AccordionTrigger>Choose a plan</AccordionTrigger><AccordionContent>Starter, Pro, Business…</AccordionContent></AccordionItem>
            <AccordionItem value="pay"><AccordionTrigger>Payment details</AccordionTrigger><AccordionContent>Card number, expiry…</AccordionContent></AccordionItem>
          </Accordion>
        ),
        caption: 'Required checkout steps hidden in an accordion: people miss the closed ones.',
      },
    },
  ],
  a11y: [
    'Triggers are buttons inside headings, with aria-expanded; Enter/Space toggles, ↑/↓ move between triggers.',
    'Keep headings short — they are read as a list of questions.',
  ],
};
