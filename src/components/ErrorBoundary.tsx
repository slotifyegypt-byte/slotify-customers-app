import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sentry } from '@/lib/sentry';
import { spacing } from '@/theme';

import { Button } from './Button';
import { ThemedText } from './ThemedText';

interface Props {
  children: ReactNode;
  /** Identifies which part of the tree failed, for Sentry breadcrumbs. */
  boundary: string;
}

interface State {
  error: Error | null;
}

/**
 * One of these should wrap each Router layout level (root, per-tab, chat
 * screen) so a crash in one tab/screen doesn't blank the whole app — see
 * the system design plan's "Observability" section.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    Sentry.captureException(error, { extra: { boundary: this.props.boundary, ...info } });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ThemedText variant="h3" style={styles.center}>
            Something broke
          </ThemedText>
          <ThemedText variant="body" color="textSecondary" style={[styles.center, styles.spaced]}>
            {this.props.boundary} ran into an error.
          </ThemedText>
          <Button label="Try again" onPress={this.reset} fullWidth={false} style={styles.spaced} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  center: { textAlign: 'center' },
  spaced: { marginTop: spacing.sm },
});
