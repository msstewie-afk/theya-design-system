import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { SecretField } from './secret-field';

export const secretFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing a secret the person needs to copy: API key, token, webhook secret, recovery code.'],
  whenNotToUse: [
    { text: 'Typing a password', instead: 'Password' },
    { text: 'Values that aren’t secret', instead: 'text + CopyButton' },
  ],
  anatomy: [
    { part: 'Value', description: 'masked by default, monospaced.' },
    { part: 'Reveal', optional: true, description: <><C>revealable</C> — show/hide.</> },
    { part: 'Copy', description: 'copies without revealing; confirms with a toast.' },
  ],
  doDont: [
    {
      do: { example: <div className="w-80"><SecretField label="API key" value="sk_live_9f2c41aa7b3e" /></div>, caption: 'Masked until asked; copy works without showing it.' },
      dont: { example: <code className="font-mono text-body-s text-[var(--color-text-text)]">sk_live_9f2c41aa7b3e</code>, caption: 'A secret in plain text ends up in screenshots and screen shares.' },
    },
  ],
  a11y: ['Reveal and Copy are named buttons (“Show API key”, “Copy API key”).', 'Copy success is announced; the value itself isn’t read out while masked.'],
};
