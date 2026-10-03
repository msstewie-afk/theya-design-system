import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DiffViewer, type DiffView } from './diff-viewer';
import { Button } from './button';

/**
 * DiffViewer — read-only comparison of two texts in the CodeBlock frame.
 * Unified (git-style) or split view, word-level highlights inside changed
 * lines, and long unchanged runs collapsed to an expander row.
 */

const OLD_CONFIG = `server {
  listen 80;
  server_name example.com www.example.com;

  root /var/www/example/public;
  index index.html index.php;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  location ~ \\.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
  }

  location ~ /\\.ht {
    deny all;
  }

  access_log /var/log/nginx/example.access.log;
  error_log /var/log/nginx/example.error.log;
}
`;

const NEW_CONFIG = `server {
  listen 443 ssl http2;
  server_name example.com www.example.com;

  ssl_certificate /etc/ssl/example/fullchain.pem;
  ssl_certificate_key /etc/ssl/example/privkey.pem;

  root /var/www/example/public;
  index index.html index.php;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  location ~ \\.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
  }

  location ~ /\\.ht {
    deny all;
  }

  access_log /var/log/nginx/example.access.log;
  error_log /var/log/nginx/example.error.log warn;
}
`;

const OLD_POLICY = `Backups run every night at 02:00.
Each backup is kept for 7 days.
Restores can be requested through support.`;

const NEW_POLICY = `Backups run every night at 03:00 server time.
Each backup is kept for 30 days.
Restores can be started from the dashboard.`;

const meta = {
  title: 'Code/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    oldValue: { control: 'text', description: 'Original text.' },
    newValue: { control: 'text', description: 'Changed text.' },
    view: { control: 'inline-radio', options: ['unified', 'split'], description: 'Controlled view.' },
    defaultView: { control: 'inline-radio', options: ['unified', 'split'], description: 'Initial view when uncontrolled.' },
    viewToggle: { control: 'boolean', description: 'Renders a Unified/Split switch in the header.' },
    filename: { control: 'text', description: 'New file name, shown mono in the header.' },
    oldFilename: { control: 'text', description: 'Previous file name; when it differs the header shows a rename.' },
    language: { control: 'text', description: 'Language hint shown as a tag in the header.' },
    context: { control: { type: 'number', min: 0 }, description: 'Unchanged lines kept around each change; longer runs collapse.' },
    wordDiff: { control: 'boolean', description: 'Highlights changed words inside paired lines.' },
    lineNumbers: { control: 'boolean', description: 'Shows old/new line numbers.' },
    stats: { control: 'boolean', description: 'Shows the +added −removed counter.' },
    wrap: { control: 'boolean', description: 'Wraps long lines instead of scrolling. Defaults to true in split view.' },
    actions: { control: false, description: 'Extra header content placed at the end.' },
    label: { control: 'text', description: 'Accessible name of the scrollable region. Defaults to the filename.' },
    expandLabel: { control: false, description: 'Text of the expander row.' },
    emptyMessage: { control: 'text', description: 'Shown when both texts are identical.' },
    onViewChange: { control: false },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    oldValue: OLD_CONFIG,
    newValue: NEW_CONFIG,
    filename: 'nginx/example.conf',
    language: 'nginx',
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiffViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unified view: removals above additions, unchanged runs collapsed around the changes. */
export const Default: Story = {};

/** Split view: old on the left, new on the right. Long lines wrap by default. */
export const Split: Story = {
  args: { defaultView: 'split' },
};

/** The header switch lets the reader pick the view. */
export const WithViewToggle: Story = {
  name: 'With view toggle',
  args: { viewToggle: true },
};

/** Controlled view, e.g. remembered per user. */
export const Controlled: Story = {
  render: (args) => {
    const [view, setView] = useState<DiffView>('split');
    return <DiffViewer {...args} view={view} onViewChange={setView} viewToggle />;
  },
};

/** Plain-text comparison: no filename, no line numbers — e.g. a policy or template change. */
export const PlainText: Story = {
  args: {
    oldValue: OLD_POLICY,
    newValue: NEW_POLICY,
    filename: undefined,
    language: undefined,
    lineNumbers: false,
    wrap: true,
    label: 'Backup policy changes',
  },
};

/** Renamed file: the header shows old → new. */
export const Renamed: Story = {
  args: { oldFilename: 'nginx/default.conf', filename: 'nginx/example.conf' },
};

/** `context={Infinity}` shows every line, nothing collapses. */
export const FullFile: Story = {
  name: 'Full file',
  args: { context: Infinity },
};

/** With extra header actions. */
export const WithActions: Story = {
  name: 'With actions',
  args: {
    actions: (
      <Button size="sm" appearance="tonal">
        Apply changes
      </Button>
    ),
  },
};

/** Long lines scroll horizontally in unified view (or set `wrap`). Height is capped by the caller. */
export const LongLinesAndHeight: Story = {
  name: 'Long lines, capped height',
  args: {
    className: 'max-h-80',
    filename: '.env',
    language: undefined,
    oldValue: `APP_URL=https://example.com\nDATABASE_URL=postgres://app:secret@db.internal:5432/app?sslmode=disable&application_name=web&connect_timeout=10\nCACHE_TTL=300\n`,
    newValue: `APP_URL=https://example.com\nDATABASE_URL=postgres://app:secret@db.internal:5432/app?sslmode=require&application_name=web&connect_timeout=5\nCACHE_TTL=600\nQUEUE=redis\n`,
  },
};

/** Identical texts show the empty message. */
export const NoChanges: Story = {
  name: 'No changes',
  args: { newValue: OLD_CONFIG },
};
