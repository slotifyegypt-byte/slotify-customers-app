import { extractJoinCode } from './joinCode';

describe('extractJoinCode', () => {
  it('reads the code out of the QR a business shows', () => {
    expect(extractJoinCode('slotify://loyalty/join/ABCDEFGHJK')).toBe('ABCDEFGHJK');
  });
  it('accepts a code typed by hand, in any case, with a dash or spaces', () => {
    expect(extractJoinCode('abcde-fghjk')).toBe('ABCDEFGHJK');
    expect(extractJoinCode('  ABCDE FGHJK ')).toBe('ABCDEFGHJK');
  });
  it('rejects anything else, so a stray QR code never reaches the server', () => {
    expect(extractJoinCode('https://example.com/ABCDEFGHJK')).toBeNull();
    expect(extractJoinCode('slotify://loyalty/join/short')).toBeNull();
    expect(extractJoinCode('hello')).toBeNull();
    expect(extractJoinCode('')).toBeNull();
  });
});
