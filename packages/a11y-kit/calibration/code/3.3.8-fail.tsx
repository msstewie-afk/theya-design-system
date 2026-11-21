/** Password field that blocks paste and gives password managers nothing. */
export function PasswordField({ onChange }: { onChange: (v: string) => void }) {
  return (
    <input
      type="password"
      onPaste={(e) => e.preventDefault()}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
