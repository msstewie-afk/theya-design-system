import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Password } from './password';

export const passwordGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Signing in, setting or changing a password — with show/hide.'],
  whenNotToUse: [
    { text: 'API keys and tokens shown to the person', instead: 'SecretField' },
    { text: 'One-time codes', instead: 'InputOTP' },
  ],
  anatomy: [
    { part: 'Field', description: 'a TextField with the show/hide toggle in its right slot.' },
    { part: 'Description', optional: true, description: 'the rule, shown before typing (“At least 8 characters.”).' },
    { part: 'Strength', optional: true, description: 'PasswordStrengthMeter under it, for new passwords.' },
  ],
  doDont: [
    {
      do: { example: <Password label="New password" description="At least 8 characters." widthSize="lg" />, caption: 'The rule is visible before the first attempt.' },
      dont: { example: <Password label="New password" error="Password is too weak." widthSize="lg" />, caption: 'The rule only appears as an error, after failing.' },
    },
    {
      do: { example: <Password label="New password" widthSize="lg" />, caption: 'One field; show/hide lets people check what they typed.' },
      dont: (
        {
          example: (
            <div className="flex flex-col gap-2">
              <Password label="New password" widthSize="lg" />
              <Password label="Repeat password" widthSize="lg" />
            </div>
          ),
          caption: 'A “repeat” field doubles the typing and still doesn’t catch a typo made twice.',
        }
      ),
    },
  ],
  a11y: [
    <><C>autoComplete="current-password"</C> to sign in, <C>"new-password"</C> to set one — password managers depend on it.</>,
    'The toggle is a button with a name that says what it will do (“Show password”).',
  ],
};
