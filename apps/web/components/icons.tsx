import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

/**
 * Ícones em SVG inline (traço 1.75, grade 24px) para evitar dependência externa nesta fase.
 * São decorativos por padrão (`aria-hidden`); passe `title` quando o ícone for a única
 * informação visual (ex.: botão só com ícone).
 */
function Icon({ title, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function FileSearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <circle cx="11.5" cy="14.5" r="2.5" />
      <path d="m13.5 16.5 2 2" />
    </Icon>
  );
}

export function UserCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.5a6 6 0 0 1 11 0" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.01" />
    </Icon>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
      <path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2z" />
      <path d="M20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" />
      <path d="M18 18v1a2 2 0 0 1-2 2h-3" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Icon>
  );
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M5 8.5h14" />
      <path d="M12 8.5v5" />
      <path d="m12 13.5-3 7" />
      <path d="m12 13.5 3 7" />
    </Icon>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="m9 13 2 2 4-4" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </Icon>
  );
}

/** Monograma provisório até o logotipo oficial ser fornecido (seção 9.1). */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect width="40" height="40" rx="10" className="fill-navy-primary" />
      <path
        d="M26.5 14.2c-1.3-1.3-3.2-2-5.5-2-3.9 0-6.4 1.9-6.4 4.8 0 2.6 1.7 3.9 5.6 4.8l1.6.4c2.3.5 3.1 1.1 3.1 2.3 0 1.4-1.4 2.3-3.6 2.3-2.3 0-3.9-.9-4.5-2.6h-3.7c.6 3.6 3.6 5.7 8.1 5.7 4.6 0 7.4-2.2 7.4-5.7 0-2.8-1.7-4.3-5.7-5.2l-1.7-.4c-2.1-.5-3-1.1-3-2.2 0-1.3 1.3-2.1 3.1-2.1 1.9 0 3.2.8 3.7 2.2h3.6c-.2-1-.7-1.8-1.1-2.3Z"
        className="fill-white"
      />
      <circle cx="31" cy="10" r="3" className="fill-support-cyan" />
    </svg>
  );
}
