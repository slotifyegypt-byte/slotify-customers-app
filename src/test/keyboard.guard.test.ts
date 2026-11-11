// Android draws edge to edge, so the system no longer resizes the window when the keyboard opens. A KeyboardAvoidingView
// that does nothing on Android (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`) leaves inputs hidden behind the keyboard.
type Fs = { readdirSync(p: string, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[]; readFileSync(p: string, e: 'utf8'): string };

function sources(fs: Fs, dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    return e.isDirectory() ? sources(fs, p) : /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name) ? [p] : [];
  });
}

describe('keyboard avoidance', () => {
  it('never switches itself off on Android', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as Fs; // Node's fs is not in this project's type set, so it is typed by hand above
    const root = (globalThis as unknown as { process: { cwd(): string } }).process.cwd();
    const offenders = sources(fs, `${root}/src`).filter((f) => /behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
