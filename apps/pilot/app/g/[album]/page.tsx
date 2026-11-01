import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@theya/shadcn/ui/page-header';
import { ALBUMS, getAlbum, formatDate } from '@/lib/data';
import { Proofing } from './proofing';

export function generateStaticParams() {
  return ALBUMS.map((a) => ({ album: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ album: string }> }): Promise<Metadata> {
  const album = getAlbum((await params).album);
  return { title: album?.title ?? 'Gallery not found' };
}

export default async function AlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const album = getAlbum((await params).album);
  if (!album) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={
          <Link href="/" className="text-body-s text-muted-foreground hover:text-foreground">
            All albums
          </Link>
        }
        title={album.title}
        description={`${album.photographer} · shot ${formatDate(album.shotOn)} · pick up to ${album.pickLimit} by ${formatDate(album.dueBy)}`}
      />
      <Proofing album={album} />
    </div>
  );
}
