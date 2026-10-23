import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const passwordResetGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The whole forgot-password path in one place: ask for the email, say a link was sent, set a new password, done.',
    'Opening from the emailed link, straight on the new-password step, or on the expired-link step with a way to get a new one.',
  ],
  whenNotToUse: [
    { text: 'Changing the password while signed in', instead: 'Preferences' },
    { text: 'Signing in', instead: 'LoginForm' },
  ],
  anatomy: [
    { part: 'Heading', description: 'names the current step.' },
    { part: 'Request', description: 'the email field and Send reset link.' },
    { part: 'Link sent', description: 'that a link is on its way, without saying whether an account exists; Resend after a short wait, and Use a different email.' },
    { part: 'Expired link', description: 'one button for a new link to the same address.', optional: true },
    { part: 'New password and done', description: 'the password rule shown before typing, then a confirmation with Sign in.' },
  ],
  doDont: [],
  a11y: [
    'Every step change moves focus to the new heading, so the change is announced.',
    'An empty or invalid field shows its error on the field and gets focus; nothing is sent until it is fixed.',
    'Resend stays focusable while it waits, and the time left is given as its description.',
  ],
};
