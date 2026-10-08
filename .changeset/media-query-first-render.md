---
"@theya/shadcn": patch
---

`useMediaQuery` answers correctly on the first render in the browser. PushSheet and Sidebar no longer mount their mobile Drawer for one frame on desktop (which briefly hid the page from screen readers), and DataTable and Carousel start in their final layout.
