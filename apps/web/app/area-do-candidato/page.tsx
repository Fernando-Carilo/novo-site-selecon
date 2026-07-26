"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CandidateDashboard, ContestSummary } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch } from "@/lib/api-client";

const REGISTRATION_STATUS_LABEL: Record<CandidateDashboard["registration"]["status"], string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

const PAYMENT_STATUS_LABEL: Record<CandidateDashboard["payment"]["status"], string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  EXEMPT: "Isento",
  OVERDUE: "Em atraso",
};

/**
 * Camada de experiência sobre o CandidateProvider (seção 11.4). Nesta fase, o "sistema do
 * candidato" é inteiramente mockado (CandidateMockProvider) — o contrato real ainda não foi
 * confirmado (ver docs/INTEGRATIONS.md). O candidateRef abaixo simula o identificador que,
 * em produção, viria de um redirecionamento assinado do sistema real após o login.
 */
export default function CandidatePage() {
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [signInUrl, setSignInUrl] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ContestSummary[]>("/public/contests")
      .then(setContests)
      .catch(() => setContests([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDashboard(null);
    setSignInUrl(null);
    const form = new FormData(event.currentTarget);
    const contestId = form.get("contestId") as string;
    const candidateRef = form.get("candidateRef") as string;
    try {
      const [{ url }, dashboardResult] = await Promise.all([
        apiFetch<{ url: string }>(`/public/candidate/sign-in-url?contestId=${contestId}`),
        apiFetch<CandidateDashboard>(
          `/public/candidate/dashboard?candidateRef=${encodeURIComponent(candidateRef)}&contestId=${contestId}`,
        ),
      ]);
      setSignInUrl(url);
      setDashboard(dashboardResult);
    } catch {
      setError("Não foi possível consultar a área do candidato agora.");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-navy-primary text-3xl font-bold">Área do candidato</h1>
      <p className="text-text-secondary mt-4">
        Consulte inscrição, pagamento, cartão de confirmação, recursos e resultados dos seus
        concursos.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {error && (
          <p
            role="alert"
            className="bg-institutional-red/10 text-institutional-red rounded-md p-3 text-sm"
          >
            {error}
          </p>
        )}
        <div>
          <label htmlFor="contestId" className="text-sm font-medium">
            Concurso
          </label>
          <select
            id="contestId"
            name="contestId"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Selecione…</option>
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="candidateRef" className="text-sm font-medium">
            CPF ou protocolo de inscrição
          </label>
          <input
            id="candidateRef"
            name="candidateRef"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className={buttonClassNames("primary")}>
          Consultar
        </button>
      </form>

      {signInUrl && (
        <p className="text-text-secondary mt-6 text-sm">
          Sistema do candidato: <span className="font-mono text-xs">{signInUrl}</span> (integração
          simulada — o contrato real do sistema do candidato ainda não foi confirmado).
        </p>
      )}

      {dashboard && (
        <div className="border-border bg-surface mt-8 space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-navy-primary text-lg font-semibold">Inscrição</h2>
            <p className="mt-1 text-sm">
              Status: {REGISTRATION_STATUS_LABEL[dashboard.registration.status]}
            </p>
            <p className="text-text-secondary text-xs">
              Protocolo {dashboard.registration.registrationId}
            </p>
          </div>

          <div>
            <h2 className="text-navy-primary text-lg font-semibold">Pagamento</h2>
            <p className="mt-1 text-sm">{PAYMENT_STATUS_LABEL[dashboard.payment.status]}</p>
          </div>

          <div>
            <h2 className="text-navy-primary text-lg font-semibold">Cartão de confirmação</h2>
            <p className="text-text-secondary mt-1 text-sm">
              {dashboard.examCardUrl ? (
                <a href={dashboard.examCardUrl} className="text-action-blue hover:underline">
                  Baixar cartão
                </a>
              ) : (
                "Ainda não disponível."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-navy-primary text-lg font-semibold">Recursos</h2>
            {dashboard.appeals.length === 0 ? (
              <p className="text-text-secondary mt-1 text-sm">Nenhum recurso registrado.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {dashboard.appeals.map((appeal) => (
                  <li key={appeal.appealId}>
                    {appeal.subject} — {appeal.status}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-navy-primary text-lg font-semibold">Resultados</h2>
            {dashboard.results.length === 0 ? (
              <p className="text-text-secondary mt-1 text-sm">
                Resultados ainda não publicados para este concurso.
              </p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {dashboard.results.map((result, index) => (
                  <li key={index}>
                    {result.stage} — {result.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
