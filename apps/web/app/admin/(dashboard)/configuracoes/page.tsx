"use client";

import { useEffect, useState } from "react";
import type { AdminDashboardStats } from "@selecon/contracts";
import { apiFetch } from "@/lib/api-client";

const INTEGRATION_LABEL: Record<string, string> = {
  candidate: "Sistema do candidato (CandidateProvider)",
  email: "Envio de e-mail (SES/SMTP)",
  messaging: "Mensageria (WhatsApp / Microsoft Graph)",
  storage: "Armazenamento de arquivos (S3)",
};

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<AdminDashboardStats>("/admin/dashboard/stats")
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Falha ao carregar configurações"),
      );
  }, []);

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Configurações e integrações</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Status real de cada adapter de integração externa. Nenhuma integração é declarada como
        operacional sem uma credencial real configurada — enquanto isso, o adapter mock mantém o
        fluxo completo testável.
      </p>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {stats?.integrations.map((integration) => (
          <div
            key={integration.name}
            className="border-border bg-surface flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="text-navy-primary font-medium">
                {INTEGRATION_LABEL[integration.name] ?? integration.name}
              </p>
              <p className="text-text-secondary text-sm">
                {integration.mode === "real"
                  ? "Credencial real configurada — integração operacional."
                  : "Modo simulado (mock) — sem credencial real. Fluxo completo disponível para teste, mas nenhuma chamada externa é feita."}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                integration.mode === "real"
                  ? "bg-success-green/10 text-success-green"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {integration.mode === "real" ? "Real" : "Simulado"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
