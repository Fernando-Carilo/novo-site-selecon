"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { TicketDetail, TicketSummary } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<TicketSummary["status"], string> = {
  NEW: "Novo",
  IN_PROGRESS: "Em atendimento",
  ANSWERED: "Respondido",
  CLOSED: "Encerrado",
  REOPENED: "Reaberto",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      setTickets(await apiFetch<TicketSummary[]>("/admin/tickets"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar atendimentos");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function openTicket(id: string) {
    setError(null);
    try {
      setSelected(await apiFetch<TicketDetail>(`/admin/tickets/${id}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao abrir atendimento");
    }
  }

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const body = new FormData(event.currentTarget).get("body") as string;
    try {
      const updated = await apiFetch<TicketDetail>(`/admin/tickets/${selected.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setSelected(updated);
      event.currentTarget.reset();
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao responder");
    }
  }

  async function handleClose() {
    if (!selected) return;
    try {
      const updated = await apiFetch<TicketDetail>(`/admin/tickets/${selected.id}/close`, {
        method: "POST",
        body: "{}",
      });
      setSelected(updated);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao encerrar");
    }
  }

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Atendimento</h1>
      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <caption className="sr-only">Fila de atendimento</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Protocolo
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Contato
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`border-border hover:bg-background-light cursor-pointer border-b ${selected?.id === ticket.id ? "bg-background-light" : ""}`}
                  onClick={() => openTicket(ticket.id)}
                >
                  <td className="py-2 pr-4 font-mono text-xs">{ticket.protocol}</td>
                  <td className="py-2 pr-4">{STATUS_LABEL[ticket.status]}</td>
                  <td className="py-2">{ticket.contactName}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-text-secondary py-6 text-center">
                    Nenhum atendimento na fila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="border-border bg-surface rounded-lg border p-5">
            <p className="text-text-secondary text-xs">Protocolo {selected.protocol}</p>
            <h2 className="text-navy-primary mt-1 text-lg font-semibold">{selected.subject}</h2>

            <ol className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {selected.messages.map((message) => (
                <li key={message.id} className="border-border border-l-2 pl-3 text-sm">
                  <p className="text-text-secondary text-xs">
                    {message.direction === "INBOUND" ? "Cidadão" : "Atendimento"}
                  </p>
                  {message.body}
                </li>
              ))}
            </ol>

            {selected.status !== "CLOSED" && (
              <>
                <form onSubmit={handleReply} className="mt-4 space-y-2">
                  <label htmlFor="body" className="text-sm font-medium">
                    Responder
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    required
                    rows={3}
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <button type="submit" className={buttonClassNames("primary")}>
                    Enviar resposta
                  </button>
                </form>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-institutional-red mt-3 text-sm hover:underline"
                >
                  Encerrar atendimento
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
