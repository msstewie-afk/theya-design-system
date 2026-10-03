import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Attachment as AttachmentIcon, Microphone, Globe, Brain, Clock, Sparks } from 'iconoir-react';
import { matchesAccept } from '@/lib/accept';
import { PromptArea } from './prompt-area';
import { Attachment } from './attachment';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Toggle } from './toggle';
import { PromptSuggestions } from './prompt-suggestions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
import { promptAreaGuidelines } from './prompt-area.guidelines';

const meta: Meta<typeof PromptArea> = {
  title: 'AI & Chat/PromptArea',
  component: PromptArea,
  tags: ['autodocs'],
  parameters: {
    guidelines: promptAreaGuidelines,
    docs: {
      description: {
        component:
          'The composer for a chat / AI assistant — an auto-growing textarea with a send button. Enter submits, Shift+Enter adds a newline. Includes a real Stop while busy, a character limit that blocks sending, drag/drop and paste attachments (validated against accept/maxFileSize), leading/trailing tool slots, and "@" / "/" menus that insert plain text.',
      },
    },
  },
  args: { placeholder: 'Send a message…' },
  argTypes: {
    value: { control: false, description: 'Controlled input value.', table: { category: 'Content' } },
    defaultValue: { control: false, description: 'Uncontrolled initial input value.', table: { category: 'Content' } },
    onValueChange: { control: false, description: 'Fires with the new value as the user types.', table: { category: 'Behavior' } },
    onSubmit: { control: false, description: 'Fires with the current value on submit (Enter or the submit button).', table: { category: 'Behavior' } },
    onStop: { control: false, description: 'Shows a stop button instead of submit while busy; fires when it is pressed.', table: { category: 'Behavior' } },
    onEditLast: { control: false, description: 'Fires when the user requests editing the last message (e.g. Up-arrow on an empty field).', table: { category: 'Behavior' } },
    leading: { control: false, description: 'Content before the textarea, e.g. a model picker.', table: { category: 'Content' } },
    trailing: { control: false, description: 'Content after the textarea, e.g. submit/stop and extra actions.', table: { category: 'Content' } },
    attachments: { control: false, description: 'Attachment chips rendered above the textarea.', table: { category: 'Content' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty.', table: { category: 'Content' } },
    maxRows: { control: 'number', description: 'Caps how many lines the textarea grows to before scrolling.', table: { category: 'Appearance' } },
    maxLength: { control: 'number', description: 'Character limit for the input.', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', description: 'Disables the textarea and all controls.', table: { category: 'State' } },
    busy: { control: 'boolean', description: 'Shows the stop affordance instead of submit and blocks further submits.', table: { category: 'State' } },
    submitLabel: { control: 'text', description: 'Accessible label for the submit button.', table: { category: 'Content' } },
    stopLabel: { control: 'text', description: 'Accessible label for the stop button.', table: { category: 'Content' } },
    onFilesAdded: { control: false, description: 'Fires with accepted files when the user attaches or drops them.', table: { category: 'Behavior' } },
    accept: { control: 'text', description: 'Accepted file types for attachments.', table: { category: 'Behavior' } },
    maxFileSize: { control: 'number', description: 'Max file size in bytes before onFileRejected fires with reason "size".', table: { category: 'Behavior' } },
    onFileRejected: { control: false, description: 'Fires when a dropped/attached file fails the type or size check.', table: { category: 'Behavior' } },
    mentions: {
      control: false,
      description: 'Items shown when the user types "@" then a query. Inserted as plain text on selection.',
      table: { category: 'Behavior' },
    },
    commands: { control: false, description: 'Items shown when the user types "/" then a query, e.g. quick actions or saved prompts.', table: { category: 'Behavior' } },
    onMentionSelect: { control: false, description: 'Called when a mention is picked from the "@" menu.', table: { category: 'Behavior' } },
    onCommandSelect: { control: false, description: 'Called when a command is picked from the "/" menu.', table: { category: 'Behavior' } },
  },
};

export default meta;
type Story = StoryObj<typeof PromptArea>;

const field = (root: HTMLElement) => within(root).getByRole('textbox') as HTMLTextAreaElement;
const activeOption = (input: HTMLElement) => {
  const id = input.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent?.trim() : undefined;
};

function drop(target: HTMLElement, files: File[]) {
  const data = new DataTransfer();
  files.forEach((file) => data.items.add(file));
  for (const type of ['dragenter', 'dragover', 'drop']) {
    target.dispatchEvent(new DragEvent(type, { dataTransfer: data, bubbles: true, cancelable: true }));
  }
}

/** Type a message and press Enter (or the send button) to submit. */
export const Default: Story = {
  render: function DefaultExample(args) {
    const [sent, setSent] = useState<string[]>([]);
    return (
      <div className="flex max-w-xl flex-col gap-3">
        <PromptArea {...args} onSubmit={(v) => setSent((s) => [...s, v])} />
        {sent.length > 0 && (
          <ul className="font-body text-body-s text-[var(--color-text-text-subtler)]">
            {sent.map((m, i) => (
              <li key={i}>sent: {m}</li>
            ))}
          </ul>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = field(canvasElement);
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(send).toBeDisabled();

    // Whitespace alone can't be sent.
    await userEvent.type(input, '   ');
    await expect(send).toBeDisabled();
    await userEvent.clear(input);

    // Shift+Enter is a newline, Enter sends the trimmed text and clears.
    await userEvent.type(input, 'Hello{Shift>}{Enter}{/Shift}world');
    await expect(input).toHaveValue('Hello\nworld');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText(/sent: Hello/)).toBeInTheDocument();
    await expect(input).toHaveValue('');
  },
};

/** A counter appears once the field is close to `maxLength`, turning danger at/over the limit. */
export const WithCharacterLimit: Story = {
  name: 'With character limit',
  args: { maxLength: 120, onSubmit: fn() },
  render: (args) => (
    <div className="max-w-xl">
      <PromptArea {...args} defaultValue="This message is getting long enough to approach the character limit set on this field" />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = field(canvasElement);
    // Near the limit a counter appears and describes the field.
    await userEvent.type(input, ' and a bit more');
    await expect(input).toHaveAccessibleDescription(/\d+\/120/);

    // Over the limit: error, aria-invalid, and sending is blocked.
    await userEvent.type(input, ' plus quite a lot more text');
    await expect(canvas.getByRole('alert')).toHaveTextContent('exceeds the 120-character limit');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Busy: a response is streaming, so the send button becomes a real Stop control (not just a disabled spinner) — click it to cancel. */
export const Busy: Story = {
  render: function BusyExample() {
    const [busy, setBusy] = useState(true);
    return (
      <div className="max-w-xl">
        <PromptArea busy={busy} defaultValue="Summarize last week's incidents" onStop={() => setBusy(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Busy: a real, enabled Stop control; Enter doesn't send.
    const stop = canvas.getByRole('button', { name: 'Stop generating' });
    await expect(stop).toBeEnabled();
    await userEvent.click(stop);
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent('Response finished.');
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'You cannot edit this right now' },
  render: (args) => (
    <div className="max-w-xl">
      <PromptArea {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(field(canvasElement)).toBeDisabled();
    await expect(within(canvasElement).getByRole('button', { name: 'Send' })).toBeDisabled();
  },
};

/** Press Up in the empty field to re-open the last sent message for editing — the same shortcut Claude/ChatGPT use. */
export const EditLastMessage: Story = {
  name: 'Edit last message (Up arrow)',
  render: function EditLastExample() {
    const [value, setValue] = useState('');
    const [lastSent, setLastSent] = useState('Create a staging environment for the shop.seashell.dev site');
    return (
      <div className="flex max-w-xl flex-col gap-2">
        <PromptArea
          value={value}
          onValueChange={setValue}
          onSubmit={(v) => {
            setLastSent(v);
            setValue('');
          }}
          onEditLast={() => setValue(lastSent)}
        />
        <p className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
          Last sent: <span className="text-[var(--color-text-text)]">{lastSent}</span> — press Up in the empty field above to edit it again.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const input = field(canvasElement);
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('Create a staging environment for the shop.seashell.dev site');
    // In a non-empty field Up is a normal caret move, not "edit last".
    await userEvent.type(input, ' now');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('');
    await expect(within(canvasElement).getByText('Create a staging environment for the shop.seashell.dev site now')).toBeInTheDocument();
  },
};

type StagedFile = { name: string; size: number; error?: string };

/**
 * Drop files anywhere on the composer, paste an image from the clipboard,
 * or click the attach button — all three call `onFilesAdded` with the raw
 * files. The caller owns the staged list (same pattern as Dropzone) and
 * renders it back through `attachments`.
 */
function AttachmentsDemo() {
  const [files, setFiles] = useState<StagedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPT = 'image/*,.pdf,.txt,.json';
  const MAX_SIZE = 5_000_000;

  const addFiles = (incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming.map((f) => ({ name: f.name, size: f.size }))]);
  };

  // Same accept/size rules PromptArea itself checks for drag-drop and
  // paste — the file-picker button uses its own plain <input type="file">
  // (PromptArea doesn't own a picker button), so it re-checks with the
  // shared matcher (it used the regex-on-the-whole-list version before).
  const addFilesFromPicker = (incoming: File[]) => {
    for (const file of incoming) {
      if (!matchesAccept(file, ACCEPT)) {
        setFiles((prev) => [...prev, { name: file.name, size: file.size, error: 'File type not allowed' }]);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setFiles((prev) => [...prev, { name: file.name, size: file.size, error: 'Exceeds the 5 MB limit' }]);
        continue;
      }
      addFiles([file]);
    }
  };

  return (
    <div className="max-w-xl">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          if (e.target.files) addFilesFromPicker(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
      <PromptArea
        placeholder="Drop a file, paste an image, or attach one below…"
        accept="image/*,.pdf,.txt,.json"
        maxFileSize={5_000_000}
        onFilesAdded={addFiles}
        onFileRejected={(file, reason) =>
          setFiles((prev) => [
            ...prev,
            { name: file.name, size: file.size, error: reason === 'size' ? 'Exceeds the 5 MB limit' : 'File type not allowed' },
          ])
        }
        onSubmit={() => setFiles([])}
        leading={
          <Button appearance="ghost" size="sm" iconOnly aria-label="Attach a file" leftIcon={<AttachmentIcon />} onClick={() => inputRef.current?.click()} />
        }
        attachments={
          files.length > 0 ? (
            <>
              {files.map((f, i) => (
                <Attachment
                  key={`${f.name}-${i}`}
                  variant="pill"
                  name={f.name}
                  size={f.size}
                  error={f.error}
                  onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </>
          ) : null
        }
      />
    </div>
  );
}

export const WithAttachments: Story = {
  name: 'With attachments',
  render: () => <AttachmentsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const surface = canvasElement.querySelector('[data-slot="prompt-area"]') as HTMLElement;
    // Drop: accepted and rejected files both show up, the rejected one with a reason.
    drop(surface, [
      new File(['%PDF'], 'brief.pdf', { type: 'application/pdf' }),
      new File(['x'], 'setup.exe', { type: 'application/x-msdownload' }),
    ]);
    await expect(await canvas.findByText('brief.pdf')).toBeInTheDocument();
    await expect(await canvas.findByText('File type not allowed')).toBeInTheDocument();

    // The picker path uses the same matcher: ".pdf" is accepted there too.
    const picker = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    const data = new DataTransfer();
    data.items.add(new File(['{}'], 'notes.json', { type: 'application/json' }));
    picker.files = data.files;
    picker.dispatchEvent(new Event('change', { bubbles: true }));
    await expect(await canvas.findByText('notes.json')).toBeInTheDocument();
  },
};

/** `leading` composes with any picker — here a model Select, alongside the attach button. Neither is built into PromptArea itself; the slot just holds whatever the app needs. */
/** The model picker sits above the composer, not inside its footer — a normal-sized Select, right-aligned, composed alongside PromptArea rather than through a slot. */
export const WithModelPicker: Story = {
  name: 'With model picker',
  render: function ModelPickerExample() {
    const [model, setModel] = useState('sonnet');
    return (
      <div className="flex max-w-xl flex-col gap-2">
        <PromptArea placeholder="Send a message…" />
        <div className="flex justify-end">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger
              className="w-fit border-none bg-transparent text-body-s shadow-none"
              aria-label="Model"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opus" className="text-body-s">
                Opus
              </SelectItem>
              <SelectItem value="sonnet" className="text-body-s">
                Sonnet
              </SelectItem>
              <SelectItem value="haiku" className="text-body-s">
                Haiku
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
};

/** `leading` can also hold toggle-style tools (web search, extended thinking) — each Toggle owns its own on/off state, PromptArea just renders the slot. */
export const WithToolToggles: Story = {
  name: 'With tool toggles',
  render: () => (
    <div className="max-w-xl">
      <PromptArea
        placeholder="Send a message…"
        leading={
          <div className="flex items-center gap-1">
            <Toggle appearance="tonal" size="sm" aria-label="Web search">
              <Globe />
            </Toggle>
            <Toggle appearance="tonal" size="sm" aria-label="Extended thinking">
              <Brain />
            </Toggle>
          </div>
        }
      />
    </div>
  ),
};

/** `trailing` sits just before the send/stop button — a natural spot for a mic button. This is UI-only (no real speech-to-text wired up); it just toggles a recording look. */
export const WithVoiceInput: Story = {
  name: 'With voice input',
  render: function VoiceInputExample() {
    const [recording, setRecording] = useState(false);
    return (
      <div className="max-w-xl">
        <PromptArea
          placeholder={recording ? 'Listening…' : 'Send a message…'}
          trailing={
            <Button
              appearance={recording ? 'filled' : 'ghost'}
              tone={recording ? 'danger' : 'neutral'}
              size="sm"
              iconOnly
              aria-label={recording ? 'Stop recording' : 'Start voice input'}
              aria-pressed={recording}
              leftIcon={<Microphone />}
              onClick={() => setRecording((r) => !r)}
            />
          }
        />
      </div>
    );
  },
};



/** Type "@" then a query to open a filtered mention menu — arrow keys navigate, Enter/Tab inserts, Escape closes. Inserted as plain text (see the component doc comment on why there's no inline pill on a plain textarea). */
export const WithMentions: Story = {
  render: () => (
    <div className="max-w-xl">
      <PromptArea
        placeholder='Type "@" to mention someone…'
        mentions={[
          { id: '1', label: 'sarah', description: 'Sarah Chen — Engineering' },
          { id: '2', label: 'marcus', description: 'Marcus Webb — Design' },
          { id: '3', label: 'priya', description: 'Priya Patel — Product' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = field(canvasElement);
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await userEvent.type(input, 'Ask @ma');
    // The textarea points at the highlighted option of the open list.
    const list = await within(document.body).findByRole('listbox', { name: 'Mentions' });
    await expect(input).toHaveAttribute('aria-controls', list.id);
    await expect(activeOption(input)).toContain('@marcus');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Ask @marcus ');
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull());
    await expect(input).not.toHaveAttribute('aria-activedescendant');

    // Arrows move and wrap; Escape closes without inserting.
    await userEvent.type(input, '@');
    await within(document.body).findByRole('listbox', { name: 'Mentions' });
    await expect(activeOption(input)).toContain('@sarah');
    await userEvent.keyboard('{ArrowUp}');
    await expect(activeOption(input)).toContain('@priya');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull());
    await expect(input).toHaveValue('Ask @marcus @');
  },
};

/** Type "/" then a query to open a filtered command menu — same mechanics as mentions, a separate list. */
export const WithSlashCommands: Story = {
  name: 'With slash commands',
  render: () => (
    <div className="max-w-xl">
      <PromptArea
        placeholder='Type "/" for a quick command…'
        commands={[
          { id: '1', label: 'summarize', description: 'Summarize the current conversation' },
          { id: '2', label: 'explain', description: 'Explain the last response in more detail' },
          { id: '3', label: 'translate', description: 'Translate the last response' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = field(canvasElement);
    await userEvent.type(input, '/tr');
    await within(document.body).findByRole('listbox', { name: 'Commands' });
    await userEvent.keyboard('{Tab}');
    await expect(input).toHaveValue('/translate ');
    // A "/" inside a word (e.g. a URL) doesn't open the menu.
    await userEvent.type(input, 'see a/b');
    await expect(within(document.body).queryByRole('listbox')).toBeNull();
  },
};

/** Context pills (a referenced file, a selected page) render through the same `attachments` slot as real file chips — it's a generic strip, not upload-specific. */
export const WithContextPills: Story = {
  name: 'With context pills',
  render: function ContextPillsExample() {
    const [pills, setPills] = useState(['pricing.tsx', 'Q3 roadmap doc']);
    return (
      <div className="max-w-xl">
        <PromptArea
          placeholder="Ask about the attached context…"
          attachments={
            pills.length > 0 ? (
              <>
                {pills.map((label, i) => (
                  <Attachment key={label} variant="pill" name={label} onRemove={() => setPills((prev) => prev.filter((_, idx) => idx !== i))} />
                ))}
              </>
            ) : null
          }
        />
      </div>
    );
  },
};

/** PromptSuggestions is a separate component, composed above the empty PromptArea — picking a suggestion fills the field, it doesn't submit on its own. */
export const WithSuggestedPrompts: Story = {
  name: 'With suggested prompts',
  render: function SuggestedPromptsExample() {
    const [value, setValue] = useState('');
    return (
      <div className="flex max-w-xl flex-col gap-3">
        <PromptArea value={value} onValueChange={setValue} onSubmit={() => setValue('')} />
        {value.length === 0 && (
          <PromptSuggestions
            items={[
              { id: '1', label: 'Summarize this document', icon: <Sparks /> },
              { id: '2', label: 'Draft a follow-up email', icon: <Sparks /> },
              { id: '3', label: 'Explain this error', icon: <Sparks /> },
            ]}
            onSelect={(item) => setValue(item.label)}
          />
        )}
      </div>
    );
  },
};

/** A "recent prompts" button in `trailing`, opening a DropdownMenu — picking one fills the field. Built entirely through composition, nothing history-specific lives in PromptArea itself. */
export const WithRecentPrompts: Story = {
  name: 'With recent prompts',
  render: function RecentPromptsExample() {
    const [value, setValue] = useState('');
    const recent = [
      'Create a staging environment for shop.seashell.dev',
      'Summarize last week\'s incidents',
      'Draft a postmortem for the outage on Tuesday',
    ];
    return (
      <div className="max-w-xl">
        <PromptArea
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue('')}
          trailing={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button appearance="ghost" size="sm" iconOnly aria-label="Recent prompts" leftIcon={<Clock />} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" size="sm">
                {recent.map((prompt) => (
                  <DropdownMenuItem key={prompt} onSelect={() => setValue(prompt)}>
                    {prompt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      </div>
    );
  },
};
