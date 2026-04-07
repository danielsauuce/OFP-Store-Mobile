import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, ColorScheme } from '@/constants/color';

// Keep splash screen visible while loading theme
SplashScreen.preventAutoHideAsync().catch(() => {});

// null = no explicit user preference, follow system
const THEME_KEY = 'app_theme_preference';

interface ThemeContextType {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  // null = not loaded yet, boolean = explicit user override
  const [userPreference, setUserPreference] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY)
      .then((val) => {
        if (val === 'true') setUserPreference(true);
        else if (val === 'false') setUserPreference(false);
        // else null = follow system
        setLoaded(true);
        // Hide splash screen after theme is loaded
        SplashScreen.hideAsync().catch(() => {});
      })
      .catch(() => {
        // Even if SecureStore fails, hide splash and use system theme
        setLoaded(true);
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);

  // Derived dark state: explicit preference wins, otherwise follow system
  const isDark = loaded
    ? userPreference !== null
      ? userPreference
      : systemScheme === 'dark'
    : systemScheme === 'dark'; // use system while loading to avoid flash

  const colors = isDark ? Colors.dark : Colors.light;

  const toggleTheme = () => {
    const next = !isDark;
    setUserPreference(next);
    SecureStore.setItemAsync(THEME_KEY, String(next));
  };

  return <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
