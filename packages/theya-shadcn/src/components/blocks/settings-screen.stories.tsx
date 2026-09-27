import type { Meta, StoryObj } from '@storybook/react';
import { SettingsScreen } from './settings-screen';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Patterns/SettingsScreen',
  component: SettingsScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    account: { control: false, description: '{ fullName, email } shown in the profile section.', table: { category: 'Content' } },
    recoveryCode: { control: 'text', description: 'Recovery code shown once after enabling two-factor.', table: { category: 'Content' } },
    notifications: { control: false, description: 'Notification toggle rows. Pass [] to omit the Notifications section.', table: { category: 'Content' } },
    onSaveProfile: { control: false, description: 'Called when the profile form is submitted.', table: { category: 'Events' } },
    onChangePassword: { control: false, description: 'Called when the change-password form is submitted.', table: { category: 'Events' } },
    onEnableTwoFactor: { control: false, description: 'Called with the entered code when two-factor is enabled.', table: { category: 'Events' } },
    onDeleteAccount: { control: false, description: 'Called when account deletion is confirmed.', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsScreen>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <SettingsScreen />
    </div>
  ),
};

export const NoNotifications: Story = {
  name: 'No notifications section',
  render: () => (
    <div className="p-6">
      <SettingsScreen notifications={[]} />
    </div>
  ),
};
