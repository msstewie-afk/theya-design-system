import { cn } from '@/lib/utils';

/**
 * Pure-CSS box that locks its children to a fixed width:height ratio
 * via the native aspect-ratio property (no library dependency). The
 * box clips overflow, so a fill child is cropped to the ratio.
 * Children are absolutely positioned to fill the box, so pass a
 * single fill element and give it a text alternative:
 * <AspectRatio ratio={16/9}><img alt="Site preview" className="absolute inset-0 size-full object-cover" /></AspectRatio>
 * (decorative media should use alt="").
 */
export interface AspectRatioProps extends React.ComponentProps<'div'> {
  ratio?: number;
}

export function AspectRatio({ ratio = 16 / 9, className, style, children, ...props }: AspectRatioProps) {
  return (
    <div data-slot="aspect-ratio" className={cn('relative w-full max-w-full overflow-hidden', className)} style={{ aspectRatio: ratio, ...style }} {...props}>
      {children}
    </div>
  );
}
