/**
 * Specific email validation messages. A generic "Enter a valid email"
 * leaves people guessing what's wrong; each message here names the actual
 * problem and how to fix it (forms audit, 2026-10-02).
 *
 * Returns undefined for an empty value — whether empty is allowed is the
 * caller's call (required vs optional field).
 */
export function emailProblem(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (/\s/.test(value)) return 'Remove the space from the email address.';
  const at = value.split('@').length - 1;
  if (at === 0) return 'An email address needs an @, e.g. name@example.com.';
  if (at > 1) return 'An email address has only one @.';
  const [local, domain] = value.split('@');
  if (!local) return 'Add the part before the @, e.g. name@example.com.';
  if (!domain) return 'Add the domain after the @, e.g. example.com.';
  if (!domain.includes('.')) return `The domain looks incomplete — e.g. ${domain}.com.`;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return 'Check the dots in the domain after the @.';
  // \p{L}: internationalised domains (пример.рф) are valid too.
  if (!/^[\p{L}\p{N}.-]+$/u.test(domain)) return 'The domain after the @ can only have letters, numbers, dots and hyphens.';
  if (/\.\p{L}$/u.test(domain)) return 'The ending after the last dot looks too short, e.g. .com.';
  return undefined;
}
