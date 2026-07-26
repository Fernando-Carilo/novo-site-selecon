"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { WhistleblowingCaseDetail, WhistleblowingCaseSummary } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<WhistleblowingCaseSummary["status"], string> = {
  RECEIVED: "Recebida",
  TRIAGE: "Em triagem",
  UNDER_ANALYSIS: "Em análise",
  AWAITING_INFO: "Aguardando informações",
  DECIDED: "Decidida",
  CLOSED: "Encerrada",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as WhistleblowingCaseSummary["status"][];

export default function AdminWhistleblowingPage() {
  const [cases, setCases] = useState<WhistleblowingCaseSummary[]>([]);
  const [pendingAccessId, setPendingAccessId] = useState<string | null>(null);
  const [selected, setSelected] = useState<WhistleblowingCaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      setCases(await apiFetch<WhistleblowingCaseSummary[]>("/admin/whistleblowing/cases"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar denúncias");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingAccessId) return;
    setError(null);
    const justification = (new FormData(event.currentTarget).get("justification") as string) ?? "";
    try {
      const detail = await apiFetch<WhistleblowingCaseDetail>(
        `/admin/whistleblowing/cases/${pendingAccessId}/access`,
        { method: "POST", body: JSON.stringify({ justification }) },
      );
      setSelected(detail);
      setPendingAccessId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao acessar o caso");
    }
  }

  async function handleStatusChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const updated = await apiFetch<WhistleblowingCaseDetail>(
        `/admin/whistleblowing/cases/${selected.id}/status`,
        {
          method: "POST",
          body: JSON.stringify({
            status: form.get("status"),
            justification: form.get("statusJustification"),
          }),
        },
      );
      setSelected(updated);
      // `event.currentTarget` é anulado pelo React assim que o handler assíncrono
      // sofre um `await` — captura-se o elemento antes para poder resetar o form.
      formElement.reset();
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao atualizar status");
    }
  }

  async function handleAddMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const updated = await apiFetch<WhistleblowingCaseDetail>(
        `/admin/whistleblowing/cases/${selected.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            body: form.get("body"),
            justification: form.get("messageJustification"),
          }),
        },
      );
      setSelected(updated);
      // `event.currentTarget` é anulado pelo React assim que o handler assíncrono
      // sofre um `await` — captura-se o elemento antes para poder resetar o form.
      formElement.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar mensagem");
    }
  }

  async function handleDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formElement = event.currentTarget;
    const summary = new FormData(formElement).get("summary") as string;
    try {
      const updated = await apiFetch<WhistleblowingCaseDetail>(
        `/admin/whistleblowing/cases/${selected.id}/decision`,
        { method: "POST", body: JSON.stringify({ summary }) },
      );
      setSelected(updated);
      // `event.currentTarget` é anulado pelo React assim que o handler assíncrono
      // sofre um `await` — captura-se o elemento antes para poder resetar o form.
      formElement.reset();
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao registrar decisão");
    }
  }

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Canal de denúncias</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Toda visualização de um caso exige justificativa e fica registrada em trilha de auditoria
        própria e segregada.
      </p>
      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <caption className="sr-only">Fila de denúncias</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Protocolo
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Categoria
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr
                  key={item.id}
                  className={`border-border hover:bg-background-light cursor-pointer border-b ${selected?.id === item.id ? "bg-background-light" : ""}`}
                  onClick={() => {
                    setSelected(null);
                    setPendingAccessId(item.id);
                  }}
                >
                  <td className="py-2 pr-4 font-mono text-xs">{item.protocol}</td>
                  <td className="py-2 pr-4">{item.categoryName}</td>
                  <td className="py-2">{STATUS_LABEL[item.status]}</td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-text-secondary py-6 text-center">
                    Nenhuma denúncia registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pendingAccessId && (
          <div className="border-border bg-surface rounded-lg border p-5">
            <h2 className="text-navy-primary text-lg font-semibold">Justificativa de acesso</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Informe o motivo da consulta a este caso. Esta justificativa fica registrada de forma
              permanente.
            </p>
            <form onSubmit={handleAccess} className="mt-4 space-y-2">
              <textarea
                name="justification"
                required
                minLength={10}
                rows={3}
                placeholder="Ex.: verificação de rotina do caso designado à minha análise"
                className="border-border w-full rounded-md border px-3 py-2 text-sm"
              />
              <div className="flex gap-3">
                <button type="submit" className={buttonClassNames("primary")}>
                  Acessar caso
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAccessId(null)}
                  className={buttonClassNames("secondary")}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {selected && (
          <div className="border-border bg-surface rounded-lg border p-5">
            <p className="text-text-secondary text-xs">Protocolo {selected.protocol}</p>
            <h2 className="text-navy-primary mt-1 text-lg font-semibold">
              {selected.categoryName}
            </h2>
            <p className="bg-background-light mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium">
              {STATUS_LABEL[selected.status]}
            </p>
            <p className="mt-4 text-sm">{selected.description}</p>
            {selected.involvedPeople && (
              <p className="text-text-secondary mt-2 text-sm">
                <strong>Envolvidos:</strong> {selected.involvedPeople}
              </p>
            )}
            {selected.location && (
              <p className="text-text-secondary mt-1 text-sm">
                <strong>Local:</strong> {selected.location}
              </p>
            )}

            <ol className="mt-6 max-h-64 space-y-3 overflow-y-auto">
              {selected.messages.map((message) => (
                <li key={message.id} className="border-border border-l-2 pl-3 text-sm">
                  <p className="text-text-secondary text-xs">
                    {message.direction === "FROM_REPORTER" ? "Denunciante" : "Instituto Selecon"}
                  </p>
                  {message.body}
                </li>
              ))}
            </ol>

            {selected.decision ? (
              <div className="border-success-green bg-success-green/10 mt-4 rounded-md border p-3 text-sm">
                <p className="font-semibold">Decisão registrada</p>
                <p className="mt-1">{selected.decision.summary}</p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleStatusChange}
                  className="border-border mt-6 space-y-2 border-t pt-4"
                >
                  <label htmlFor="status" className="text-sm font-medium">
                    Atualizar status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={selected.status}
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="statusJustification"
                    required
                    minLength={10}
                    rows={2}
                    placeholder="Justificativa da mudança de status"
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <button type="submit" className={buttonClassNames("secondary")}>
                    Atualizar status
                  </button>
                </form>

                <form onSubmit={handleAddMessage} className="mt-4 space-y-2">
                  <label htmlFor="body" className="text-sm font-medium">
                    Enviar mensagem ao denunciante
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    required
                    rows={2}
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <textarea
                    name="messageJustification"
                    required
                    minLength={10}
                    rows={2}
                    placeholder="Justificativa do contato"
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <button type="submit" className={buttonClassNames("secondary")}>
                    Enviar mensagem
                  </button>
                </form>

                <form onSubmit={handleDecision} className="mt-4 space-y-2">
                  <label htmlFor="summary" className="text-sm font-medium">
                    Registrar decisão final
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    required
                    minLength={10}
                    rows={3}
                    className="border-border w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <button type="submit" className={buttonClassNames("primary")}>
                    Registrar decisão
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
