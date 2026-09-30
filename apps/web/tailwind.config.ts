import type { Config } from "tailwindcss";

/**
 * Tailwind consome os tokens via variáveis CSS definidas em
 * `@selecon/ui/tokens.css` (importado em `app/globals.css`) — nenhuma cor hardcoded
 * aqui, apenas o mapeamento nome-utilitário → variável (seção 5.2 do prompt mestre).
 *
 * As cores usam os canais `--color-*-rgb` para que modificadores de opacidade
 * (`bg-action-blue/10`, `border-navy-primary/20`) funcionem com tokens centralizados.
 */
const tokenColor = (name: string) => `rgb(var(--color-${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy-primary": tokenColor("navy-primary"),
        "navy-secondary": tokenColor("navy-secondary"),
        "action-blue": tokenColor("action-blue"),
        "support-cyan": tokenColor("support-cyan"),
        "institutional-red": tokenColor("institutional-red"),
        "success-green": tokenColor("success-green"),
        "background-light": tokenColor("background-light"),
        surface: tokenColor("surface"),
        "text-primary": tokenColor("text-primary"),
        "text-secondary": tokenColor("text-secondary"),
        border: tokenColor("border"),
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
        low: "var(--shadow-low)",
        medium: "var(--shadow-medium)",
        high: "var(--shadow-high)",
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
