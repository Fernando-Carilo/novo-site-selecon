import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

const CONTROL_CLASSES =
  "block w-full min-h-11 rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-secondary/80 focus:border-action-blue focus:outline-none focus:ring-[3px] focus:ring-action-blue/40 aria-[invalid=true]:border-institutional-red";

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/** Rótulo, dica e mensagem de erro sempre associados ao controle (seção 5.4). */
export function FieldShell({ id, label, hint, error, required, children, className = "" }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-primary">
        {label}
        {required ? (
          <span className="ml-1 text-institutional-red" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mb-1.5 text-sm text-text-secondary">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-institutional-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function InputField({ id, label, hint, error, required, wrapperClassName, className = "", ...props }: InputFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <input
        id={id}
        name={props.name ?? id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL_CLASSES} ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ id, label, hint, error, required, wrapperClassName, className = "", options, placeholder, ...props }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <select
        id={id}
        name={props.name ?? id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL_CLASSES} ${className}`}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextareaField({ id, label, hint, error, required, wrapperClassName, className = "", ...props }: TextareaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <textarea
        id={id}
        name={props.name ?? id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL_CLASSES} min-h-32 ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export function CheckboxField({ id, label, error, required, wrapperClassName = "", className = "", ...props }: CheckboxFieldProps) {
  return (
    <div className={wrapperClassName}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={props.name ?? id}
          type="checkbox"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-1 h-5 w-5 shrink-0 rounded-sm border-border-strong text-action-blue focus:ring-[3px] focus:ring-action-blue/40 ${className}`}
          {...props}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-text-primary">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-institutional-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
