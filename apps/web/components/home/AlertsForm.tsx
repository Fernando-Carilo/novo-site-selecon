"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Button, CheckboxField, InputField, SelectField } from "@selecon/ui";
import { subscribeAlertsAction, type AlertsFormState } from "@/app/actions/alerts";

const INITIAL: AlertsFormState = { status: "idle" };

const UF_OPTIONS = ["RJ", "MT", "MS", "MG", "BA", "RR", "MA", "SP", "SE", "SC"].map((uf) => ({
  value: uf,
  label: uf,
}));

interface AlertsFormProps {
  contestSlug?: string;
  compact?: boolean;
}

export function AlertsForm({ contestSlug, compact = false }: AlertsFormProps) {
  const [state, formAction, pending] = useActionState(subscribeAlertsAction, INITIAL);

  if (state.status === "success") {
    return (
      <Alert tone="success" role="status" title="Alertas ativados">
        {state.message} Protocolo <strong className="tabular-nums">{state.protocol}</strong>.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {contestSlug ? <input type="hidden" name="contestSlug" value={contestSlug} /> : null}
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-[1fr_8rem]"}>
        <InputField
          id={`alerts-email${contestSlug ? `-${contestSlug}` : ""}`}
          name="email"
          type="email"
          label="Seu e-mail"
          placeholder="nome@exemplo.com.br"
          autoComplete="email"
          required
          error={state.errors?.email}
        />
        {contestSlug ? null : (
          <SelectField
            id="alerts-uf"
            name="uf"
            label="Estado (opcional)"
            options={UF_OPTIONS}
            placeholder="Todos"
          />
        )}
      </div>
      <CheckboxField
        id={`alerts-consent${contestSlug ? `-${contestSlug}` : ""}`}
        name="privacyConsent"
        required
        error={state.errors?.privacyConsent}
        label={
          <>
            Concordo em receber alertas por e-mail sobre editais e publicações, conforme a{" "}
            <Link
              href="/privacidade"
              className="text-action-blue font-semibold underline underline-offset-4"
            >
              política de privacidade
            </Link>
            . Posso cancelar a qualquer momento.
          </>
        }
      />
      {state.status === "error" && state.message ? (
        <Alert tone="danger" role="alert">
          {state.message}
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Receber alertas"}
      </Button>
    </form>
  );
}
