import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useThemePreferenceStore, type ThemePreference } from '@/lib/theme/themePreferenceStore';

import { colorSchemes, type Colors } from './colors';

export type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  scheme: ResolvedScheme;
  preference: ThemePreference;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useThemePreferenceStore((state) => state.preference);

  // useColorScheme() can also return 'unspecified' (Android, no explicit
  // setting) or null — both fall back to 'light', same as an explicit
  // 'light' preference does.
  const scheme: ResolvedScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, preference, colors: colorSchemes[scheme] }),
    [scheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme/useColors must be used within <ThemeProvider>');
  return ctx;
}

// Resolved 'light' | 'dark' plus the raw preference ('system' | 'light' |
// 'dark') — for screens (e.g. the Appearance setting) that need to know
// which option is currently selected, not just what it resolved to.
export function useTheme(): ThemeContextValue {
  return useThemeContext();
}

// The color palette for the resolved theme — the reactive drop-in
// replacement for the old static `colors` import, for use inside components.
export function useColors(): Colors {
  return useThemeContext().colors;
}
