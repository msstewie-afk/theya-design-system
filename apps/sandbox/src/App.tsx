import { useState } from 'react';
import { Badge } from '@theya/shadcn/ui/badge';
import { Button } from '@theya/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@theya/shadcn/ui/card';
import { TextField } from '@theya/shadcn/ui/text-field';
import { ThemeToggle } from '@theya/shadcn/ui/theme-toggle';
import { Toaster, toast } from '@theya/shadcn/ui/sonner';

/**
 * A small page built only from DS imports. If something here looks
 * unstyled or breaks, the package wiring (exports, @source, React dedupe)
 * is what to check — not the components.
 */
export function App() {
  const [domain, setDomain] = useState('');
  return (
    <div className="min-h-svh bg-[var(--color-bg-surface-bg-surface-base)] font-body text-[var(--color-text-text)]">
      <header className="flex items-center justify-between border-b border-solid border-[var(--color-border-border)] px-6 py-3">
        <span className="font-heading text-heading-xs font-semibold">Theya sandbox</span>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Add a site</CardTitle>
              <CardDescription>Components imported from @theya/shadcn via the workspace.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField label="Domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} widthSize="full" />
            <div className="flex items-center gap-3">
              <Button size="md" onClick={() => toast.success(domain ? `${domain} added` : 'Site added')}>Add site</Button>
              <Badge tone="success">Workspace link works</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
