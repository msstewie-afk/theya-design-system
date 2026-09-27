import { useState, useMemo, useId, type FormEvent, type ReactNode } from 'react';
import { UserPlus, Trash, Send, SendMail, Mail } from 'iconoir-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { undoToast } from '@/components/ui/undo-toast';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

/**
 * A reusable team/members management screen. Owns: an invite-by-
 * email row (email + role Select), a members Table with a per-row
 * role Select and a Remove behind a ConfirmDialog + undo-toast, and a
 * pending-invites section (resend/revoke, with an empty state).
 *
 * Both confirms are click-confirms, not typed confirms: each
 * destructive action is reversible via its undo toast.
 *
 * Roles are never color-alone (a Badge + text label). Every prop is
 * optional and defaults to a realistic, populated team, so
 * `<TeamMembers/>` renders standalone.
 */
export interface TeamRoleOption {
  value: string;
  label: string;
  description?: string;
  badge?: BadgeVariant;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Minutes since last active; null/undefined = never. */
  lastActiveMins?: number | null;
  initials?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  invitedAgo?: string;
}

const DEFAULT_ROLES: TeamRoleOption[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to settings and billing', badge: 'primary' },
  { value: 'member', label: 'Member', description: 'Manage sites and deployments', badge: 'neutral' },
  { value: 'billing', label: 'Billing', description: 'View invoices and usage only', badge: 'info' },
];

/** The account owner — a fixed role, not an assignable option. */
const OWNER_ROLE: TeamRoleOption = { value: 'owner', label: 'Owner', badge: 'primary' };

const SEEDED_MEMBERS: TeamMember[] = [
  { id: 'u-1', name: 'Alex Morgan', email: 'alex@seashell.dev', role: 'owner', lastActiveMins: 4 },
  { id: 'u-2', name: 'Jordan Kim', email: 'jordan@seashell.dev', role: 'admin', lastActiveMins: 90 },
  { id: 'u-3', name: 'Priya Nair', email: 'priya@seashell.dev', role: 'member', lastActiveMins: 60 * 26 },
  { id: 'u-4', name: 'Sam Okoro', email: 'sam@seashell.dev', role: 'billing', lastActiveMins: 60 * 24 * 5 },
];

const SEEDED_INVITES: TeamInvite[] = [
  { id: 'inv-1', email: 'dana@contractor.dev', role: 'member', invitedAgo: '2d ago' },
  { id: 'inv-2', email: 'lee@seashell.dev', role: 'admin', invitedAgo: '5h ago' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatAgo(mins: number | null | undefined): string {
  if (mins == null) return 'Never';
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export interface TeamMembersProps {
  title?: string;
  description?: ReactNode;
  members?: TeamMember[];
  invites?: TeamInvite[];
  roles?: TeamRoleOption[];
  /** Id of the signed-in member: its row shows "You" and locks role + removal. */
  currentUserId?: string;
  onInvite?: (email: string, role: string) => void;
  onChangeRole?: (member: TeamMember, role: string) => void;
  onRemoveMember?: (member: TeamMember) => void;
  onResendInvite?: (invite: TeamInvite) => void;
  onRevokeInvite?: (invite: TeamInvite) => void;
}

export function TeamMembers({
  title = 'Team members',
  description = 'Invite teammates and manage their access to this account.',
  members: membersProp,
  invites: invitesProp,
  roles = DEFAULT_ROLES,
  currentUserId = 'u-1',
  onInvite,
  onChangeRole,
  onRemoveMember,
  onResendInvite,
  onRevokeInvite,
}: TeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>(membersProp ?? SEEDED_MEMBERS);
  const [invites, setInvites] = useState<TeamInvite[]>(invitesProp ?? SEEDED_INVITES);

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(roles[0]?.value ?? 'member');
  const [touched, setTouched] = useState(false);
  const emailId = useId();
  const emailErrId = useId();
  const inviteRoleId = useId();

  const roleMap = useMemo(() => {
    const map = new Map<string, TeamRoleOption>();
    for (const r of [OWNER_ROLE, ...roles]) map.set(r.value, r);
    return map;
  }, [roles]);
  const roleOf = (value: string): TeamRoleOption => roleMap.get(value) ?? { value, label: value, badge: 'neutral' };

  const trimmedEmail = email.trim();
  const emailValid = EMAIL_RE.test(trimmedEmail);
  const showEmailError = touched && trimmedEmail.length > 0 && !emailValid;

  function sendInvite(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return;
    const invite: TeamInvite = { id: `inv-${Date.now()}`, email: trimmedEmail, role: inviteRole, invitedAgo: 'Just now' };
    setInvites((prev) => [invite, ...prev]);
    onInvite?.(trimmedEmail, inviteRole);
    toast.success('Invite sent', { description: `${trimmedEmail} · ${roleOf(inviteRole).label}` });
    setEmail('');
    setTouched(false);
  }

  function changeRole(member: TeamMember, role: string) {
    if (role === member.role) return;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    onChangeRole?.({ ...member, role }, role);
    toast('Role updated', { description: `${member.name} is now ${roleOf(role).label}` });
  }

  function removeMember(member: TeamMember) {
    const index = members.findIndex((m) => m.id === member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    onRemoveMember?.(member);
    undoToast({
      title: 'Member removed',
      description: `${member.name} no longer has access`,
      icon: <Trash width={16} height={16} />,
      onUndo: () =>
        setMembers((prev) => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, member);
          return next;
        }),
    });
  }

  function revokeInvite(invite: TeamInvite) {
    const index = invites.findIndex((i) => i.id === invite.id);
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    onRevokeInvite?.(invite);
    undoToast({
      title: 'Invite revoked',
      description: invite.email,
      icon: <Trash width={16} height={16} />,
      onUndo: () =>
        setInvites((prev) => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, invite);
          return next;
        }),
    });
  }

  function resendInvite(invite: TeamInvite) {
    onResendInvite?.(invite);
    setInvites((prev) => prev.map((i) => (i.id === invite.id ? { ...i, invitedAgo: 'Just now' } : i)));
    toast.success('Invite resent', { description: invite.email });
  }

  return (
    <section className="flex flex-col gap-8">
      {(title || description) && (
        <header className="min-w-0">
          {title && <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h2>}
          {description && <p className="mt-1 max-w-2xl font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </header>
      )}

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Invite a teammate</h3>
          <CardDescription>They will get an email invitation to join this account.</CardDescription>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={sendInvite} noValidate>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Label htmlFor={emailId}>Email address</Label>
              <TextField
                id={emailId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="teammate@seashell.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showEmailError || undefined}
                aria-describedby={showEmailError ? emailErrId : undefined}
                widthSize="full"
              />
              {showEmailError && (
                <p id={emailErrId} role="alert" className="font-body text-body-s font-medium text-[var(--color-text-text-danger)]">
                  Enter a valid email address.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:w-44">
              <Label htmlFor={inviteRoleId}>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id={inviteRoleId} widthSize="full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <Button type="filled" tone="primary" className="max-sm:w-full" leftIcon={<UserPlus />}>
            Send invite
          </Button>
        </form>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Members</h3>
          <CardDescription>
            <span className="tabular-nums">{members.length}</span> {members.length === 1 ? 'person has' : 'people have'} access to this account.
          </CardDescription>
        </div>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Last active</TableHead>
                <TableHead className="w-44">Role</TableHead>
                <TableHead className="w-11">
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isYou = member.id === currentUserId;
                const isOwner = member.role === 'owner';
                const locked = isYou || isOwner;
                const role = roleOf(member.role);
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback>{member.initials ?? initials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{member.name}</span>
                            {isYou && <Badge variant="neutral">You</Badge>}
                          </div>
                          <span className="truncate text-body-s text-[var(--color-text-text-subtler)]">{member.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-[var(--color-text-text-subtler)] sm:table-cell">{formatAgo(member.lastActiveMins)}</TableCell>
                    <TableCell>
                      {isOwner ? (
                        <Badge variant={role.badge}>{role.label}</Badge>
                      ) : (
                        <Select value={member.role} onValueChange={(value) => changeRole(member, value)} disabled={locked}>
                          <SelectTrigger widthSize="full" aria-label={`Role for ${member.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {!locked && (
                        <ConfirmDialog
                          title={`Remove ${member.name}?`}
                          description="They will immediately lose access to this account. You can undo this for a short time after."
                          confirmLabel="Remove"
                          confirmIcon={<Trash width={16} height={16} />}
                          trigger={
                            <Button type="ghost" tone="danger" iconOnly size="md" aria-label={`Remove ${member.name}`} leftIcon={<Trash />} />
                          }
                          onConfirm={() => removeMember(member)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Pending invites</h3>
          <CardDescription>Invitations that haven't been accepted yet.</CardDescription>
        </div>
        {invites.length === 0 ? (
          <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
            <EmptyState icon={<Mail />} title="No pending invites" titleAs="h4" description="Everyone you've invited has already joined." />
          </div>
        ) : (
            <ul role="list" className="flex flex-col divide-y divide-[var(--color-border-border-subtle)]">
              {invites.map((invite) => {
                const role = roleOf(invite.role);
                return (
                  <li key={invite.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)]">
                        <SendMail className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium">{invite.email}</span>
                          <Badge variant={role.badge}>{role.label}</Badge>
                        </div>
                        <span className="flex items-center gap-1.5 font-body text-body-xs text-[var(--color-text-text-subtler)]">
                          <StatusDot tone="warning" />
                          Invited {invite.invitedAgo ?? 'recently'}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
                      <Button type="ghost" size="md" className="max-sm:flex-1" onClick={() => resendInvite(invite)} leftIcon={<Send />}>
                        Resend
                      </Button>
                      <ConfirmDialog
                        title="Revoke this invite?"
                        description={`${invite.email} will no longer be able to accept this invitation.`}
                        confirmLabel="Revoke"
                        confirmIcon={<Trash width={16} height={16} />}
                        trigger={
                          <Button type="ghost" tone="danger" size="md" className="max-sm:flex-1">
                            Revoke
                          </Button>
                        }
                        onConfirm={() => revokeInvite(invite)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
        )}
      </div>
    </section>
  );
}
