import { type ComponentGuidelines } from '@/docs/guidelines';
import { PromptSuggestions } from './prompt-suggestions';

export const promptSuggestionsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Starting points above an empty composer — what the assistant is good at, as tap-to-ask prompts.'],
  whenNotToUse: [
    { text: 'Mid-conversation follow-ups', instead: 'short reply chips under the last answer' },
    { text: 'Navigation', instead: 'links or buttons' },
  ],
  anatomy: [
    { part: 'Cards', description: 'a short, concrete prompt each, optional icon; 2–4 of them.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <PromptSuggestions
            aria-label="Suggestions"
            onSelect={() => {}}
            items={[
              { id: '1', label: 'Why is shop.seashell.dev slow today?' },
              { id: '2', label: 'Which certificates expire this month?' },
              { id: '3', label: 'Summarize last night’s backup' },
            ]}
          />
        ),
        caption: 'Concrete questions about the user’s own data — they show what’s possible.',
      },
      dont: {
        example: (
          <PromptSuggestions
            aria-label="Vague suggestions"
            onSelect={() => {}}
            items={[{ id: '1', label: 'Help' }, { id: '2', label: 'Ask a question' }, { id: '3', label: 'Learn more' }]}
          />
        ),
        caption: '“Help”, “Ask a question”: nothing to learn, nothing to tap for.',
      },
    },
  ],
  a11y: ['Each suggestion is a button. In onSelect, fill or send the prompt and move focus to the composer — the component doesn’t do it for you.'],
};
