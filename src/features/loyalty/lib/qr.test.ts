import jsQR from 'jsqr';

import { qrMatrix, qrRuns } from './qr';

/** Draws the matrix the way a screen does (dark modules on white, with a quiet zone) so a real decoder can read it. */
function bitmap(matrix: boolean[][], scale = 6, quiet = 4) {
  const size = (matrix.length + quiet * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  matrix.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (!dark) return;
      for (let y = 0; y < scale; y++)
        for (let x = 0; x < scale; x++) {
          const i = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
          data[i] = data[i + 1] = data[i + 2] = 0;
        }
    }),
  );
  return { data, size };
}

describe('qrMatrix', () => {
  it('is a square grid and deterministic', () => {
    const m = qrMatrix('ABCDEFGHJK');
    expect(m.length).toBe(21); // version 1: a 10-character code fits the smallest QR
    expect(m.every((row) => row.length === 21)).toBe(true);
    expect(qrMatrix('ABCDEFGHJK')).toEqual(m);
    expect(qrMatrix('ABCDEFGHJM')).not.toEqual(m);
  });

  it('has the three finder patterns in the corners', () => {
    const m = qrMatrix('ABCDEFGHJK');
    const finder = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111'];
    const at = (r0: number, c0: number) => finder.map((_, r) => m[r0 + r]!.slice(c0, c0 + 7).map((d) => (d ? '1' : '0')).join(''));
    expect(at(0, 0)).toEqual(finder);
    expect(at(0, 14)).toEqual(finder);
    expect(at(14, 0)).toEqual(finder);
  });

  it.each(['ABCDEFGHJK', 'ZZZZZZZZZZ', '2345678923', 'MNPQRSTUVW'])('a real QR decoder reads %s back', (code) => {
    const { data, size } = bitmap(qrMatrix(code));
    expect(jsQR(data, size, size)?.data).toBe(code);
  });
});

describe('qrRuns', () => {
  it('covers exactly the dark modules, merging neighbours into bars', () => {
    const m = qrMatrix('ABCDEFGHJK');
    const dark = m.flat().filter(Boolean).length;
    const runs = qrRuns(m);
    expect(runs.reduce((n, r) => n + r.length, 0)).toBe(dark);
    expect(runs.length).toBeLessThan(dark); // neighbouring modules are merged into one bar
    // and rebuilding the grid from the runs gives the original back
    const rebuilt = m.map((row) => row.map(() => false));
    for (const r of runs) for (let i = 0; i < r.length; i++) rebuilt[r.row]![r.col + i] = true;
    expect(rebuilt).toEqual(m);
  });

  it('handles runs at the edges, gaps and an all-dark / all-light row', () => {
    expect(qrRuns([[true, true, false, true]])).toEqual([
      { row: 0, col: 0, length: 2 },
      { row: 0, col: 3, length: 1 },
    ]);
    expect(qrRuns([[false, false, false]])).toEqual([]);
    expect(qrRuns([[true, true, true]])).toEqual([{ row: 0, col: 0, length: 3 }]);
    expect(qrRuns([[false, true, true]])).toEqual([{ row: 0, col: 1, length: 2 }]);
    expect(qrRuns([])).toEqual([]);
  });
});
