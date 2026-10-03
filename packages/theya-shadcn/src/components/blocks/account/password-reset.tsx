import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle, Mail, WarningTriangle } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Password } from '@/components/ui/password';
import { TextField } from '@/components/ui/text-field';
import { emailProblem } from '@/lib/email';
import { AuthFrame, AuthHeader, authLink, MIN_PASSWORD, passwordProblem } from './auth-shared';

export type ResetStep = 'request' | 'sent' | 'expired' | 'reset' | 'done';

export interface PasswordResetProps {
  appName?: string;
  /** Where the flow starts — 'reset' / 'expired' when opened from the emailed link. */
  initialStep?: ResetStep;
  defaultEmail?: string;
  onRequest?: (email: string) => void;
  onReset?: (password: string) => void;
  signInHref?: string;
  /** Seconds before "Resend" is offered again. */
  resendAfter?: number;
  className?: string;
}

/**
 * The whole "forgot password" path on one component, step by step:
 * ask for the email → say a link was sent (without revealing whether an
 * account exists), with a resend after a short wait and a way to fix a
 * typo → set a new password, the rule shown up front → done, with the
 * way back to sign in. An expired link isn't a dead end: it offers a new
 * one for the same address.
 */
export function PasswordReset({ appName = 'Theya', initialStep = 'request', defaultEmail = '', onRequest, onReset, signInHref = '#sign-in', resendAfter = 30, className }: PasswordResetProps) {
  const uid = useId();
  const [step, setStep] = useState<ResetStep>(initialStep);
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string>();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [wait, setWait] = useState(0);
  const headingRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Each step change moves focus to the new heading, so the change is heard.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.querySelector('h1')?.focus();
  }, [step]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = () => {
    const problem = email.trim() ? emailProblem(email.trim()) : 'Enter your email.';
    setEmailError(problem);
    if (problem) {
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    onRequest?.(email.trim());
    setWait(resendAfter);
    setStep('sent');
  };

  const titles: Record<ResetStep, string> = {
    request: 'Reset your password',
    sent: 'Check your email',
    expired: 'This link has expired',
    reset: 'Set a new password',
    done: 'Password changed',
  };

  const back = (
    <a href={signInHref} className={`${authLink} self-center font-body text-body-m`}>
      Back to sign in
    </a>
  );

  return (
    <AuthFrame className={className}>
      <div ref={headingRef} className="[&_h1]:outline-none">
        <AuthHeader appName={appName} title={titles[step]} />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          {step === 'request' && (
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">Enter the email you sign in with. We’ll send a link to set a new password.</p>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-email`}>Email</Label>
                <TextField
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  widthSize="full"
                  value={email}
                  error={emailError}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(e.target.value.trim() ? emailProblem(e.target.value.trim()) : 'Enter your email.');
                  }}
                  onBlur={() => email.trim() && setEmailError(emailProblem(email.trim()))}
                />
              </div>
              <Button type="submit" appearance="filled" tone="primary" size="2xl" className="w-full">
                Send reset link
              </Button>
            </form>
          )}

          {step === 'sent' && (
            <>
              <div className="flex items-start gap-3">
                <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-icon-icon-primary)]" />
                <p className="font-body text-body-m text-[var(--color-text-text)]">
                  {'If an account exists for '}
                  <strong className="font-semibold">{email}</strong>
                  {', a link to reset the password is on its way. It works for 1 hour.'}
                </p>
              </div>
              <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">No email after a few minutes? Check the spam folder, or send it again.</p>
              <div className="flex flex-wrap gap-2">
                <Button appearance="outlined" tone="secondary" size="md" softDisabled={wait > 0} onClick={send} aria-describedby={`${uid}-wait`}>
                  Resend link
                </Button>
                <Button appearance="ghost" tone="secondary" size="md" onClick={() => setStep('request')}>
                  Use a different email
                </Button>
              </div>
              <p id={`${uid}-wait`} className="font-body text-body-s text-[var(--color-text-text-subtler)]" aria-live="off">
                {wait > 0 ? `You can resend in ${wait} s.` : 'You can resend now.'}
              </p>
            </>
          )}

          {step === 'expired' && (
            <>
              <div className="flex items-start gap-3">
                <WarningTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-icon-icon-warning)]" />
                <p className="font-body text-body-m text-[var(--color-text-text)]">Reset links work for 1 hour and only once. Get a new one — it takes a minute.</p>
              </div>
              {/* The address goes under the button, not in it: an email can be any length. */}
              <div className="flex flex-col gap-2">
                <Button appearance="filled" tone="primary" size="2xl" className="w-full" onClick={() => (email ? send() : setStep('request'))} aria-describedby={email ? `${uid}-to` : undefined}>
                  Send a new link
                </Button>
                {email && (
                  <p id={`${uid}-to`} className="text-center font-body text-body-s text-[var(--color-text-text-subtle)]">
                    {'To '}
                    <span className="break-all font-medium text-[var(--color-text-text)]">{email}</span>
                  </p>
                )}
              </div>
            </>
          )}

          {step === 'reset' && (
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const problem = passwordProblem(password);
                setPasswordError(problem);
                if (problem) {
                  document.getElementById(`${uid}-password`)?.focus();
                  return;
                }
                onReset?.(password);
                setStep('done');
              }}
            >
              {email && (
                <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
                  {'For '}
                  <strong className="font-semibold text-[var(--color-text-text)]">{email}</strong>
                </p>
              )}
              {/* For password managers: the account this password belongs to. */}
              <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-password`}>New password</Label>
                <Password
                  id={`${uid}-password`}
                  autoComplete="new-password"
                  widthSize="full"
                  value={password}
                  description={passwordError ? undefined : password && password.length < MIN_PASSWORD ? `${MIN_PASSWORD - password.length} more characters` : `At least ${MIN_PASSWORD} characters.`}
                  error={passwordError}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(passwordProblem(e.target.value));
                  }}
                  onBlur={() => password && setPasswordError(passwordProblem(password))}
                />
              </div>
              <Button type="submit" appearance="filled" tone="primary" size="2xl" className="w-full">
                Save new password
              </Button>
            </form>
          )}

          {step === 'done' && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-icon-icon-success)]" />
                <p className="font-body text-body-m text-[var(--color-text-text)]">Your password is changed. Other devices were signed out, just in case.</p>
              </div>
              <Button asChild appearance="filled" tone="primary" size="2xl" className="w-full">
                <a href={signInHref}>Sign in</a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {step !== 'done' && back}
    </AuthFrame>
  );
}
