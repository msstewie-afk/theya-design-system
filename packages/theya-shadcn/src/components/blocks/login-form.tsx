import { useId, useState } from 'react';
import type { ComponentProps, FormEventHandler } from 'react';
import { Github } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * A complete, reusable sign-in block. Composed entirely from shipped
 * primitives (Card, TextField, Label, Button, Checkbox, Separator),
 * tokens-only and mobile-first. Drop it on a centered page; wire
 * `onSubmit` to your auth action and the `*Href` props to your real
 * routes. For 2FA, follow this with InputOTP.
 *
 * Validates before `onSubmit`: an empty or malformed email and an empty
 * password show errors on the fields, focus the first one, and don't
 * reach `onSubmit` (the form is `noValidate`, so it used to submit
 * empty credentials with no feedback at all).
 */
export interface LoginFormProps extends Omit<ComponentProps<'div'>, 'onSubmit'> {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** Product name shown in the heading and on the brand mark. */
  appName?: string;
  forgotHref?: string;
  signupHref?: string;
  /** Show the "or continue with" single sign-on row. */
  showSso?: boolean;
  /** Fired by "Continue with GitHub" (it had no handler, so it did nothing). */
  onSso?: () => void;
  /** Wrap the fields in a bordered Card. Turn off when the form already sits in its own visually distinct area (e.g. the right pane of `LoginFormSplit`) — a Card there is a boundary around a boundary. */
  card?: boolean;
}

export function LoginForm({ className, onSubmit, appName = 'Theya', forgotHref = '#', signupHref = '#', showSso = true, onSso, card = true, ...props }: LoginFormProps) {
  // Per-instance ids: the fixed "login-email"/"login-password" collided
  // when two forms shared a page (e.g. LoginForm + LoginFormSplit in Docs).
  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const rememberId = `${uid}-remember`;
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const next = {
      email: !email ? 'Enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : undefined,
      password: password ? undefined : 'Enter your password.',
    };
    setErrors(next);
    if (next.email || next.password) {
      e.preventDefault();
      document.getElementById(next.email ? emailId : passwordId)?.focus();
      return;
    }
    if (onSubmit) onSubmit(e);
    else e.preventDefault();
  };

  const fields = (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={emailId}>Email</Label>
        <TextField
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@seashell.dev"
          required
          widthSize="full"
          error={errors.email}
          onChange={() => errors.email && setErrors((p) => ({ ...p, email: undefined }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={passwordId}>Password</Label>
          <a
            href={forgotHref}
            className="rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
          >
            Forgot password?
          </a>
        </div>
        <TextField
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          widthSize="full"
          error={errors.password}
          onChange={() => errors.password && setErrors((p) => ({ ...p, password: undefined }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id={rememberId} name="remember" defaultChecked />
        <Label htmlFor={rememberId} className="font-normal text-[var(--color-text-text-subtler)]">
          Keep me signed in for 30 days
        </Label>
      </div>

      <Button type="submit" appearance="filled" tone="primary" size="2xl" className="w-full">
        Sign in
      </Button>

      {showSso && (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">or continue with</span>
            <Separator className="flex-1" />
          </div>
          <Button appearance="outlined" tone="secondary" size="2xl" className="w-full" leftIcon={<Github />} onClick={onSso}>
            Continue with GitHub
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className={cn('flex w-full max-w-sm flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div aria-hidden="true" className="grid size-11 place-content-center rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-primary-bg-primary)] font-body text-body-l font-semibold text-[var(--color-icon-icon-on-dark)]">
          {appName.charAt(0)}
        </div>
        <h1 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Sign in to {appName}</h1>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Welcome back. Enter your details to continue.</p>
      </div>

      {card ? (
        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader className="sr-only">
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your email and password.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">{fields}</CardContent>
          </form>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <h2 className="sr-only">Sign in</h2>
          {fields}
        </form>
      )}

      <p className="text-center font-body text-body-s text-[var(--color-text-text-subtler)]">
        Don&apos;t have an account?{' '}
        <a
          href={signupHref}
          className="rounded-[var(--size-border-radius-border-radius-sm)] font-body font-medium text-[var(--color-text-text-link)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
        >
          Create one
        </a>
      </p>
    </div>
  );
}
