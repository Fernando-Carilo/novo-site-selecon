import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

const FIELD_CLASSES =
  "border-border mt-1 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-action-blue";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Campo de texto rotulado — `<label htmlFor>` associado por id gerado
 * automaticamente (React 18+ `useId`), com `aria-describedby` apontando para
 * a dica/erro quando presentes, seguindo o padrão já usado manualmente em
 * cada formulário administrativo (agora centralizado aqui).
 */
export function TextField({ label, hint, error, id, className = "", ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`${FIELD_CLASSES} ${className}`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-text-secondary mt-1 text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-institutional-red mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function SelectField({ label, id, className = "", children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <select id={fieldId} className={`${FIELD_CLASSES} bg-white ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}
