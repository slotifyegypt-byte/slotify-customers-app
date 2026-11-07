import { AppState } from 'react-native';

const mockOnlineSetListener = jest.fn();
const mockFocusSetListener = jest.fn();
const mockNetInfoListen = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  onlineManager: { setEventListener: (...args: unknown[]) => mockOnlineSetListener(...args) },
  focusManager: { setEventListener: (...args: unknown[]) => mockFocusSetListener(...args) },
}));
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: (...args: unknown[]) => mockNetInfoListen(...args) },
}));

describe('setupQueryManagers', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const load = () => {
    let setup!: () => void;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh module copy per test
      setup = require('./managers').setupQueryManagers;
    });
    return setup;
  };

  it('wires online and focus once, however often it is called', () => {
    const setup = load();
    setup();
    setup();
    expect(mockOnlineSetListener).toHaveBeenCalledTimes(1);
    expect(mockFocusSetListener).toHaveBeenCalledTimes(1);
  });

  it('treats a dropped connection as offline, an unknown reachability as online', () => {
    load()();
    const subscribe = mockOnlineSetListener.mock.calls[0][0];
    const setOnline = jest.fn();
    subscribe(setOnline);
    const onChange = mockNetInfoListen.mock.calls[0][0];

    onChange({ isConnected: false, isInternetReachable: false });
    onChange({ isConnected: true, isInternetReachable: null });
    onChange({ isConnected: true, isInternetReachable: false });
    onChange({ isConnected: true, isInternetReachable: true });
    onChange({ isConnected: null, isInternetReachable: null });

    expect(setOnline.mock.calls.map(([v]) => v)).toEqual([false, true, false, true, true]);
  });

  it('reports the app as focused only while it is in the foreground, and unsubscribes', () => {
    const remove = jest.fn();
    const addListener = jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });
    load()();
    const subscribe = mockFocusSetListener.mock.calls[0][0];
    const handleFocus = jest.fn();
    const unsubscribe = subscribe(handleFocus);

    const onChange = addListener.mock.calls[0][1] as (status: string) => void;
    onChange('active');
    onChange('background');
    onChange('inactive');
    expect(handleFocus.mock.calls.map(([v]) => v)).toEqual([true, false, false]);

    unsubscribe();
    expect(remove).toHaveBeenCalled();
    addListener.mockRestore();
  });
});
