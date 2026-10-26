/**
 * Design System / Changelog: what changed, read from the same files a
 * release uses, so the page can't drift from them.
 * - Unreleased: every changeset waiting in .changeset/ (frontmatter =
 *   packages and bump level, body = the entry). An entry that says
 *   **Breaking** anywhere is listed first.
 * - Released: packages/<pkg>/CHANGELOG.md, written by `changeset version`.
 *
 * The files are bundled at build time (?raw). The renderer below covers the
 * Markdown these files use: headings, paragraphs, nested "-" lists, tables,
 * `code`, **bold** and [links](…). Not a general Markdown parser.
 */
import { Fragment, useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { Badge, type BadgeTone } from '../components/ui/badge';
import { Prose } from '../components/ui/prose';
import { TextField } from '../components/ui/text-field';
import { DocsPage, DocsSection, DocsSubheading, TEXT } from '../stories/docs-page';
import shadcnChangelog from '../../CHANGELOG.md?raw';
import tokensChangelog from '../../../tokens/CHANGELOG.md?raw';

const CHANGESET_FILES = import.meta.glob<string>('../../../../.changeset/*.md', { query: '?raw', import: 'default', eager: true });

type Level = 'major' | 'minor' | 'patch';
const LEVEL_RANK: Record<Level, number> = { major: 0, minor: 1, patch: 2 };

interface Changeset {
  id: string;
  packages: { name: string; level: Level }[];
  body: string;
  breaking: boolean;
  level: Level;
}

export function parseChangeset(id: string, raw: string): Changeset | null {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const packages = m[1]
    .split('\n')
    .map((line) => /^\s*['"]?([^'":]+)['"]?\s*:\s*(major|minor|patch)\s*$/.exec(line))
    .filter((x): x is RegExpExecArray => !!x)
    .map(([, name, level]) => ({ name, level: level as Level }));
  const body = m[2].trim();
  if (!packages.length || !body) return null;
  const level = packages.map((p) => p.level).sort((a, b) => LEVEL_RANK[a] - LEVEL_RANK[b])[0];
  return { id, packages, body, breaking: /\*\*breaking/i.test(body) || level === 'major', level };
}

const CHANGESETS: Changeset[] = Object.entries(CHANGESET_FILES)
  .filter(([path]) => !/\/README\.md$/i.test(path))
  .map(([path, raw]) => parseChangeset(path.split('/').pop()!.replace(/\.md$/, ''), raw))
  .filter((c): c is Changeset => !!c)
  .sort((a, b) => a.id.localeCompare(b.id));

/** "# @theya/shadcn\n\n## 0.1.0\n…" → [{ version, body }] */
export function parseChangelog(raw: string) {
  return raw
    .replace(/\r\n/g, '\n')
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [version, ...rest] = chunk.split('\n');
      return { version: version.trim(), body: rest.join('\n').trim() };
    });
}

const RELEASED = [
  { name: '@theya/shadcn', versions: parseChangelog(shadcnChangelog) },
  { name: '@theya/tokens', versions: parseChangelog(tokensChangelog) },
];

// ---- Markdown subset -------------------------------------------------------

function inline(text: string, key = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined) out.push(<code key={k}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={k}>{inline(m[2], k)}</strong>);
    else out.push(<a key={k} href={m[4]} target="_blank" rel="noreferrer">{inline(m[3], k)}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

interface ListItem { text: string; children: ListItem[] }

function parseList(lines: string[]): ListItem[] {
  const root: ListItem[] = [];
  const stack: { indent: number; items: ListItem[] }[] = [{ indent: -1, items: root }];
  for (const line of lines) {
    const m = /^(\s*)[-*] (.*)$/.exec(line);
    if (!m) {
      // A continuation line belongs to the last item.
      const items = stack[stack.length - 1].items;
      if (items.length) items[items.length - 1].text += ` ${line.trim()}`;
      continue;
    }
    const indent = m[1].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1];
    const item: ListItem = { text: m[2], children: [] };
    parent.items.push(item);
    stack.push({ indent, items: item.children });
  }
  return root;
}

function List({ items, k }: { items: ListItem[]; k: string }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          {inline(item.text, `${k}-${i}`)}
          {item.children.length > 0 && <List items={item.children} k={`${k}-${i}`} />}
        </li>
      ))}
    </ul>
  );
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function Markdown({ source, headingOffset = 0 }: { source: string; headingOffset?: number }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const k = `b${i}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    if (heading) {
      const level = Math.min(6, heading[1].length + headingOffset);
      const Tag = `h${level}` as 'h2';
      blocks.push(<Tag key={k}>{inline(heading[2], k)}</Tag>);
      i++;
      continue;
    }
    if (/^\s*[-*] /.test(line)) {
      const start = i;
      while (i < lines.length && lines[i].trim() && (/^\s*[-*] /.test(lines[i]) || /^\s+\S/.test(lines[i]))) i++;
      blocks.push(<List key={k} items={parseList(lines.slice(start, i))} k={k} />);
      continue;
    }
    if (/^\s*\|/.test(line)) {
      const start = i;
      while (i < lines.length && /^\s*\|/.test(lines[i])) i++;
      const rows = lines.slice(start, i).filter((r) => !/^\s*\|[\s|:-]+\|\s*$/.test(r)).map(cells);
      const [head, ...body] = rows;
      blocks.push(
        <table key={k}>
          <thead>
            <tr>{head.map((c, j) => <th key={j}>{inline(c, `${k}-h${j}`)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `${k}-${ri}-${j}`)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }
    const start = i;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6} |\s*[-*] |\s*\|)/.test(lines[i])) i++;
    blocks.push(<p key={k}>{inline(lines.slice(start, i).join(' '), k)}</p>);
  }
  return <>{blocks}</>;
}

// ---- Page ------------------------------------------------------------------

const SHORT = (name: string) => name.replace(/^@theya\//, '');
const LEVEL_TONE: Record<Level, BadgeTone> = { major: 'danger', minor: 'primary', patch: 'neutral' };

function Entry({ entry }: { entry: Changeset }) {
  return (
    <article className="flex flex-col gap-2 border-t border-[var(--color-border-border-subtler)] py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap gap-2">
        {entry.packages.map((p) => (
          <Badge key={p.name} tone={entry.breaking && p.level !== 'patch' ? 'danger' : LEVEL_TONE[p.level]}>
            {SHORT(p.name)} · {p.level}
          </Badge>
        ))}
      </div>
      <Prose size="sm">
        <Markdown source={entry.body} />
      </Prose>
    </article>
  );
}

const GROUPS: { title: string; test: (c: Changeset) => boolean }[] = [
  { title: 'Breaking changes', test: (c) => c.breaking },
  { title: 'Minor changes', test: (c) => !c.breaking && c.level === 'minor' },
  { title: 'Patch changes', test: (c) => !c.breaking && c.level === 'patch' },
];

export function ChangelogPage() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const unreleased = useMemo(
    () => (deferred ? CHANGESETS.filter((c) => c.body.toLowerCase().includes(deferred) || c.packages.some((p) => p.name.includes(deferred))) : CHANGESETS),
    [deferred],
  );

  return (
    <DocsPage
      title="Changelog"
      description="What changed in @theya/shadcn and @theya/tokens. Unreleased changes are waiting for the next version; each line is written for the person upgrading."
    >
      <TextField
        label="Filter changes"
        placeholder="Button, dark, red-600"
        description="Searches the unreleased changes."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        widthSize="md"
      />

      <DocsSection title="Unreleased" description={`${unreleased.length} of ${CHANGESETS.length} changes${deferred ? ` match “${query.trim()}”` : ''}.`}>
        <div aria-live="polite" className="sr-only">
          {deferred ? `${unreleased.length} changes match` : ''}
        </div>
        {unreleased.length === 0 && <p className={TEXT}>Nothing matches. Try a component or token name.</p>}
        {GROUPS.map(({ title, test }) => {
          const items = unreleased.filter(test);
          if (!items.length) return null;
          return (
            <Fragment key={title}>
              <DocsSubheading>
                {title} ({items.length})
              </DocsSubheading>
              <div className="flex flex-col">
                {items.map((entry) => (
                  <Entry key={entry.id} entry={entry} />
                ))}
              </div>
            </Fragment>
          );
        })}
      </DocsSection>

      {RELEASED.map(({ name, versions }) => (
        <DocsSection key={name} title={name}>
          {versions.map(({ version, body }) => (
            <Fragment key={version}>
              <DocsSubheading>{version}</DocsSubheading>
              <Prose size="sm">
                <Markdown source={body} headingOffset={1} />
              </Prose>
            </Fragment>
          ))}
        </DocsSection>
      ))}
    </DocsPage>
  );
}
