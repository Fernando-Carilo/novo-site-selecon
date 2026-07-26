import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  assignRoleRequestSchema,
  createUserRequestSchema,
  type AdminUserSummary,
  type AssignRoleRequest,
  type CreateUserRequest,
  type TemporaryCredential,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { UsersService } from "./users.service.js";

@ApiTags("admin-users")
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermission("users:manage")
  list(): Promise<AdminUserSummary[]> {
    return this.users.list();
  }

  @Post()
  @RequirePermission("users:manage")
  create(
    @Body(new ZodValidationPipe(createUserRequestSchema)) body: CreateUserRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ user: AdminUserSummary; credential: TemporaryCredential }> {
    return this.users.create(body, user.id);
  }

  @Post(":id/activate")
  @RequirePermission("users:manage")
  activate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminUserSummary> {
    return this.users.setActive(id, true, user.id);
  }

  @Post(":id/deactivate")
  @RequirePermission("users:manage")
  deactivate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminUserSummary> {
    return this.users.setActive(id, false, user.id);
  }

  @Post(":id/reset-password")
  @RequirePermission("users:manage")
  resetPassword(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TemporaryCredential> {
    return this.users.resetPassword(id, user.id);
  }

  @Post(":id/roles")
  @RequirePermission("users:manage")
  assignRole(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(assignRoleRequestSchema)) body: AssignRoleRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminUserSummary> {
    return this.users.assignRole(id, body.roleKey, user.id);
  }

  @Post(":id/roles/:userRoleId/revoke")
  @RequirePermission("users:manage")
  revokeRole(
    @Param("id") id: string,
    @Param("userRoleId") userRoleId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminUserSummary> {
    return this.users.revokeRole(id, userRoleId, user.id);
  }

  @Post(":id/terminate-sessions")
  @RequirePermission("users:manage")
  terminateSessions(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ terminated: number }> {
    return this.users.terminateSessions(id, user.id);
  }
}
