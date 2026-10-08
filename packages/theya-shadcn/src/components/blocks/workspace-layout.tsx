'use client';

import { useState, useEffect, Fragment } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { Bell, Lifebelt, Dashboard, Globe, Database, ShieldCheck, CreditCard, Group, Settings } from 'iconoir-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarBrand, SidebarCollapse, SidebarNav, SidebarSection, SidebarItem, SidebarFooter } from '../ui/sidebar';
import { Topbar, TopbarMenu, TopbarSearch, TopbarSpacer, TopbarAction } from '../ui/topbar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ThemeToggle } from '../ui/theme-toggle';

/**
 * A product-agnostic application shell: a collapsible Sidebar rail +
 * a sticky Topbar wrapped around a content slot, plus the automatic
 * mobile slide-over rail (below md). Nav, brand, breadcrumbs, actions
 * and the signed-in user are all props. The initial active state is
 * passed in (`item.active`) and selecting an item updates it locally,
 * so JS-driven panels stay in sync while the block stays decoupled
 * from any router. Includes a WCAG 2.4.1 skip link, names both nav
 * landmarks, and keeps a long identifier crumb from scrolling the
 * page at 360px. Renders standalone with a seeded product nav.
 *
 *   <WorkspaceLayout brand="Theya Seashell" nav={nav} breadcrumbs={crumbs} onSearch={openPalette}>
 *     <YourPage />
 *   </WorkspaceLayout>
 */
export interface WorkspaceLayoutNavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  /** A small count/pill after the label. Pair with an sr-only unit when the meaning isn't obvious from the label. */
  badge?: ReactNode;
  active?: boolean;
  onSelect?: () => void;
}

export interface WorkspaceLayoutNavGroup {
  label?: string;
  items: WorkspaceLayoutNavItem[];
}

export interface WorkspaceLayoutCrumb {
  label: string;
  href?: string;
}

export interface WorkspaceLayoutProps {
  brand?: ReactNode;
  nav?: WorkspaceLayoutNavGroup[];
  /** Topbar breadcrumb trail; the last crumb is the current page. */
  breadcrumbs?: WorkspaceLayoutCrumb[];
  showBreadcrumbs?: boolean;
  /** Extra topbar actions rendered before Notifications/Help/theme controls. */
  actions?: ReactNode;
  user?: { name: string; org?: string; initials?: string };
  searchPlaceholder?: string;
  /** Wire the topbar search to a command palette (⌘K). */
  /** Shows the Notifications button and fires when it's pressed. Omitted -> no button (it used to render with no way to handle it). */
  onOpenNotifications?: () => void;
  /** Red dot + "unread" in the button's name. Default false — it used to be hardcoded on, so it always claimed unread. */
  unreadNotifications?: boolean;
  /** Shows the Help button and fires when it's pressed. */
  onOpenHelp?: () => void;
  onSearch?: () => void;
  defaultCollapsed?: boolean;
  children: ReactNode;
}

const DEFAULT_NAV: WorkspaceLayoutNavGroup[] = [
  {
    label: 'Manage',
    items: [
      { label: 'Dashboard', href: '#', icon: <Dashboard />, active: true },
      {
        label: 'Sites',
        href: '#',
        icon: <Globe />,
        badge: (
          <>
            12<span className="sr-only"> sites</span>
          </>
        ),
      },
      { label: 'Databases', href: '#', icon: <Database /> },
      { label: 'Certificates', href: '#', icon: <ShieldCheck /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Billing', href: '#', icon: <CreditCard /> },
      { label: 'Team', href: '#', icon: <Group /> },
      { label: 'Settings', href: '#', icon: <Settings /> },
    ],
  },
];

const DEFAULT_BREADCRUMBS: WorkspaceLayoutCrumb[] = [{ label: 'Dashboard' }];

const DEFAULT_USER = { name: 'Alex Morgan', org: 'Theya Seashell', initials: 'AM' };

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function WorkspaceLayout({
  brand = 'Theya',
  nav = DEFAULT_NAV,
  breadcrumbs = DEFAULT_BREADCRUMBS,
  showBreadcrumbs = true,
  actions,
  user = DEFAULT_USER,
  searchPlaceholder = 'Search...',
  onSearch,
  onOpenNotifications,
  unreadNotifications = false,
  onOpenHelp,
  defaultCollapsed,
  children,
}: WorkspaceLayoutProps) {
  const userInitials = user.initials ?? initialsFor(user.name);
  const propActiveKey = nav.flatMap((group, gi) => group.items.map((item, ii) => ({ item, key: `${gi}-${ii}` }))).find(({ item }) => item.active)?.key;
  const [selectedNavKey, setSelectedNavKey] = useState(propActiveKey);

  useEffect(() => {
    setSelectedNavKey(propActiveKey);
  }, [propActiveKey]);

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <a href="#main-content"
        className="sr-only rounded-[var(--size-border-radius-border-radius-md)] focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-tooltip focus:border focus:border-solid focus:border-[var(--color-border-border)] focus:bg-[var(--color-bg-surface-bg-surface)] focus:px-3 focus:py-2 focus:font-body focus:text-body-s focus:font-medium focus:text-[var(--color-text-text)] focus:shadow-elevation-md focus:outline-none focus:focus-ring"
      >
        Skip to main content
      </a>
      <div className="grid min-h-svh grid-cols-[1fr] md:grid-cols-[var(--rail-w)_1fr]">
        <Sidebar>
          <SidebarHeader>
            <SidebarBrand>{brand}</SidebarBrand>
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarNav>
            {nav.map((group, gi) => (
              <SidebarSection key={group.label ?? `group-${gi}`} label={group.label}>
                {group.items.map((item, ii) => {
                  const itemKey = `${gi}-${ii}`;
                  return (
                    <SidebarItem
                      key={itemKey}
                      href={item.href}
                      icon={item.icon}
                      badge={item.badge}
                      active={selectedNavKey === itemKey}
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        if (selectedNavKey === itemKey) {
                          e.preventDefault();
                          return;
                        }
                        if (item.onSelect && (!item.href || item.href === '#')) {
                          e.preventDefault();
                        }
                        setSelectedNavKey(itemKey);
                        item.onSelect?.();
                      }}
                    >
                      {item.label}
                    </SidebarItem>
                  );
                })}
              </SidebarSection>
            ))}
          </SidebarNav>
          <SidebarFooter>
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-7">
                <AvatarFallback className="text-body-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate font-body text-body-s font-medium text-[var(--color-text-text)]">{user.name}</div>
                {user.org && <div className="truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">{user.org}</div>}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-col">
          <Topbar>
            <TopbarMenu />
            {showBreadcrumbs && breadcrumbs.length > 1 && (
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  {breadcrumbs.map((c, i) => {
                    const last = i === breadcrumbs.length - 1;
                    return (
                      <Fragment key={`${c.label}-${i}`}>
                        <BreadcrumbItem className="min-w-0">
                          {last || !c.href ? (
                            <BreadcrumbPage className="max-w-[40vw] truncate">{c.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <a href={c.href}>{c.label}</a>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!last && <BreadcrumbSeparator />}
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            <TopbarSearch onClick={onSearch} placeholder={searchPlaceholder} />
            <TopbarSpacer />
            {actions}
            {onOpenNotifications && (
              <TopbarAction badge={unreadNotifications} aria-label="Notifications" onClick={onOpenNotifications}>
                <Bell />
              </TopbarAction>
            )}
            {onOpenHelp && (
              <TopbarAction aria-label="Help" onClick={onOpenHelp}>
                <Lifebelt />
              </TopbarAction>
            )}
            <ThemeToggle />
          </Topbar>

          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
