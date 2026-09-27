import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from './login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Patterns/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onSubmit: { control: false, description: 'Fires on form submit.', table: { category: 'Events' } },
    appName: { control: 'text', description: 'Product name shown in the heading and on the brand mark.', table: { category: 'Content' } },
    forgotHref: { control: 'text', description: '"Forgot password" link target.', table: { category: 'Content' } },
    signupHref: { control: 'text', description: 'Sign-up link target.', table: { category: 'Content' } },
    showSso: { control: 'boolean', description: 'Show the "or continue with" single sign-on row.', table: { category: 'Appearance' } },
    card: {
      control: 'boolean',
      description: 'Wrap the fields in a bordered Card. Turn off when the form already sits in its own visually distinct area (e.g. the right pane of LoginFormSplit).',
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[600px] items-center justify-center p-6">
      <LoginForm onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
};

export const NoSso: Story = {
  name: 'No SSO',
  render: () => (
    <div className="flex min-h-[600px] items-center justify-center p-6">
      <LoginForm showSso={false} />
    </div>
  ),
};
