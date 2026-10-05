import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** `status` para informação; `alert` para erro que exige atenção imediata. */
  role?: "status" | "alert" | "note";
}

const TONE_CLASSES: Record<AlertTone, string> = {
  info: "border-action-blue/30 bg-wash-blue text-navy-primary",
  success: "border-success-green/30 bg-wash-green text-navy-primary",
  warning: "border-warning-amber/40 bg-wash-amber text-navy-primary",
  danger: "border-institutional-red/40 bg-wash-red text-navy-primary",
};

const BAR_CLASSES: Record<AlertTone, string> = {
  info: "bg-action-blue",
  success: "bg-success-green",
  warning: "bg-warning-amber",
  danger: "bg-institutional-red",
};

export function Alert({
  tone = "info",
  title,
  children,
  icon,
  className = "",
  role = "note",
}: AlertProps) {
  return (
    <div
      role={role === "note" ? undefined : role}
      className={`relative overflow-hidden rounded-md border p-4 pl-5 ${TONE_CLASSES[tone]} ${className}`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${BAR_CLASSES[tone]}`} />
      <div className="flex gap-3">
        {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
        <div className="text-sm leading-relaxed">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={title ? "mt-1" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}
