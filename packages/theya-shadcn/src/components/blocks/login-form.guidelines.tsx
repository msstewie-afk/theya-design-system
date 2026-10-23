import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const loginFormGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Signing in with an email and a password, on a centered page.',
  ],
  whenNotToUse: [
    { text: 'A wide page with an image beside the form', instead: 'LoginFormSplit' },
    { text: 'Creating an account', instead: 'SignUpForm' },
    { text: 'The second step of two-factor sign-in', instead: 'InputOTP' },
  ],
  anatomy: [
    { part: 'Heading', description: 'what people sign in to.' },
    { part: 'Fields', description: 'email and password, with Show.' },
    { part: 'Keep me signed in', description: 'a checkbox.', optional: true },
    { part: 'Actions', description: 'Sign in, with links to reset the password and to sign up.' },
  ],
  doDont: [],
  a11y: [
    'Empty or malformed fields show their error on the field and move focus to the first one; nothing is submitted until they are fixed.',
    'Fields carry the right autocomplete values, so password managers fill them.',
  ],
};
