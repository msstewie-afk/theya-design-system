import type { Meta, StoryObj } from '@storybook/react';
import { PasswordStrengthMeter } from './password-strength-meter';
import { passwordStrengthMeterGuidelines } from './password-strength-meter.guidelines';

const meta: Meta<typeof PasswordStrengthMeter> = {
  title: 'Text Input/PasswordStrengthMeter',
  component: PasswordStrengthMeter,
  tags: ['autodocs'],
  parameters: {
    guidelines: passwordStrengthMeterGuidelines,
    docs: {
      description: {
        component:
          'Standalone composition helper meant to sit below a Password field — pass it the same controlled ' +
          'value. Solid color per score band (danger/warning/success), no gradient. See Text Input/Password → ' +
          '"Strength meter" for it paired with an actual input.',
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: 'The current password value to evaluate.', table: { category: 'Content' } },
    rules: { control: false, description: 'Override the default 5 rules (length/upper/lower/number/symbol).', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordStrengthMeter>;

export const Playground: Story = {
  args: { value: 'abc' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { value: '' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export const Weak: Story = {
  args: { value: 'abc' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export const Good: Story = {
  args: { value: 'abcDEF12' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export const Strong: Story = {
  args: { value: 'correct-Horse-Battery-9!' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export const CustomRules: Story = {
  name: 'Custom rules',
  render: () => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter
        value="hunter2"
        rules={[
          { label: 'At least 10 characters', test: (v) => v.length >= 10 },
          { label: 'No spaces', test: (v) => !/\s/.test(v) },
          { label: "Not the word 'password'", test: (v) => !/password/i.test(v) },
        ]}
      />
    </div>
  ),
};
