"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, Badge, Button, Icon, InputField, type BadgeTone } from "@selecon/ui";
import type { TicketStatus } from "@selecon/contracts";
import { lookupProtocolAction, type ProtocolLookupState } from "@/app/actions/protocol";

const INITIAL: ProtocolLookupState = { status: "idle" };

const STATUS_LABEL: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  NEW: { label: "Recebido", tone: "info" },
  IN_PROGRESS: { label: "Em atendimento", tone: "warning" },
  ANSWERED: { label: "Respondido", tone: "success" },
  CLOSED: { label: "Encerrado", tone: "neutral" },
  REOPENED: { label: "Reaberto", tone: "warning" },
};

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : DATE_TIME.format(date);
}

interface ProtocolLookupFormProps {
  /** URL do atendimento anterior, para protocolos emitidos antes deste portal. */
  legacyServiceUrl: string;
}

export function ProtocolLookupForm({ legacyServiceUrl }: ProtocolLookupFormProps) {
  const [state, formAction, pending] = useActionState(lookupProtocolAction, INITIAL);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") feedbackRef.current?.focus();
  }, [state]);

  return (
    <div className="space-y-5">
      <form
        action={formAction}
        className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
        noValidate
      >
        <InputField
          id="protocolo-numero"
          name="protocol"
          label="Número do protocolo"
          hint="Como consta no e-mail de confirmação, por exemplo ATD-2026-A1B2C3."
          autoComplete="off"
          spellCheck={false}
          required
          maxLength={40}
          defaultValue={state.protocol}
          error={state.errors?.protocol}
          className="uppercase"
        />
        <Button type="submit" disabled={pending} className="sm:mb-0">
          {pending ? "Consultando..." : "Consultar"}
        </Button>
      </form>

      <div ref={feedbackRef} tabIndex={-1} className="focus:outline-none" aria-live="polite">
        {state.status === "error" && state.message ? (
          <Alert tone="danger" role="alert">
            {state.message}
          </Alert>
        ) : null}

        {state.status === "not_found" ? (
          <Alert tone="warning" role="status" title="Protocolo não encontrado">
            <p>
              Não há chamado com o número <strong className="tabular-nums">{state.protocol}</strong>{" "}
              neste portal. Confira se o número foi digitado como consta no e-mail de confirmação.
            </p>
            <p className="mt-2">
              Protocolos abertos no sistema de atendimento anterior continuam sendo consultados em{" "}
              <a
                href={legacyServiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-blue inline-flex items-center gap-1 font-semibold underline underline-offset-4"
              >
                {legacyServiceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <Icon name="external-link" size={14} label="abre em nova aba" />
              </a>
              .
            </p>
          </Alert>
        ) : null}

        {state.status === "found" && state.result ? (
          <article
            className="border-border bg-surface rounded-lg border p-5"
            aria-labelledby="protocolo-resultado"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="protocolo-resultado" className="text-navy-primary text-lg font-bold">
                Protocolo <span className="tabular-nums">{state.protocol}</span>
              </h3>
              <Badge tone={STATUS_LABEL[state.result.status].tone} dot>
                {STATUS_LABEL[state.result.status].label}
              </Badge>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                  Assunto
                </dt>
                <dd className="text-navy-primary font-semibold">{state.result.subject}</dd>
              </div>
              <div>
                <dt className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                  Última atualização
                </dt>
                <dd className="text-navy-primary font-semibold tabular-nums">
                  <time dateTime={state.result.updatedAt}>
                    {formatDateTime(state.result.updatedAt)}
                  </time>
                </dd>
              </div>
            </dl>
            {state.result.messages.length > 0 ? (
              <ol className="mt-5 space-y-3" aria-label="Mensagens do chamado">
                {state.result.messages.map((message, index) => (
                  <li
                    key={`${message.at}-${index}`}
                    className={`rounded-md border p-4 text-sm ${
                      message.direction === "OUT"
                        ? "border-action-blue/30 bg-wash-blue"
                        : "border-border bg-background-light"
                    }`}
                  >
                    <p className="text-text-secondary flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span>{message.direction === "OUT" ? "Atendimento Selecon" : "Você"}</span>
                      <time dateTime={message.at} className="tabular-nums">
                        {formatDateTime(message.at)}
                      </time>
                    </p>
                    <p className="text-text-primary mt-2 whitespace-pre-line leading-relaxed">
                      {message.body}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-text-secondary mt-5 text-sm">
                Ainda não há mensagens neste chamado. A resposta será enviada ao e-mail informado na
                abertura.
              </p>
            )}
          </article>
        ) : null}
      </div>
    </div>
  );
}
