/** Password field a password manager can fill; paste works. */
export function PasswordField({ onChange }: { onChange: (v: string) => void }) {
  return (
    <input
      type="password"
      autoComplete="current-password"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
