import type { Meta, StoryObj } from '@storybook/react';
import { ShieldCheck } from 'iconoir-react';
import { QrCode } from './qr-code';
import { SecretField } from './secret-field';

const OTPAUTH = 'otpauth://totp/Seashell:maria%40seashell.dev?secret=JBSWY3DPEHPK3PXP&issuer=Seashell';

/**
 * QrCode — a crisp SVG QR code. Dark modules on a white plate in both
 * themes (many scanners can't read inverted codes), with the 4-module quiet
 * zone built in. Always pair it with the same value as text for people who
 * can't scan. `label` is the accessible name: say what scanning does.
 */
const meta = {
  title: 'Data/QrCode',
  component: QrCode,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: 'text', description: 'Text or URL to encode.', table: { category: 'Content' } },
    label: { control: 'text', description: 'Accessible name — what scanning does.', table: { category: 'Content' } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'sm 128px, md 160px, lg 200px (quiet zone included).', table: { category: 'Appearance' } },
    level: { control: 'inline-radio', options: ['L', 'M', 'Q', 'H'], description: 'Error correction: L 7%, M 15%, Q 25%, H 30%. Forced to H with an icon.', table: { category: 'Behavior' } },
    loading: { control: 'boolean', description: 'Same-size placeholder while the value loads.', table: { category: 'State' } },
    icon: { control: false, description: 'Optional center mark; raises the level to H.', table: { category: 'Content' } },
  },
  args: { value: 'https://seashell.dev/download', label: 'Scan to download the Seashell app', size: 'md', level: 'M' },
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A link. Edit the value in Controls — the code re-encodes as you type. */
export const Default: Story = {};

/** Three sizes. Each includes the quiet zone, so the visible code is a little smaller than the box. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <QrCode {...args} size={size} />
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Same value at every level: higher correction survives more damage but makes a denser, harder-to-scan code at small sizes. M is the default. */
export const Levels: Story = {
  parameters: { controls: { exclude: ['level'] } },
  render: (args) => (
    <div className="flex items-end gap-6">
      {(['L', 'M', 'Q', 'H'] as const).map((level) => (
        <div key={level} className="flex flex-col items-center gap-2">
          <QrCode {...args} size="sm" level={level} />
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{level}</span>
        </div>
      ))}
    </div>
  ),
};

/** A center mark. The level is raised to H automatically so the covered modules don't break scanning. */
export const WithIcon: Story = {
  args: { size: 'lg', icon: <ShieldCheck /> },
};

/** Placeholder of the same size while the value is fetched — the layout doesn't jump when the code arrives. */
export const Loading: Story = {
  args: { loading: true },
};

/** A value longer than any QR version can hold shows a clear message instead of a broken code. */
export const TooMuchData: Story = {
  args: { value: 'x'.repeat(5000) },
};

/** Two-factor setup: the QR code plus the same secret as text for anyone who can't scan. */
export const TwoFactorSetup: Story = {
  parameters: { controls: { exclude: ['value', 'label', 'icon'] } },
  render: (args) => (
    <div className="flex w-[420px] flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] p-6">
      <div>
        <h3 className="font-heading text-heading-xs text-[var(--color-text-text)]">Set up your authenticator app</h3>
        <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Scan the code with Google Authenticator, 1Password or any TOTP app.</p>
      </div>
      <QrCode {...args} value={OTPAUTH} label="Scan to add Seashell to your authenticator app" className="self-center" />
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Can’t scan? Enter this key instead:</span>
        <SecretField value="JBSWY3DPEHPK3PXP" defaultRevealed label="Setup key" />
      </div>
    </div>
  ),
};
