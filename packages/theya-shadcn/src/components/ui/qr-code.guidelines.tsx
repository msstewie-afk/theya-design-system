import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { QrCode } from './qr-code';
import { SecretField } from './secret-field';

const SECRET = 'JBSWY3DPEHPK3PXP';
const OTPAUTH = `otpauth://totp/Seashell:maria?secret=${SECRET}&issuer=Seashell`;

export const qrCodeGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Moving something from screen to phone: 2FA setup, a Wi-Fi or app link, a payment or ticket.'],
  whenNotToUse: [
    { text: 'The user is already on the phone', instead: 'a link or button' },
    { text: 'Long data (a whole config)', instead: 'a download or a short link in the code' },
  ],
  anatomy: [
    { part: 'Plate', description: 'white with a 4-module quiet zone — in both themes.' },
    { part: 'Modules', description: <>one SVG path; error correction by <C>level</C> (H when there’s a center <C>icon</C>).</> },
    { part: 'Center icon', description: 'a small brand mark.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col items-center gap-3">
            <QrCode value={OTPAUTH} size="sm" label="Scan to add Seashell to your authenticator app" />
            <SecretField label="Or enter this key" value={SECRET} />
          </div>
        ),
        caption: 'The same value as text, for people who can’t scan.',
      },
      dont: { example: <QrCode value={OTPAUTH} size="sm" />, caption: 'A code alone locks out screen-reader users and anyone without a phone at hand.' },
    },
  ],
  a11y: [
    <>It’s an image named by <C>label</C> — describe what scanning does, not “QR code”.</>,
    'Always pair it with the value as text or a link.',
    'Don’t invert it for dark theme — many scanners can’t read light-on-dark.',
  ],
};
