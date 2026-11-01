import Link from 'next/link';
import { PageHeader } from '@theya/shadcn/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardLink, CardMedia, CardTitle } from '@theya/shadcn/ui/card';
import { Badge } from '@theya/shadcn/ui/badge';
import { ALBUMS, CLIENT, STUDIO, formatDate } from '@/lib/data';

// A server component: Theya's client components render here without a
// 'use client' boundary in the app, because each Theya module carries its own.
export default function PortalHome() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome, ${CLIENT.name.split(' ')[0]}`}
        description={`${STUDIO.name} shared ${ALBUMS.length} albums with you. Pick your favourites for retouching.`}
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ALBUMS.map((album) => (
          <li key={album.slug}>
            <Card interactive className="h-full">
              <CardMedia src={album.photos[0].src} alt="" height={180} />
              <CardHeader>
                <CardTitle>
                  {/* CardLink stretches over the card; asChild keeps Next's client routing. */}
                  <CardLink asChild>
                    <Link href={`/g/${album.slug}`}>{album.title}</Link>
                  </CardLink>
                </CardTitle>
                <CardDescription>
                  {album.photographer} · {album.photos.length} photos
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge tone="info">Pick up to {album.pickLimit}</Badge>
                <span className="text-body-s text-muted-foreground">Due {formatDate(album.dueBy)}</span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
