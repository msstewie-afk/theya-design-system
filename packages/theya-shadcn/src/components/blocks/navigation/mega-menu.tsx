'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Menu } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../ui/drawer';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../ui/navigation-menu';
import { Link } from '../../ui/link';

export interface MegaLink {
  label: string;
  href: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
}

export interface MegaSection {
  id: string;
  label: string;
  /** "All products" — the section's own landing page. Always offered. */
  overview: { label: string; href: string };
  columns: { title: string; links: MegaLink[] }[];
  /** One highlighted item next to the columns. */
  featured?: { title: string; description: string; href: string; cta: string };
}

export type MegaItem = MegaSection | { id: string; label: string; href: string };

export interface MegaMenuProps {
  items: MegaItem[];
  /** Highlights the section the current page belongs to. */
  currentId?: string;
  /** `auto` switches at the md breakpoint; force one when the app decides itself. */
  layout?: 'auto' | 'bar' | 'drawer';
  className?: string;
}

const isSection = (i: MegaItem): i is MegaSection => 'columns' in i;

/**
 * Each panel is as wide as its content: 12rem per column, 1.5rem gaps,
 * 16rem for a featured card, 1.5rem padding each side. Panels with fewer
 * columns stay narrow instead of stretching to the widest one.
 */
function panelWidth(s: MegaSection): string {
  const cols = Math.min(s.columns.length, 3);
  const rem = Math.min(56, cols * 12 + (cols - 1) * 1.5 + (s.featured ? 16 + 1.5 : 0) + 3);
  return `min(${rem}rem, calc(100vw - 2rem))`;
}

const groupHeading = 'font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]';

/**
 * Site navigation for many destinations. On wide screens each section
 * opens a panel with its sub-areas grouped under headings (with a line of
 * description where names alone are ambiguous), one featured item, and
 * always the section's own "All …" page — so the top level is never a
 * dead end. On narrow screens the same tree becomes a drawer with one
 * expandable section at a time. The section of the current page is
 * marked in both.
 */
export function MegaMenu({ items, currentId, layout = 'auto', className }: MegaMenuProps) {
  const uid = useId();
  return (
    <div className={cn('flex items-center', className)}>
      {/* Wide */}
      <NavigationMenu aria-label="Main" className={cn(layout === 'auto' && 'hidden md:flex', layout === 'drawer' && 'hidden')} delayDuration={150}>
        <NavigationMenuList>
          {items.map((item) =>
            isSection(item) ? (
              <NavigationMenuItem key={item.id} value={item.id}>
                {/* link-on-tonal, not link: the open trigger sits on a tinted fill, where
                    plain link blue drops to 4.4:1 in dark (on-tonal is 7.3:1). */}
                <NavigationMenuTrigger className={cn(item.id === currentId && 'text-[var(--color-text-text-link-on-tonal)]')}>
                  {item.label}
                  {item.id === currentId && <span className="sr-only"> (current section)</span>}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-0 sm:w-auto sm:min-w-0" style={{ width: panelWidth(item) }}>
                  <div className={cn('grid gap-6 p-6', item.featured && 'md:grid-cols-[minmax(0,1fr)_16rem]')}>
                    <div className="grid gap-x-6 gap-y-5" style={{ gridTemplateColumns: `repeat(${Math.min(item.columns.length, 3)}, minmax(0, 1fr))` }}>
                      {item.columns.map((col, ci) => {
                        const hid = `${uid}-${item.id}-${ci}`;
                        return (
                          <div key={col.title} className="flex flex-col gap-2">
                            <h3 id={hid} className={cn(groupHeading, 'px-2.5')}>
                              {col.title}
                            </h3>
                            <ul aria-labelledby={hid} className="flex flex-col">
                              {col.links.map((l) => (
                                <li key={l.href}>
                                  <NavigationMenuLink asChild>
                                    <a href={l.href} className="focus-visible:focus-ring">
                                      <span className="flex items-center gap-2 font-medium">
                                        {l.icon}
                                        {l.label}
                                        {l.badge && <Badge tone="primary">{l.badge}</Badge>}
                                      </span>
                                      {l.description && <span className="font-body text-body-s font-normal leading-snug text-[var(--color-text-text-subtle)]">{l.description}</span>}
                                    </a>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                    {item.featured && (
                      <NavigationMenuLink asChild>
                        <a href={item.featured.href} className="flex h-full flex-col justify-between gap-3 rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-primary-bg-primary-subtle)] p-4 focus-visible:focus-ring">
                          <span className="flex flex-col gap-1">
                            <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{item.featured.title}</span>
                            <span className="font-body text-body-s text-[var(--color-text-text-subtler-on-tonal)]">{item.featured.description}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-body text-body-m font-medium text-[var(--color-text-text-link-on-tonal)]">
                            {item.featured.cta}
                            <ArrowRight aria-hidden="true" className="size-4 text-current! rtl:-scale-x-100" />
                          </span>
                        </a>
                      </NavigationMenuLink>
                    )}
                  </div>
                  <div className="border-t border-solid border-[var(--color-border-border-subtler)] px-6 py-3">
                    <NavigationMenuLink asChild>
                      <Link href={item.overview.href} className="inline-flex flex-row items-center gap-1 p-1.5 font-medium">
                        {item.overview.label}
                        <ArrowRight aria-hidden="true" className="size-4 text-current! rtl:-scale-x-100" />
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.id}>
                <NavigationMenuLink asChild active={item.id === currentId}>
                  <a href={item.href} aria-current={item.id === currentId ? 'page' : undefined} className="h-9 justify-center px-3 py-2 font-medium focus-visible:focus-ring">
                    {item.label}
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ),
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Narrow */}
      <Drawer direction="start">
        <DrawerTrigger asChild>
          <Button appearance="ghost" tone="secondary" size="lg" leftIcon={<Menu />} className={cn(layout === 'auto' && 'md:hidden', layout === 'bar' && 'hidden')}>
            Menu
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav aria-label="Main">
              <Accordion type="single" collapsible defaultValue={currentId}>
                {items.map((item) =>
                  isSection(item) ? (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>
                        {item.label}
                        {item.id === currentId && <span className="sr-only"> (current section)</span>}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                          <Link href={item.overview.href} size="md" className="inline-flex items-center gap-1 self-start font-medium">
                            {item.overview.label}
                            <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                          </Link>
                          {item.columns.map((col) => (
                            <div key={col.title} className="flex flex-col gap-1">
                              <p className={groupHeading}>{col.title}</p>
                              <ul className="flex flex-col">
                                {col.links.map((l) => (
                                  <li key={l.href}>
                                    <a href={l.href} className="flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-md)] py-2 font-body text-body-m text-[var(--color-text-text)] outline-none focus-visible:focus-ring">
                                      {l.label}
                                      {l.badge && <Badge tone="primary">{l.badge}</Badge>}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <a
                      key={item.id}
                      href={item.href}
                      aria-current={item.id === currentId ? 'page' : undefined}
                      className="flex border-b border-solid border-[var(--color-border-border-subtler)] py-4 font-body text-body-m font-medium text-[var(--color-text-text)] outline-none focus-visible:focus-ring"
                    >
                      {item.label}
                    </a>
                  ),
                )}
              </Accordion>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
