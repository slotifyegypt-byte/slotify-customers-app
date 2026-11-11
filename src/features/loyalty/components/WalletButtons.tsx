import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';
import { useAddToWallet, useAvailableWallets } from '../hooks/useWallet';

// Apple and Google ask for their official "Add to Wallet" badge artwork in published apps. Until those assets are added
// these are the app's own buttons with the same wording.
export function WalletButtons({ card }: { card: LoyaltyCard }) {
  const { t } = useTranslation();
  const wallets = useAvailableWallets();
  const add = useAddToWallet();
  if (wallets.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <ThemedText variant="h3">{t('loyalty.walletTitle')}</ThemedText>
      {wallets.map((provider) => (
        <Button
          key={provider}
          label={provider === 'apple' ? t('loyalty.walletApple') : t('loyalty.walletGoogle')}
          icon="wallet-outline"
          variant="primary"
          loading={add.isPending && add.variables?.provider === provider}
          disabled={add.isPending}
          onPress={() => add.mutate({ provider, cardId: card.id })}
        />
      ))}
      {add.isError ? (
        <ThemedText variant="caption" color="danger" accessibilityRole="alert">
          {t('loyalty.walletError')}
        </ThemedText>
      ) : null}
    </View>
  );
}
