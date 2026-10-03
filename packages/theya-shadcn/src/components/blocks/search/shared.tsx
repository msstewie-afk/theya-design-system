import { Database, Globe, HelpCircle, Mail, Settings, User } from 'iconoir-react';
import { cn } from '@/lib/utils';
import type { SearchItem, SearchType } from './types';

export const TYPE_META: Record<SearchType, { one: string; many: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
  domain: { one: 'domain', many: 'Domains', icon: Globe },
  database: { one: 'database', many: 'Databases', icon: Database },
  mailbox: { one: 'mailbox', many: 'Mailboxes', icon: Mail },
  user: { one: 'user', many: 'Users', icon: User },
  setting: { one: 'setting', many: 'Settings', icon: Settings },
  article: { one: 'help article', many: 'Help articles', icon: HelpCircle },
};

/** Fixed order for groups and scopes: things you own first, then settings, then help. */
export const TYPE_ORDER: SearchType[] = ['domain', 'database', 'mailbox', 'user', 'setting', 'article'];

export function terms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

const fields = (i: SearchItem) => [i.title, i.context ?? '', i.snippet ?? ''].join(' ').toLowerCase();

/**
 * Every term must appear somewhere (AND). Ranked: title starts with the
 * query, then title contains every term, then the rest — so the thing
 * whose name you typed comes first, not the article that mentions it.
 */
export function search(items: SearchItem[], query: string): SearchItem[] {
  const t = terms(query);
  if (!t.length) return [];
  const score = (i: SearchItem) => {
    const title = i.title.toLowerCase();
    if (title.startsWith(query.trim().toLowerCase())) return 0;
    if (t.every((w) => title.includes(w))) return 1;
    return 2;
  };
  return items
    .filter((i) => t.every((w) => fields(i).includes(w)))
    .map((i, idx) => ({ i, s: score(i), idx }))
    .sort((a, b) => a.s - b.s || a.idx - b.idx)
    .map(({ i }) => i);
}

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Closest spelling built from the words in the index, or null when nothing is close (≤ 2 edits per word). */
export function suggestSpelling(items: SearchItem[], query: string): string | null {
  const vocab = [...new Set(items.flatMap((i) => terms(fields(i).replace(/[^\p{L}\p{N}\s.-]/gu, ' '))))];
  let changed = false;
  const fixed = terms(query).map((w) => {
    if (vocab.includes(w)) return w;
    let best: string | null = null;
    let bestD = 3;
    for (const v of vocab) {
      if (Math.abs(v.length - w.length) > 2) continue;
      const dd = distance(w, v);
      if (dd < bestD) {
        bestD = dd;
        best = v;
      }
    }
    if (best) changed = true;
    return best ?? w;
  });
  const result = fixed.join(' ');
  return changed && search(items, result).length ? result : null;
}

/** Marks every occurrence of the query terms (results: what matched). */
export function Highlight({ text, query, className }: { text: string; query: string; className?: string }) {
  const t = terms(query).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!t.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${t.join('|')})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <mark key={i} className={cn('bg-transparent font-semibold text-[var(--color-text-text)]', className)}>
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** The type's glyph in a small neutral tile. Decorative — the type is also said in text. */
export function TypeIcon({ type, className }: { type: SearchType; className?: string }) {
  const Glyph = TYPE_META[type].icon;
  return (
    <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)] [&_svg]:size-4', className)}>
      <Glyph />
    </span>
  );
}
