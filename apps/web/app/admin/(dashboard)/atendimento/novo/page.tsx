"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const CHANNELS = [
  { id: "telefone", label: "Telefone" },
  { id: "chat", label: "Chat" },
  { id: "email", label: "E-mail" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "outro", label: "Outro" },
];

const STATUS_OPTIONS = [
  { id: "resolvido", label: "Resolvido" },
  { id: "pendente", label: "Pendente" },
  { id: "encaminhado", label: "Encaminhado" },
];

export default function NovoAtendimentoPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section>
        <div className="rounded-lg border border-green/30 bg-green-soft p-6 text-center">
          <span className="text-4xl" role="img" aria-hidden="true">
            ✅
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-ink">Atendimento registrado</h1>
          <p className="mt-2 text-sm text-muted">
            O atendimento foi registrado com sucesso.
          </p>
          <Link
            href="/admin/atendimento"
            className="mt-4 min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
          >
            Voltar para lista
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-3">
        <Link href="/admin/atendimento" className="text-muted hover:text-ink transition-colors">
          ← Voltar
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-ink">Novo Atendimento</h1>
      <p className="mt-1 text-sm text-muted">Registre um novo atendimento ao público.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="att-date"
              className="block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Data
            </label>
            <input
              id="att-date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div>
            <label
              htmlFor="att-base"
              className="block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Base
            </label>
            <input
              id="att-base"
              type="text"
              placeholder="Ex: Volta Redonda"
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="att-certame"
            className="block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Certame
          </label>
          <input
            id="att-certame"
            type="text"
            required
            placeholder="Nome do concurso"
            className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>

        <div>
          <label
            htmlFor="att-motivo"
            className="block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Motivo
          </label>
          <textarea
            id="att-motivo"
            rows={3}
            required
            placeholder="Descreva o motivo do atendimento"
            className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="att-canal"
              className="block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Canal
            </label>
            <select
              id="att-canal"
              required
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            >
              <option value="">Selecione...</option>
              {CHANNELS.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="att-qtd"
              className="block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Quantidade
            </label>
            <input
              id="att-qtd"
              type="number"
              min={1}
              defaultValue={1}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div>
            <label
              htmlFor="att-status"
              className="block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Status de resolução
            </label>
            <select
              id="att-status"
              required
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            >
              <option value="">Selecione...</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="att-notas"
            className="block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Notas
          </label>
          <textarea
            id="att-notas"
            rows={3}
            placeholder="Observações adicionais (opcional)"
            className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>

        <button
          type="submit"
          className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
        >
          Registrar atendimento
        </button>
      </form>
    </section>
  );
}
