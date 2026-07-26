import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { hashSessionToken, isRole } from "@selecon/auth";
import { prisma } from "@selecon/db";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { SESSION_COOKIE_NAME } from "./auth.constants.js";
import type { AuthenticatedUser } from "./authenticated-user.js";

/**
 * Guard global de sessão: lê o cookie de sessão, resolve o usuário e anexa
 * `request.user` (AuthenticatedUser). Rotas marcadas com `@Public()` são
 * ignoradas. Nenhuma rota fica protegida "por esquecimento" — o padrão é
 * exigir sessão válida (regra 12.1: nunca confiar apenas no frontend).
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: AuthenticatedUser }>();
    const token = request.cookies?.[SESSION_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException("Sessão não encontrada");
    }

    const tokenHash = hashSessionToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true, scopeAssignments: true },
            },
          },
        },
      },
    });

    const now = new Date();
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt < now ||
      session.user.status !== "ACTIVE"
    ) {
      throw new UnauthorizedException("Sessão inválida ou expirada");
    }

    const activeRoles = session.user.userRoles.filter(
      (userRole) => !userRole.validUntil || userRole.validUntil > now,
    );

    request.user = {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      roles: activeRoles.map((userRole) => userRole.role.key).filter(isRole),
      scopes: activeRoles.flatMap((userRole) =>
        userRole.scopeAssignments.map((scope) => ({ [scope.scopeType]: scope.scopeValue })),
      ),
      mustChangePassword: session.user.mustChangePassword,
      sessionId: session.id,
    };

    return true;
  }
}
