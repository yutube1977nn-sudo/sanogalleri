import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useColorScheme, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Palette {
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  text: string;
  textDim: string;
  textFaint: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  tabBar: string;
  overlay: string;
  isDark: boolean;
}

const light: Palette = {
  bg: '#F4F5F9',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EEF0F6',
  text: '#14161D',
  textDim: '#5B6072',
  textFaint: '#9AA0B2',
  border: '#E6E8F0',
  primary: '#5A4CF0',
  primarySoft: '#ECEAFF',
  accent: '#00C2A8',
  danger: '#F0434F',
  success: '#17B978',
  warning: '#F5A623',
  tabBar: '#FFFFFF',
  overlay: 'rgba(14,16,24,0.55)',
  isDark: false,
};

const dark: Palette = {
  bg: '#0C0D12',
  bgElevated: '#15171F',
  card: '#171922',
  cardAlt: '#1F2230',
  text: '#F2F3F8',
  textDim: '#A6ABBD',
  textFaint: '#6B7085',
  border: '#262A38',
  primary: '#7C6FFF',
  primarySoft: '#241F45',
  accent: '#1FD8BE',
  danger: '#FF5964',
  success: '#2BD68A',
  warning: '#FFB443',
  tabBar: '#111219',
  overlay: 'rgba(0,0,0,0.65)',
  isDark: true,
};

interface ThemeCtx {
  c: Palette;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeCtx>({ c: dark, mode: 'system', setMode: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem('sano_theme').then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem('sano_theme', m);
  }, []);

  const resolved = mode === 'system' ? (sys === 'light' ? 'light' : 'dark') : mode;
  const c = resolved === 'light' ? light : dark;

  const value = useMemo(() => ({ c, mode, setMode }), [c, mode, setMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTheme = () => useContext(Ctx);

// Arabic font family helpers (system fonts render Arabic fine)
export const AR = {
  regular: undefined as string | undefined,
};

export const rtlText = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
