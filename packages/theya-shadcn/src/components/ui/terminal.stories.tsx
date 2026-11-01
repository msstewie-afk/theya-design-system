import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Refresh } from 'iconoir-react';
import { Terminal, TerminalLine, type TerminalLineData } from './terminal';
import { Button } from './button';
import { terminalGuidelines } from './terminal.guidelines';
import { expect, userEvent, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * Terminal — a read-only console scrollback viewer. Renders a mono
 * body (`role="log"`) that auto-follows the newest line, with an
 * optional connection header (StatusDot + `user@host` + status label
 * + a right-aligned `tools` slot). Feed it the data-driven `lines`
 * prop for log streams, or compose the body yourself with
 * `TerminalLine` children for static dumps. Each line's `level` maps
 * to a semantic token (cmd / ok / warn / err / info / dim); severity
 * is never color-alone — err/warn prepend a visually-hidden severity
 * word. `inverse` (default true) forces the fixed dark Luna Pro
 * Midnight surface — same idea as CodeEditor's own `inverse` — since
 * real terminal chrome shouldn't flip pale in light theme.
 */
const meta: Meta<typeof Terminal> = {
  title: 'Code/Terminal',
  component: Terminal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Console output, live or past: a remote session on a studio workstation, an export log, a tail of access logs. Follows the newest line and can show the connection state.",
      },
    },
    layout: 'padded', guidelines: terminalGuidelines,
  },
  argTypes: {
    connection: {
      control: 'select',
      options: ['connected', 'connecting', 'down'],
      description: 'Drives the header StatusDot tone and the default status label.',
    },
    live: {
      control: 'select',
      options: ['polite', 'off'],
      description: 'Live-region politeness. Use "off" for chatty streams.',
    },
    inverse: {
      control: 'boolean',
      description: 'Fixed dark Luna Pro Midnight surface for the whole terminal. Default true.',
      table: { defaultValue: { summary: 'true' } },
    },
    user: { control: 'text', description: 'Username shown in the prompt.' },
    host: { control: 'text', description: 'Hostname shown in the prompt.' },
    status: { control: 'text', description: 'Overrides the default status label derived from connection.' },
    hideHeader: { control: 'boolean', description: 'Hides the connection/status header row.' },
    ariaLabel: { control: 'text', description: 'Accessible name for the terminal region.' },
    lines: { control: false, description: 'Rendered terminal lines.' },
    tools: { control: false, description: 'Extra action controls in the header.' },
    children: { control: false, description: 'Custom content in place of lines.' },
  },
};

export default meta;
type Story = StoryObj<typeof Terminal>;

const sshLines: TerminalLineData[] = [
  { id: '1', text: 'thea@studio-l4:~$ aether sync ./Golden-hour', level: 'cmd' },
  { id: '2', text: 'Synced 248 photos to Helios Studio.', level: 'ok' },
  { id: '3', text: 'thea@studio-l4:~$ ls ./Golden-hour | head -3', level: 'cmd' },
  { id: '4', text: 'GOLDEN_0901.tif' },
  { id: '5', text: 'GOLDEN_0902.tif' },
  { id: '6', text: 'thea@studio-l4:~$ du -sh ./Golden-hour', level: 'cmd' },
  { id: '7', text: '12G     ./Golden-hour', level: 'info' },
];

/** A remote session on a studio workstation — dark by default. */
export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'thea',
    host: 'studio-l4',
    connection: 'connected',
    status: 'Connected · ssh-ed25519 · 22ms',
    live: 'polite',
    lines: sshLines,
  },
  // Keyboard: the output scrolls on its own, so it is a tab stop with a name.
  play: async ({ canvasElement }) => {
    const output = canvasElement.querySelector<HTMLElement>('[tabindex="0"]')!;
    await expect(output).toHaveAccessibleName();
    resetFocus();
    await tabTo(output);
  },
};

/** `inverse={false}` — falls back to the theme-reactive surface instead of the fixed dark one. */
export const LightSurface: Story = {
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    inverse: false,
  },
};

/** An export log mixing severity levels — info, warning, and error. Each
 * line carries its severity in the visible text, and err/warn also
 * prepend a visually-hidden severity word so status is never color-alone. */
export const SeverityLevels: Story = {
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  parameters: { controls: { exclude: ['connection', 'lines'] } },
  args: {
    user: 'export',
    host: 'helios',
    connection: 'connecting',
    ariaLabel: 'Export log',
    lines: [
      { id: 'a', text: '$ aether export "Golden hour" --format jpeg --long-edge 2048', level: 'cmd' },
      { id: 'b', text: 'Rendering 248 photos (this can take a minute)', level: 'info' },
      { id: 'c', text: 'Uploading to helios.aether.photo', level: 'info' },
      { id: 'd', text: 'Warning: 3 photos have no color profile, using sRGB', level: 'warn' },
      { id: 'e', text: 'Error: GOLDEN_0907.tif could not be read - the file is damaged', level: 'err' },
      { id: 'f', text: 'Exported 247 of 248 photos', level: 'dim' },
    ],
  },
};

/** The three connection states. The dot tone + label move together,
 * and the "connecting" dot pulses (gated behind `motion-safe:`). */
export const ConnectionStates: Story = {
  parameters: { controls: { exclude: ['connection', 'lines'] } },
  render: (args) => (
    <div className="flex w-full max-w-[480px] flex-col gap-4">
      <Terminal {...args} connection="connected" status="Connected · ssh-ed25519 · 22ms" bodyClassName="h-28" lines={[{ id: 'c1', text: 'thea@studio-l4:~$ aether status', level: 'cmd' }]} />
      <Terminal {...args} connection="connecting" bodyClassName="h-28" lines={[{ id: 'g1', text: 'Negotiating key exchange…', level: 'info' }]} />
      <Terminal {...args} connection="down" bodyClassName="h-28" lines={[{ id: 'd1', text: 'Error: connection refused on studio-l4', level: 'err' }]} />
    </div>
  ),
  args: {
    user: 'thea',
    host: 'studio-l4',
    ariaLabel: 'Connection demo',
  },
};

/** A right-aligned `tools` slot in the header — here a verb-first
 * action. The row wraps to a clean full-width row below `sm`. An
 * `inverse` terminal scopes data-theme="dark", so a plain Button here
 * renders its dark-theme look with no overrides. */
export const WithTools: Story = {
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'export',
    host: 'helios',
    connection: 'connected',
    status: 'Connected · 12ms',
    ariaLabel: 'Export output',
    tools: (
      <Button appearance="outlined" tone="secondary" size="md" leftIcon={<Refresh />}>
        Rerun export
      </Button>
    ),
    lines: [
      { id: 'b1', text: '$ aether export "Blue hour"', level: 'cmd' },
      { id: 'b2', text: 'Rendered 96 photos in 42s' },
      { id: 'b3', text: 'Success: Export complete.', level: 'ok' },
    ],
  },
};

/** No header: hide it and compose the body yourself with
 * `TerminalLine` children (each needs its own `inverse` to match). */
export const Headless: Story = {
  parameters: { controls: { exclude: ['user', 'host', 'connection', 'status', 'lines'] } },
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} hideHeader ariaLabel="Export output" bodyClassName="h-48">
        <TerminalLine level="cmd" inverse={args.inverse}>$ aether export "Blue hour"</TerminalLine>
        <TerminalLine inverse={args.inverse}>Rendered 96 photos in 42s</TerminalLine>
        <TerminalLine level="warn" inverse={args.inverse}>Warning: 2 photos have no color profile</TerminalLine>
        <TerminalLine level="ok" inverse={args.inverse}>Success: Export complete.</TerminalLine>
      </Terminal>
    </div>
  ),
  args: { inverse: true },
};

/** A chatty access-log tail. `live="off"` keeps the rapid appends
 * from flooding screen readers — announce only outcomes via a
 * separate, quieter region. */
export const QuietStream: Story = {
  render: (args) => (
    <div className="w-full max-w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'thea',
    host: 'helios',
    connection: 'connected',
    status: 'Connected · tailing /var/log/access.log',
    live: 'off',
    ariaLabel: 'Access log tail',
    bodyClassName: 'h-48',
    lines: [
      { id: 'q1', text: '203.0.113.7 GET /galleries/golden-hour  200  18ms', level: 'dim' },
      { id: 'q2', text: '203.0.113.7 GET /photos/DAWN_0412.jpg  200  42ms', level: 'dim' },
      { id: 'q3', text: '198.51.100.2 GET /api/galleries  200  31ms', level: 'dim' },
      { id: 'q4', text: '198.51.100.2 POST /api/favorites  201  88ms', level: 'dim' },
      { id: 'q5', text: '203.0.113.7 GET /favicon.ico  404  2ms', level: 'warn' },
    ],
  },
};

function ReconnectDemo() {
  const [connection, setConnection] = useState<'connected' | 'connecting' | 'down'>('down');
  const reconnect = () => {
    setConnection('connecting');
    window.setTimeout(() => setConnection('connected'), 2000);
  };
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-3">
      <Terminal
        user="thea"
        host="studio-l4"
        ariaLabel="studio-l4 session"
        connection={connection}
        bodyClassName="h-28"
        lines={[{ id: 'r1', text: connection === 'connected' ? 'thea@studio-l4:~$ aether status' : 'Error: connection refused on studio-l4', level: connection === 'connected' ? 'cmd' : 'err' }]}
        tools={
          <Button size="sm" appearance="outlined" tone="neutral" leftIcon={<Refresh />} onClick={reconnect} disabled={connection === 'connecting'}>
            Reconnect
          </Button>
        }
      />
      <Button className="self-start" appearance="ghost" tone="neutral" onClick={() => setConnection('down')}>
        Drop the connection
      </Button>
    </div>
  );
}

/** The header's connection line is a status region: "Connecting…" and "Connected" are announced as they change (WCAG 4.1.3). */
export const Reconnect: Story = {
  render: () => <ReconnectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reconnect' }));
    await expect(await canvas.findByText(/Connected/, {}, { timeout: 4000 })).toBeInTheDocument();
  },
};
