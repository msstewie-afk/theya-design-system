import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { PasswordStrengthMeter } from './password-strength-meter';

export const passwordStrengthMeterGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Under a new-password field, to show how close the password is to the rules as it’s typed.'],
  whenNotToUse: [
    { text: 'Signing in with an existing password' },
    { text: 'When the only rule is a length — say it in the field’s description instead' },
  ],
  anatomy: [
    { part: 'Bar', description: 'filled by score; danger / warning / success.' },
    { part: 'Label', description: 'Weak / Good / Strong.' },
    { part: 'Checklist', description: <>each rule met or not; <C>rules</C> to override.</> },
  ],
  doDont: [
    {
      do: { example: <div className="w-[348px] max-w-full"><PasswordStrengthMeter value="abcDEF12" /></div>, caption: 'The checklist says what’s missing, not just “weak”.' },
      dont: { example: <span className="font-body text-body-m text-[var(--color-text-text-danger)]">Weak</span>, caption: 'A verdict without the rules leaves people guessing what to add.' },
    },
  ],
  a11y: ['The bar is a progressbar with a text value (Weak/Good/Strong).', 'Each rule is text with a met/not-met state, not color only.'],
};
