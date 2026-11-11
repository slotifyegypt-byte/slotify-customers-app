// What a business's join QR carries, and what a customer may type instead. 10 characters from an alphabet without look-alikes
// (matches the database); the QR holds them inside a slotify:// link.
const PREFIX = 'slotify://loyalty/join/';
const VALID = /^[A-HJKMNP-Z2-9]{10}$/;

const clean = (input: string) => input.replace(/[\s\-‐-―−]/g, '').toUpperCase();

/** The join code in a scanned QR or typed text, or null if it is not one. */
export function extractJoinCode(input: string): string | null {
  const text = input.trim();
  const code = clean(text.startsWith(PREFIX) ? text.slice(PREFIX.length) : text);
  return VALID.test(code) ? code : null;
}
