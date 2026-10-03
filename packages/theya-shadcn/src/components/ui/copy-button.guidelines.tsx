import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';
import { CopyButton } from './copy-button';

export const copyButtonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Next to a value people paste somewhere else: an API key, a DNS record, a command, a link.', 'When selecting the text by hand would be fiddly (long, monospaced, partly hidden).'],
  whenNotToUse: [
    { text: 'A secret that should stay masked until asked', instead: 'SecretField (copy built in)' },
    { text: 'A block of code', instead: 'CodeBlock (copy built in)' },
    { text: 'Sharing a page', instead: 'a Share action or the URL itself' },
  ],
  anatomy: [
    { part: 'Button', description: <>a Button; icon-only with <C>label={'{null}'}</C> (then <C>aria-label</C>).</> },
    { part: 'Icon', description: 'copy → check for the confirmation.' },
    { part: 'Label', optional: true, description: <>“Copy” → “Copied” for <C>resetDelay</C> ms.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex items-center gap-2">
            <code className="rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-2 py-1 font-mono text-body-s text-[var(--color-text-text)]">ns1.theya.dev</code>
            <CopyButton value="ns1.theya.dev" label={null} aria-label="Copy ns1.theya.dev" appearance="ghost" tone="secondary" size="sm" />
          </div>
        ),
        caption: 'Right next to the value it copies, and the name says which value.',
      },
      dont: {
        example: (
          <div className="flex flex-col items-start gap-2">
            <code className="font-mono text-body-s text-[var(--color-text-text)]">ns1.theya.dev</code>
            <code className="font-mono text-body-s text-[var(--color-text-text)]">ns2.theya.dev</code>
            <Button appearance="outlined" tone="secondary" size="md">Copy</Button>
          </div>
        ),
        caption: 'One “Copy” for two values — which one did it take?',
      },
    },
  ],
  a11y: [
    'The confirmation is announced (“Copied”), not only shown by the icon swap.',
    <>Icon-only needs an <C>aria-label</C> naming the value: “Copy API key”, not just “Copy”.</>,
    <>If copying fails, say so — wire <C>onCopyError</C> to a toast.</>,
  ],
};
