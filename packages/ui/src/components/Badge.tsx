import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "danger" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-background-light text-text-primary",
  success: "bg-success-green/10 text-success-green",
  danger: "bg-institutional-red/10 text-institutional-red",
  info: "bg-action-blue/10 text-action-blue",
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Rótulo de status compacto (ex.: status de concurso, campanha, denúncia).
 * Cor sozinha nunca é o único indicador — sempre combine com o texto do rótulo.
 */
export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
