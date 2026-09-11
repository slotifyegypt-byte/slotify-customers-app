import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types';

import ProfileScreen              from '@/screens/profile/ProfileScreen';
import EditProfileScreen          from '@/screens/profile/EditProfileScreen';
import LanguageScreen             from '@/screens/profile/LanguageScreen';
import FavouritesScreen           from '@/screens/profile/FavouritesScreen';
import NotificationSettingsScreen from '@/screens/profile/NotificationSettingsScreen';
import HelpFAQScreen              from '@/screens/profile/HelpFAQScreen';
import ContactUsScreen            from '@/screens/profile/ContactUsScreen';
import MyReviewsScreen            from '@/screens/profile/MyReviewsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile"              component={ProfileScreen} />
      <Stack.Screen name="EditProfile"          component={EditProfileScreen} />
      <Stack.Screen name="Language"             component={LanguageScreen} />
      <Stack.Screen name="Favourites"           component={FavouritesScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="HelpFAQ"              component={HelpFAQScreen} />
      <Stack.Screen name="ContactUs"            component={ContactUsScreen} />
      <Stack.Screen name="MyReviews"            component={MyReviewsScreen} />
    </Stack.Navigator>
  );
}
