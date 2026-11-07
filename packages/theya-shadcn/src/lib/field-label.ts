/**
 * The visible name of a form control, as a sighted user reads it: the text
 * of its aria-labelledby targets, else its <label for> / wrapping label.
 * Used as the title of a popover that opens as a bottom sheet on phones,
 * where the field's own label is no longer on screen.
 */
export function fieldLabelText(el: HTMLElement | null): string | undefined {
  if (!el) return undefined;
  const ids = el.getAttribute('aria-labelledby');
  if (ids) {
    const text = ids
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }
  const labels = (el as HTMLButtonElement | HTMLInputElement).labels;
  const text = labels?.[0]?.textContent?.trim();
  return text || undefined;
}
