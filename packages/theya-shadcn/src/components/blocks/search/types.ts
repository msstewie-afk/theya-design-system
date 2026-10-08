/** Shared shapes for the Search patterns (a cloud platform's global search in the demos). */
export type SearchType = 'domain' | 'database' | 'project' | 'user' | 'setting' | 'article';

export interface SearchItem {
  id: string;
  type: SearchType;
  title: string;
  /** Where it lives — the parent team, section or path. */
  context?: string;
  /** A line of body text (help articles, settings descriptions). */
  snippet?: string;
  /** Short trailing fact: status, size, last change. */
  meta?: string;
  href: string;
}
