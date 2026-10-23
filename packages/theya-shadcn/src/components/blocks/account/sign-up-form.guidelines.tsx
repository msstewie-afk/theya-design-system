import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const signUpFormGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Creating an account with an email and a password, on a centered page; anything else is asked when it’s needed.',
  ],
  whenNotToUse: [
    { text: 'Signing in to an existing account', instead: 'LoginForm' },
    { text: 'Profile and setup questions once the account exists', instead: 'OnboardingWizard' },
  ],
  anatomy: [
    { part: 'Heading', description: 'what the account is for, with a link to sign in.' },
    { part: 'Error', description: 'a server-side problem, like an email that already has an account.', optional: true },
    { part: 'Fields', description: 'work email and password, with Show; the password rule is shown before typing.' },
    { part: 'Product news', description: 'an opt-in checkbox, unchecked.' },
    { part: 'Actions', description: 'Create account and the terms as a sentence; a single sign-on button below when there is one.' },
  ],
  doDont: [],
  a11y: [
    'Empty or invalid fields show their error on the field and move focus to the first one; nothing is submitted until they are fixed.',
    'The password rule is the field’s description, so it is read before typing and counts down while typing.',
    'A server-side error is announced as soon as it appears.',
  ],
};
