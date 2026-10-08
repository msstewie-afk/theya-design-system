/**
 * @internal
 * The small filled "!" circle shown next to a field's error message
 * (TextField, Textarea, TagInput, PhoneField, PromptArea, Dropzone).
 * One shared drawing instead of a copy per field. Not part of the public
 * API: it is reachable through `./ui/*` only because every ui file is,
 * and it may change without notice.
 *
 * Decorative (`aria-hidden`): the error text next to it carries the
 * meaning. The glyph is `currentColor`, so callers set its color (the
 * danger icon token) via `className`.
 */
export function FieldErrorIcon({ className, size = 12 }: { className?: string; size?: 12 | 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <rect x="5.25" y="2.5" width="1.5" height="4" rx="0.75" fill="white" />
      <circle cx="6" cy="8.5" r="0.9" fill="white" />
    </svg>
  );
}
