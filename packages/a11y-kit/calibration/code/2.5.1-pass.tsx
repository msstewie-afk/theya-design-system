import { useRef, useState } from 'react';

/** The same pinch zoom, plus single-pointer and keyboard alternatives. */
export function PinchZoom({ src }: { src: string }) {
  const start = useRef(0);
  const [zoom, setZoom] = useState(1);
  return (
    <div onKeyDown={(e) => { if (e.key === '+') setZoom((z) => z + 0.1); }}>
      <img
        src={src}
        style={{ transform: `scale(${zoom})` }}
        onTouchStart={(e) => {
          if (e.touches.length > 1) start.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        }}
      />
      <button onClick={() => setZoom((z) => z + 0.1)}>Zoom in</button>
      <button onClick={() => setZoom((z) => z - 0.1)}>Zoom out</button>
    </div>
  );
}
