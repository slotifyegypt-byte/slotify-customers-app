import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import { createSupportTicket } from '../api/supportApi';
import { hiddenKey, useHiddenContentStore } from '../store/hiddenContentStore';

import { ReportSheet } from './ReportSheet';

jest.mock('../api/supportApi', () => ({ createSupportTicket: jest.fn() }));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const createTicket = createSupportTicket as jest.Mock;

const renderSheet = async (onClose = jest.fn()) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  await render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ReportSheet target={{ kind: 'review', id: 'r-1' }} onClose={onClose} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return onClose;
};

beforeEach(() => {
  createTicket.mockReset();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  useHiddenContentStore.setState({ hidden: {} });
});

describe('ReportSheet', () => {
  it('cannot be sent until a reason is chosen', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByText('Send report'));
    expect(createTicket).not.toHaveBeenCalled();
  });

  it('files the report as a support ticket, hides the item and confirms', async () => {
    createTicket.mockResolvedValue({ id: 't1' });
    const onClose = await renderSheet();

    await fireEvent.press(screen.getByText('Fake or misleading'));
    await fireEvent.changeText(
      screen.getByPlaceholderText('Anything else we should know?'),
      'lies',
    );
    await fireEvent.press(screen.getByText('Send report'));

    await waitFor(() =>
      expect(createTicket.mock.calls[0][0]).toEqual({
        subject: 'Report: review r-1',
        message: 'Kind: review\nTarget ID: r-1\nReason: Fake or misleading\nNote: lies',
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useHiddenContentStore.getState().hidden[hiddenKey('review', 'r-1')]).toBe(true);
    // Not at once: an alert raised while the sheet is still sliding away is dropped on iOS.
    expect(Alert.alert).not.toHaveBeenCalledWith('Report sent', expect.any(String));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Report sent', expect.any(String)),
    );
  });

  it('keeps the item visible and the sheet open when sending fails', async () => {
    createTicket.mockRejectedValue(new Error('offline'));
    const onClose = await renderSheet();

    await fireEvent.press(screen.getByText('Spam'));
    await act(async () => {
      await fireEvent.press(screen.getByText('Send report'));
    });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith("Couldn't send your report", expect.any(String)),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(useHiddenContentStore.getState().hidden).toEqual({});
  });
});
