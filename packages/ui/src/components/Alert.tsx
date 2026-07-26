import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "danger" | "warning";

const TONE_CLASSES: Record<AlertTone, string> = {
  info: "bg-action-blue/10 text-action-blue",
  success: "bg-success-green/10 text-success-green",
  danger: "bg-institutional-red/10 text-institutional-red",
  warning: "bg-support-cyan/10 text-navy-primary",
};

export interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}

/**
 * Mensagem de status inline (erro de formulário, confirmação, aviso). Usa
 * `role="alert"` para ser anunciada por leitores de tela assim que aparece —
 * nunca reaproveite este componente para conteúdo que já estava na página
 * antes da interação (isso silenciaria o anúncio).
 */
export function Alert({ tone = "info", children, className = "" }: AlertProps) {
  return (
    <p role="alert" className={`rounded-md p-3 text-sm ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </p>
  );
}
