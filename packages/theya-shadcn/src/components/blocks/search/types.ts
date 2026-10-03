/** Shared shapes for the Search patterns (a hosting panel's global search in the demos). */
export type SearchType = 'domain' | 'database' | 'mailbox' | 'user' | 'setting' | 'article';

export interface SearchItem {
  id: string;
  type: SearchType;
  title: string;
  /** Where it lives — the parent subscription, section or path. */
  context?: string;
  /** A line of body text (help articles, settings descriptions). */
  snippet?: string;
  /** Short trailing fact: status, size, last change. */
  meta?: string;
  href: string;
}
