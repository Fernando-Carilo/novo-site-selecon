"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { WhistleblowingCategoryDto, WhistleblowingCredentials } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function NewWhistleblowingCasePage() {
  const [categories, setCategories] = useState<WhistleblowingCategoryDto[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [credentials, setCredentials] = useState<WhistleblowingCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<WhistleblowingCategoryDto[]>("/public/whistleblowing/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const incidentDate = form.get("incidentDate") as string;
    try {
      const result = await apiFetch<WhistleblowingCredentials>("/public/whistleblowing/cases", {
        method: "POST",
        body: JSON.stringify({
          isAnonymous,
          reporterName: isAnonymous ? undefined : form.get("reporterName") || undefined,
          reporterEmail: isAnonymous ? undefined : form.get("reporterEmail") || undefined,
          categoryId: form.get("categoryId"),
          description: form.get("description"),
          involvedPeople: form.get("involvedPeople") || undefined,
          location: form.get("location") || undefined,
          incidentDate: incidentDate ? new Date(incidentDate).toISOString() : undefined,
        }),
      });
      setCredentials(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível registrar a denúncia agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (credentials) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-success-green text-2xl font-bold">Denúncia registrada</h1>
        <p className="text-institutional-red bg-institutional-red/10 mt-4 rounded-md p-4 text-sm font-medium">
          Guarde estas credenciais agora. Elas não serão exibidas novamente e ninguém do Instituto
          Selecon poderá recuperá-las para você.
        </p>
        <dl className="border-border bg-surface mt-4 space-y-3 rounded-lg border p-4">
          <div>
            <dt className="text-text-secondary text-xs uppercase">Protocolo</dt>
            <dd className="font-mono text-lg">{credentials.protocol}</dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs uppercase">Código de acesso</dt>
            <dd className="font-mono text-lg">{credentials.accessCode}</dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-navy-primary text-2xl font-bold">Registrar denúncia</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {error && (
          <p
            role="alert"
            className="bg-institutional-red/10 text-institutional-red rounded-md p-3 text-sm"
          >
            {error}
          </p>
        )}

        <fieldset className="border-border rounded-md border p-4">
          <legend className="px-1 text-sm font-medium">Identificação</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="identification"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(true)}
              />
              Prefiro permanecer anônimo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="identification"
                checked={!isAnonymous}
                onChange={() => setIsAnonymous(false)}
              />
              Quero me identificar
            </label>
          </div>

          {!isAnonymous && (
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="reporterName" className="text-sm font-medium">
                  Nome completo
                </label>
                <input
                  id="reporterName"
                  name="reporterName"
                  className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="reporterEmail" className="text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="reporterEmail"
                  name="reporterEmail"
                  type="email"
                  className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </fieldset>

        <div>
          <label htmlFor="categoryId" className="text-sm font-medium">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Selecione…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Descreva o ocorrido
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            rows={6}
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="involvedPeople" className="text-sm font-medium">
            Pessoas envolvidas (opcional)
          </label>
          <textarea
            id="involvedPeople"
            name="involvedPeople"
            rows={3}
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="text-sm font-medium">
              Local (opcional)
            </label>
            <input
              id="location"
              name="location"
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="incidentDate" className="text-sm font-medium">
              Data do ocorrido (opcional)
            </label>
            <input
              id="incidentDate"
              name="incidentDate"
              type="date"
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className={buttonClassNames("primary")}>
          {submitting ? "Enviando…" : "Registrar denúncia"}
        </button>
      </form>
    </section>
  );
}
