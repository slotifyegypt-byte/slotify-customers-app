import { Redirect, useLocalSearchParams } from 'expo-router';

/** slotify://loyalty/join/<code>: what the business's QR holds. Opens the Add card screen, which joins with that code. */
export default function JoinLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <Redirect href={{ pathname: '/(tabs)/profile/loyalty-join', params: { code } }} />;
}
