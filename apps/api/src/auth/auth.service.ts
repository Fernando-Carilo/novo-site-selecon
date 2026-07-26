import { Injectable, UnauthorizedException } from "@nestjs/common";
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from "@selecon/auth";
import { prisma } from "@selecon/db";
import { createLogger } from "@selecon/observability";
import { AuditService } from "../audit/audit.service.js";
import { SESSION_TTL_MS } from "./auth.constants.js";

const logger = createLogger("auth");

export interface LoginResult {
  token: string;
  expiresAt: Date;
  userId: string;
  mustChangePassword: boolean;
}

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(private readonly audit: AuditService) {}

  /**
   * Autentica por e-mail/senha (provider LOCAL_DEV). Mensagens de erro são
   * neutras (não revelam se o e-mail existe) e há bloqueio progressivo contra
   * força bruta (regra 12.1: "proteção contra enumeração", "bloqueio
   * progressivo de login").
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({ where: { email } });

    const recentFailures = user
      ? await prisma.loginEvent.count({
          where: {
            userId: user.id,
            result: "FAILURE",
            occurredAt: { gte: new Date(Date.now() - LOCKOUT_WINDOW_MS) },
          },
        })
      : 0;

    if (recentFailures >= LOCKOUT_THRESHOLD) {
      await this.recordLoginEvent(email, user?.id, "FAILURE");
      throw new UnauthorizedException("Credenciais inválidas ou conta temporariamente bloqueada");
    }

    const passwordValid =
      !!user?.passwordHash && (await verifyPassword(user.passwordHash, password));

    if (!user || !passwordValid || user.status !== "ACTIVE") {
      await this.recordLoginEvent(email, user?.id, "FAILURE");
      throw new UnauthorizedException("Credenciais inválidas");
    }

    await this.recordLoginEvent(email, user.id, "SUCCESS");

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      resourceType: "session",
    });

    logger.info({ userId: user.id }, "Login bem-sucedido");
    return { token, expiresAt, userId: user.id, mustChangePassword: user.mustChangePassword };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
    await this.audit.log({ actorUserId: userId, action: "LOGOUT", resourceType: "session" });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.passwordHash || !(await verifyPassword(user.passwordHash, currentPassword))) {
      throw new UnauthorizedException("Senha atual incorreta");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
    });
    await this.audit.log({ actorUserId: userId, action: "PASSWORD_CHANGED", resourceType: "user" });
  }

  private async recordLoginEvent(
    email: string,
    userId: string | undefined,
    result: "SUCCESS" | "FAILURE",
  ): Promise<void> {
    await prisma.loginEvent.create({
      data: { email, userId, result },
    });
  }
}
