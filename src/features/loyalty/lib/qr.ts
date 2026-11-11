// QR codes without a native module: qrcode-generator makes the module grid and the screen draws it with plain Views.
import qrcode from 'qrcode-generator';

/** The QR grid for `text` (true = dark module). Error correction M: a screen-held code survives glare and scratches. */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'M'); // type 0 = the smallest version that fits
  qr.addData(text, 'Byte');
  qr.make();
  const size = qr.getModuleCount();
  return Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => qr.isDark(r, c)));
}

export interface Run {
  row: number;
  col: number;
  length: number;
}

/** The dark modules as horizontal runs: a few dozen bars instead of hundreds of squares, drawn with plain Views. */
export function qrRuns(matrix: boolean[][]): Run[] {
  const runs: Run[] = [];
  matrix.forEach((cells, row) => {
    let start = -1;
    cells.forEach((dark, col) => {
      if (dark && start < 0) start = col;
      if (start >= 0 && (!dark || col === cells.length - 1)) {
        runs.push({ row, col: start, length: (dark ? col + 1 : col) - start });
        start = -1;
      }
    });
  });
  return runs;
}
