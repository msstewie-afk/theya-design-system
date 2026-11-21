import { useRef } from 'react';

/** Image viewer zoomed only by pinching: two touch points tracked by hand. */
export function PinchZoom({ src }: { src: string }) {
  const start = useRef(0);
  return (
    <img
      src={src}
      onTouchStart={(e) => {
        if (e.touches.length > 1) start.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches.length > 1) {
          const now = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          document.documentElement.style.setProperty('--zoom', String(now / start.current));
        }
      }}
    />
  );
}
