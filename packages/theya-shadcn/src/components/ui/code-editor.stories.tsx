import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor } from './code-editor';
import { codeEditorGuidelines } from './code-editor.guidelines';

const meta: Meta<typeof CodeEditor> = {
  title: 'Code/CodeEditor',
  component: CodeEditor,
  parameters: { guidelines: codeEditorGuidelines },
  tags: ['autodocs'],
  argTypes: {
    value: { control: false, description: 'Controlled value.', table: { category: 'State' } },
    defaultValue: { control: 'text', description: 'Uncontrolled initial value.', table: { category: 'State' } },
    onChange: { control: false, description: 'Fires with the new value on edit.', table: { category: 'Events' } },
    extensions: { control: false, description: 'Extra CodeMirror extensions, added alongside whatever language auto-resolves.', table: { category: 'Advanced' } },
    readOnly: { control: 'boolean', description: 'Presentation-only: content can be selected/copied but not edited.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables editing entirely.', table: { category: 'State' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty.', table: { category: 'Content' } },
    minHeight: { control: 'text', description: 'Minimum height of the code area (CSS length).', table: { category: 'Appearance' } },
    maxHeight: { control: 'text', description: 'Maximum height before the code area scrolls (CSS length).', table: { category: 'Appearance' } },
    filename: { control: 'text', description: 'Filename shown mono in the header (takes visual priority over language).', table: { category: 'Content' } },
    language: {
      control: 'text',
      description: 'Also auto-selects syntax coloring when it matches a known grammar: json, html, css, javascript/js/jsx, typescript/ts/tsx, bash/shell/sh.',
      table: { category: 'Content' },
    },
    copy: { control: 'boolean', description: 'Shows a copy-to-clipboard button.', table: { category: 'Behavior' } },
    copyLabel: { control: 'text', description: 'Accessible label for the copy button.', table: { category: 'Content' } },
    clearable: { control: 'boolean', description: 'Shows a clear button.', table: { category: 'Behavior' } },
    clearLabel: { control: 'text', description: 'Accessible label for the clear button.', table: { category: 'Content' } },
    inverse: {
      control: 'boolean',
      description: "Forces the code area (not the header) onto a fixed dark surface (Luna Pro Midnight) regardless of the page's own theme.",
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeEditor>;

export const PlainText: Story = {
  name: 'Plain text',
  render: () => (
    <div className="w-[480px]">
      <CodeEditor aria-label="Notes" defaultValue={'# Deployment notes\n\nRemember to flush the cache after each release.'} minHeight="8rem" />
    </div>
  ),
};

export const WithHeader: Story = {
  name: 'With header',
  render: () => (
    <div className="w-[480px]">
      <CodeEditor aria-label="Config editor" filename="config.json" language="json" copy clearable defaultValue={'{\n  "region": "eu-west-1",\n  "replicas": 3\n}'} minHeight="10rem" />
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="w-[480px]">
      <CodeEditor
        aria-label="Generated config (read only)"
        readOnly
        filename="block.html"
        language="html"
        copy
        defaultValue={'<div class="callout">\n  <p>Your account is on hold.</p>\n</div>'}
        minHeight="8rem"
      />
    </div>
  ),
};

export const Languages: Story = {
  name: 'Language coloring',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 w-[480px]">
      <CodeEditor aria-label="CSS example" filename="styles.css" language="css" defaultValue={'.callout {\n  color: var(--color-text-danger);\n  border: 1px solid #e5484d;\n}'} minHeight="6rem" />
      {/* Reads as a terminal/shell session rather than a source file, so it
          forces the same dark surface as the "Inverse (forced dark)" story
          (Мария's call) — `inverse` alone gets both the bg AND the syntax
          tokens right, since editorTheme()/highlightStyle() both already
          branch on it (see code-editor.tsx), no separate token wiring
          needed here. */}
      <CodeEditor aria-label="Bash example" filename="deploy.sh" language="bash" inverse defaultValue={'#!/usr/bin/env bash\nset -euo pipefail\n\necho "Deploying..."\nnpm run build'} minHeight="6rem" />
    </div>
  ),
};

export const Inverse: Story = {
  name: 'Inverse (forced dark)',
  parameters: { controls: { disable: true } },
  // Forces the code area onto the fixed Luna Pro Midnight surface
  // regardless of the page's own light/dark theme — the header (filename/
  // language label bar) stays on the regular theme-reactive surface.
  render: () => (
    <div className="w-[480px]">
      <CodeEditor
        aria-label="Config editor (inverse)"
        filename="config.json"
        language="json"
        copy
        inverse
        defaultValue={'{\n  "region": "eu-west-1",\n  "replicas": 3\n}'}
        minHeight="10rem"
      />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('echo "hello world"');
  return (
    <div className="flex flex-col gap-2 w-[480px]">
      <CodeEditor aria-label="Script" value={value} onChange={setValue} minHeight="6rem" />
      <p className="font-body text-body-xs text-[var(--color-text-text-subtler)]">{value.length} characters</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
