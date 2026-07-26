/** Perfis iniciais, conforme seção 10.7 do prompt mestre. */
export const ROLES = [
  "PORTAL_ADMIN",
  "CONTENT_ADMIN",
  "CONTENT_EDITOR",
  "CONTENT_REVIEWER",
  "CONTEST_ADMIN",
  "CONTEST_EDITOR",
  "SERVICE_ADMIN",
  "SERVICE_SUPERVISOR",
  "SERVICE_AGENT",
  "INTEGRITY_ADMIN",
  "INTEGRITY_ANALYST",
  "INTEGRITY_AUDITOR",
  "ADVERTISING_ADMIN",
  "ADVERTISING_REVIEWER",
  "SECURITY_ADMIN",
  "AUDITOR",
  "READ_ONLY",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
