import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { ShieldCheck } from 'iconoir-react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp';
import { Label } from './label';
import { Button } from './button';

type Args = { maxLength?: number; disabled?: boolean };

const meta: Meta<Args> = {
  title: 'Forms/InputOTP',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A segmented one-time-code field on input-otp: each character lands in its own slot, with an active focus ring and a blinking caret. Use for a 2FA token, an email/SMS verification code, or a recovery code. Always give it an accessible name and pair aria-invalid with a described, visible error.',
      },
    },
  },
  argTypes: {
    maxLength: { control: { type: 'number', min: 1 }, description: 'Number of character slots.', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', description: 'Disables all character slots.', table: { category: 'State' } },
    value: { control: false, description: 'Controlled value.', table: { category: 'State' } },
    onChange: { control: false, description: 'Fires with the new value on change.', table: { category: 'Events' } },
    containerClassName: { control: false, description: 'Class on the slots container, separate from the root className.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<Args>;

/** A labelled, controlled 6-digit 2FA code with a described help line. Type to fill the slots; digits only, numeric keypad on mobile. */
export const Default: Story = {
  parameters: { controls: { exclude: ['maxLength'] } },
  render: function DefaultExample(args) {
    const [code, setCode] = useState('');
    return (
      <div className="grid w-full max-w-sm gap-2">
        <Label htmlFor="otp-default">One-time code</Label>
        <InputOTP {...args} id="otp-default" maxLength={6} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" value={code} onChange={setCode} aria-describedby="otp-default-help">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p id="otp-default-help" className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
    );
  },
};

/** Two InputOTPGroups joined by an InputOTPSeparator for a longer recovery code. Splitting keeps the field readable; this code allows letters too. */
export const SplitWithSeparator: Story = {
  name: 'Split with separator',
  parameters: { controls: { exclude: ['maxLength'] } },
  render: (args) => (
    <div className="grid w-fit gap-2">
      <Label htmlFor="otp-recovery">Recovery code</Label>
      <InputOTP {...args} id="otp-recovery" maxLength={8} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} aria-describedby="otp-recovery-help">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-recovery-help" className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
        Use one of the backup codes from your account settings.
      </p>
    </div>
  ),
};

/** Invalid state: aria-invalid on InputOTP reaches the single real input, so the slots mirror the danger border+background via the container's group. Always pair with a visible, described error — the red styling alone is color-only. */
export const Invalid: Story = {
  parameters: { controls: { exclude: ['maxLength'] } },
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="otp-invalid">One-time code</Label>
      <InputOTP {...args} id="otp-invalid" maxLength={6} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" defaultValue="012345" aria-invalid="true" aria-describedby="otp-invalid-error">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-invalid-error" className="font-body text-body-xs font-medium text-[var(--color-text-text-danger)]">
        That code didn't match. Request a new one.
      </p>
    </div>
  ),
};

/** Disabled blocks entry and dims the whole field to 50% (the container reacts to the real input's disabled state). */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['maxLength', 'disabled'] } },
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="otp-disabled">One-time code</Label>
      <InputOTP {...args} id="otp-disabled" maxLength={6} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" defaultValue="0124" disabled aria-describedby="otp-disabled-help">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-disabled-help" className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
        Codes are paused while two-factor setup is incomplete.
      </p>
    </div>
  ),
};

/** A complete verification flow: the Verify action stays disabled until all 6 slots are filled. */
export const VerificationFlow: Story = {
  name: 'Verification flow',
  parameters: { controls: { exclude: ['maxLength'] } },
  render: function VerifyExample(args) {
    const [code, setCode] = useState('');
    const complete = code.length === 6;
    return (
      <div className="grid w-fit gap-3">
        <Label htmlFor="otp-verify">One-time code</Label>
        <InputOTP {...args} id="otp-verify" maxLength={6} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" value={code} onChange={setCode} aria-describedby="otp-verify-help">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p id="otp-verify-help" className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
          Signing in to <span className="font-mono">shop.seashell.dev</span>.
        </p>
        <Button type="filled" tone="primary" size="2xl" disabled={!complete} leftIcon={<ShieldCheck />} className="w-full">
          Verify code
        </Button>
      </div>
    );
  },
};
