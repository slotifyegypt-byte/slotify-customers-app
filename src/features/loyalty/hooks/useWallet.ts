import { useMutation, useQuery } from '@tanstack/react-query';
import { Linking, Platform } from 'react-native';

import { getWalletCapabilities, getWalletLink } from '../api/loyaltyApi';
import { loyaltyKeys } from '../api/queryKeys';
import { availableWallets, type WalletProvider } from '../lib/wallet';

/** The "Add to wallet" buttons this phone should show (none until the server has answered). */
export function useAvailableWallets(): WalletProvider[] {
  const caps = useQuery({ queryKey: loyaltyKeys.capabilities(), queryFn: getWalletCapabilities, staleTime: 300_000 });
  return availableWallets(caps.data, Platform.OS);
}

/** Gets the link and hands it to the system: Safari adds an Apple pass, Google's save page opens in Google Wallet. */
export function useAddToWallet() {
  return useMutation({
    mutationFn: async (v: { provider: WalletProvider; cardId: string }) => {
      const url = await getWalletLink(v.provider, v.cardId);
      await Linking.openURL(url);
    },
  });
}
