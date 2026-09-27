import { useState, useId } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Key, Plus, Trash } from 'iconoir-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { undoToast } from '@/components/ui/undo-toast';
import { SecretField } from '@/components/ui/secret-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

/**
 * A reusable API key management screen: a "Create key" form that
 * opens a dialog, a table of existing keys (name, masked value with
 * copy, created/last-used dates, revoke behind a ConfirmDialog +
 * undo-toast), and an empty state. Once created, a key's full value
 * is shown exactly once (SecretField, revealed) inside a confirmation
 * dialog, then only its masked form persists in the table.
 *
 * Every prop is optional and defaults to a realistic, populated set
 * of keys, so `<ApiKeys/>` renders standalone.
 */
export interface ApiKey {
  id: string;
  name: string;
  /** The masked value shown in the table; the real secret exists only at creation time. */
  maskedValue: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

const SEEDED_KEYS: ApiKey[] = [
  { id: 'key-1', name: 'Production deploy', maskedValue: '••••••••••3f9a', createdAt: 'Jan 12, 2026', lastUsedAt: '2h ago' },
  { id: 'key-2', name: 'CI pipeline', maskedValue: '••••••••••7d21', createdAt: 'Feb 3, 2026', lastUsedAt: 'yesterday' },
  { id: 'key-3', name: 'Legacy script', maskedValue: '••••••••••0c88', createdAt: 'Nov 8, 2025', lastUsedAt: null },
];

function maskKey(secret: string): string {
  const tail = secret.length > 4 ? secret.slice(-4) : secret;
  return `${'•'.repeat(10)}${tail}`;
}

function generateSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface ApiKeysProps {
  title?: string;
  description?: ReactNode;
  keys?: ApiKey[];
  onCreate?: (name: string) => string | Promise<string>;
  onRevoke?: (key: ApiKey) => void;
}

export function ApiKeys({ title = 'API keys', description = 'Keys used to authenticate requests to the API on your behalf.', keys: keysProp, onCreate, onRevoke }: ApiKeysProps) {
  const [keys, setKeys] = useState<ApiKey[]>(keysProp ?? SEEDED_KEYS);
  const [name, setName] = useState('');
  const nameId = useId();
  const [createdSecret, setCreatedSecret] = useState<{ name: string; secret: string } | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const secret = onCreate ? await onCreate(trimmed) : generateSecret();
    const key: ApiKey = { id: `key-${Date.now()}`, name: trimmed, maskedValue: maskKey(secret), createdAt: 'Just now', lastUsedAt: null };
    setKeys((prev) => [key, ...prev]);
    setCreatedSecret({ name: trimmed, secret });
    setName('');
  };

  const revokeKey = (key: ApiKey) => {
    const index = keys.findIndex((k) => k.id === key.id);
    setKeys((prev) => prev.filter((k) => k.id !== key.id));
    onRevoke?.(key);
    undoToast({
      title: 'Key revoked',
      description: key.name,
      icon: <Trash width={16} height={16} />,
      onUndo: () =>
        setKeys((prev) => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, key);
          return next;
        }),
    });
  };

  return (
    <section className="flex flex-col gap-8">
      {(title || description) && (
        <header className="min-w-0">
          {title && <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h2>}
          {description && <p className="mt-1 max-w-2xl font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </header>
      )}

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Create a new key</h3>
          <CardDescription>Name it after what will use it, so you can identify it later.</CardDescription>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor={nameId}>Key name</Label>
            <TextField id={nameId} placeholder="Production deploy" value={name} onChange={(e) => setName(e.target.value)} widthSize="full" />
          </div>
          <Button type="filled" tone="primary" disabled={!name.trim()} className="max-sm:w-full" leftIcon={<Plus />}>
            Create key
          </Button>
        </form>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Your keys</h3>
          <CardDescription>
            <span className="tabular-nums">{keys.length}</span> active {keys.length === 1 ? 'key' : 'keys'}
          </CardDescription>
        </div>
        {keys.length === 0 ? (
          <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
            <EmptyState icon={<Key />} title="No API keys yet" titleAs="h4" description="Create your first key to start making authenticated requests." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden md:table-cell">Last used</TableHead>
                <TableHead className="w-11">
                  <span className="sr-only">Revoke</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[var(--color-text-text-subtler)]">{key.maskedValue}</TableCell>
                  <TableCell className="hidden whitespace-nowrap text-[var(--color-text-text-subtler)] sm:table-cell">{key.createdAt}</TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
                    {key.lastUsedAt ? (
                      <span className="flex items-center gap-1.5 text-[var(--color-text-text-subtler)]">
                        <StatusDot tone="success" />
                        {key.lastUsedAt}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[var(--color-text-text-subtler)]">
                        <StatusDot tone="neutral" />
                        Never used
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ConfirmDialog
                      title={`Revoke "${key.name}"?`}
                      description="Any requests using this key will immediately start failing. You can undo this for a short time after."
                      confirmLabel="Revoke"
                      confirmIcon={<Trash width={16} height={16} />}
                      trigger={<Button type="ghost" tone="danger" iconOnly size="md" aria-label={`Revoke ${key.name}`} leftIcon={<Trash />} />}
                      onConfirm={() => revokeKey(key)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={createdSecret != null} onOpenChange={(open) => !open && setCreatedSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your new key</DialogTitle>
            <DialogDescription>This is the only time you'll see the full value of "{createdSecret?.name}". Store it somewhere safe.</DialogDescription>
          </DialogHeader>
          {createdSecret && <SecretField value={createdSecret.secret} label={createdSecret.name} defaultRevealed className="mx-6" />}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="filled"
                tone="primary"
                onClick={() => {
                  toast.success('Key created', { description: createdSecret?.name });
                  setCreatedSecret(null);
                }}
              >
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
