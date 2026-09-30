import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

/**
 * Split panes with draggable, keyboard-resizable dividers, on
 * react-resizable-panels v4 — the standard purpose-built library for
 * this, same rationale as react-day-picker for Calendar. v4's exports
 * are named Group/Panel/Separator (not v3's PanelGroup/
 * PanelResizeHandle) — re-exported under our own names below. The
 * handle is a real role="separator": arrow keys resize, Home/End
 * jump, double-click resets.
 *
 * Sizes: in v4 a NUMBER is pixels and a unitless STRING is a percentage
 * (`defaultSize={30}` is 30px, `defaultSize="30%"` is 30%). The stories
 * used bare numbers as if they were percentages until 2026-09-30.
 *
 *   <ResizablePanelGroup orientation="horizontal">
 *     <ResizablePanel defaultSize="30%" minSize="20%">Sidebar</ResizablePanel>
 *     <ResizableHandle withHandle aria-label="Resize sidebar" />
 *     <ResizablePanel>Main</ResizablePanel>
 *   </ResizablePanelGroup>
 */
export function ResizablePanelGroup({ className, orientation = 'horizontal', style, ...props }: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      data-orientation={orientation}
      orientation={orientation}
      className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
      // The library sets inline `height: 100%; width: 100%`, which beats any
      // class — a consumer's `h-80` was silently ignored, and a vertical
      // group inside an auto-height parent collapsed its panels to 0px.
      // Clearing them lets the classes above (h-full/w-full by default,
      // overridable via className) size the group. User style still wins.
      style={{ height: undefined, width: undefined, ...style }}
      {...props}
    />
  );
}

export function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

export interface ResizableHandleProps extends React.ComponentProps<typeof Separator> {
  withHandle?: boolean;
}

export function ResizableHandle({ withHandle = false, className, 'aria-label': ariaLabel, ...props }: ResizableHandleProps) {
  return (
    <Separator
      data-slot="resizable-handle"
      aria-label={ariaLabel ?? 'Resize panel'}
      className={cn(
        'relative flex w-px items-center justify-center bg-[var(--color-border-border-subtle)] outline-none',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'focus-visible:z-10 focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'hover:bg-[var(--color-border-border-default)] data-[separator=disabled]:cursor-default data-[separator=disabled]:opacity-50 aria-disabled:opacity-50',
        '[[data-orientation=vertical]>&]:h-px [[data-orientation=vertical]>&]:w-full',
        "before:absolute before:inset-y-0 before:left-1/2 before:w-6 before:-translate-x-1/2 before:content-['']",
        '[[data-orientation=vertical]>&]:before:inset-x-0 [[data-orientation=vertical]>&]:before:left-0 [[data-orientation=vertical]>&]:before:top-1/2',
        '[[data-orientation=vertical]>&]:before:h-6 [[data-orientation=vertical]>&]:before:w-full [[data-orientation=vertical]>&]:before:translate-x-0 [[data-orientation=vertical]>&]:before:-translate-y-1/2',
        className,
      )}
      {...props}
    >
      {withHandle && (
        // Plain box, no internal glyph — iconoir has no lucide-GripVertical equivalent, and a drawn
        // dot/line pattern read as visual noise (tried both; Мария asked to drop it). The box alone
        // still gives a clear, larger drag target than the bare hairline.
        <div
          data-slot="resizable-handle-grip"
          className={cn(
            'z-10 h-5 w-3 shrink-0 rounded-full',
            'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
            '[[data-orientation=vertical]>&]:h-3 [[data-orientation=vertical]>&]:w-5',
          )}
        />
      )}
    </Separator>
  );
}
