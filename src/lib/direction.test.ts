import { I18nManager } from 'react-native';

import { directional } from './direction';

describe('directional', () => {
  afterEach(() => {
    Object.defineProperty(I18nManager, 'isRTL', { configurable: true, get: () => false });
  });

  it('leaves arrows alone when reading left to right', () => {
    expect(directional('chevron-forward')).toBe('chevron-forward');
    expect(directional('arrow-back')).toBe('arrow-back');
  });

  it('turns back and forward around when reading right to left', () => {
    Object.defineProperty(I18nManager, 'isRTL', { configurable: true, get: () => true });
    expect(directional('chevron-forward')).toBe('chevron-back');
    expect(directional('chevron-back')).toBe('chevron-forward');
    expect(directional('arrow-back')).toBe('arrow-forward');
    expect(directional('star')).toBe('star'); // not directional
  });
});
