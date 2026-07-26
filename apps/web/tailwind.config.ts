import type { Config } from "tailwindcss";

/**
 * Tailwind consome os tokens via variáveis CSS definidas em
 * `@selecon/ui/tokens.css` (importado em `app/globals.css`) — nenhuma cor hardcoded
 * aqui, apenas o mapeamento nome-utilitário → variável (seção 5.2 do prompt mestre).
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
        "navy-primary": "var(--color-navy-primary)",
        "navy-secondary": "var(--color-navy-secondary)",
        "action-blue": "var(--color-action-blue)",
        "support-cyan": "var(--color-support-cyan)",
        "institutional-red": "var(--color-institutional-red)",
        "success-green": "var(--color-success-green)",
        "background-light": "var(--color-background-light)",
        surface: "var(--color-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
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
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        base: "var(--motion-duration-base)",
        slow: "var(--motion-duration-slow)",
      },
      screens: {
        xs: "360px",
      },
    },
  },
  plugins: [],
};

export default config;
