import { hiddenKey, MAX_HIDDEN, useHiddenContentStore } from './hiddenContentStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('hiddenContentStore', () => {
  beforeEach(() => useHiddenContentStore.setState({ hidden: {} }));

  it('hides a review or message on this device', () => {
    useHiddenContentStore.getState().hide('review', 'r-1');
    const { hidden } = useHiddenContentStore.getState();
    expect(hidden[hiddenKey('review', 'r-1')]).toBe(true);
    expect(hidden[hiddenKey('message', 'r-1')]).toBeUndefined();
  });
});

describe('hiddenContentStore limits and clearing', () => {
  beforeEach(() => useHiddenContentStore.setState({ hidden: {} }));

  it('forgets everything on clear', () => {
    const { hide, clear } = useHiddenContentStore.getState();
    hide('review', 'r-1');
    hide('message', 'm-1');
    clear();
    expect(useHiddenContentStore.getState().hidden).toEqual({});
  });

  it('keeps only the most recent reports so the stored value stays small', () => {
    const { hide } = useHiddenContentStore.getState();
    for (let i = 0; i < MAX_HIDDEN + 10; i++) hide('review', `r-${i}`);
    const keys = Object.keys(useHiddenContentStore.getState().hidden);
    expect(keys).toHaveLength(MAX_HIDDEN);
    expect(keys[0]).toBe(hiddenKey('review', 'r-10'));
    expect(keys[keys.length - 1]).toBe(hiddenKey('review', `r-${MAX_HIDDEN + 9}`));
  });

  it('stays well under the 2 KB secure-store limit when full', () => {
    const { hide } = useHiddenContentStore.getState();
    const uuid = (i: number) => `3f2b8c1e-5d4a-4e6f-9a7b-${String(i).padStart(12, '0')}`;
    for (let i = 0; i < MAX_HIDDEN + 5; i++) hide('message', uuid(i));
    expect(JSON.stringify(useHiddenContentStore.getState().hidden).length).toBeLessThan(2048);
  });
});
