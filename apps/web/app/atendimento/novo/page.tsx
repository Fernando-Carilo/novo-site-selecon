"use client";

import { useState, type FormEvent } from "react";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function NewTicketPage() {
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ protocol: string }>("/public/tickets", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          subject: form.get("subject"),
          preferredChannel: "WEB",
          description: form.get("description"),
          privacyConsent: form.get("privacyConsent") === "on",
        }),
      });
      setProtocol(result.protocol);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar sua solicitação.");
    } finally {
      setSubmitting(false);
    }
  }

  if (protocol) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-success-green text-2xl font-bold">Solicitação registrada</h1>
        <p className="text-text-secondary mt-4">
          Guarde o número de protocolo abaixo para acompanhar sua solicitação:
        </p>
        <p className="border-border bg-background-light mt-4 rounded-md border p-4 font-mono text-lg">
          {protocol}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-navy-primary text-2xl font-bold">Abrir solicitação</h1>
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
          <label htmlFor="name" className="text-sm font-medium">
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="subject" className="text-sm font-medium">
            Assunto
          </label>
          <input
            id="subject"
            name="subject"
            required
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Descreva sua solicitação
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="privacyConsent"
            name="privacyConsent"
            type="checkbox"
            required
            className="mt-1"
          />
          <label htmlFor="privacyConsent" className="text-sm">
            Estou ciente de que meus dados serão tratados conforme a Política de Privacidade do
            Instituto Selecon.
          </label>
        </div>
        <button type="submit" disabled={submitting} className={buttonClassNames("primary")}>
          {submitting ? "Enviando…" : "Enviar solicitação"}
        </button>
      </form>
    </section>
  );
}
