import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import i18n from '@/lib/i18n';
import { Sentry } from '@/lib/sentry';
import { ThemeProvider } from '@/theme';

import { ErrorBoundary } from './ErrorBoundary';

jest.mock('@/lib/sentry', () => ({ Sentry: { captureException: jest.fn() } }));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));

let shouldCrash = true;
function Bomb() {
  if (shouldCrash) throw new Error('boom');
  return <Text>recovered</Text>;
}

const renderBoundary = () =>
  render(
    <ThemeProvider>
      <ErrorBoundary boundary="test">
        <Bomb />
      </ErrorBoundary>
    </ThemeProvider>,
  );

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldCrash = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('shows a calm fallback and reports the crash with its boundary name', async () => {
    await renderBoundary();
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('Try again')).toBeOnTheScreen();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ boundary: 'test' }) }),
    );
  });

  it('renders the children again after "Try again" once the cause is gone', async () => {
    await renderBoundary();
    shouldCrash = false;
    await fireEvent.press(screen.getByText('Try again'));
    expect(screen.getByText('recovered')).toBeOnTheScreen();
  });

  it('speaks Arabic when the app language is Arabic', async () => {
    await i18n.changeLanguage('ar');
    try {
      await renderBoundary();
      expect(screen.getByText('حدث خطأ ما')).toBeOnTheScreen();
      expect(screen.getByText('إعادة المحاولة')).toBeOnTheScreen();
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
