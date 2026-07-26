import { Injectable } from "@nestjs/common";
import { prisma } from "@selecon/db";
import type { HealthStatus } from "@selecon/contracts";
import Redis from "ioredis";

@Injectable()
export class HealthService {
  private readonly redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  liveness(): HealthStatus {
    return { status: "ok", checkedAt: new Date().toISOString() };
  }

  async readiness(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([this.checkDatabase(), this.checkRedis()]);
    const failures = checks
      .map((check, index) => ({ check, name: index === 0 ? "database" : "redis" }))
      .filter(({ check }) => check.status === "rejected");

    if (failures.length > 0) {
      const detail = failures.map(({ name }) => `${name} indisponível`).join("; ");
      return { status: "down", detail, checkedAt: new Date().toISOString() };
    }

    return { status: "ok", checkedAt: new Date().toISOString() };
  }

  private async checkDatabase(): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await this.redis.connect();
    await this.redis.ping();
    await this.redis.disconnect();
  }
}
