---
'@theya/shadcn': patch
---

AccordionContent no longer has `role="region"` by default. In Safari, VoiceOver stopped on the region and spoke its label (the question again), so VO + Right never reached the answer. Pass `role="region"` to get it back, labelled by its trigger.
