'use client';

import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { SectionHead } from './feature-shared';

export interface BlogPost {
  id: string;
  title: string;
  href: string;
  /** One or two sentences. */
  excerpt?: ReactNode;
  /** The cover: an image URL (3 : 2 works best). Decorative: the title names the post. */
  cover?: string;
  category?: string;
  /** ISO date ("2026-11-20"); shown as "Nov 20, 2026" in the page's locale. */
  date?: string;
  /** "6 min read". */
  readingTime?: string;
}

export interface BlogTeaserProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Three reads best; two and four work too. */
  posts: BlogPost[];
  /** "All articles" — a link to the blog. */
  action?: ReactNode;
  locale?: string;
}

/**
 * The latest posts at the end of a landing page: cover, category, title,
 * a line of excerpt, date and reading time. Each card is one link (its
 * title). Three across on a wide screen; on a phone the cards sit in a
 * row you swipe through, with the next one peeking in.
 */
export function BlogTeaser({ eyebrow, title, description, posts, action, locale = 'en-US', className, ...props }: BlogTeaserProps) {
  const uid = useId();
  const fmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <section data-slot="blog-teaser" data-scale="display" aria-labelledby={`${uid}-title`} className={cn('section-display', className)} {...props}>
      <div className="container-display flex flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead eyebrow={eyebrow} title={<span id={`${uid}-title`}>{title}</span>} description={description} />
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {/* A swipe row on phones (the next card peeks in), a grid from md. */}
        <ul
          role="list"
          className={cn(
            'm-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 pb-2 [scrollbar-width:none] md:grid md:snap-none md:overflow-visible md:pb-0',
            posts.length === 2 ? 'md:grid-cols-2' : posts.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3',
            'md:gap-6',
          )}
        >
          {posts.map((post) => (
            <li key={post.id} className="w-[82%] shrink-0 snap-start md:w-auto">
              <article className="group relative flex h-full flex-col gap-4">
                {post.cover && (
                  <div className="aspect-[3/2] overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] bg-[var(--color-bg-surface-bg-surface-sunken)]">
                    <img
                      src={post.cover}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-slow ease-glide group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {post.category && <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">{post.category}</p>}
                  <h3 className="m-0 font-heading text-heading-xs">
                    {/* The title is the link; ::after stretches it over the card. */}
                    <a
                      href={post.href}
                      className="rounded-[var(--size-border-radius-border-radius-sm)] text-[var(--color-text-text)] no-underline outline-none after:absolute after:inset-0 after:rounded-[var(--size-border-radius-border-radius-3xl)] focus-visible:after:focus-ring group-hover:underline"
                    >
                      {post.title}
                    </a>
                  </h3>
                  {post.excerpt && <p className="m-0 line-clamp-2 font-body text-body-m text-[var(--color-text-text-subtle)]">{post.excerpt}</p>}
                  {(post.date || post.readingTime) && (
                    <p className="m-0 flex flex-wrap gap-x-2 font-body text-body-s text-[var(--color-text-text-subtle)]">
                      {post.date && <time dateTime={post.date}>{fmt.format(new Date(`${post.date}T12:00:00`))}</time>}
                      {post.date && post.readingTime && <span aria-hidden>·</span>}
                      {post.readingTime && <span>{post.readingTime}</span>}
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
