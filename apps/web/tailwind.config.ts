import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v2 Premium — Portal Selecon
 * Consome os tokens via variáveis CSS definidas em @selecon/ui/tokens.css.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        soft: "var(--color-soft)",
        "soft-blue": "var(--color-soft-blue)",
        line: "var(--color-line)",
        "blue-950": "var(--color-blue-950)",
        "blue-900": "var(--color-blue-900)",
        "blue-800": "var(--color-blue-800)",
        "blue-700": "var(--color-blue-700)",
        green: {
          DEFAULT: "var(--color-green)",
          "700": "var(--color-green-700)",
          soft: "var(--color-green-soft)",
        },
        yellow: "var(--color-yellow)",
        red: "var(--color-red)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: ["var(--font-family-base)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        green: "var(--shadow-green)",
        dark: "var(--shadow-dark)",
      },
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        base: "var(--motion-duration-base)",
        slow: "var(--motion-duration-slow)",
      },
      maxWidth: {
        content: "var(--max-width)",
      },
      screens: {
        xs: "360px",
      },
      animation: {
        rise: "rise 0.8s ease both 0.18s",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(24px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
