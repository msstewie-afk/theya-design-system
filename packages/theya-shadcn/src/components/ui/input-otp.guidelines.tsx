import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { TextField } from './text-field';

export const inputOtpGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A one-time code of known length from an SMS, email or authenticator app.'],
  whenNotToUse: [
    { text: 'Codes of varying length, or recovery codes with dashes', instead: 'TextField' },
    { text: 'Anything that isn’t a code (PINs people set themselves)', instead: 'Password' },
  ],
  anatomy: [
    { part: 'Input', description: <>one real input under the slots; <C>maxLength</C>, <C>pattern</C>, <C>inputMode</C>.</> },
    { part: 'Slots', description: 'one per character, grouped like the code is shown (3 + 3).' },
    { part: 'Help / error text', description: 'linked with aria-describedby.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <InputOTP maxLength={6} inputMode="numeric" aria-label="Verification code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        ),
        caption: 'One field under the hood: paste and autofill fill every slot.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <TextField key={i} aria-label={`Digit ${i + 1}`} widthSize="sm" />
            ))}
          </div>
        ),
        caption: 'Separate fields break paste, autofill and Backspace.',
      },
    },
  ],
  a11y: [
    <>Set <C>autoComplete="one-time-code"</C> and <C>inputMode="numeric"</C> for digits.</>,
    <>Put <C>aria-invalid</C> on InputOTP itself and describe the error in text — the red border alone isn’t enough.</>,
  ],
};
