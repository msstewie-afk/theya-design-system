import type { ComponentProps, FormEventHandler, MouseEvent } from 'react';
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
 * Our Button always renders a native type="button" (its own `type`
 * prop means visual variant, not the HTML attribute), so the submit
 * button here calls form.requestSubmit() explicitly instead of
 * relying on native type="submit" form association.
 */
export interface LoginFormProps extends Omit<ComponentProps<'div'>, 'onSubmit'> {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** Product name shown in the heading and on the brand mark. */
  appName?: string;
  forgotHref?: string;
  signupHref?: string;
  /** Show the "or continue with" single sign-on row. */
  showSso?: boolean;
  /** Wrap the fields in a bordered Card. Turn off when the form already sits in its own visually distinct area (e.g. the right pane of `LoginFormSplit`) — a Card there is a boundary around a boundary. */
  card?: boolean;
}

export function LoginForm({ className, onSubmit, appName = 'Theya', forgotHref = '#', signupHref = '#', showSso = true, card = true, ...props }: LoginFormProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    if (onSubmit) onSubmit(e);
    else e.preventDefault();
  };

  const submitForm = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest('form')?.requestSubmit();
  };

  const fields = (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <TextField id="login-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@seashell.dev" required widthSize="full" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <a
            href={forgotHref}
            className="rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
          >
            Forgot password?
          </a>
        </div>
        <TextField id="login-password" name="password" type="password" autoComplete="current-password" required widthSize="full" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="login-remember" name="remember" defaultChecked />
        <Label htmlFor="login-remember" className="font-normal text-[var(--color-text-text-subtler)]">
          Keep me signed in for 30 days
        </Label>
      </div>

      <Button type="filled" intent="primary" size="2xl" className="w-full" onClick={submitForm}>
        Sign in
      </Button>

      {showSso && (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">or continue with</span>
            <Separator className="flex-1" />
          </div>
          <Button type="outlined" intent="secondary" size="2xl" className="w-full" leftIcon={<Github />}>
            Continue with GitHub
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className={cn('flex w-full max-w-sm flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div aria-hidden="true" className="grid size-11 place-content-center rounded-xl bg-[var(--color-bg-primary-bg-primary)] font-body text-body-l font-semibold text-[var(--color-icon-icon-on-dark)]">
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
