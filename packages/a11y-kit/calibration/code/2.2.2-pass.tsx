/** The same slideshow with a pause button. */
export function Slides({ slides }: { slides: string[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [paused, slides.length]);
  return (
    <>
      <img src={slides[index]} alt="" />
      <button type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>Pause</button>
    </>
  );
}
