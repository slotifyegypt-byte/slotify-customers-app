// One muted hue per name, the same everywhere (avatars, photo placeholders): a person or place keeps its colour.
const HUES = ['#4B3BA6', '#0F7B6B', '#A8680B', '#C73E4A', '#2F6FA8'] as const;

export function hueFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return HUES[hash % HUES.length]!;
}
