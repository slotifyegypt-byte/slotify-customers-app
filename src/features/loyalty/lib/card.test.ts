import { formatCode, inkOn, stampCells, stampColumns } from './card';

describe('formatCode', () => {
  it('shows ten characters as two groups of five, anything else unchanged', () => {
    expect(formatCode('ABCDEFGHJK')).toBe('ABCDE-FGHJK');
    expect(formatCode('abc')).toBe('abc');
  });
});

describe('stamp layout', () => {
  it('fills the first N cells and clamps nonsense', () => {
    expect(stampCells(3, 5)).toEqual(['filled', 'filled', 'filled', 'empty', 'empty']);
    expect(stampCells(9, 4)).toEqual(['filled', 'filled', 'filled', 'filled']);
    expect(stampCells(-2, 3)).toEqual(['empty', 'empty', 'empty']);
    expect(stampCells(1, 0)).toEqual([]);
  });
  it('one row up to 5 stamps, then two balanced rows', () => {
    expect([2, 5, 6, 8, 9, 20].map(stampColumns)).toEqual([2, 5, 3, 4, 5, 10]);
  });
});

describe('inkOn', () => {
  it('picks whichever of white or near-black reads better on the card colour', () => {
    expect(inkOn('#6A58D8')).toBe('#FFFFFF');
    expect(inkOn('#F59F00')).toBe('#18181B');
    expect(inkOn('#0EA5A4')).toBe('#18181B');
    expect(inkOn('#D6336C')).toBe('#FFFFFF');
    expect(inkOn('nonsense')).toBe('#FFFFFF');
  });
});
