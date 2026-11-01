/** Shared shapes for the Catalog patterns (a shop of photo products in the demos). */
export type CatalogIconKey =
  | 'shield'
  | 'backup'
  | 'search'
  | 'speed'
  | 'mail'
  | 'code'
  | 'stats'
  | 'language'
  | 'bug'
  | 'cloud'
  | 'preset'
  | 'addon'
  | 'book'
  | 'print'
  | 'studio'
  | 'lens';

export interface CatalogItem {
  id: string;
  name: string;
  vendor: string;
  category: string;
  icon: CatalogIconKey;
  /** One line under the name. */
  summary: string;
  /** 0–5, one decimal. */
  rating: number;
  reviewCount: number;
  installs: number;
  /** Per month; 0 = free. */
  price: number;
  /** What it works with: editing apps, camera mounts or plans. */
  compatibility: string[];
  /** Added to the catalog, ISO date — for "Newest" sorting. */
  added: string;
}
