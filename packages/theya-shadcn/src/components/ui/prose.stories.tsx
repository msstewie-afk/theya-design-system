import type { Meta, StoryObj } from '@storybook/react';
import { Prose } from './prose';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { CodeBlock } from './code-block';
import { proseGuidelines } from './prose.guidelines';

/**
 * Prose — typography for long-form content: help articles, docs,
 * changelogs, legal pages, rendered Markdown/CMS HTML. Plain HTML inside
 * gets Theya's type scale, colors and spacing with no classes on the inner
 * elements. Links are always underlined in running text (color alone
 * doesn't mark a link). Measure is capped at 70ch; `max-w-none` lifts it.
 * Anything that must keep its own look — a Button, Alert, CodeBlock — goes
 * in with `className="not-prose"`.
 */
const meta = {
  title: 'Layout/Prose',
  component: Prose,
  tags: ['autodocs'],
  parameters: { guidelines: proseGuidelines, layout: 'padded' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Base text step: sm body-s (side panels, in-product help), md body-m (docs, articles), lg body-l (editorial). Headings scale with it.',
      table: { category: 'Appearance' },
    },
    asChild: { control: false, description: 'Render onto the child element, e.g. an <article>.' },
    children: { control: false },
  },
  args: { size: 'md' },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every element Prose styles, in one help article. Switch `size` in Controls. */
export const Article: Story = {
  render: (args) => (
    <Prose {...args} asChild>
      <article>
        <h1>Moving a site to a new region</h1>
        <p>
          A region move copies your site, its databases and its certificates to the new location, then switches traffic over once
          everything checks out. Visitors keep being served from the old region until the switch, so there is <strong>no downtime</strong>{' '}
          for a typical site.
        </p>
        <p>
          Before you start, check the <a href="#limits">regional limits</a> and make sure the site has a recent backup. Press{' '}
          <kbd>⌘</kbd> <kbd>K</kbd> and type <code>move region</code> to open the flow from anywhere.
        </p>
        <h2 id="limits">Before you start</h2>
        <ul>
          <li>The target region must support every add-on the site uses.</li>
          <li>
            Custom DNS records stay as they are. If you point an <code>A</code> record straight at an IP address, update it after the move:
            <ul>
              <li>for apex domains, switch to the <code>ALIAS</code> record we provide;</li>
              <li>for subdomains, a <code>CNAME</code> is enough.</li>
            </ul>
          </li>
          <li>Scheduled jobs pause during the copy and resume on their own.</li>
        </ul>
        <h2>Move the site</h2>
        <ol>
          <li>Open the site and go to <strong>Settings → Infrastructure</strong>.</li>
          <li>Choose <strong>Change region</strong> and pick the target from the list.</li>
          <li>Review the summary and start the move. You can close the page — we email you when it finishes.</li>
        </ol>
        <blockquote>
          <p>A move between continents can take a few hours for sites with large media libraries. Most moves finish in under 20 minutes.</p>
        </blockquote>
        <h3>Doing it from the command line</h3>
        <p>The CLI runs the same checks and prints the plan before it changes anything:</p>
        <pre>
          <code>{`seashell sites move shop.seashell.dev \\
  --to eu-central-1 \\
  --dry-run`}</code>
        </pre>
        <h3>What gets copied</h3>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Copied</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Files and media</td>
              <td>Yes</td>
              <td>Incremental — only changes since the first pass are copied at switch time.</td>
            </tr>
            <tr>
              <td>Databases</td>
              <td>Yes</td>
              <td>Writes are held for a few seconds during the final sync.</td>
            </tr>
            <tr>
              <td>Access logs</td>
              <td>No</td>
              <td>Older logs stay readable in the old region for 30 days.</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h4>Still stuck?</h4>
        <p>
          <mark>Moves can be cancelled</mark> until traffic switches over. After that, start a new move back to the original region.{' '}
          <small>Last updated 2 October 2026.</small>
        </p>
      </article>
    </Prose>
  ),
};

/** The three steps side by side — body and every heading level move together. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: () => (
    <div className="grid gap-10 lg:grid-cols-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Prose key={size} size={size}>
          <h2>size=&quot;{size}&quot;</h2>
          <p>
            Certificates renew automatically 30 days before they expire. If a renewal fails, we retry daily and <a href="#">notify the site owners</a>.
          </p>
          <h3>Renewal checks</h3>
          <ul>
            <li>DNS still points at Seashell</li>
            <li>The domain is not on a blocklist</li>
          </ul>
        </Prose>
      ))}
    </div>
  ),
};

/** `size="sm"` in a narrow side panel — in-product help next to a form. */
export const InProductHelp: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <aside className="w-[320px] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] p-4">
      <Prose {...args}>
        <h3>About API key scopes</h3>
        <p>
          A key can only do what its scopes allow. Give each integration the <strong>narrowest</strong> set it needs — you can widen it later without
          creating a new key.
        </p>
        <dl>
          <dt>read:sites</dt>
          <dd>List sites and read their settings.</dd>
          <dt>write:deploys</dt>
          <dd>Start and cancel deploys.</dd>
        </dl>
        <p>
          <a href="#">Read the full scopes reference</a>
        </p>
      </Prose>
    </aside>
  ),
};

/** Legal-style page: nested numbered clauses (1 → a) and long paragraphs. */
export const LegalPage: Story = {
  render: (args) => (
    <Prose {...args}>
      <h1>Acceptable use</h1>
      <p>These terms describe what you may and may not host on Seashell. They apply to every site on your account, including staging sites.</p>
      <h2>1. Prohibited content</h2>
      <ol>
        <li>
          You may not host content that:
          <ol>
            <li>distributes malware or phishing pages;</li>
            <li>sends unsolicited bulk email from our infrastructure;</li>
            <li>infringes someone else’s rights.</li>
          </ol>
        </li>
        <li>We may suspend a site that breaks these rules after notifying the account owner, or immediately when there is an active risk to others.</li>
      </ol>
      <h2>2. Reporting a problem</h2>
      <p>
        Send reports to <a href="mailto:abuse@seashell.dev">abuse@seashell.dev</a>. Include the URL and what you found; we reply within one business day.
      </p>
    </Prose>
  ),
};

/** Theya components inside an article keep their own look with `className="not-prose"` and still get the normal block spacing. */
export const WithComponents: Story = {
  render: (args) => (
    <Prose {...args}>
      <h2>Rotating a leaked key</h2>
      <p>If a key ends up somewhere public, revoke it first and create the replacement second — the order matters.</p>
      <Alert tone="warning" className="not-prose">
        <AlertTitle>Revoking is immediate</AlertTitle>
        <AlertDescription>Every integration using the old key stops working the moment you revoke it.</AlertDescription>
      </Alert>
      <p>Then update the environment variable wherever the key is used:</p>
      <CodeBlock className="not-prose" filename=".env" code={'SEASHELL_API_KEY=sk_demo_replace_me'} />
      <p>When everything is green again, close the incident.</p>
      <div className="not-prose flex gap-2">
        <Button appearance="filled" tone="primary">
          Revoke key
        </Button>
        <Button appearance="outlined" tone="secondary">
          Cancel
        </Button>
      </div>
    </Prose>
  ),
};

const RENDERED_MARKDOWN = `
<h2>Changelog — September</h2>
<p>Highlights from this month's releases. Full notes are in the <a href="#">release history</a>.</p>
<h3>New</h3>
<ul>
  <li><strong>Region moves</strong> without downtime for sites under 50 GB.</li>
  <li>The CLI can now print a plan with <code>--dry-run</code>.</li>
</ul>
<h3>Fixed</h3>
<ul>
  <li>Certificate renewals no longer stall when a CAA record lists a second issuer.</li>
</ul>
`;

/** HTML from a Markdown renderer or CMS, injected as-is. Prose styles it without touching the generated markup. Sanitize untrusted HTML before injecting it. */
export const RenderedMarkdown: Story = {
  render: (args) => <Prose {...args} dangerouslySetInnerHTML={{ __html: RENDERED_MARKDOWN }} />,
};
