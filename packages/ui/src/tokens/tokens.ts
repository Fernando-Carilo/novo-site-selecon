/**
 * Design tokens centralizados — seção 5.2 do prompt mestre. Nenhuma cor deve ser
 * hardcoded em componentes: sempre referenciar estes tokens (ou as variáveis CSS
 * equivalentes em `tokens.css`, usadas pela configuração Tailwind de `apps/web`).
 */
export const colorTokens = {
  navyPrimary: "#071B3D",
  navySecondary: "#0B2D60",
  actionBlue: "#0B66D4",
  supportCyan: "#23B5E8",
  institutionalRed: "#D52B3F",
  successGreen: "#12805C",
  backgroundLight: "#F3F7FB",
  surface: "#FFFFFF",
  textPrimary: "#14233D",
  textSecondary: "#61708A",
  border: "#DCE6F2",
} as const;

export const typographyTokens = {
  fontFamily: '"Inter", "Public Sans", system-ui, -apple-system, sans-serif',
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
} as const;

export const spacingTokens = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const radiusTokens = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
} as const;

export const elevationTokens = {
  low: "0 1px 2px 0 rgba(7, 27, 61, 0.06)",
  medium: "0 4px 12px 0 rgba(7, 27, 61, 0.10)",
  high: "0 12px 32px 0 rgba(7, 27, 61, 0.16)",
} as const;

export const focusTokens = {
  ringWidth: "3px",
  ringColor: colorTokens.actionBlue,
  ringOffset: "2px",
} as const;

export const motionTokens = {
  durationFast: "120ms",
  durationBase: "200ms",
  durationSlow: "320ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/** Breakpoints — seção 5.3 do prompt mestre. */
export const breakpointTokens = {
  mobileSmall: "360px",
  mobileLarge: "390px",
  tablet: "768px",
  desktop: "1280px",
  desktopLarge: "1440px",
} as const;
