import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingWizard } from './onboarding-wizard';

const meta: Meta<typeof OnboardingWizard> = {
  title: 'Patterns/OnboardingWizard',
  component: OnboardingWizard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Wizard heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    steps: { control: false, description: 'Ordered wizard steps ({ id, label, description, content }).', table: { category: 'Content' } },
    current: { control: { type: 'number', min: 0 }, description: 'Controlled active step index.', table: { category: 'State' } },
    onStepChange: { control: false, description: 'Fires with the new step index when Back/Next changes it.', table: { category: 'Events' } },
    onComplete: { control: false, description: 'Fires when the final step is completed.', table: { category: 'Events' } },
    completeLabel: { control: 'text', description: 'Label for the final step\'s action button.', table: { category: 'Content' } },
    backLabel: { control: 'text', description: 'Label for the back button.', table: { category: 'Content' } },
    nextLabel: { control: 'text', description: 'Label for the next button.', table: { category: 'Content' } },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Stepper layout direction.', table: { category: 'Appearance' } },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingWizard>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <OnboardingWizard onComplete={() => alert('Site created!')} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex max-w-3xl p-6">
      <OnboardingWizard orientation="vertical" onComplete={() => alert('Site created!')} />
    </div>
  ),
};
