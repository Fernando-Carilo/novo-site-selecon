"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Alert,
  Button,
  CheckboxField,
  Icon,
  InputField,
  SelectField,
  TextareaField,
  buttonClassNames,
} from "@selecon/ui";
import {
  submitContactAction,
  type ContactField,
  type ContactFormState,
} from "@/app/actions/contact";
import { CONTACT_SUBJECTS, suggestFaqForSubject, type ContactSubjectId } from "@/lib/service/faq";

const INITIAL: ContactFormState = { status: "idle" };

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "E-mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "WEB", label: "Resposta pelo portal (consulta por protocolo)" },
];

const FIELD_LABELS: Record<ContactField, string> = {
  name: "Nome completo",
  email: "E-mail",
  phone: "Telefone",
  contestSlug: "Concurso relacionado",
  subject: "Assunto",
  preferredChannel: "Canal preferido para resposta",
  description: "Descrição",
  privacyConsent: "Aviso de privacidade",
};

const FIELD_IDS: Record<ContactField, string> = {
  name: "atd-name",
  email: "atd-email",
  phone: "atd-phone",
  contestSlug: "atd-contestSlug",
  subject: "atd-subject",
  preferredChannel: "atd-preferredChannel",
  description: "atd-description",
  privacyConsent: "atd-privacyConsent",
};

export interface ContactFormContestOption {
  value: string;
  label: string;
}

interface ContactFormProps {
  contests: ContactFormContestOption[];
  initialContestSlug?: string;
  initialSubject?: ContactSubjectId;
}

export function ContactForm({ contests, initialContestSlug, initialSubject }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContactAction, INITIAL);
  const [subject, setSubject] = useState<ContactSubjectId | "">(initialSubject ?? "");
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") feedbackRef.current?.focus();
  }, [state]);

  useEffect(() => {
    const sent = state.values?.subject;
    if (sent && CONTACT_SUBJECTS.some((s) => s.id === sent)) setSubject(sent as ContactSubjectId);
  }, [state.values?.subject]);

  if (state.status === "success") {
    return (
      <div ref={feedbackRef} tabIndex={-1} className="focus:outline-none">
        <Alert tone="success" role="status" title="Chamado registrado">
          <p>
            Protocolo <strong className="tabular-nums">{state.protocol}</strong>. {state.message}
          </p>
          <p className="mt-2">
            <Link
              href="/atendimento#protocolo"
              className="text-action-blue font-semibold underline underline-offset-4"
            >
              Consultar andamento pelo protocolo
            </Link>
          </p>
        </Alert>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const errorEntries = (Object.keys(errors) as ContactField[]).filter((key) => errors[key]);
  const isCommercial = subject === "COMERCIAL";
  const suggestions = suggestFaqForSubject(subject || undefined, 3);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" ? (
        <div ref={feedbackRef} tabIndex={-1} className="focus:outline-none">
          <Alert tone="danger" role="alert" title={state.message}>
            {errorEntries.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {errorEntries.map((key) => (
                  <li key={key}>
                    <a
                      href={`#${FIELD_IDS[key]}`}
                      className="font-semibold underline underline-offset-4"
                    >
                      {FIELD_LABELS[key]}
                    </a>
                    : {errors[key]}
                  </li>
                ))}
              </ul>
            ) : null}
          </Alert>
        </div>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-navy-primary text-lg font-bold">Seus dados</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id={FIELD_IDS.name}
            name="name"
            label={FIELD_LABELS.name}
            autoComplete="name"
            required
            maxLength={200}
            defaultValue={values.name}
            error={errors.name}
          />
          <InputField
            id={FIELD_IDS.email}
            name="email"
            type="email"
            label={FIELD_LABELS.email}
            hint="A resposta e o protocolo são enviados para este e-mail."
            autoComplete="email"
            required
            defaultValue={values.email}
            error={errors.email}
          />
          <InputField
            id={FIELD_IDS.phone}
            name="phone"
            type="tel"
            label={`${FIELD_LABELS.phone} (opcional)`}
            hint="Com DDD. Necessário se preferir resposta por WhatsApp."
            autoComplete="tel"
            maxLength={30}
            defaultValue={values.phone}
            error={errors.phone}
          />
          <SelectField
            id={FIELD_IDS.preferredChannel}
            name="preferredChannel"
            label={FIELD_LABELS.preferredChannel}
            options={CHANNEL_OPTIONS}
            placeholder="Selecione"
            required
            defaultValue={values.preferredChannel ?? "EMAIL"}
            error={errors.preferredChannel}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-primary text-lg font-bold">Sua solicitação</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id={FIELD_IDS.contestSlug}
            name="contestSlug"
            label={FIELD_LABELS.contestSlug}
            options={contests}
            placeholder="Não se refere a um concurso"
            defaultValue={values.contestSlug ?? initialContestSlug ?? ""}
            error={errors.contestSlug}
          />
          <SelectField
            id={FIELD_IDS.subject}
            name="subject"
            label={FIELD_LABELS.subject}
            options={CONTACT_SUBJECTS.map((s) => ({ value: s.id, label: s.label }))}
            placeholder="Selecione"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value as ContactSubjectId | "")}
            error={errors.subject}
          />
        </div>

        {isCommercial ? (
          <Alert tone="info" role="status" title="Propostas e contratação têm um canal próprio">
            <p>
              Pedidos de proposta, orçamento ou contratação de concursos e processos seletivos
              entram na fila comercial, com classificação por tipo de projeto.
            </p>
            <p className="mt-3">
              <Link href="/comercial#solicitar-proposta" className={buttonClassNames("primary")}>
                Ir para o formulário comercial
                <Icon name="arrow-right" size={16} />
              </Link>
            </p>
          </Alert>
        ) : null}

        {!isCommercial && suggestions.length > 0 ? (
          <div className="border-border bg-background-light rounded-lg border p-4">
            <h3 className="text-navy-primary text-base font-bold">
              Talvez isto responda sua dúvida
            </h3>
            <p className="text-text-secondary mt-1 text-sm">
              Respostas oficiais para as perguntas mais comuns sobre este assunto. Você pode abrir o
              chamado mesmo assim.
            </p>
            <Accordion
              className="mt-3"
              items={suggestions.map((item) => ({
                id: `sugestao-${item.id}`,
                title: item.question,
                content: (
                  <div className="space-y-3 text-sm">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                    {item.links?.length ? (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {item.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-action-blue font-semibold underline underline-offset-4"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ),
              }))}
            />
          </div>
        ) : null}

        <TextareaField
          id={FIELD_IDS.description}
          name="description"
          label={FIELD_LABELS.description}
          hint="Informe o número da inscrição, cargo e o que já verificou. Não inclua senha nem dados bancários."
          required
          maxLength={5000}
          rows={6}
          defaultValue={values.description}
          error={errors.description}
        />
        <p className="text-text-secondary flex gap-2 text-sm">
          <Icon name="info" size={18} className="text-action-blue mt-0.5" />
          Anexos podem ser enviados após a resposta inicial, pelo e-mail do protocolo.
        </p>
      </fieldset>

      <CheckboxField
        id={FIELD_IDS.privacyConsent}
        name="privacyConsent"
        required
        defaultChecked={values.privacyConsent === "on"}
        error={errors.privacyConsent}
        label={
          <>
            Li o{" "}
            <Link
              href="/privacidade"
              className="text-action-blue font-semibold underline underline-offset-4"
            >
              aviso de privacidade
            </Link>{" "}
            e concordo que meus dados sejam usados pelo Instituto Selecon exclusivamente para
            responder a este chamado.
          </>
        }
      />

      <Button type="submit" size="lg" disabled={pending || isCommercial}>
        {pending ? "Enviando..." : "Abrir chamado"}
      </Button>
    </form>
  );
}
