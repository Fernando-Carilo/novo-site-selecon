"use client";

import { useState } from "react";
import { buttonClassNames } from "@selecon/ui";
import { consultarDenuncia, enviarMensagem, formatDateTime, type DenunciaView } from "@/lib/denuncias";

const input = "border-border bg-surface text-text-primary placeholder:text-text-secondary/70 focus:border-action-blue focus:ring-action-blue/25 mt-1.5 block min-h-11 w-full rounded-md border px-3 py-2 text-base outline-none transition-[box-shadow,border-color] focus:ring-4";
const label = "text-navy-primary block text-sm font-semibold";

/** Consulta pelo protocolo + código e conversa com a Ouvidoria. */
export function Consulta() {
  const [protocol, setProtocol] = useState("");
  const [code, setCode] = useState("");
  const [view, setView] = useState<DenunciaView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null); setLoading(true);
    try {
      setView(await consultarDenuncia(protocol, code));
    } catch (err) {
      setView(null);
      setError(err instanceof Error ? err.message : "Não foi possível consultar.");
    } finally {
      setLoading(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSending(true); setSent(false);
    try {
      await enviarMensagem(protocol, code, message);
      setMessage(""); setSent(true);
      await lookup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <form onSubmit={lookup} className="border-border bg-surface shadow-low grid gap-4 rounded-xl border p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label className={label} htmlFor="protocol">Protocolo</label><input id="protocol" value={protocol} onChange={(e) => setProtocol(e.target.value)} className={`${input} font-mono`} placeholder="SC-2026-000000" required autoComplete="off" /></div>
        <div><label className={label} htmlFor="code">Código de acesso</label><input id="code" value={code} onChange={(e) => setCode(e.target.value)} className={`${input} font-mono`} placeholder="XXXXXXX-XXXXXXX-XXXXXXX-XXXXXXX" required autoComplete="off" /></div>
        <button type="submit" disabled={loading} className={buttonClassNames("primary", "min-h-11")}>{loading ? "Consultando…" : "Consultar"}</button>
      </form>
      {error ? <p role="alert" className="border-institutional-red/30 bg-institutional-red/5 text-institutional-red rounded-lg border p-3 text-sm">{error}</p> : null}

      {view ? (
        <article className="space-y-6">
          <div className="border-border bg-surface shadow-low rounded-xl border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Protocolo</p>
                <p className="text-navy-primary font-mono text-xl font-bold">{view.protocol}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${view.closed ? "bg-navy-primary/5 text-text-secondary" : "bg-action-blue/10 text-action-blue"}`}>{view.statusLabel}</span>
            </div>
            <p className="text-text-secondary mt-3 text-sm">Registrada em {formatDateTime(view.createdAt)} · última atualização {formatDateTime(view.updatedAt)}</p>
          </div>

          <section aria-labelledby="msgs-title" className="border-border bg-surface shadow-low rounded-xl border p-6">
            <h2 id="msgs-title" className="text-navy-primary text-lg font-bold">Mensagens</h2>
            {view.messages.length === 0 ? <p className="text-text-secondary mt-3 text-sm">A Ouvidoria ainda não respondeu. Você será avisado por e-mail se tiver se identificado; caso contrário, consulte novamente mais tarde.</p> : (
              <ol className="mt-4 space-y-3">
                {view.messages.map((m) => (
                  <li key={m.id} className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.author === "EQUIPE" ? "bg-action-blue/10 text-navy-primary" : "bg-background-light text-text-primary ml-auto"}`}>
                    <p className="text-text-secondary mb-1 text-xs font-semibold uppercase tracking-wide">{m.author === "EQUIPE" ? m.authorName ?? "Ouvidoria" : "Você"} · {formatDateTime(m.createdAt)}</p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ol>
            )}
            {!view.closed ? (
              <form onSubmit={send} className="mt-6 space-y-3">
                <label className={label} htmlFor="message">Enviar informação adicional</label>
                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className={`${input} min-h-[110px]`} minLength={5} maxLength={4000} required placeholder="Acrescente detalhes, documentos citados ou responda a uma pergunta da Ouvidoria." />
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={sending || message.trim().length < 5} className={buttonClassNames("primary")}>{sending ? "Enviando…" : "Enviar mensagem"}</button>
                  {sent ? <span className="text-success-green text-sm font-semibold" role="status">Mensagem enviada.</span> : null}
                </div>
              </form>
            ) : <p className="text-text-secondary mt-4 text-sm">Esta denúncia foi encerrada e não aceita novas mensagens.</p>}
          </section>
        </article>
      ) : null}
    </div>
  );
}
