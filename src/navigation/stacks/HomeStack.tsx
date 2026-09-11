import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types';

import HomeScreen               from '@/screens/home/HomeScreen';
import SearchScreen             from '@/screens/home/SearchScreen';
import CategoryListingScreen    from '@/screens/home/CategoryListingScreen';
import VenueDetailScreen        from '@/screens/venue/VenueDetailScreen';
import ServiceBookingConfigScreen from '@/screens/venue/ServiceBookingConfigScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"                 component={HomeScreen} />
      <Stack.Screen name="Search"               component={SearchScreen} />
      <Stack.Screen name="CategoryListing"      component={CategoryListingScreen} />
      <Stack.Screen name="VenueDetail"          component={VenueDetailScreen} />
      <Stack.Screen name="ServiceBookingConfig" component={ServiceBookingConfigScreen} />
    </Stack.Navigator>
  );
}
