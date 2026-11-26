/** A slideshow that moves on every four seconds; there is no way to stop it. */
export function Slides({ slides }: { slides: string[] }) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);
  return <img src={slides[index]} alt="" />;
}
