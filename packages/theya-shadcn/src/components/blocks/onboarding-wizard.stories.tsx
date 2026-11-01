import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { OnboardingWizard } from './onboarding-wizard';
import { TextField } from '../ui/text-field';
import { Label } from '../ui/label';
import { onboardingWizardGuidelines } from './onboarding-wizard.guidelines';

const meta: Meta<typeof OnboardingWizard> = {
  title: 'Patterns/OnboardingWizard',
  component: OnboardingWizard,
  tags: ['autodocs'],
  parameters: {
    guidelines: onboardingWizardGuidelines,
    docs: {
      description: {
        component:
          "A setup done in a few steps: the current step’s content, a Stepper showing progress, and Back / Next.",
      },
    },
    layout: 'fullscreen',
  },
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

const stepHeading = (canvasElement: HTMLElement) => canvasElement.querySelector('h3') as HTMLElement;

/**
 * Next validates the step; input survives Back/Next; Review shows what was
 * entered; focus never falls to <body> when Back disables itself.
 */
export const Default: Story = {
  args: { onComplete: fn() },
  render: (args) => (
    <div className="p-6">
      <OnboardingWizard onComplete={args.onComplete} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Next' });
    const back = canvas.getByRole('button', { name: 'Back' });
    const portal = canvas.getByRole('textbox', { name: 'Portal address' });
    await expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 3: Portal');
    await expect(back).toBeDisabled();

    // Next validates: empty, then malformed, both keep you on step 1.
    await userEvent.click(next);
    await waitFor(() => expect(portal).toHaveAccessibleDescription(/Enter a portal address\./));
    await expect(portal).toHaveFocus();
    await expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 3');
    await userEvent.type(portal, 'not an address');
    await userEvent.click(next);
    await waitFor(() => expect(portal).toHaveAccessibleDescription(/Enter a valid address/));
    await expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 3');

    // Enter in the field works like Next (validates, then advances) — and
    // doesn't reload the page.
    await userEvent.clear(portal);
    await userEvent.type(portal, 'rhea-okafor.aether.photo{Enter}');
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 2 of 3: Plan'));
    await expect(canvas.queryByRole('textbox', { name: 'Portal address' })).toBeNull();
    await userEvent.click(canvas.getByRole('radio', { name: /^Business/ }));

    // Back to step 1: the typed address is still there, and with Back now
    // disabled, focus lands on the step's field instead of <body>.
    await userEvent.click(back);
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 3'));
    await expect(canvas.getByRole('textbox', { name: 'Portal address' })).toHaveValue('rhea-okafor.aether.photo');
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Portal address' })).toHaveFocus());

    await userEvent.click(next);
    await waitFor(() => expect(canvas.getByRole('radio', { name: /^Business/ })).toBeChecked());
    await userEvent.click(next);
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 3 of 3: Review'));
    // Review reflects the real choices (was hardcoded).
    await expect(canvas.getByText('rhea-okafor.aether.photo')).toBeVisible();
    await expect(canvas.getByText('Business, $60 / mo')).toBeVisible();

    // Review's Edit links and the Stepper's completed steps jump back.
    await userEvent.click(canvas.getByRole('button', { name: 'Edit plan' }));
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 2 of 3: Plan'));
    await userEvent.click(canvas.getByRole('button', { name: /^Portal \(go back to this step\)/ }));
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 3: Portal'));
    await userEvent.click(next);
    await userEvent.click(next);
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 3 of 3: Review'));

    await userEvent.click(canvas.getByRole('button', { name: 'Create portal' }));
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
  },
};

/** `orientation="vertical"` lists the Stepper's steps top to bottom instead of across. */
export const Vertical: Story = {
  render: () => (
    <div className="flex max-w-3xl p-6">
      <OnboardingWizard orientation="vertical" onComplete={fn()} />
    </div>
  ),
};

/** A step whose state lives inside it (an uncontrolled field). */
function NotesStep() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="wizard-notes">Notes</Label>
      <TextField id="wizard-notes" defaultValue="" widthSize="full" />
    </div>
  );
}

/**
 * Consumer-supplied steps keep their own state across Back/Next: inactive
 * steps are hidden, not unmounted, so nothing resets.
 */
export const CustomSteps: Story = {
  render: () => (
    <div className="p-6">
      <OnboardingWizard
        title="Request access"
        completeLabel="Send request"
        steps={[
          { id: 'notes', label: 'Notes', content: <NotesStep /> },
          { id: 'confirm', label: 'Confirm', content: <p className="font-body text-body-m">Ready to send.</p> },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Notes' }), 'Need archive access');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 2 of 2: Confirm'));
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(stepHeading(canvasElement)).toHaveTextContent('Step 1 of 2: Notes'));
    await expect(canvas.getByRole('textbox', { name: 'Notes' })).toHaveValue('Need archive access');
  },
};
