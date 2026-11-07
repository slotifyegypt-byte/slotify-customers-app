import * as WebBrowser from 'expo-web-browser';

import { LEGAL_URLS, openLegalUrl } from './legal';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn().mockResolvedValue({}) }));

describe('legal links', () => {
  it('points at the public website pages', () => {
    expect(LEGAL_URLS).toEqual({
      privacy: 'https://slotify-eg.com/privacy',
      terms: 'https://slotify-eg.com/terms',
      deleteAccount: 'https://slotify-eg.com/delete-account',
    });
  });

  it('opens a page in the in-app browser', async () => {
    await openLegalUrl('terms');
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://slotify-eg.com/terms');
  });

  it('never throws when the browser cannot open', async () => {
    (WebBrowser.openBrowserAsync as jest.Mock).mockRejectedValueOnce(new Error('no browser'));
    await expect(openLegalUrl('privacy')).resolves.toBeUndefined();
  });
});
