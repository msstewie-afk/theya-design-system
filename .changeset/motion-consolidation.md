---
"@theya/shadcn": minor
---

Motion: one carousel and one card wall instead of landing copies.

- OrbitCarousel gains `shape="wall"` (coverflow, stops at the ends) and `shape="fan"` (cards on an arc, deals itself out, a click on a side card brings it in), plus `lean`, `center` (a drum round a word), `height` and `defaultIndex`. Cards follow the finger while dragging; the carousel is described by an arrow-keys hint and announces the position with the slide name ("2 of 8: Research"), silent while autoplay runs; wall and fan show dots.
- MarqueeColumns gains `drive="scroll"`: the columns slide through their length with the page scroll (a Pinterest-like board), open to full height on focus, one column below 640px.
- New hook `useScrollFrame` (ui/use-scroll-frame).
- Removed the landing-only RingCarousel, FanCarousel and MasonryDrift; the landing stories use OrbitCarousel and MarqueeColumns.
