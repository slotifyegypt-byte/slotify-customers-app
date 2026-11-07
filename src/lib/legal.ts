import * as WebBrowser from 'expo-web-browser';

// The public legal pages, served by the Slotify website. The app stores and
// the in-app links must point at the same addresses.
export const LEGAL_URLS = {
  privacy: 'https://slotify-eg.com/privacy',
  terms: 'https://slotify-eg.com/terms',
  deleteAccount: 'https://slotify-eg.com/delete-account',
} as const;

export type LegalPage = keyof typeof LEGAL_URLS;

// Opens in the system's in-app browser (SFSafariViewController / Custom Tabs),
// so the user stays in the app. Failing to open a page is never worth a crash.
export async function openLegalUrl(page: LegalPage): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(LEGAL_URLS[page]);
  } catch {
    // No browser available: nothing useful to do.
  }
}
