import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Imperative navigation ref used by the API client's 401 interceptor to
// redirect to the SignedOut screen without needing a React context.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
