import type { Role } from "@selecon/auth";

/** Formato do usuário autenticado anexado a `request.user` pelo SessionGuard. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  roles: Role[];
  scopes: Record<string, string>[];
  mustChangePassword: boolean;
  sessionId: string;
}
