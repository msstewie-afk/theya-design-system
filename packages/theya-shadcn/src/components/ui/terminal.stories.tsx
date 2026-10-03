import type { Meta, StoryObj } from '@storybook/react';
import { Refresh } from 'iconoir-react';
import { Terminal, TerminalLine, type TerminalLineData } from './terminal';
import { Button } from './button';
import { terminalGuidelines } from './terminal.guidelines';

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
  parameters: { layout: 'padded', guidelines: terminalGuidelines },
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
  { id: '1', text: 'acme@web-04:~$ wp cache flush', level: 'cmd' },
  { id: '2', text: 'Success: The cache was flushed.', level: 'ok' },
  { id: '3', text: 'acme@web-04:~$ wp plugin list', level: 'cmd' },
  { id: '4', text: 'woocommerce   active   8.6.1' },
  { id: '5', text: 'akismet       inactive 5.3', level: 'dim' },
  { id: '6', text: 'acme@web-04:~$ wp db size', level: 'cmd' },
  { id: '7', text: 'Database size: 248.4 MB', level: 'info' },
];

/** A web SSH session — dark by default. */
export const Default: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'acme',
    host: 'web-04',
    connection: 'connected',
    status: 'Connected · ssh-ed25519 · 22ms',
    ariaLabel: 'Terminal output',
    live: 'polite',
    lines: sshLines,
  },
};

/** `inverse={false}` — falls back to the theme-reactive surface instead of the fixed dark one. */
export const LightSurface: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    inverse: false,
  },
};

/** A deploy log mixing severity levels — info, warning, and error. Each
 * line carries its severity in the visible text, and err/warn also
 * prepend a visually-hidden severity word so status is never color-alone. */
export const SeverityLevels: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  parameters: { controls: { exclude: ['connection', 'lines'] } },
  args: {
    user: 'deploy',
    host: 'edge-07',
    connection: 'connecting',
    ariaLabel: 'Deploy log',
    lines: [
      { id: 'a', text: '$ deploy shop.seashell.dev --region eu-west-1', level: 'cmd' },
      { id: 'b', text: 'Building image sha256:9f2c… (this can take a minute)', level: 'info' },
      { id: 'c', text: 'Pushing layers to eu-west-1', level: 'info' },
      { id: 'd', text: 'Warning: 1 cached layer is stale, rebuilding', level: 'warn' },
      { id: 'e', text: 'Error: health check failed on web-04 - unreachable', level: 'err' },
      { id: 'f', text: 'Rolled back to v2.4.0', level: 'dim' },
    ],
  },
};

/** The three connection states. The dot tone + label move together,
 * and the "connecting" dot pulses (gated behind `motion-safe:`). */
export const ConnectionStates: Story = {
  parameters: { controls: { exclude: ['connection', 'lines'] } },
  render: (args) => (
    <div className="flex w-[480px] flex-col gap-4">
      <Terminal {...args} connection="connected" status="Connected · ssh-ed25519 · 22ms" bodyClassName="h-28" lines={[{ id: 'c1', text: 'acme@web-04:~$ uptime', level: 'cmd' }]} />
      <Terminal {...args} connection="connecting" bodyClassName="h-28" lines={[{ id: 'g1', text: 'Negotiating key exchange…', level: 'info' }]} />
      <Terminal {...args} connection="down" bodyClassName="h-28" lines={[{ id: 'd1', text: 'Error: connection refused on web-04', level: 'err' }]} />
    </div>
  ),
  args: {
    user: 'acme',
    host: 'web-04',
    ariaLabel: 'Connection demo',
  },
};

/** A right-aligned `tools` slot in the header — here a verb-first
 * action. The row wraps to a clean full-width row below `sm`. An
 * `inverse` terminal scopes data-theme="dark", so a plain Button here
 * renders its dark-theme look with no overrides. */
export const WithTools: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'deploy',
    host: 'edge-07',
    connection: 'connected',
    status: 'Connected · 12ms',
    ariaLabel: 'Build output',
    tools: (
      <Button appearance="outlined" tone="secondary" size="md" leftIcon={<Refresh />}>
        Rerun build
      </Button>
    ),
    lines: [
      { id: 'b1', text: '$ npm run build', level: 'cmd' },
      { id: 'b2', text: 'Compiled in 4.2s' },
      { id: 'b3', text: 'Success: Build complete.', level: 'ok' },
    ],
  },
};

/** No header: hide it and compose the body yourself with
 * `TerminalLine` children (each needs its own `inverse` to match). */
export const Headless: Story = {
  parameters: { controls: { exclude: ['user', 'host', 'connection', 'status', 'lines'] } },
  render: (args) => (
    <div className="w-[480px]">
      <Terminal {...args} hideHeader ariaLabel="Build output" bodyClassName="h-48">
        <TerminalLine level="cmd" inverse={args.inverse}>$ npm run build</TerminalLine>
        <TerminalLine inverse={args.inverse}>Compiled in 4.2s</TerminalLine>
        <TerminalLine level="warn" inverse={args.inverse}>Warning: 2 unused exports</TerminalLine>
        <TerminalLine level="ok" inverse={args.inverse}>Success: Build complete.</TerminalLine>
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
    <div className="w-[480px]">
      <Terminal {...args} />
    </div>
  ),
  args: {
    user: 'acme',
    host: 'web-01',
    connection: 'connected',
    status: 'Connected · tailing /var/log/access.log',
    live: 'off',
    ariaLabel: 'Access log tail',
    bodyClassName: 'h-48',
    lines: [
      { id: 'q1', text: '203.0.113.7 GET /  200  18ms', level: 'dim' },
      { id: 'q2', text: '203.0.113.7 GET /assets/app.css  200  4ms', level: 'dim' },
      { id: 'q3', text: '198.51.100.2 GET /api/sites  200  31ms', level: 'dim' },
      { id: 'q4', text: '198.51.100.2 POST /api/sites  201  88ms', level: 'dim' },
      { id: 'q5', text: '203.0.113.7 GET /favicon.ico  404  2ms', level: 'warn' },
    ],
  },
};
