import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-action-blue text-white hover:bg-navy-secondary",
  secondary: "bg-white text-navy-primary border border-border hover:bg-background-light",
  ghost: "bg-transparent text-navy-primary hover:bg-background-light",
  danger: "bg-institutional-red text-white hover:opacity-90",
};

/**
 * Classes utilitárias do botão, exportadas para uso em elementos não-`<button>` (ex.:
 * `<a>` de navegação estilizado como CTA) sem aninhar elementos interativos.
 */
export function buttonClassNames(variant: ButtonVariant = "primary", className = ""): string {
  return [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2",
    "text-sm font-medium transition-colors duration-base",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-action-blue focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    className,
  ].join(" ");
}

/**
 * Botão base do design system. Foco visível e alvo de toque mínimo de 44px (seção 5.4)
 * são garantidos por classes utilitárias — nunca remova `focus-visible:ring` em overrides.
 */
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={buttonClassNames(variant, className)} {...props}>
      {children}
    </button>
  );
}
