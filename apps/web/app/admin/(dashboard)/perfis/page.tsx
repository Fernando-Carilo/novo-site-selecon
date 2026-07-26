"use client";

import { useEffect, useState } from "react";
import type { PermissionMatrixEntry } from "@selecon/contracts";
import { apiFetch } from "@/lib/api-client";

export default function AdminProfilesPage() {
  const [matrix, setMatrix] = useState<PermissionMatrixEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PermissionMatrixEntry[]>("/admin/permissions/matrix")
      .then(setMatrix)
      .catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar perfis"));
  }, []);

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Perfis e permissões</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Matriz somente-leitura — perfis e permissões são definidos em código (não numa tabela
        editável) para garantir que o que é exibido aqui é exatamente o que o backend aplica em cada
        requisição.
      </p>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {matrix.map((entry) => (
          <div key={entry.roleKey} className="border-border bg-surface rounded-lg border p-4">
            <p className="text-navy-primary font-semibold">{entry.roleKey}</p>
            <p className="text-text-secondary text-sm">{entry.description}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {entry.permissions.map((permission) => (
                <li
                  key={permission}
                  className="bg-background-light rounded px-2 py-0.5 font-mono text-xs"
                >
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
