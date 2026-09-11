import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ─── Root stack ───────────────────────────────────────────────────────────────
// Unauthenticated screens and root-level modals all live here.

export type RootStackParamList = {
  // Auth (shown when not authenticated)
  SignIn: undefined;

  // Main shell (shown when authenticated)
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Root-level pushed screen (accessible from any tab via the bell icon)
  Notifications: undefined;

  // Root-level modals — presentation: 'modal' (slide-up bottom sheet feel)
  BookingSheet: {
    storeId: string;
    /** Services the user has already selected; pre-fills the sheet. */
    preselectedServiceIds?: string[];
  };
  RebookSheet: {
    /** The past BookingRead.id to clone slots from. */
    bookingId: string;
  };
  CancelBooking: { bookingId: string };

  // Root-level modals — presentation: 'fullScreenModal'
  Confirmation: { bookingId: string };
  /** Shown when the session expires while the user is inside the app. */
  SignedOut: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// ─── Bottom tabs ──────────────────────────────────────────────────────────────

export type MainTabParamList = {
  HomeTab:     NavigatorScreenParams<HomeStackParamList>;
  ExploreTab:  NavigatorScreenParams<ExploreStackParamList>;
  ActivityTab: NavigatorScreenParams<ActivityStackParamList>;
  ProfileTab:  NavigatorScreenParams<ProfileStackParamList>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// ─── Home stack ───────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  Search: { initialQuery?: string; categoryKey?: string };
  CategoryListing: { categoryKey: string; categoryLabel: string };
  VenueDetail: { storeId: string };
  ServiceBookingConfig: { storeId: string; serviceId: string };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<'HomeTab'>
  >;

// ─── Explore stack ────────────────────────────────────────────────────────────

export type ExploreStackParamList = {
  Explore: undefined;
};

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExploreStackParamList, T>,
    MainTabScreenProps<'ExploreTab'>
  >;

// ─── Activity stack ───────────────────────────────────────────────────────────

export type ActivityStackParamList = {
  Activity: undefined;
  AppointmentDetail: { bookingId: string };
  TicketTracker: { bookingId: string };
  OrderChat: { bookingId: string };
  OnsiteDetail: { bookingId: string };
};

export type ActivityStackScreenProps<T extends keyof ActivityStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ActivityStackParamList, T>,
    MainTabScreenProps<'ActivityTab'>
  >;

// ─── Profile stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Language: undefined;
  Favourites: undefined;
  NotificationSettings: undefined;
  HelpFAQ: undefined;
  ContactUs: undefined;
  MyReviews: undefined;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<'ProfileTab'>
  >;

// ─── Global type augmentation ─────────────────────────────────────────────────
// Allows useNavigation() to be typed without generics in leaf screens.

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
