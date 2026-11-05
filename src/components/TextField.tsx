import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fontFamily, radius, spacing, useColors } from '@/theme';

import { ThemedText } from './ThemedText';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

/** A labelled text input: a sunken fill that lifts to white with an indigo edge on focus, and a clear error line. */
export function TextField({ label, error, hint, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText variant="captionStrong" color="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.brandAccent}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: focused ? colors.surface : colors.backgroundMuted,
            borderColor: error ? colors.danger : focused ? colors.brandAccent : 'transparent',
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText variant="caption" color="danger" style={styles.note}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption" color="textTertiary" style={styles.note}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  label: { marginBottom: 6 },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
  },
  note: { marginTop: 6 },
});
