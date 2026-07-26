"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ContestStatus, ContestSummary } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<ContestStatus, string> = {
  DRAFT: "Rascunho",
  IN_REVIEW: "Em revisão",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  SUSPENDED: "Suspenso",
  CLOSED: "Encerrado",
  ARCHIVED: "Arquivado",
};

export default function AdminContestsPage() {
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ContestSummary[]>("/admin/contests");
      setContests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar concursos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch("/admin/contests", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          slug: form.get("slug"),
          organizationId: form.get("organizationId"),
          shortDescription: form.get("shortDescription"),
          vacancies: form.get("vacancies") ? Number(form.get("vacancies")) : undefined,
        }),
      });
      setShowCreateForm(false);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Falha ao criar concurso");
    }
  }

  async function handleAction(id: string, action: string) {
    setActionError(null);
    try {
      await apiFetch(`/admin/contests/${id}/${action}`, { method: "POST", body: "{}" });
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : `Falha ao executar "${action}"`);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-navy-primary text-2xl font-bold">Gestão de concursos</h1>
        <button
          type="button"
          className={buttonClassNames("primary")}
          onClick={() => setShowCreateForm((value) => !value)}
        >
          {showCreateForm ? "Cancelar" : "Novo concurso"}
        </button>
      </div>

      {actionError && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {actionError}
        </p>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="border-border bg-surface mt-6 space-y-3 rounded-lg border p-5"
        >
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Título
            </label>
            <input
              id="title"
              name="title"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="slug" className="text-sm font-medium">
              Slug (URL)
            </label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="concurso-exemplo-2026"
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="organizationId" className="text-sm font-medium">
              ID do órgão
            </label>
            <input
              id="organizationId"
              name="organizationId"
              required
              defaultValue="00000000-0000-0000-0000-000000000001"
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="shortDescription" className="text-sm font-medium">
              Descrição curta
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="vacancies" className="text-sm font-medium">
              Vagas
            </label>
            <input
              id="vacancies"
              name="vacancies"
              type="number"
              min={0}
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className={buttonClassNames("primary")}>
            Salvar rascunho
          </button>
        </form>
      )}

      {loading && <p className="text-text-secondary mt-6">Carregando…</p>}
      {error && <p className="text-institutional-red mt-6">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">Lista de concursos administrados</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Título
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Vagas
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr key={contest.id} className="border-border border-b">
                  <td className="py-2 pr-4">{contest.title}</td>
                  <td className="py-2 pr-4">{STATUS_LABEL[contest.status]}</td>
                  <td className="py-2 pr-4">{contest.vacancies ?? "—"}</td>
                  <td className="flex gap-2 py-2">
                    {contest.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => handleAction(contest.id, "submit-for-review")}
                        className="text-action-blue text-sm hover:underline"
                      >
                        Enviar p/ revisão
                      </button>
                    )}
                    {(contest.status === "DRAFT" || contest.status === "IN_REVIEW") && (
                      <button
                        type="button"
                        onClick={() => handleAction(contest.id, "publish")}
                        className="text-success-green text-sm hover:underline"
                      >
                        Publicar
                      </button>
                    )}
                    {contest.status === "PUBLISHED" && (
                      <button
                        type="button"
                        onClick={() => handleAction(contest.id, "suspend")}
                        className="text-institutional-red text-sm hover:underline"
                      >
                        Suspender
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {contests.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-text-secondary py-6 text-center">
                    Nenhum concurso cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
