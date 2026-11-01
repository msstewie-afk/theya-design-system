'use client';

import { useEffect } from 'react';

// Theya's useTheme / useDensity write data-theme and data-density on <html>
// but don't remember them. This keeps the choice across reloads; the inline
// script in layout.tsx applies it before the first paint.
export const PREFS_SCRIPT = `try{var t=localStorage.getItem('pilot-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.setAttribute('data-theme','dark');var d=localStorage.getItem('pilot-density');if(d)document.documentElement.setAttribute('data-density',d)}catch(e){}`;

export function PersistPreferences() {
  useEffect(() => {
    const html = document.documentElement;
    const save = () => {
      try {
        localStorage.setItem('pilot-theme', html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
        const density = html.getAttribute('data-density');
        if (density) localStorage.setItem('pilot-density', density);
        else localStorage.removeItem('pilot-density');
      } catch {
        // Storage can be unavailable (private mode); the choice then lasts for the visit.
      }
    };
    const observer = new MutationObserver(save);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-density'] });
    return () => observer.disconnect();
  }, []);
  return null;
}
