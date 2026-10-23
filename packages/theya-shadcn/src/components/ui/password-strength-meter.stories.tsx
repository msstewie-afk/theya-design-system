import type { Meta, StoryObj } from '@storybook/react';
import { PasswordStrengthMeter } from './password-strength-meter';
import { passwordStrengthMeterGuidelines } from './password-strength-meter.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Standalone composition helper meant to sit below a Password field — pass
//   it the same controlled value. Solid color per score band
//   (danger/warning/success), no gradient. See Text Input/Password → "Strength
//   meter" for it paired with an actual input.
const meta: Meta<typeof PasswordStrengthMeter> = {
  title: 'Text Input/PasswordStrengthMeter',
  component: PasswordStrengthMeter,
  tags: ['autodocs'],
  parameters: {
    guidelines: passwordStrengthMeterGuidelines,
    docs: {
      description: {
        component:
          "Sits under a new-password field and shows, as people type, how close the password is to the rules.",
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

/** Interactive example — type a password into `value` in the Controls below and watch the bar and the checklist update. */
export const Playground: Story = {
  args: { value: 'abc' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** No password yet: the bar is empty, no strength is shown and every rule is unmet. */
export const Empty: Story = {
  args: { value: '' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** `value="abc"`: only one rule passes, so the bar shows the weak band in the danger color. */
export const Weak: Story = {
  args: { value: 'abc' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** `value="abcdef12"`: three of the five default rules pass — long enough, with lowercase letters and a number — so the meter reads Good. */
export const Good: Story = {
  args: { value: 'abcdef12' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** `value="correct-Horse-Battery-9!"` meets all five default rules, so the bar fills in the success color. */
export const Strong: Story = {
  args: { value: 'correct-Horse-Battery-9!' },
  render: (args) => (
    <div className="w-full max-w-[348px]">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** `rules` replaces the default checklist with your own labels and tests; the score is measured against those rules. */
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
