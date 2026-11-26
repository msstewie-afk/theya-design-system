/** A notice that closes itself after five seconds; nothing pauses or extends it. */
export function Notice({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div role="status">{message}</div>;
}
