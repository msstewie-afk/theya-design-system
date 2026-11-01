import Link from 'next/link';
import { EmptyState } from '@theya/shadcn/ui/empty-state';
import { Button } from '@theya/shadcn/ui/button';

export default function NotFound() {
  return (
    <EmptyState
      title="Gallery not found"
      titleAs="h1"
      description="Even Theia couldn’t light this one. The link may be old, or the album was taken down."
      action={
        <Button asChild appearance="outlined" size="md">
          <Link href="/">All albums</Link>
        </Button>
      }
    />
  );
}
