import { useEffect, useId, useState } from 'react';
import type { FormEventHandler, FormEvent } from 'react';
import { Key, FloppyDisk, ShieldCheck, Trash, WarningTriangle, ArrowUp, ArrowDown } from 'iconoir-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/components/ui/alert';
import { SecretField } from '@/components/ui/secret-field';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { undoToast } from '@/components/ui/undo-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

/**
 * A sectioned account-settings page composed entirely from shipped
 * primitives. Each section (Profile/Security/Notifications/Danger zone)
 * is plain heading + content — no `Card`, no `Separator` between
 * sections either; this is page-level structure, not a repeated
 * discrete object, so a border- or divider-per-section would just be
 * card soup. A generous `gap-10` between sections carries the
 * separation instead. (A `Separator` still appears *within* a
 * section, e.g. before its own action row — that is dividing related
 * content in one panel, a different job.) On lg+ a sticky left
 * section-nav (in-page anchor links) sits beside the stacked sections,
 * collapsing to a single column below lg.
 *
 * Every prop is optional and defaults to a realistic, populated
 * account, so `<SettingsScreen/>` renders standalone. Pass `account`,
 * `recoveryCode` and `notifications` to drive it from real data
 * (`notifications={[]}` drops that section), and the `on*` handlers
 * to wire it to your account actions.
 */
const ALL_SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'danger', label: 'Danger zone' },
] as const;

export interface SettingsAccount {
  fullName: string;
  email: string;
}

export interface SettingsNotification {
  id: string;
  label: string;
  helper: string;
  defaultChecked: boolean;
}

const DEFAULT_ACCOUNT: SettingsAccount = { fullName: 'Dana Okafor', email: 'dana.okafor@seashell.dev' };

/** Recovery code shown once after enabling two-factor. */
const DEFAULT_RECOVERY_CODE = 'K7Q2-9MTX-4BWP-1ZHL';

const DEFAULT_NOTIFICATIONS: SettingsNotification[] = [
  { id: 'deploy-failures', label: 'Deploy failures', helper: 'Email me when a deploy fails or is rolled back.', defaultChecked: true },
  { id: 'certificate-expiry', label: 'Certificate expiry', helper: 'Warn me 14 days before a TLS certificate expires.', defaultChecked: true },
  { id: 'weekly-summary', label: 'Weekly summary', helper: 'A Monday digest of traffic, errors and resource usage.', defaultChecked: false },
];

export interface SettingsScreenProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  account?: SettingsAccount;
  recoveryCode?: string;
  /** Notification toggle rows. Pass [] to omit the Notifications section. */
  notifications?: SettingsNotification[];
  onSaveProfile?: FormEventHandler<HTMLFormElement>;
  onChangePassword?: FormEventHandler<HTMLFormElement>;
  onEnableTwoFactor?: (code: string) => void;
  onDeleteAccount?: () => void;
}

export function SettingsScreen({ className, account = DEFAULT_ACCOUNT, recoveryCode = DEFAULT_RECOVERY_CODE, notifications = DEFAULT_NOTIFICATIONS, onSaveProfile, onChangePassword, onEnableTwoFactor, onDeleteAccount, ...props }: SettingsScreenProps) {
  const showNotifications = notifications.length > 0;
  const sections = ALL_SECTIONS.filter((s) => s.id !== 'notifications' || showNotifications);
  const activeId = useActiveSection(sections.map((s) => s.id));

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-8', className)} {...props}>
      <SectionNav sections={sections} activeId={activeId} />
      <div className="flex min-w-0 flex-col gap-10">
        <ProfileSection account={account} onSaveProfile={onSaveProfile} />
        <SecuritySection recoveryCode={recoveryCode} onChangePassword={onChangePassword} onEnableTwoFactor={onEnableTwoFactor} />
        {showNotifications && <NotificationsSection notifications={notifications} />}
        <DangerSection email={account.email} onDeleteAccount={onDeleteAccount} />
      </div>
      <ScrollButtons />
    </div>
  );
}

/**
 * Floating "jump to top / jump to bottom" pair, fixed to the viewport's
 * bottom-right corner — a scroll shortcut independent of the sticky
 * SectionNav (useful on narrow viewports below `lg`, where SectionNav is
 * hidden entirely, and as a quicker jump than scrolling past four
 * sections by hand). Hidden altogether when the page doesn't actually
 * scroll; each button disables itself once you're already at that end.
 *
 * Note: `position: fixed` pins to the nearest browsing context's
 * viewport. That's the real page in normal use — but Storybook's own
 * "Docs" tab renders each story inside a content-sized (non-scrolling)
 * iframe, so both this and SectionNav's `sticky` track that iframe's
 * layout instead of the outer docs page you're actually scrolling.
 * That's a Storybook docs-preview quirk, not a bug here — the "Canvas"
 * story view (a real, viewport-scrolling page) shows the intended
 * behavior.
 */
function ScrollButtons() {
  const [state, setState] = useState({ show: false, atTop: true, atBottom: true });

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight + 2;
      setState({
        show: scrollable,
        atTop: window.scrollY <= 2,
        atBottom: window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!state.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-2">
      <Button
        type="tonal"
        tone="neutral"
        iconOnly
        size="md"
        aria-label="Scroll to top"
        disabled={state.atTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        leftIcon={<ArrowUp />}
        className="shadow-md"
      />
      <Button
        type="tonal"
        tone="neutral"
        iconOnly
        size="md"
        aria-label="Scroll to bottom"
        disabled={state.atBottom}
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        leftIcon={<ArrowDown />}
        className="shadow-md"
      />
    </div>
  );
}

/**
 * Tracks which section is currently in view while the page scrolls, for
 * SectionNav's active-item highlight. Not a generic scrollspy utility —
 * kept local since SettingsScreen is (so far) the only consumer of this
 * anchor-nav pattern; worth lifting out if a second multi-section page
 * wants the same behavior.
 */
function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);
  const key = ids.join(',');

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const lastId = ids[ids.length - 1];
    // Sections currently intersecting the "active" band, tracked
    // incrementally — IntersectionObserver entries only report what
    // *changed* since the last callback, not the full current set.
    const intersecting = new Set<string>();

    const pickActive = () => {
      // Edge case the observer alone can't cover: on a page short enough
      // that the last section can never scroll up into the active band
      // (nothing left below it to push it there), scrolling to the very
      // end would otherwise leave an earlier section stuck as "active"
      // forever. Checked first so it always wins, whichever of the two
      // listeners below fires last. Gated on the page actually having
      // something to scroll — without `scrollable`, a page short enough
      // to fit the viewport with zero scrolling reads as "at the bottom"
      // from the very first render (scrollY is already 0 >= max scroll),
      // which pinned the nav on the *last* section by default instead of
      // the first.
      const scrollable = document.documentElement.scrollHeight > window.innerHeight + 2;
      const atBottom = scrollable && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) return lastId;
      const candidates = elements.filter((el) => intersecting.has(el.id));
      if (candidates.length === 0) return undefined;
      candidates.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      return candidates[0].id;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        const next = pickActive();
        if (next) setActiveId(next);
      },
      // Treats a section as "current" once it's crossed just below the
      // sticky top offset, and stops counting it once it's past the
      // upper ~30% of the viewport — mirrors the usual docs-site TOC feel
      // rather than requiring the whole section to be on screen.
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const next = pickActive();
      if (next) setActiveId(next);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is ids.join(',')
  }, [key]);

  return activeId;
}

/**
 * In-page "on this page" anchor nav, not the app's primary Sidebar — but
 * still reads as left-hand navigation, so it deliberately mirrors
 * SidebarItem's visual language (size, radius, hover, active treatment)
 * rather than inventing its own.
 */
function SectionNav({ sections, activeId }: { sections: ReadonlyArray<{ id: string; label: string }>; activeId?: string }) {
  return (
    <nav aria-label="Settings sections" className="hidden lg:block">
      <ul className="sticky top-6 flex flex-col gap-0.5">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-2',
                  'font-body text-body-m font-medium text-[var(--color-text-text-subtler)]',
                  'transition-colors duration-150 ease-out motion-reduce:transition-none',
                  'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-text-text)]',
                  'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
                  active && 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link)]',
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ProfileSection({ account, onSaveProfile }: { account: SettingsAccount; onSaveProfile?: FormEventHandler<HTMLFormElement> }) {
  const fullNameId = useId();
  const emailId = useId();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile(e);
      return;
    }
    toast.success('Profile saved', { description: 'Your name and email were updated.' });
  };

  return (
    <div id="profile" className="scroll-mt-6 flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="min-w-0">
          <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Profile</h2>
          <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Your name and contact email. The email is used for sign-in and account notices.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={fullNameId}>Full name</Label>
            <TextField id={fullNameId} name="fullName" autoComplete="name" defaultValue={account.fullName} widthSize="lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={emailId}>Email</Label>
            <TextField id={emailId} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={account.email} widthSize="lg" />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button type="filled" tone="primary" size="2xl" leftIcon={<FloppyDisk />}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function SecuritySection({ recoveryCode, onChangePassword, onEnableTwoFactor }: { recoveryCode: string; onChangePassword?: FormEventHandler<HTMLFormElement>; onEnableTwoFactor?: (code: string) => void }) {
  const currentId = useId();
  const newId = useId();
  const otpId = useId();
  const otpHintId = useId();
  const [code, setCode] = useState('');

  const handlePassword: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (onChangePassword) {
      onChangePassword(e);
      return;
    }
    toast.success('Password updated', { description: 'Use your new password the next time you sign in.' });
  };

  const verify = () => {
    if (onEnableTwoFactor) onEnableTwoFactor(code);
    else toast.success('Two-factor enabled', { description: 'Store your recovery code somewhere safe.' });
    setCode('');
  };

  return (
    <div id="security" className="scroll-mt-6 flex flex-col gap-6">
      <div className="min-w-0">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Security</h2>
        <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Change your password and manage two-factor authentication.</p>
      </div>
      <form onSubmit={handlePassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={currentId}>Current password</Label>
          <TextField id={currentId} name="currentPassword" type="password" autoComplete="current-password" widthSize="lg" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={newId}>New password</Label>
          <TextField id={newId} name="newPassword" type="password" autoComplete="new-password" widthSize="lg" />
        </div>
        <div className="flex justify-end">
          <Button type="outlined" tone="secondary" size="2xl" leftIcon={<Key />}>
            Update password
          </Button>
        </div>
      </form>

      <Separator />

      <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-icon-icon-primary)] [&_svg]:size-[1.125rem]">
              <ShieldCheck />
            </span>
            <div className="min-w-0">
              <p className="font-body text-body-m font-medium">Two-factor authentication</p>
              <p id={otpHintId} className="mt-0.5 font-body text-body-s text-[var(--color-text-text-subtler)]">
                Open your authenticator app and enter the 6-digit code to confirm setup. We never store the code itself.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={otpId}>Enter the 6-digit code</Label>
            <div className="flex flex-wrap items-center gap-3">
              <InputOTP id={otpId} maxLength={6} inputMode="numeric" value={code} onChange={setCode} aria-describedby={otpHintId}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button type="outlined" tone="secondary" disabled={code.length < 6} onClick={verify}>
                Verify code
              </Button>
            </div>
          </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-body-m font-medium">Recovery code</p>
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Shown once. Save it now: it lets you sign in if you lose your device.</p>
          <SecretField value={recoveryCode} label="Recovery code" defaultRevealed />
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }: { notifications: SettingsNotification[] }) {
  return (
    <div id="notifications" className="scroll-mt-6 flex flex-col gap-6">
      <div className="min-w-0">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Notifications</h2>
        <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Choose which account events email you. Changes apply immediately.</p>
      </div>
      <div className="flex flex-col">
        {notifications.map((row, i) => (
          <div key={row.id} className={cn('flex items-start justify-between gap-4 py-4', i > 0 && 'border-t border-solid border-[var(--color-border-border-subtle)]', i === 0 && 'pt-0', i === notifications.length - 1 && 'pb-0')}>
            <div className="min-w-0">
              <Label htmlFor={row.id} className="font-medium">
                {row.label}
              </Label>
              <p className="mt-0.5 font-body text-body-s text-[var(--color-text-text-subtler)]">{row.helper}</p>
            </div>
            <Switch id={row.id} defaultChecked={row.defaultChecked} aria-label={row.label} className="mt-0.5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerSection({ email, onDeleteAccount }: { email: string; onDeleteAccount?: () => void }) {
  const handleDelete = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
      return;
    }
    undoToast({
      title: 'Account scheduled for deletion',
      description: 'Recoverable for 30 days, then permanently removed.',
      onUndo: () => toast('Deletion cancelled', { description: 'Your account is active again.' }),
    });
  };

  return (
    <div id="danger" className="scroll-mt-6 flex flex-col gap-6">
      <div className="min-w-0">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Danger zone</h2>
        <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Deleting your account removes every site, database and backup. This cannot be undone after the recovery window.</p>
      </div>
      <Alert tone="danger">
        <WarningTriangle />
        {/* items-start (not items-center) keeps this row's top edge level
            with the icon's own top-of-first-line position from Alert's
            `[&>svg]:mt-px` — so the icon lines up with AlertTitle, not
            with the vertical center of the whole row (which the taller
            Delete button would otherwise pull it toward). The button is
            recentered on its own, independently, via `sm:self-center`
            below. */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <AlertTitle>Delete account</AlertTitle>
            <AlertDescription>
              Permanently delete <span className="text-[var(--color-text-text)]">{email}</span> and all of its data.
            </AlertDescription>
          </div>
          <ConfirmDialog
            trigger={
              <Button type="filled" tone="danger" size="2xl" className="shrink-0 sm:self-center" leftIcon={<Trash />}>
                Delete account
              </Button>
            }
            title="Delete your account?"
            confirmValue={email}
            confirmValueMono={false}
            confirmLabel="Delete account"
            confirmIcon={<Trash />}
            onConfirm={handleDelete}
          >
            <p className="font-body text-body-s leading-relaxed text-[var(--color-text-text-subtler)]">
              This schedules <span className="text-[var(--color-text-text)]">{email}</span> for deletion - with all of its <b className="font-medium text-[var(--color-text-text)]">sites</b>,{' '}
              <b className="font-medium text-[var(--color-text-text)]">databases</b> and <b className="font-medium text-[var(--color-text-text)]">backups</b>. It is recoverable for 30 days, then permanently deleted.
            </p>
          </ConfirmDialog>
        </div>
      </Alert>
    </div>
  );
}
