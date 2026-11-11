import { render, screen, userEvent } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';

import { LoyaltyCardView } from './LoyaltyCardView';

jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) => select({ preference: 'light' }),
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const CARD: LoyaltyCard = {
  id: 'c1',
  code: 'ABCDEFGHJK',
  businessId: 'b1',
  businessName: 'Glow Studio',
  logoPath: null,
  programName: 'Glow Club',
  isActive: true,
  stamps: 3,
  stampsRequired: 8,
  rewardsAvailable: 0,
  rewardsRedeemed: 0,
  rewardTitle: 'Free blow-dry',
  rewardDescription: null,
  brandColor: '#6A58D8',
};

const view = (card: LoyaltyCard, onPress?: () => void) =>
  render(
    <ThemeProvider>
      <LoyaltyCardView card={card} {...(onPress ? { onPress } : {})} />
    </ThemeProvider>,
  );

describe('LoyaltyCardView', () => {
  it('shows the business, the program, the progress and the reward', async () => {
    await view(CARD);
    expect(screen.getByText('Glow Studio')).toBeOnTheScreen();
    expect(screen.getByText('Glow Club')).toBeOnTheScreen();
    expect(screen.getByText('3 of 8 stamps')).toBeOnTheScreen();
    expect(screen.getByText('Free blow-dry')).toBeOnTheScreen();
  });

  it('is described as one thing to a screen reader, with the progress in words', async () => {
    await view(CARD);
    expect(screen.getByLabelText('Glow Studio loyalty card, 3 of 8 stamps')).toBeOnTheScreen();
  });

  it('flags one reward that is ready', async () => {
    await view({ ...CARD, rewardsAvailable: 1 });
    expect(screen.getByText('Reward ready')).toBeOnTheScreen();
  });

  it('flags several rewards that are ready', async () => {
    await view({ ...CARD, rewardsAvailable: 3 });
    expect(screen.getByText('Rewards ready: 3')).toBeOnTheScreen();
  });

  it('shows no reward badge when there is none', async () => {
    await view(CARD);
    expect(screen.getByText('Glow Studio')).toBeOnTheScreen(); // the card is really there...
    expect(screen.queryByText(/ready/i)).not.toBeOnTheScreen(); // ...and has no badge
  });

  it('is tappable only when given somewhere to go', async () => {
    const onPress = jest.fn();
    await view(CARD, onPress);
    await userEvent.setup().press(screen.getByRole('button', { name: /Glow Studio loyalty card/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not a button when it has nowhere to go', async () => {
    await view(CARD);
    expect(screen.getByLabelText(/Glow Studio loyalty card/)).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it.each([
    [3, 8],
    [0, 2],
    [20, 20],
    [5, 5],
  ])('draws %i filled of %i stamp circles (decorative: hidden from screen readers, which hear the progress in words)', async (stamps, required) => {
    await view({ ...CARD, stamps, stampsRequired: required });
    expect(screen.queryAllByTestId('stamp-filled', { includeHiddenElements: true })).toHaveLength(stamps);
    expect(screen.queryAllByTestId('stamp-empty', { includeHiddenElements: true })).toHaveLength(required - stamps);
  });
});
