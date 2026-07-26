"use client";

import { useState, type FormEvent } from "react";
import type { TicketPublicView } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch } from "@/lib/api-client";

const STATUS_LABEL: Record<TicketPublicView["status"], string> = {
  NEW: "Novo",
  IN_PROGRESS: "Em atendimento",
  ANSWERED: "Respondido",
  CLOSED: "Encerrado",
  REOPENED: "Reaberto",
};

export default function TicketLookupPage() {
  const [ticket, setTicket] = useState<TicketPublicView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTicket(null);
    setLoading(true);
    const protocol = new FormData(event.currentTarget).get("protocol") as string;
    try {
      const result = await apiFetch<TicketPublicView>(
        `/public/tickets/${encodeURIComponent(protocol)}`,
      );
      setTicket(result);
    } catch {
      setError("Protocolo não encontrado. Verifique o número informado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-navy-primary text-2xl font-bold">Consultar protocolo</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
        <label className="sr-only" htmlFor="protocol">
          Número do protocolo
        </label>
        <input
          id="protocol"
          name="protocol"
          required
          placeholder="AT-20260101-123456"
          className="border-border flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className={buttonClassNames("primary")}>
          {loading ? "Buscando…" : "Consultar"}
        </button>
      </form>

      {error && <p className="text-institutional-red mt-6">{error}</p>}

      {ticket && (
        <div className="border-border bg-surface mt-8 rounded-lg border p-6">
          <p className="text-text-secondary text-sm">Protocolo {ticket.protocol}</p>
          <h2 className="text-navy-primary mt-1 text-xl font-semibold">{ticket.subject}</h2>
          <p className="bg-background-light mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium">
            {STATUS_LABEL[ticket.status]}
          </p>

          <ol className="mt-6 space-y-4">
            {ticket.messages.map((message) => (
              <li key={message.id} className="border-border border-l-2 pl-4">
                <p className="text-text-secondary text-xs">
                  {message.direction === "INBOUND" ? "Sua mensagem" : "Resposta do atendimento"} —{" "}
                  {new Date(message.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm">{message.body}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
