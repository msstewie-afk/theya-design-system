import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Topbar, TopbarSpacer } from '@theya/shadcn/ui/topbar';
import { ThemeToggle } from '@theya/shadcn/ui/theme-toggle';
import { DensityToggle } from '@theya/shadcn/ui/density-toggle';
import { Avatar } from '@theya/shadcn/ui/avatar';
import { Toaster } from '@theya/shadcn/ui/sonner';
import { CLIENT, STUDIO } from '@/lib/data';
import { PREFS_SCRIPT, PersistPreferences } from './preferences';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${STUDIO.name} · Aether`, template: `%s · ${STUDIO.name}` },
  description: 'Client proofing portal on Aether',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-theme / data-density are set by the script before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50">
          Skip to content
        </a>
        <Topbar>
          <Link href="/" className="text-body-m font-semibold">
            {STUDIO.name}
          </Link>
          <TopbarSpacer />
          {/* Three text segments don't fit next to the studio name on a phone. */}
          <DensityToggle className="max-sm:hidden" />
          <ThemeToggle />
          {/* Initials only; the name is in the page heading. */}
          <Avatar size="sm" type="text" initials={CLIENT.initials} aria-hidden />
        </Topbar>
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
        <Toaster />
        <PersistPreferences />
      </body>
    </html>
  );
}
