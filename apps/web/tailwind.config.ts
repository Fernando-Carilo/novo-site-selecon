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
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy-primary": "var(--color-navy-primary)",
        "navy-secondary": "var(--color-navy-secondary)",
        "action-blue": "var(--color-action-blue)",
        "action-blue-hover": "var(--color-action-blue-hover)",
        "support-cyan": "var(--color-support-cyan)",
        "institutional-red": "var(--color-institutional-red)",
        "success-green": "var(--color-success-green)",
        "warning-amber": "var(--color-warning-amber)",
        "background-light": "var(--color-background-light)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        "wash-blue": "var(--color-wash-blue)",
        "wash-cyan": "var(--color-wash-cyan)",
        "wash-green": "var(--color-wash-green)",
        "wash-amber": "var(--color-wash-amber)",
        "wash-red": "var(--color-wash-red)",
        "wash-neutral": "var(--color-wash-neutral)",
      },
      fontFamily: {
        sans: ["var(--font-family-base)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        low: "var(--elevation-low)",
        medium: "var(--elevation-medium)",
        high: "var(--elevation-high)",
      },
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        base: "var(--motion-duration-base)",
        slow: "var(--motion-duration-slow)",
      },
      screens: {
        xs: "360px",
      },
      maxWidth: {
        container: "var(--container-max)",
      },
    },
  },
  plugins: [],
};

export default config;
