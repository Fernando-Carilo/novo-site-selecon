import type { ReactNode } from "react";

export type BadgeTone = "open" | "info" | "success" | "neutral" | "warning" | "danger" | "navy";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  /** Ponto colorido à esquerda — reforço visual; a informação nunca é só a cor. */
  dot?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  open: "bg-wash-green text-success-green-ink",
  success: "bg-wash-green text-success-green-ink",
  info: "bg-wash-blue text-action-blue",
  neutral: "bg-wash-neutral text-text-secondary",
  warning: "bg-wash-amber text-warning-amber",
  danger: "bg-wash-red text-institutional-red-ink",
  navy: "bg-navy-primary text-white",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  open: "bg-success-green",
  success: "bg-success-green",
  info: "bg-action-blue",
  neutral: "bg-text-secondary",
  warning: "bg-warning-amber",
  danger: "bg-institutional-red",
  navy: "bg-support-cyan",
};

export function Badge({ tone = "neutral", children, className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
        className,
      ].join(" ")}
    >
      {dot ? (
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`} />
      ) : null}
      {children}
    </span>
  );
}
