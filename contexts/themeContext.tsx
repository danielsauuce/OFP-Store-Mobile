import { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, Theme, ColorScheme } from '@/constants/color';

type ThemeContextType = {
  theme: Theme;
  colors: ColorScheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};
