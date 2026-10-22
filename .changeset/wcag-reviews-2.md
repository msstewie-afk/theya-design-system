---
'@theya/shadcn': patch
---

WCAG 2.2 reviews of 1.4.13, 2.2.2, 2.4.4, 2.4.11, 2.5.1, 2.5.7, 2.5.8 and 3.3.8, recorded in `a11y/manual.json`, with these fixes:

- Focus Not Obscured (2.4.11): Topbar, StickyActionBar, Fab and a sticky AnnouncementBar reserve their height as `scroll-padding` on the container they sit over (new `lib/scroll-padding`), so Tab-focused content stops clear of them. DataTable's sticky header no longer hides a focused cell.
- Card (2.4.4): a whole-card link or filter overlay without its own label is named by its CardTitle instead of the raw URL.
- WheelPicker (2.5.7): clicking a row selects it (pointer capture used to swallow the click).
- ImageCropper (2.5.7): a click centres the frame on that point, so the crop can be moved without dragging.
- Lightbox (2.5.1): Previous/Next show on phones when the thumbnail strip is off.
- DataTable / DataTableToolbar (1.4.13): Escape closes the select-all tooltip while it's hovered.
- InputOTP (3.3.8): a code pasted with spaces or dashes ("123 456") fills the slots.
- Guidelines: PromptArea (attach button with `onFilesAdded`), Resizable (collapse/preset buttons), ImageCropper (`controls={false}`).
