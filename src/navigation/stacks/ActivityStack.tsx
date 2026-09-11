import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ActivityStackParamList } from '../types';

import ActivityScreen          from '@/screens/activity/ActivityScreen';
import AppointmentDetailScreen from '@/screens/activity/AppointmentDetailScreen';
import TicketTrackerScreen     from '@/screens/activity/TicketTrackerScreen';
import OrderChatScreen         from '@/screens/activity/OrderChatScreen';
import OnsiteDetailScreen      from '@/screens/activity/OnsiteDetailScreen';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export default function ActivityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Activity"          component={ActivityScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="TicketTracker"     component={TicketTrackerScreen} />
      <Stack.Screen name="OrderChat"         component={OrderChatScreen} />
      <Stack.Screen name="OnsiteDetail"      component={OnsiteDetailScreen} />
    </Stack.Navigator>
  );
}
