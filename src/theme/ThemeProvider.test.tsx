import { render } from '@testing-library/react-native';
import { Appearance, Text } from 'react-native';

import { ThemeProvider, useTheme } from './ThemeProvider';

let mockPreference: 'system' | 'light' | 'dark' = 'light';
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: mockPreference }),
}));

function Probe() {
  const { scheme } = useTheme();
  return <Text>{scheme}</Text>;
}

describe('ThemeProvider native appearance', () => {
  let setColorScheme: jest.SpyInstance;
  beforeEach(() => {
    setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined);
  });
  afterEach(() => setColorScheme.mockRestore());

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
  ] as const)(
    'pins the native appearance to an explicit %s choice',
    async (preference, expected) => {
      mockPreference = preference;
      const { getByText } = await render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );
      expect(setColorScheme).toHaveBeenCalledWith(expected);
      expect(getByText(expected)).toBeOnTheScreen();
    },
  );

  it('hands control back to the OS for "System"', async () => {
    mockPreference = 'system';
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(setColorScheme).toHaveBeenCalledWith('unspecified');
  });
});
