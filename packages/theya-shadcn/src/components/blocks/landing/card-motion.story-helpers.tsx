import type { ReactNode } from 'react';
import { SectionHead } from './feature-shared';

/** A display-scale section around a card-motion demo. */
export function CardMotionSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-scale="display" className="section-display overflow-hidden">
      <div className="container-display flex flex-col items-center gap-12">
        {title && <SectionHead align="center" title={title} />}
        {children}
      </div>
    </section>
  );
}
