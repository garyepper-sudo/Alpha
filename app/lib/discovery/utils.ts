export function stableId(prefix: string, input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

export function splitStatements(content: string) {
  return content
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24)
    .slice(0, 40);
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function confidenceBand(score: number) {
  if (score >= 0.86) return "Very High";
  if (score >= 0.7) return "Strong";
  if (score >= 0.52) return "Stabilizing";
  if (score >= 0.32) return "Emerging";
  return "Low";
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
