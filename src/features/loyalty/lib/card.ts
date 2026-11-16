// Pure helpers for drawing a loyalty card. The colour is the business's own, so text colour is computed.

/** ABCDE-FGHJK. Anything that is not a whole 10-character code is returned unchanged. */
export function formatCode(code: string): string {
  return /^[A-Z0-9]{10}$/.test(code) ? `${code.slice(0, 5)}-${code.slice(5)}` : code;
}

export function stampCells(stamps: number, required: number): ('filled' | 'empty')[] {
  const total = Math.max(0, Math.floor(required));
  const filled = Math.min(total, Math.max(0, Math.floor(stamps)));
  return Array.from({ length: total }, (_, i) => (i < filled ? 'filled' : 'empty'));
}

/**
 * The stamps a card should show. The database turns a full card into a ready reward and starts the next card at 0, but
 * a customer who has just earned a reward should see the full card, not an empty one: 0 with a reward waiting is drawn
 * as full, and the next stamp then shows as 1.
 */
export function displayStamps(card: {
  stamps: number;
  stampsRequired: number;
  rewardsAvailable: number;
}): number {
  return card.rewardsAvailable > 0 && card.stamps === 0 ? card.stampsRequired : card.stamps;
}

/** One row up to 5 stamps, then two balanced rows. */
export function stampColumns(required: number): number {
  return required <= 5 ? Math.max(1, required) : Math.ceil(required / 2);
}

/** Whichever of white or near-black text has the higher WCAG contrast on the card colour. */
export function inkOn(hex: string): '#FFFFFF' | '#18181B' {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return '#FFFFFF';
  const lin = (h: string) => {
    const s = parseInt(h, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const l = 0.2126 * lin(m[1]!) + 0.7152 * lin(m[2]!) + 0.0722 * lin(m[3]!);
  const white = 1.05 / (l + 0.05);
  const dark = (l + 0.05) / (0.0091 + 0.05); // #18181B has relative luminance ~0.0091
  return white >= dark ? '#FFFFFF' : '#18181B';
}
