"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AuditEventDto } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch } from "@/lib/api-client";

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEventDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ resourceType?: string; action?: string }>({});

  const load = useCallback(async (nextFilters: { resourceType?: string; action?: string }) => {
    setError(null);
    const params = new URLSearchParams();
    if (nextFilters.resourceType) params.set("resourceType", nextFilters.resourceType);
    if (nextFilters.action) params.set("action", nextFilters.action);
    try {
      setEvents(await apiFetch<AuditEventDto[]>(`/admin/audit/events?${params.toString()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar auditoria");
    }
  }, []);

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {
      resourceType: (form.get("resourceType") as string) || undefined,
      action: (form.get("action") as string) || undefined,
    };
    setFilters(next);
    load(next);
  }

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Trilha de auditoria</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Registro somente-leitura de todas as ações sensíveis do sistema. A trilha do canal de
        denúncias é segregada e não aparece aqui (ver módulo de integridade).
      </p>

      <form onSubmit={handleFilter} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="resourceType" className="text-sm font-medium">
            Tipo de recurso
          </label>
          <input
            id="resourceType"
            name="resourceType"
            placeholder="contest, campaign, user…"
            className="border-border mt-1 rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="action" className="text-sm font-medium">
            Ação
          </label>
          <input
            id="action"
            name="action"
            placeholder="CONTEST_PUBLISHED…"
            className="border-border mt-1 rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className={buttonClassNames("secondary")}>
          Filtrar
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="border-border bg-surface mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">Eventos de auditoria</caption>
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="p-3 font-semibold">
                Ação
              </th>
              <th scope="col" className="p-3 font-semibold">
                Recurso
              </th>
              <th scope="col" className="p-3 font-semibold">
                Ator
              </th>
              <th scope="col" className="p-3 font-semibold">
                Risco
              </th>
              <th scope="col" className="p-3 font-semibold">
                Resultado
              </th>
              <th scope="col" className="p-3 font-semibold">
                Quando
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-border border-b last:border-0">
                <td className="p-3">{event.action}</td>
                <td className="p-3">
                  {event.resourceType}
                  {event.resourceId ? ` (${event.resourceId.slice(0, 8)}…)` : ""}
                </td>
                <td className="p-3 font-mono text-xs">
                  {event.actorUserId ? `${event.actorUserId.slice(0, 8)}…` : "—"}
                </td>
                <td className="p-3">{event.riskLevel ?? "—"}</td>
                <td className="p-3">{event.result}</td>
                <td className="p-3">{new Date(event.occurredAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="text-text-secondary p-4 text-center">
                  Nenhum evento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
