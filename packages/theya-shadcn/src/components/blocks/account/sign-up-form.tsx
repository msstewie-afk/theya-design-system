'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Github, WarningCircle } from 'iconoir-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Password } from '../../ui/password';
import { Separator } from '../../ui/separator';
import { TextField } from '../../ui/text-field';
import { emailProblem } from '../../../lib/email';
import { AuthFrame, AuthHeader, authLink, MIN_PASSWORD, passwordProblem } from './auth-shared';
import { Link } from '../../ui/link';

export interface SignUpValues {
  email: string;
  password: string;
  news: boolean;
}

export interface SignUpFormProps {
  appName?: string;
  onSubmit?: (values: SignUpValues) => void;
  onSso?: () => void;
  signInHref?: string;
  termsHref?: string;
  privacyHref?: string;
  loading?: boolean;
  /** Server-side problem, e.g. the email already has an account. */
  error?: ReactNode;
  className?: string;
}

/**
 * Two fields, not eight: an email and a password are enough to create an
 * account; the rest can be asked when it's needed. The password rule is
 * shown before typing and counts down while you type; there's no
 * "confirm password" — the show/hide toggle does that job. Marketing
 * email is opt-in and unchecked. Terms are a sentence, not a checkbox.
 */
export function SignUpForm({ appName = 'Theya', onSubmit, onSso, signInHref = '#sign-in', termsHref = '#terms', privacyHref = '#privacy', loading, error, className }: SignUpFormProps) {
  const uid = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [news, setNews] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const short = password.length > 0 && password.length < MIN_PASSWORD;

  return (
    <AuthFrame className={className}>
      <AuthHeader appName={appName} title={`Create your ${appName} account`}>
        {'Already have one? '}
        <Link href={signInHref} className={authLink}>
          Sign in
        </Link>
      </AuthHeader>
      <Card>
        <CardContent>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const next = { email: email.trim() ? emailProblem(email.trim()) : 'Enter your email.', password: passwordProblem(password) };
              setErrors(next);
              if (next.email || next.password) {
                document.getElementById(next.email ? `${uid}-email` : `${uid}-password`)?.focus();
                return;
              }
              onSubmit?.({ email: email.trim(), password, news });
            }}
          >
            {error && (
              <Alert tone="danger" live="assertive">
                <WarningCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${uid}-email`}>Work email</Label>
              <TextField
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                widthSize="full"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: e.target.value.trim() ? emailProblem(e.target.value.trim()) : 'Enter your email.' }));
                }}
                onBlur={() => email.trim() && setErrors((p) => ({ ...p, email: emailProblem(email.trim()) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${uid}-password`}>Password</Label>
              <Password
                id={`${uid}-password`}
                autoComplete="new-password"
                widthSize="full"
                value={password}
                // The rule is visible before typing, then counts down; the
                // error only replaces it after leaving the field too short.
                description={errors.password ? undefined : short ? `${MIN_PASSWORD - password.length} more characters` : `At least ${MIN_PASSWORD} characters.`}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: passwordProblem(e.target.value) }));
                }}
                onBlur={() => password && setErrors((p) => ({ ...p, password: passwordProblem(password) }))}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id={`${uid}-news`} checked={news} onCheckedChange={(v) => setNews(v === true)} className="mt-0.5" />
              <Label htmlFor={`${uid}-news`} className="font-normal text-[var(--color-text-text-subtle)]">
                Send me product news, about once a month
              </Label>
            </div>
            <Button type="submit" appearance="filled" tone="primary" size="2xl" loading={loading} className="w-full">
              Create account
            </Button>
            <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">
              {'By creating an account you agree to the '}
              <Link href={termsHref} className={authLink}>
                Terms of Service
              </Link>
              {' and '}
              <Link href={privacyHref} className={authLink}>
                Privacy Policy
              </Link>
              .
            </p>
            {onSso && (
              <>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">or</span>
                  <Separator className="flex-1" />
                </div>
                <Button type="button" appearance="outlined" tone="secondary" size="2xl" className="w-full" leftIcon={<Github />} onClick={onSso}>
                  Sign up with GitHub
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </AuthFrame>
  );
}
