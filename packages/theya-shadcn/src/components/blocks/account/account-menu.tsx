import { useId } from 'react';
import type { ReactNode } from 'react';
import { Bell, CreditCard, HelpCircle, LogOut, NavArrowDown, Shield, User, ViewGrid } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrailing,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface AccountUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AccountWorkspace {
  id: string;
  name: string;
  role: string;
}

export interface AccountMenuLink {
  label: string;
  href: string;
  icon?: ReactNode;
  /** A count of things that need attention there. */
  count?: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AccountMenuProps {
  user: AccountUser;
  workspaces?: AccountWorkspace[];
  workspaceId?: string;
  onWorkspaceChange?: (id: string) => void;
  links?: AccountMenuLink[];
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void;
  helpHref?: string;
  onSignOut?: () => void;
  /** Hide the name next to the avatar (narrow top bars). */
  compact?: boolean;
  className?: string;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const DEFAULT_ACCOUNT_LINKS: AccountMenuLink[] = [
  { label: 'Account overview', href: '#account', icon: <ViewGrid /> },
  { label: 'Profile', href: '#profile', icon: <User /> },
  { label: 'Billing', href: '#billing', icon: <CreditCard /> },
  { label: 'Security', href: '#security', icon: <Shield /> },
  { label: 'Notifications', href: '#notifications', icon: <Bell /> },
];

/**
 * The account entry in the top right. The trigger shows who is signed in
 * (and in which workspace), not just an anonymous icon. The menu opens
 * with that identity, then workspace switching, then every account area
 * by name — including the overview that lists them all — then
 * preferences, help, and sign-out last and on its own, so it's never hit
 * by accident on the way to something else.
 */
export function AccountMenu({
  user,
  workspaces = [],
  workspaceId,
  onWorkspaceChange,
  links = DEFAULT_ACCOUNT_LINKS,
  theme,
  onThemeChange,
  helpHref = '#help',
  onSignOut,
  compact,
  className,
}: AccountMenuProps) {
  const uid = useId();
  const current = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
  const attention = links.reduce((n, l) => n + (l.count ?? 0), 0);
  const avatar = (
    <Avatar size="sm">
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account: ${user.name}${current ? `, ${current.name}` : ''}${attention ? `, ${attention} ${attention === 1 ? 'item needs' : 'items need'} attention` : ''}`}
        className={cn(
          'group relative flex h-fit cursor-pointer items-center gap-2 rounded-[var(--size-border-radius-border-radius-xl)] p-1 pr-2 text-left outline-none',
          'transition-colors duration-standard ease-enter motion-reduce:transition-none',
          'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:focus-ring data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          compact && 'pr-1',
          className,
        )}
      >
        <span className="relative">
          {avatar}
          {attention > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-solid border-[var(--color-bg-surface-bg-surface)] bg-[var(--color-bg-danger-bg-danger-status)]" />}
        </span>
        {!compact && (
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="max-w-40 truncate font-body text-body-s font-medium text-[var(--color-text-text)]">{user.name}</span>
            {current && <span className="max-w-40 truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">{current.name}</span>}
          </span>
        )}
        {!compact && <NavArrowDown aria-hidden="true" className="hidden size-4 text-[var(--color-icon-icon-subtle)] transition-transform duration-standard ease-enter group-data-[state=open]:rotate-180 motion-reduce:transition-none sm:block" />}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {/* Identity: who is signed in. Not a section header, so normal case. */}
        <div className="flex items-center gap-3 px-[var(--size-margin-margin-s)] py-2">
          {avatar}
          <div className="min-w-0">
            <p className="truncate font-body text-body-m font-medium text-[var(--color-text-text)]">{user.name}</p>
            <p className="truncate font-body text-body-s text-[var(--color-text-text-subtler)]">{user.email}</p>
          </div>
        </div>

        {workspaces.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel id={`${uid}-ws`}>Workspace</DropdownMenuLabel>
            <DropdownMenuRadioGroup aria-labelledby={`${uid}-ws`} value={current?.id} onValueChange={onWorkspaceChange}>
              {workspaces.map((w) => (
                <DropdownMenuRadioItem key={w.id} value={w.id}>
                  <span className="min-w-0 flex-1 truncate">{w.name}</span>
                  <span className="shrink-0 text-[var(--color-text-text-subtler)]">{w.role}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {links.map((l) => (
            <DropdownMenuItem key={l.href} asChild>
              <a href={l.href}>
                {l.icon}
                <span className="min-w-0 flex-1">{l.label}</span>
                {l.count ? (
                  <DropdownMenuTrailing>
                    <Badge tone="danger" appearance="filled">
                      {l.count}
                      <span className="sr-only">{l.count === 1 ? ' item needs attention' : ' items need attention'}</span>
                    </Badge>
                  </DropdownMenuTrailing>
                ) : null}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {onThemeChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel id={`${uid}-theme`}>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup aria-labelledby={`${uid}-theme`} value={theme} onValueChange={(v) => onThemeChange(v as ThemePreference)}>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">Same as system</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={helpHref}>
            <HelpCircle />
            Help and support
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
