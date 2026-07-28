/**
 * Design Tokens v2 — Portal Selecon (Premium)
 * Interface premium inspirada em Stripe, Vercel, Linear e Apple.
 * Cores, tipografia, espaçamento, raios, elevações, motion e breakpoints.
 */

export const colorTokens = {
  // Core palette
  ink: "#081520",
  muted: "#617080",
  soft: "#f5f8fa",
  softBlue: "#e9f2f7",
  line: "#dce6ea",
  white: "#ffffff",

  // Blues
  blue950: "#051928",
  blue900: "#06243b",
  blue800: "#073a63",
  blue700: "#0a568d",

  // Accents
  green: "#00a783",
  green700: "#007a61",
  greenSoft: "#e8fff8",
  yellow: "#f4bd4f",
  red: "#c84f4f",
} as const;

export const gradientTokens = {
  hero: "linear-gradient(115deg, rgba(5,25,40,0.98), rgba(7,58,99,0.92) 54%, rgba(0,167,131,0.72))",
  brand: "linear-gradient(135deg, #073a63, #00a783)",
  softFade: "linear-gradient(180deg, #ffffff 0%, #f5f8fa 100%)",
  proofFade: "linear-gradient(180deg, #f5f8fa 0%, #ffffff 100%)",
} as const;

export const typographyTokens = {
  fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  size: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
  },
  lineHeight: {
    tight: "0.96",
    snug: "1.03",
    normal: "1.5",
    relaxed: "1.6",
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
  20: "5rem",
  24: "6rem",
} as const;

export const radiusTokens = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
} as const;

export const elevationTokens = {
  sm: "0 1px 2px rgba(8, 21, 32, 0.05)",
  md: "0 4px 16px rgba(8, 21, 32, 0.08)",
  lg: "0 24px 70px rgba(8, 21, 32, 0.12)",
  green: "0 16px 36px rgba(0, 167, 131, 0.24)",
  dark: "0 16px 36px rgba(8, 21, 32, 0.18)",
} as const;

export const focusTokens = {
  ringWidth: "3px",
  ringColor: colorTokens.green,
  ringOffset: "2px",
} as const;

export const motionTokens = {
  durationFast: "120ms",
  durationBase: "200ms",
  durationSlow: "320ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const breakpointTokens = {
  xs: "360px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

export const layoutTokens = {
  maxWidth: "1200px",
  headerHeight: "76px",
  sectionPadding: "92px",
  sectionPaddingMobile: "68px",
} as const;
