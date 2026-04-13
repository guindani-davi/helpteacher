/**
 * Design tokens shared between backend (emails, PDF reports) and frontend (theme).
 * Single source of truth for the visual identity of Help Teacher.
 */

export const colors = {
  primary: "#2563eb",
  primaryDark: "#1e40af",
  primaryLight: "#eff6ff",
  accent: "#d97706",
  accentDark: "#b45309",
  accentLight: "#fffbeb",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  border: "#d1d5db",
  borderLight: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  altRowBg: "#f9fafb",
} as const;

export const fonts = {
  sans: "'Segoe UI', Arial, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
} as const;

export type Colors = typeof colors;
export type Fonts = typeof fonts;
export type Spacing = typeof spacing;
