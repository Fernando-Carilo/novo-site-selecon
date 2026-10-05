"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Alert, Button, CheckboxField, InputField, SelectField, TextareaField } from "@selecon/ui";
import {
  submitCommercialLeadAction,
  type CommercialLeadField,
  type CommercialLeadFormState,
} from "@/app/actions/commercial";

const INITIAL: CommercialLeadFormState = { status: "idle" };

const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((uf) => ({ value: uf, label: uf }));

const SPHERE_OPTIONS = [
  { value: "MUNICIPAL", label: "Prefeitura ou órgão municipal" },
  { value: "ESTADUAL", label: "Governo ou órgão estadual" },
  { value: "FEDERAL", label: "Órgão federal" },
  { value: "AUTARQUIA_OU_FUNDACAO", label: "Autarquia ou fundação" },
  { value: "EMPRESA_PUBLICA", label: "Empresa pública ou sociedade de economia mista" },
  { value: "CONSORCIO", label: "Consórcio público" },
  { value: "PRIVADO", label: "Instituição privada" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "CONCURSO_PUBLICO", label: "Concurso público" },
  { value: "PROCESSO_SELETIVO", label: "Processo seletivo" },
  { value: "SELECAO_ESCOLAR_OU_VESTIBULAR", label: "Seleção escolar ou vestibular" },
  { value: "CAPACITACAO", label: "Capacitação ou curso de formação" },
  { value: "PESQUISA", label: "Pesquisa ou avaliação institucional" },
  { value: "OUTRO", label: "Outro" },
];

const CANDIDATES_OPTIONS = [
  { value: "ATE_5_MIL", label: "Até 5 mil candidatos" },
  { value: "DE_5_A_20_MIL", label: "De 5 mil a 20 mil" },
  { value: "DE_20_A_50_MIL", label: "De 20 mil a 50 mil" },
  { value: "DE_50_A_100_MIL", label: "De 50 mil a 100 mil" },
  { value: "ACIMA_DE_100_MIL", label: "Acima de 100 mil" },
  { value: "NAO_SEI", label: "Ainda não sei" },
];

/** Rótulos usados no resumo de erros — mesma ordem visual do formulário. */
const FIELD_LABELS: Record<CommercialLeadField, string> = {
  organizationName: "Órgão ou instituição",
  organizationSphere: "Esfera",
  uf: "Estado",
  city: "Município",
  contactName: "Nome do contato",
  contactRole: "Cargo ou função",
  email: "E-mail institucional",
  phone: "Telefone",
  projectType: "Tipo de projeto",
  estimatedCandidates: "Estimativa de candidatos",
  expectedStart: "Previsão de início",
  hasTermOfReference: "Termo de referência",
  message: "Descrição da demanda",
  privacyConsent: "Aviso de privacidade",
};

const FIELD_IDS: Record<CommercialLeadField, string> = {
  organizationName: "com-organizationName",
  organizationSphere: "com-organizationSphere",
  uf: "com-uf",
  city: "com-city",
  contactName: "com-contactName",
  contactRole: "com-contactRole",
  email: "com-email",
  phone: "com-phone",
  projectType: "com-projectType",
  estimatedCandidates: "com-estimatedCandidates",
  expectedStart: "com-expectedStart",
  hasTermOfReference: "com-hasTermOfReference",
  message: "com-message",
  privacyConsent: "com-privacyConsent",
};

export function CommercialLeadForm() {
  const [state, formAction, pending] = useActionState(submitCommercialLeadAction, INITIAL);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") feedbackRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={feedbackRef} tabIndex={-1} className="focus:outline-none">
        <Alert tone="success" role="status" title="Solicitação registrada">
          <p>
            Protocolo <strong className="tabular-nums">{state.protocol}</strong>. {state.message}
          </p>
          <p className="mt-2">
            Enquanto isso, conheça as{" "}
            <Link
              href="/servicos"
              className="text-action-blue font-semibold underline underline-offset-4"
            >
              linhas de serviço
            </Link>{" "}
            e os certames de referência nesta página.
          </p>
        </Alert>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const errorEntries = (Object.keys(errors) as CommercialLeadField[]).filter((key) => errors[key]);

  return (
    <form action={formAction} className="space-y-6" noValidate aria-describedby="com-form-note">
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
        <legend className="text-navy-primary text-lg font-bold">Órgão ou instituição</legend>
        <InputField
          id={FIELD_IDS.organizationName}
          name="organizationName"
          label={FIELD_LABELS.organizationName}
          autoComplete="organization"
          required
          maxLength={200}
          defaultValue={values.organizationName}
          error={errors.organizationName}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem_1fr]">
          <SelectField
            id={FIELD_IDS.organizationSphere}
            name="organizationSphere"
            label={FIELD_LABELS.organizationSphere}
            options={SPHERE_OPTIONS}
            placeholder="Selecione"
            required
            defaultValue={values.organizationSphere ?? ""}
            error={errors.organizationSphere}
          />
          <SelectField
            id={FIELD_IDS.uf}
            name="uf"
            label={FIELD_LABELS.uf}
            options={UF_OPTIONS}
            placeholder="UF"
            required
            defaultValue={values.uf ?? ""}
            error={errors.uf}
          />
          <InputField
            id={FIELD_IDS.city}
            name="city"
            label={FIELD_LABELS.city}
            autoComplete="address-level2"
            required
            maxLength={120}
            defaultValue={values.city}
            error={errors.city}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-primary text-lg font-bold">Pessoa de contato</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id={FIELD_IDS.contactName}
            name="contactName"
            label={FIELD_LABELS.contactName}
            autoComplete="name"
            required
            maxLength={200}
            defaultValue={values.contactName}
            error={errors.contactName}
          />
          <InputField
            id={FIELD_IDS.contactRole}
            name="contactRole"
            label={FIELD_LABELS.contactRole}
            autoComplete="organization-title"
            required
            maxLength={120}
            placeholder="Ex.: Secretário(a) de Administração"
            defaultValue={values.contactRole}
            error={errors.contactRole}
          />
          <InputField
            id={FIELD_IDS.email}
            name="email"
            type="email"
            label={FIELD_LABELS.email}
            autoComplete="email"
            required
            defaultValue={values.email}
            error={errors.email}
          />
          <InputField
            id={FIELD_IDS.phone}
            name="phone"
            type="tel"
            label={FIELD_LABELS.phone}
            autoComplete="tel"
            required
            maxLength={30}
            placeholder="(DDD) número"
            defaultValue={values.phone}
            error={errors.phone}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-primary text-lg font-bold">Projeto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id={FIELD_IDS.projectType}
            name="projectType"
            label={FIELD_LABELS.projectType}
            hint="Define a classificação do pedido na fila comercial."
            options={PROJECT_TYPE_OPTIONS}
            placeholder="Selecione"
            required
            defaultValue={values.projectType ?? ""}
            error={errors.projectType}
          />
          <SelectField
            id={FIELD_IDS.estimatedCandidates}
            name="estimatedCandidates"
            label={FIELD_LABELS.estimatedCandidates}
            options={CANDIDATES_OPTIONS}
            placeholder="Selecione"
            required
            defaultValue={values.estimatedCandidates ?? ""}
            error={errors.estimatedCandidates}
          />
        </div>
        <InputField
          id={FIELD_IDS.expectedStart}
          name="expectedStart"
          label={`${FIELD_LABELS.expectedStart} (opcional)`}
          hint="Texto livre, ex.: 1º semestre de 2027."
          maxLength={60}
          defaultValue={values.expectedStart}
          error={errors.expectedStart}
        />
        <CheckboxField
          id={FIELD_IDS.hasTermOfReference}
          name="hasTermOfReference"
          defaultChecked={values.hasTermOfReference === "on"}
          error={errors.hasTermOfReference}
          label="Já temos termo de referência ou estudo técnico preliminar elaborado."
        />
        <TextareaField
          id={FIELD_IDS.message}
          name="message"
          label={FIELD_LABELS.message}
          hint="Cargos ou áreas previstas, quantidade de vagas, etapas desejadas (provas, títulos, TAF, curso de formação) e outras informações relevantes."
          required
          maxLength={5000}
          rows={6}
          defaultValue={values.message}
          error={errors.message}
        />
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
            e concordo que os dados informados sejam usados pelo Instituto Selecon exclusivamente
            para responder a esta solicitação comercial.
          </>
        }
      />

      <p id="com-form-note" className="text-text-secondary text-sm">
        O pedido entra na fila Comercial da Central de Serviços Selecon, classificado pelo tipo de
        projeto, e recebe um protocolo com prefixo COM.
      </p>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando..." : "Enviar solicitação de proposta"}
      </Button>
    </form>
  );
}
