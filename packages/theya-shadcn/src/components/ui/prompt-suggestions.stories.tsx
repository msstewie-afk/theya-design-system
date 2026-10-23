import type { Meta, StoryObj } from '@storybook/react';
import { Sparks } from 'iconoir-react';
import { PromptSuggestions } from './prompt-suggestions';
import { promptSuggestionsGuidelines } from './prompt-suggestions.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   A row of suggestion cards shown above an empty PromptArea — a separate,
//   small composition-only piece, since suggestions belong to the surrounding
//   empty chat state, not to the composer itself.
const meta: Meta<typeof PromptSuggestions> = {
  title: 'AI & Chat/PromptSuggestions',
  component: PromptSuggestions,
  tags: ['autodocs'],
  parameters: {
    guidelines: promptSuggestionsGuidelines,
    docs: {
      description: {
        component:
          "Starting points above an empty composer: a few prompts, as cards, that show what the assistant is good at and ask it in one tap.",
      },
    },
  },
  argTypes: {
    items: { control: false, description: 'Suggestion cards to render ({ id, label, icon? }).' },
    onSelect: { control: false, description: 'Fires with the picked item when a suggestion card is clicked.' },
  },
};

export default meta;
type Story = StoryObj<typeof PromptSuggestions>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', label: 'Summarize this document', icon: <Sparks /> },
      { id: '2', label: 'Draft a follow-up email', icon: <Sparks /> },
      { id: '3', label: 'Explain this error', icon: <Sparks /> },
    ],
    onSelect: () => {},
  },
};
