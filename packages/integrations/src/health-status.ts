import type { HealthStatus } from "@selecon/contracts";

export function healthy(detail?: string): HealthStatus {
  return { status: "ok", detail, checkedAt: new Date().toISOString() };
}

export function degraded(detail: string): HealthStatus {
  return { status: "degraded", detail, checkedAt: new Date().toISOString() };
}

export function down(detail: string): HealthStatus {
  return { status: "down", detail, checkedAt: new Date().toISOString() };
}
