import { Bug, Cloud, CloudSync, Code, Flash, Language, Mail, Search, Shield, StatsUpSquare } from 'iconoir-react';
import { cn } from '@/lib/utils';
import type { CatalogIconKey } from './types';

const ICONS: Record<CatalogIconKey, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  shield: Shield,
  backup: CloudSync,
  search: Search,
  speed: Flash,
  mail: Mail,
  code: Code,
  stats: StatsUpSquare,
  language: Language,
  bug: Bug,
  cloud: Cloud,
};

/** The extension's tile: a tinted square with its glyph. Decorative — the name carries the meaning. */
export function ItemIcon({ icon, size = 'md', className }: { icon: CatalogIconKey; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Glyph = ICONS[icon];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-icon-icon-primary)]',
        size === 'sm' && 'size-8 rounded-[var(--size-border-radius-border-radius-lg)] [&_svg]:size-4',
        size === 'md' && 'size-10 rounded-[var(--size-border-radius-border-radius-xl)] [&_svg]:size-5',
        size === 'lg' && 'size-16 rounded-[var(--size-border-radius-border-radius-3xl)] [&_svg]:size-8',
        className,
      )}
    >
      <Glyph />
    </span>
  );
}
