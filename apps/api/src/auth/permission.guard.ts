import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { authorize, type Permission } from "@selecon/auth";
import type { FastifyRequest } from "fastify";
import { AuditService } from "../audit/audit.service.js";
import type { AuthenticatedUser } from "./authenticated-user.js";
import { REQUIRE_PERMISSION_KEY } from "./require-permission.decorator.js";

/**
 * Aplica a decisão RBAC/ABAC de `@selecon/auth#authorize` sobre o usuário
 * anexado pelo SessionGuard. Roda depois do SessionGuard (ordem de guards do
 * NestJS respeita a ordem de registro/decoração). Toda negação é auditada.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission | undefined>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) return true;

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Sessão não encontrada");
    }

    const decision = authorize(
      { userId: user.id, roles: user.roles, scopes: user.scopes },
      { permission: requiredPermission },
    );

    if (!decision.allowed) {
      await this.audit.log({
        actorUserId: user.id,
        action: "AUTHORIZATION_DENIED",
        resourceType: "permission",
        resourceId: requiredPermission,
        result: "FAILURE",
        justification: decision.reason,
      });
      throw new ForbiddenException("Você não tem permissão para esta operação");
    }

    return true;
  }
}
