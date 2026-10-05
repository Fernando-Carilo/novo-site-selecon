import type { SVGProps } from "react";

export type IconName =
  | "search"
  | "calendar"
  | "map-pin"
  | "users"
  | "briefcase"
  | "shield"
  | "file-text"
  | "arrow-right"
  | "arrow-left"
  | "chevron-down"
  | "chevron-right"
  | "menu"
  | "x"
  | "phone"
  | "mail"
  | "message-circle"
  | "external-link"
  | "check"
  | "check-circle"
  | "alert-triangle"
  | "info"
  | "clock"
  | "graduation-cap"
  | "building"
  | "megaphone"
  | "lock"
  | "user"
  | "credit-card"
  | "award"
  | "download"
  | "globe"
  | "accessibility"
  | "landmark"
  | "heart-pulse"
  | "anchor"
  | "wrench"
  | "book-open"
  | "bar-chart"
  | "printer"
  | "server"
  | "scale"
  | "headset"
  | "list-checks"
  | "bell"
  | "filter"
  | "share";

const PATHS: Record<IconName, string> = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  "map-pin": "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  briefcase: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 8h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  "file-text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M16 13H8m8 4H8m2-8H8",
  "arrow-right": "M5 12h14m-7-7 7 7-7 7",
  "arrow-left": "M19 12H5m7 7-7-7 7-7",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-right": "m9 18 6-6-6-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6 6 18M6 6l12 12",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm18 2-10 7L2 6",
  "message-circle": "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z",
  "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3",
  check: "M20 6 9 17l-5-5",
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  "alert-triangle": "m10.29 3.86-8.6 14.86A2 2 0 0 0 3.4 21.7h17.2a2 2 0 0 0 1.71-2.98l-8.6-14.86a2 2 0 0 0-3.42 0ZM12 9v4m0 4h.01",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6v-4m0-4h.01",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  "graduation-cap": "M22 10 12 5 2 10l10 5 10-5Zm-16 2.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5M22 10v6",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Zm3-16h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2M2 22h20M10 22v-4h4v4",
  megaphone: "m3 11 18-5v12L3 14v-3Zm3 3v4a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm2 0V7a5 5 0 0 1 10 0v4",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  "credit-card": "M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm-2 5h22M6 15h4",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-3.21-1.6L7 23l5-3 5 3-1.79-9.6",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-10-10h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z",
  accessibility: "M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 3 8-1 8 1m-11 11 3-8 3 8m-3-8V9",
  landmark: "M3 22h18M6 18v-7m4 7v-7m4 7v-7m4 7v-7M2 11l10-7 10 7H2Z",
  "heart-pulse": "M19.5 12.57 12 20l-7.5-7.43A5 5 0 1 1 12 6.01a5 5 0 1 1 7.5 6.56ZM3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
  anchor: "M12 22V8m0-6a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 12H2a10 10 0 0 0 20 0h-3",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z",
  "book-open": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3Zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z",
  "bar-chart": "M12 20V10m6 10V4M6 20v-4",
  printer: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-4h12v8H6v-8Z",
  server: "M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 12h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm2-8h.01M6 18h.01",
  scale: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Zm-14 0 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18m-9-14h18",
  headset: "M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7Zm18 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v-7Zm-18 0a9 9 0 0 1 18 0m-9 10a3 3 0 0 0 3-3",
  "list-checks": "m3 17 2 2 4-4m-6-7 2 2 4-4m4 1h8m-8 8h8",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Zm-4.27 13a2 2 0 0 1-3.46 0",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3Z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13",
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Rótulo acessível — omitido = ícone decorativo (`aria-hidden`). */
  label?: string;
  size?: number;
}

/**
 * Ícones SVG inline (stroke 2) — nunca glifos Unicode, que renderizam diferente em cada
 * sistema. Decorativos por padrão; passe `label` quando o ícone carregar significado sozinho.
 */
export function Icon({ name, label, size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      className={`shrink-0 ${className}`}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
