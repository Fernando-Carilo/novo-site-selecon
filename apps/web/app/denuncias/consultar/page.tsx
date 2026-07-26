"use client";

import { useState, type FormEvent } from "react";
import type { WhistleblowingCasePublicView } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch } from "@/lib/api-client";

const STATUS_LABEL: Record<WhistleblowingCasePublicView["status"], string> = {
  RECEIVED: "Recebida",
  TRIAGE: "Em triagem",
  UNDER_ANALYSIS: "Em análise",
  AWAITING_INFO: "Aguardando informações",
  DECIDED: "Decidida",
  CLOSED: "Encerrada",
};

export default function WhistleblowingLookupPage() {
  const [credentials, setCredentials] = useState<{ protocol: string; accessCode: string } | null>(
    null,
  );
  const [caseView, setCaseView] = useState<WhistleblowingCasePublicView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const protocol = (form.get("protocol") as string).trim();
    const accessCode = (form.get("accessCode") as string).trim();
    try {
      const result = await apiFetch<WhistleblowingCasePublicView>(
        "/public/whistleblowing/cases/lookup",
        { method: "POST", body: JSON.stringify({ protocol, accessCode }) },
      );
      setCaseView(result);
      setCredentials({ protocol, accessCode });
    } catch {
      setError("Protocolo ou código de acesso inválidos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!credentials) return;
    setError(null);
    try {
      const result = await apiFetch<WhistleblowingCasePublicView>(
        "/public/whistleblowing/cases/messages",
        {
          method: "POST",
          body: JSON.stringify({ ...credentials, body: messageBody }),
        },
      );
      setCaseView(result);
      setMessageBody("");
    } catch {
      setError("Não foi possível enviar a mensagem agora.");
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-navy-primary text-2xl font-bold">Consultar denúncia</h1>
      <form onSubmit={handleLookup} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="protocol" className="text-sm font-medium">
            Protocolo
          </label>
          <input
            id="protocol"
            name="protocol"
            required
            placeholder="DEN-20260101-123456"
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="accessCode" className="text-sm font-medium">
            Código de acesso
          </label>
          <input
            id="accessCode"
            name="accessCode"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClassNames("primary")}>
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </form>

      {error && <p className="text-institutional-red mt-6">{error}</p>}

      {caseView && (
        <div className="border-border bg-surface mt-8 rounded-lg border p-6">
          <p className="text-text-secondary text-sm">Protocolo {caseView.protocol}</p>
          <p className="bg-background-light mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium">
            {STATUS_LABEL[caseView.status]}
          </p>

          <ol className="mt-6 space-y-4">
            {caseView.messages.map((message) => (
              <li key={message.id} className="border-border border-l-2 pl-4">
                <p className="text-text-secondary text-xs">
                  {message.direction === "FROM_REPORTER" ? "Você" : "Instituto Selecon"} —{" "}
                  {new Date(message.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm">{message.body}</p>
              </li>
            ))}
          </ol>

          <form onSubmit={handleAddMessage} className="mt-6 space-y-2">
            <label htmlFor="messageBody" className="text-sm font-medium">
              Enviar informação adicional
            </label>
            <textarea
              id="messageBody"
              name="messageBody"
              required
              rows={3}
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              className="border-border w-full rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className={buttonClassNames("secondary")}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
