"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AdminUserSummary, RoleKey, TemporaryCredential } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const ROLE_OPTIONS: RoleKey[] = [
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
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [lastCredential, setLastCredential] = useState<TemporaryCredential | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await apiFetch<AdminUserSummary[]>("/admin/users"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar usuários");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ user: AdminUserSummary; credential: TemporaryCredential }>(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.get("email"),
            displayName: form.get("displayName"),
            roleKey: form.get("roleKey"),
          }),
        },
      );
      setLastCredential(result.credential);
      setShowNewForm(false);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao criar usuário");
    }
  }

  async function toggleActive(user: AdminUserSummary) {
    setError(null);
    try {
      await apiFetch(
        `/admin/users/${user.id}/${user.status === "ACTIVE" ? "deactivate" : "activate"}`,
        {
          method: "POST",
          body: "{}",
        },
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao atualizar status");
    }
  }

  async function resetPassword(user: AdminUserSummary) {
    setError(null);
    try {
      const credential = await apiFetch<TemporaryCredential>(
        `/admin/users/${user.id}/reset-password`,
        { method: "POST", body: "{}" },
      );
      setLastCredential(credential);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao redefinir senha");
    }
  }

  async function terminateSessions(user: AdminUserSummary) {
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}/terminate-sessions`, { method: "POST", body: "{}" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao encerrar sessões");
    }
  }

  async function assignRole(user: AdminUserSummary, roleKey: string) {
    if (!roleKey) return;
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleKey }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao atribuir perfil");
    }
  }

  async function revokeRole(user: AdminUserSummary, userRoleId: string) {
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}/roles/${userRoleId}/revoke`, {
        method: "POST",
        body: "{}",
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao revogar perfil");
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-navy-primary text-2xl font-bold">Usuários</h1>
        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className={buttonClassNames("primary")}
        >
          {showNewForm ? "Cancelar" : "Novo usuário"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      {lastCredential && (
        <div className="border-institutional-red bg-institutional-red/10 mt-4 rounded-md border p-4 text-sm">
          <p className="font-medium">
            Senha temporária gerada — mostrada apenas uma vez, não fica recuperável depois.
          </p>
          <p className="mt-1 font-mono">{lastCredential.temporaryPassword}</p>
        </div>
      )}

      {showNewForm && (
        <form
          onSubmit={handleCreate}
          className="border-border bg-surface mt-4 space-y-3 rounded-lg border p-4"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="roleKey" className="text-sm font-medium">
              Perfil
            </label>
            <select
              id="roleKey"
              name="roleKey"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonClassNames("primary")}>
            Criar usuário
          </button>
        </form>
      )}

      <div className="border-border bg-surface mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <caption className="sr-only">Usuários administrativos</caption>
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="p-3 font-semibold">
                Nome
              </th>
              <th scope="col" className="p-3 font-semibold">
                E-mail
              </th>
              <th scope="col" className="p-3 font-semibold">
                Perfis
              </th>
              <th scope="col" className="p-3 font-semibold">
                Status
              </th>
              <th scope="col" className="p-3 font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-border border-b align-top last:border-0">
                <td className="p-3">{user.displayName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <ul className="space-y-1">
                    {user.roles.map((role) => (
                      <li key={role.id} className="flex items-center gap-2">
                        <span className="bg-background-light rounded px-2 py-0.5 font-mono text-xs">
                          {role.roleKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => revokeRole(user, role.id)}
                          className="text-institutional-red text-xs hover:underline"
                        >
                          revogar
                        </button>
                      </li>
                    ))}
                  </ul>
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      assignRole(user, event.target.value);
                      event.target.value = "";
                    }}
                    className="border-border mt-2 rounded-md border px-2 py-1 text-xs"
                  >
                    <option value="">+ atribuir perfil…</option>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.status === "ACTIVE"
                        ? "bg-success-green/10 text-success-green"
                        : "bg-institutional-red/10 text-institutional-red"
                    }`}
                  >
                    {user.status}
                  </span>
                  {user.mustChangePassword && (
                    <p className="text-text-secondary mt-1 text-xs">Troca de senha pendente</p>
                  )}
                </td>
                <td className="space-y-1 p-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(user)}
                    className="text-action-blue block text-xs hover:underline"
                  >
                    {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetPassword(user)}
                    className="text-action-blue block text-xs hover:underline"
                  >
                    Redefinir senha
                  </button>
                  <button
                    type="button"
                    onClick={() => terminateSessions(user)}
                    className="text-action-blue block text-xs hover:underline"
                  >
                    Encerrar sessões
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-text-secondary p-4 text-center">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
