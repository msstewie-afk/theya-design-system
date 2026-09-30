/**
 * Does `file` match an <input accept> string? Comma-separated patterns,
 * each checked on its own: a leading-dot pattern matches the filename
 * extension, anything else matches the MIME type with `*` as a wildcard
 * ("image/*", "application/pdf"). Case-insensitive. An empty or missing
 * accept matches everything.
 *
 * Shared by Dropzone and PromptArea (drag/drop and paste bypass the
 * native picker's own filtering, so both re-check here). A bare
 * `file.type.match(accept.replace('*', '.*'))` treats the whole list as
 * one regex, so nothing beyond the first pattern can ever match.
 */
export function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept?.trim()) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(',').some((raw) => {
    const pattern = raw.trim().toLowerCase();
    if (!pattern) return false;
    if (pattern.startsWith('.')) return name.endsWith(pattern);
    // Escape regex metachars (not `*`), then turn `*` into a wildcard.
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(type);
  });
}
