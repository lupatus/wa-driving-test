export interface ThemeColors {
  background: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  primarySoftText: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  track: string;
}

/**
 * Palette carried over from the original web app: blue-600 primary on a
 * gray-50 ground, with a dark counterpart for native + browser dark mode.
 */
export const Palette: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#f9fafb',
    card: '#ffffff',
    cardAlt: '#f3f4f6',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#2563eb',
    primaryText: '#ffffff',
    primarySoft: '#dbeafe',
    primarySoftText: '#1d4ed8',
    success: '#16a34a',
    successSoft: '#dcfce7',
    warning: '#d97706',
    warningSoft: '#fef3c7',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    track: '#e5e7eb',
  },
  dark: {
    background: '#0b1220',
    card: '#151d2e',
    cardAlt: '#1e2739',
    border: '#2a3549',
    text: '#f3f4f6',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    primary: '#3b82f6',
    primaryText: '#ffffff',
    primarySoft: '#1e3a8a',
    primarySoftText: '#bfdbfe',
    success: '#22c55e',
    successSoft: '#14532d',
    warning: '#f59e0b',
    warningSoft: '#451a03',
    danger: '#ef4444',
    dangerSoft: '#450a0a',
    track: '#2a3549',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Keeps wide browser windows from stretching the layout into a mess. */
export const MaxContentWidth = 720;
