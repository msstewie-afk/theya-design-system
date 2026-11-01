'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChatLines, Heart, HeartSolid } from 'iconoir-react';
import { Button } from '@theya/shadcn/ui/button';
import { Toggle } from '@theya/shadcn/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@theya/shadcn/ui/toggle-group';
import { Lightbox } from '@theya/shadcn/ui/lightbox';
import { StickyActionBar } from '@theya/shadcn/ui/sticky-action-bar';
import { ConfirmDialog } from '@theya/shadcn/ui/confirm-dialog';
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@theya/shadcn/ui/dialog';
import { TextArea } from '@theya/shadcn/ui/textarea';
import { EmptyState } from '@theya/shadcn/ui/empty-state';
import { SuccessCheck } from '@theya/shadcn/ui/success-check';
import { toast } from '@theya/shadcn/ui/sonner';
import { TruncatedText } from '@theya/shadcn/ui/truncated-text';
import { announce } from '@theya/shadcn/lib/announce';
import type { Album } from '@/lib/data';
import { formatDate } from '@/lib/data';

type Filter = 'all' | 'picked' | 'commented';

export function Proofing({ album }: { album: Album }) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [comments, setComments] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [viewing, setViewing] = useState<number | null>(null);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  const limit = album.pickLimit;
  const commentCount = Object.keys(comments).length;
  const shown = album.photos.filter((p) => (filter === 'picked' ? picked.has(p.id) : filter === 'commented' ? p.id in comments : true));
  const first = album.photographer.split(' ')[0];

  useEffect(() => {
    if (sent) sentHeading.current?.focus();
  }, [sent]);

  function togglePick(id: string, file: string, on: boolean) {
    if (on && picked.size >= limit) {
      // The toggle stays off; say why instead of disabling the other photos.
      toast.warning(`You’ve picked ${limit} of ${limit}`, { description: 'Unpick a photo to choose another.' });
      return;
    }
    const next = new Set(picked);
    if (on) next.add(id);
    else next.delete(id);
    setPicked(next);
    announce(`${on ? 'Picked' : 'Unpicked'} ${file}. ${next.size} of ${limit} picked.`, 'polite', { delay: 300 });
  }

  function saveComment(id: string, text: string) {
    setComments((c) => {
      const next = { ...c };
      if (text.trim()) next[id] = text.trim();
      else delete next[id];
      return next;
    });
    setCommentFor(null);
    toast.success(text.trim() ? 'Comment saved' : 'Comment removed');
  }

  if (sent) {
    return (
      <EmptyState
        icon={<SuccessCheck />}
        title={
          <span ref={sentHeading} tabIndex={-1} className="outline-none">
            Selection sent
          </span>
        }
        titleAs="h2"
        description={`${first} will retouch your ${picked.size} photos and email you by ${formatDate(album.dueBy)}.`}
        action={
          <Button asChild appearance="outlined" size="md">
            <Link href="/">All albums</Link>
          </Button>
        }
      />
    );
  }

  const photo = commentFor ? album.photos.find((p) => p.id === commentFor) : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span id="show-label" className="text-body-s font-medium">
          Show
        </span>
        <ToggleGroup
          type="single"
          appearance="outlined"
          size="sm"
          aria-labelledby="show-label"
          value={filter}
          onValueChange={(v) => v && setFilter(v as Filter)}
        >
          <ToggleGroupItem value="all">All {album.photos.length}</ToggleGroupItem>
          <ToggleGroupItem value="picked">Picked {picked.size}</ToggleGroupItem>
          <ToggleGroupItem value="commented">With comments {commentCount}</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          filtered
          title={filter === 'picked' ? 'No picked photos yet' : 'No comments yet'}
          description={filter === 'picked' ? 'Tap the heart on a photo to pick it.' : 'Use the comment button on a photo to leave a note for the retoucher.'}
          filteredAction={
            <Button appearance="outlined" size="md" onClick={() => setFilter('all')}>
              Show all photos
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => {
            const isPicked = picked.has(p.id);
            const index = album.photos.indexOf(p);
            return (
              <li key={p.id}>
                <figure className="overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
                  <button type="button" className="block w-full outline-none focus-visible:focus-ring-inset" onClick={() => setViewing(index)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data, nothing to optimise */}
                    <img src={p.src} alt={p.alt} className="aspect-[4/3] w-full object-cover" />
                  </button>
                  <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                    <TruncatedText className="font-mono text-body-s">{p.file}</TruncatedText>
                    <span className="flex shrink-0 gap-1">
                      <Button
                        iconOnly
                        size="sm"
                        appearance="ghost"
                        tone="neutral"
                        aria-label={`${p.id in comments ? 'Edit comment on' : 'Comment on'} ${p.file}`}
                        badge={p.id in comments ? { dot: true, tone: 'info' } : undefined}
                        leftIcon={<ChatLines />}
                        onClick={() => setCommentFor(p.id)}
                      />
                      <Toggle
                        iconOnly
                        size="sm"
                        appearance="ghost"
                        aria-label={`Pick ${p.file}`}
                        pressed={isPicked}
                        onPressedChange={(on) => togglePick(p.id, p.file, on)}
                      >
                        {isPicked ? <HeartSolid className="text-[var(--color-icon-icon-danger)]" /> : <Heart />}
                      </Toggle>
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      )}

      <StickyActionBar aria-label="Selection" message={`${picked.size} of ${limit} picked${commentCount ? ` · ${commentCount} with comments` : ''}`}>
        <Button size="md" disabled={picked.size === 0} onClick={() => setConfirming(true)}>
          Send selection
        </Button>
      </StickyActionBar>

      <Lightbox
        images={album.photos.map((p) => ({ src: p.src, alt: p.alt, caption: `${p.file}${picked.has(p.id) ? ' · picked' : ''}` }))}
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        index={viewing ?? 0}
        onIndexChange={setViewing}
        title={album.title}
      />

      <Dialog open={!!photo} onOpenChange={(open) => !open && setCommentFor(null)}>
        {photo && (
          <DialogContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveComment(photo.id, String(new FormData(e.currentTarget).get('comment') ?? ''));
              }}
            >
              <DialogHeader>
                <DialogTitle>Comment on {photo.file}</DialogTitle>
                <DialogDescription>{first} reads every note before retouching.</DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data */}
                <img src={photo.src} alt="" className="aspect-[4/3] w-40 rounded-[var(--size-border-radius-border-radius-md)] object-cover" />
                <TextArea name="comment" label={`Note for ${first}`} description="For example: crop tighter, warmer tones." defaultValue={comments[photo.id] ?? ''} />
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" appearance="outlined" tone="neutral" size="md">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" size="md">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="neutral"
        title={`Send ${picked.size} photos to ${first}?`}
        description="Retouching starts once you send. You can’t change the selection after that."
        confirmLabel="Send selection"
        onConfirm={() => {
          setSent(true);
          toast.success('Selection sent');
        }}
      />
    </>
  );
}
