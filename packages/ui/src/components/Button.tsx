import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-action-blue text-white shadow-low hover:bg-navy-secondary hover:shadow-medium active:shadow-low",
  secondary:
    "bg-surface text-navy-primary border border-border shadow-low hover:border-action-blue/40 hover:bg-background-light",
  ghost: "bg-transparent text-navy-primary hover:bg-navy-primary/5",
  danger:
    "bg-institutional-red text-white shadow-low hover:bg-institutional-red/90 hover:shadow-medium",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

/**
 * Classes utilitárias do botão, exportadas para uso em elementos não-`<button>` (ex.:
 * `<a>` de navegação estilizado como CTA) sem aninhar elementos interativos.
 */
export function buttonClassNames(
  variant: ButtonVariant = "primary",
  className = "",
  size: ButtonSize = "md",
): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold",
    "transition-[background-color,border-color,box-shadow,transform] duration-base ease-out",
    "active:translate-y-px",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-action-blue focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "motion-reduce:transition-none motion-reduce:active:translate-y-0",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  ].join(" ");
}

/**
 * Botão base do design system. Foco visível e alvo de toque mínimo de 44px (seção 5.4)
 * são garantidos por classes utilitárias — nunca remova `focus-visible:ring` em overrides.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassNames(variant, className, size)} {...props}>
      {children}
    </button>
  );
}
