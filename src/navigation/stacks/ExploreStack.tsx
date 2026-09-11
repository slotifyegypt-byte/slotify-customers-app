import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../types';

import ExploreScreen from '@/screens/explore/ExploreScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={ExploreScreen} />
    </Stack.Navigator>
  );
}
