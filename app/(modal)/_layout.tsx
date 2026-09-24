import { Stack } from 'expo-router';

export default function ModalStackLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: true }}>
      {/* headerShown: false on all three — BookingFlow/ConfirmationScreen
          render their own custom header (or, for confirmation, none at all,
          matching 27-booking-confirmation.png's headerless design — exit is
          via the in-content "Back to home" link). A native title bar here
          would just duplicate that chrome. */}
      <Stack.Screen name="booking-sheet" options={{ headerShown: false }} />
      <Stack.Screen name="rebook-sheet" options={{ headerShown: false }} />
      <Stack.Screen name="confirmation" options={{ headerShown: false }} />
      <Stack.Screen
        name="cancel-booking"
        options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="write-review" options={{ title: 'Write a Review' }} />
      {/* headerShown: false — RescheduleBookingScreen renders its own
          ScreenHeader, same as BookingFlow's header above. */}
      <Stack.Screen name="reschedule-booking" options={{ headerShown: false }} />
    </Stack>
  );
}
