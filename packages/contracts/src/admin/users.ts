import { z } from "zod";

export const roleKeySchema = z.enum([
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
]);
export type RoleKey = z.infer<typeof roleKeySchema>;

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(200),
  roleKey: roleKeySchema,
});
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const assignRoleRequestSchema = z.object({ roleKey: roleKeySchema });
export type AssignRoleRequest = z.infer<typeof assignRoleRequestSchema>;

export const userRoleSummarySchema = z.object({
  id: z.string().uuid(),
  roleKey: z.string(),
  grantedByUserId: z.string(),
  validUntil: z.string().datetime().nullable(),
});
export type UserRoleSummary = z.infer<typeof userRoleSummarySchema>;

export const adminUserSummarySchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  mustChangePassword: z.boolean(),
  roles: z.array(userRoleSummarySchema),
  createdAt: z.string().datetime(),
});
export type AdminUserSummary = z.infer<typeof adminUserSummarySchema>;

/** Retornada uma única vez, imediatamente após criar o usuário ou redefinir a senha —
 * nunca fica recuperável depois (mesmo padrão usado no seed e no canal de denúncias). */
export const temporaryCredentialSchema = z.object({
  userId: z.string().uuid(),
  temporaryPassword: z.string(),
});
export type TemporaryCredential = z.infer<typeof temporaryCredentialSchema>;

export const permissionMatrixEntrySchema = z.object({
  roleKey: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
});
export type PermissionMatrixEntry = z.infer<typeof permissionMatrixEntrySchema>;
