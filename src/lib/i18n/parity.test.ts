import ar from './ar.json';
import en from './en.json';

// Every string the app can show must exist in both languages with the same {{placeholders}}. Arabic has six plural
// forms (zero, one, two, few, many, other) where English has two, so plural suffixes are compared by their base key.

type Tree = { [key: string]: string | Tree };

const PLURAL = /_(zero|one|two|few|many|other)$/;

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

const placeholders = (text: string) => [...new Set(text.match(/\{\{\s*\w+\s*\}\}/g) ?? [])].sort();
const base = (path: string) => path.replace(PLURAL, '');

const english = flatten(en as Tree);
const arabic = flatten(ar as Tree);

describe('translations', () => {
  it('has no empty string in either language', () => {
    for (const [path, text] of [...Object.entries(english), ...Object.entries(arabic)]) {
      expect([path, text.trim().length > 0]).toEqual([path, true]);
    }
  });

  it('has every English string in Arabic', () => {
    const arabicBases = new Set(Object.keys(arabic).map(base));
    const missing = [...new Set(Object.keys(english).map(base))].filter((k) => !arabicBases.has(k));
    expect(missing).toEqual([]);
  });

  it('has no Arabic string without an English one', () => {
    const englishBases = new Set(Object.keys(english).map(base));
    const orphans = [...new Set(Object.keys(arabic).map(base))].filter((k) => !englishBases.has(k));
    expect(orphans).toEqual([]);
  });

  it('keeps the same {{placeholders}} in both languages', () => {
    const mismatched: string[] = [];
    for (const [path, text] of Object.entries(english)) {
      // Plural forms are skipped: Arabic "one" and "two" spell the number out, so they carry no {{count}}.
      if (PLURAL.test(path)) continue;
      if (arabic[path] === undefined) continue; // covered by the "missing" test
      if (placeholders(text).join() !== placeholders(arabic[path]).join()) mismatched.push(path);
    }
    expect(mismatched).toEqual([]);
  });

  it('keeps {{count}} in the plural forms that use a number', () => {
    const broken = Object.entries(english)
      .filter(([path, text]) => PLURAL.test(path) && text.includes('{{count}}'))
      .flatMap(([path]) =>
        ['few', 'many', 'other']
          .map((form) => `${base(path)}_${form}`)
          .filter((key) => arabic[key] !== undefined && !arabic[key].includes('{{count}}')),
      );
    expect(broken).toEqual([]);
  });

  it('gives every Arabic plural all six forms', () => {
    const groups = new Map<string, Set<string>>();
    for (const path of Object.keys(arabic)) {
      const match = PLURAL.exec(path);
      if (!match) continue;
      groups.set(base(path), (groups.get(base(path)) ?? new Set()).add(match[1]));
    }
    const incomplete = [...groups].filter(([, forms]) => forms.size < 6).map(([key]) => key);
    expect(incomplete).toEqual([]);
  });
});
