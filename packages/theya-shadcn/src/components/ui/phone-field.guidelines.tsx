import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { PhoneField } from './phone-field';
import { TextField } from './text-field';

export const phoneFieldGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Any phone number: account, 2FA by SMS, contact details.'],
  whenNotToUse: [{ text: 'Other fixed formats', instead: 'MaskedInput' }],
  anatomy: [
    { part: 'Country picker', description: <>flag + code; <C>preferredCountries</C> on top.</> },
    { part: 'Number', description: 'formatted as typed; the country’s example as placeholder.' },
    { part: 'Message', description: 'too short / too long for the country, on blur.' },
  ],
  doDont: [
    {
      do: { example: <div className="w-72"><PhoneField label="Phone" defaultCountry="BG" /></div>, caption: 'People type the way they know their number; the value comes out as E.164.' },
      dont: { example: <TextField label="Phone" placeholder="+359XXXXXXXXX, no spaces" widthSize="md" />, caption: 'Making people enter your storage format.' },
    },
  ],
  a11y: [
    <>Pasting “+44…” switches the country by itself — autofill works.</>,
    'The picker has a search; the selected country is announced with the number field.',
    'Flags are emoji: on Windows they show as two letters.',
  ],
};
