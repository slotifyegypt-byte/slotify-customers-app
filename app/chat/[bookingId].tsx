import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OrderChatScreen } from '@/features/chat/screens/OrderChatScreen';

export default function ChatRoute() {
  return (
    <ErrorBoundary boundary="Order chat">
      <OrderChatScreen />
    </ErrorBoundary>
  );
}
