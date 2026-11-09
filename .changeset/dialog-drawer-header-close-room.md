---
'@theya/shadcn': patch
---

Dialog and Drawer headers keep the title clear of the close button: with the × shown, DialogContent gives its header 56 px of end padding (like AlertDialog), and DrawerHeader has 56 px on the right. A left or right Drawer starts its header 24 px from the top (it has no drag handle); top and bottom drawers keep 12 under the handle. Stories no longer add `pt-7 pb-0` to side drawers.
