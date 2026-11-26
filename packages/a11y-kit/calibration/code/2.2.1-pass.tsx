/** The same notice, paused while hovered or focused. */
export function Notice({ message, onClose }: { message: string; onClose: () => void }) {
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [paused, onClose]);
  return (
    <div role="status" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {message}
    </div>
  );
}
