import { useEffect } from 'react';

/**
 * Dev-only: warn when a form control rendered with `id` ends up with no
 * accessible name. Checks the real DOM after mount — aria-label,
 * aria-labelledby, a <label for=id> (element.labels) or a wrapping
 * <label> — instead of only the component's own `label`/`aria-label`
 * props, which flagged every field labelled by an external
 * <Label htmlFor> (SettingsScreen, TeamMembers, ApiKeys…) and buried
 * real misses in noise.
 */
export function useMissingNameWarning(component: string, id: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const el = document.getElementById(id);
    if (!el) return;
    const labels = (el as HTMLInputElement).labels;
    const named =
      Boolean(el.getAttribute('aria-label')?.trim()) ||
      Boolean(el.getAttribute('aria-labelledby')?.trim()) ||
      (labels != null && labels.length > 0) ||
      el.closest('label') != null;
    if (!named) {
      console.warn(`[${component}] Missing accessible name: pass \`label\`, \`aria-label\`, \`aria-labelledby\`, or render a <Label htmlFor="${id}">.`);
    }
  }, [component, id]);
}
