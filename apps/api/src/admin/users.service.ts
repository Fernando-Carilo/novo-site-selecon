import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AdminUserSummary, CreateUserRequest, TemporaryCredential } from "@selecon/contracts";
import { generateTemporaryPassword, hashPassword } from "@selecon/auth";
import { prisma } from "@selecon/db";
import { AuditService } from "../audit/audit.service.js";

/** Deve ser recalculada a cada consulta — `new Date()` fixado em uma constante de
 * módulo ficaria congelado no horário de import, fazendo papéis revogados (validUntil
 * no passado, mas depois do horário congelado) continuarem aparecendo como ativos. */
function activeRoleWhere() {
  return { OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }] };
}

@Injectable()
export class UsersService {
  constructor(private readonly audit: AuditService) {}

  private toSummary(user: Awaited<ReturnType<typeof this.getUserOrThrow>>): AdminUserSummary {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
      roles: user.userRoles.map((userRole) => ({
        id: userRole.id,
        roleKey: userRole.role.key,
        grantedByUserId: userRole.grantedByUserId,
        validUntil: userRole.validUntil?.toISOString() ?? null,
      })),
      createdAt: user.createdAt.toISOString(),
    };
  }

  async list(): Promise<AdminUserSummary[]> {
    const users = await prisma.user.findMany({
      include: { userRoles: { where: activeRoleWhere(), include: { role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return users.map((user) => this.toSummary(user));
  }

  private async getUserOrThrow(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { userRoles: { where: activeRoleWhere(), include: { role: true } } },
    });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  async create(
    input: CreateUserRequest,
    actorUserId: string,
  ): Promise<{ user: AdminUserSummary; credential: TemporaryCredential }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new BadRequestException("Já existe um usuário com este e-mail");

    const role = await prisma.role.findUnique({ where: { key: input.roleKey } });
    if (!role) throw new NotFoundException("Perfil não encontrado");

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const created = await prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        mustChangePassword: true,
        userRoles: { create: { roleId: role.id, grantedByUserId: actorUserId } },
      },
      include: { userRoles: { where: activeRoleWhere(), include: { role: true } } },
    });

    await this.audit.log({
      actorUserId,
      action: "USER_CREATED",
      resourceType: "user",
      resourceId: created.id,
      afterData: { email: created.email, roleKey: input.roleKey },
      riskLevel: "medium",
    });

    return {
      user: this.toSummary(created),
      credential: { userId: created.id, temporaryPassword },
    };
  }

  async setActive(id: string, active: boolean, actorUserId: string): Promise<AdminUserSummary> {
    await this.getUserOrThrow(id);
    const user = await prisma.user.update({
      where: { id },
      data: { status: active ? "ACTIVE" : "INACTIVE", deactivatedAt: active ? null : new Date() },
      include: { userRoles: { where: activeRoleWhere(), include: { role: true } } },
    });

    if (!active) {
      await prisma.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.audit.log({
      actorUserId,
      action: active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      resourceType: "user",
      resourceId: id,
      riskLevel: "medium",
    });

    return this.toSummary(user);
  }

  async resetPassword(id: string, actorUserId: string): Promise<TemporaryCredential> {
    await this.getUserOrThrow(id);
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    await prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });
    await prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.audit.log({
      actorUserId,
      action: "USER_PASSWORD_RESET",
      resourceType: "user",
      resourceId: id,
      riskLevel: "high",
    });

    return { userId: id, temporaryPassword };
  }

  async assignRole(id: string, roleKey: string, actorUserId: string): Promise<AdminUserSummary> {
    await this.getUserOrThrow(id);
    const role = await prisma.role.findUnique({ where: { key: roleKey } });
    if (!role) throw new NotFoundException("Perfil não encontrado");

    const existingAssignment = await prisma.userRole.findFirst({
      where: { userId: id, roleId: role.id, ...activeRoleWhere() },
    });
    if (!existingAssignment) {
      await prisma.userRole.create({
        data: { userId: id, roleId: role.id, grantedByUserId: actorUserId },
      });
    }

    await this.audit.log({
      actorUserId,
      action: "USER_ROLE_ASSIGNED",
      resourceType: "user",
      resourceId: id,
      afterData: { roleKey },
      riskLevel: "medium",
    });

    return this.toSummary(await this.getUserOrThrow(id));
  }

  async revokeRole(id: string, userRoleId: string, actorUserId: string): Promise<AdminUserSummary> {
    await this.getUserOrThrow(id);
    await prisma.userRole.update({
      where: { id: userRoleId },
      data: { validUntil: new Date() },
    });

    await this.audit.log({
      actorUserId,
      action: "USER_ROLE_REVOKED",
      resourceType: "user",
      resourceId: id,
      afterData: { userRoleId },
      riskLevel: "medium",
    });

    return this.toSummary(await this.getUserOrThrow(id));
  }

  async terminateSessions(id: string, actorUserId: string): Promise<{ terminated: number }> {
    await this.getUserOrThrow(id);
    const result = await prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.audit.log({
      actorUserId,
      action: "USER_SESSIONS_TERMINATED",
      resourceType: "user",
      resourceId: id,
      afterData: { count: result.count },
      riskLevel: "medium",
    });

    return { terminated: result.count };
  }
}
