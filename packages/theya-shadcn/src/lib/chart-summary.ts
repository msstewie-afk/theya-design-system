/**
 * Spoken digest of one series for a chart's accessible name: first value,
 * last value and the peak with its label, so a screen-reader user gets the
 * shape of the data, not just "N points". Returns null when the series has
 * no finite values.
 */
export function seriesRange(
  points: ReadonlyArray<{ label: string | number; value: unknown }>,
  fmt: (v: number) => string,
  range: (first: string, last: string, peak: string, peakLabel: string) => string,
): string | null {
  const finite = points.filter((p): p is { label: string | number; value: number } => typeof p.value === 'number' && Number.isFinite(p.value));
  if (finite.length === 0) return null;
  let peak = finite[0];
  for (const p of finite) if (p.value > peak.value) peak = p;
  return range(fmt(finite[0].value), fmt(finite[finite.length - 1].value), fmt(peak.value), String(peak.label));
}
