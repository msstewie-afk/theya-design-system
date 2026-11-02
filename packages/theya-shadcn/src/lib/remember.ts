'use client';

/** Storage can throw (private mode, blocked site data): a failed write only means the choice lasts for this visit. */
export function remember(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Not available: nothing to keep.
  }
}
