"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { buttonClassNames } from "@selecon/ui";
import {
  ApiError,
  EXAM_CATEGORIES,
  RECEIPT_KEY,
  createDenuncia,
  getConfig,
  presignAnexo,
  type DenunciaConfig,
} from "@/lib/denuncias";

type Attachment = { key: string; filename: string; mimeType: string; size: number };

const INITIAL = {
  isAnonymous: true,
  reporterName: "",
  reporterEmail: "",
  reporterPhone: "",
  category: "",
  otherCategory: "",
  relatedArea: "",
  examConcurso: "",
  examOrgao: "",
  examEdital: "",
  examCargo: "",
  examLocal: "",
  examDataFato: "",
  examEtapa: "",
  examEmAndamento: "" as "" | "sim" | "nao",
  physicalThreat: false,
  evidenceDestructionRisk: false,
  description: "",
  consent: false,
};

const input =
  "border-border bg-surface text-text-primary placeholder:text-text-secondary/70 focus:border-action-blue focus:ring-action-blue/25 mt-1.5 block min-h-11 w-full rounded-md border px-3 py-2 text-base outline-none transition-[box-shadow,border-color] focus:ring-4";
const label = "text-navy-primary block text-sm font-semibold";
const hint = "text-text-secondary mt-1 text-xs";
const errorText = "text-institutional-red mt-1 text-xs font-semibold";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: string;
        },
      ) => string;
    };
  }
}

/**
 * Formulário público de denúncia (portado do canal anterior). Validação espelha
 * a da Central; erros de campo vindos da API aparecem no campo. Anexos vão
 * direto ao S3 por URL pré-assinada. O comprovante (protocolo + código) vai
 * para sessionStorage — nunca para a URL.
 */
export function DenunciaForm() {
  const router = useRouter();
  const [config, setConfig] = useState<DenunciaConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileRendered = useRef(false);

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch((e) => setConfigError(e instanceof Error ? e.message : "Canal indisponível."));
  }, []);

  const renderTurnstile = () => {
    if (
      !config?.turnstileSiteKey ||
      !turnstileRef.current ||
      turnstileRendered.current ||
      !window.turnstile
    )
      return;
    turnstileRendered.current = true;
    window.turnstile.render(turnstileRef.current, {
      sitekey: config.turnstileSiteKey,
      callback: setTurnstileToken,
      "expired-callback": () => setTurnstileToken(undefined),
      theme: "light",
    });
  };
  useEffect(() => {
    renderTurnstile();
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof typeof INITIAL>(k: K, v: (typeof INITIAL)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };
  const isExam = EXAM_CATEGORIES.has(form.category);
  const descLen = form.description.trim().replace(/\s+/g, " ").length;

  async function onFile(file: File | undefined) {
    if (!file || !config) return;
    if (attachments.length >= config.maxAttachments)
      return setError(`Máximo de ${config.maxAttachments} anexos.`);
    if (!config.allowedMimeTypes.includes(file.type))
      return setError("Tipo de arquivo não permitido (use PDF, PNG, JPG ou WEBP).");
    if (file.size > config.maxUploadBytes)
      return setError("Arquivo excede o tamanho máximo de 10 MB.");
    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, key } = await presignAnexo(file.type, file.size, file.name);
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Falha ao enviar o arquivo. Tente novamente.");
      setAttachments((a) => [
        ...a,
        { key, filename: file.name, mimeType: file.type, size: file.size },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar o anexo.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setError(null);
    setFieldErrors({});
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = "Escolha a categoria";
    if (form.category === "OUTRO" && !form.otherCategory.trim())
      errs.otherCategory = "Descreva a categoria";
    if (!form.isAnonymous && !form.reporterName.trim()) errs.reporterName = "Informe seu nome";
    if (isExam) {
      if (!form.examConcurso.trim()) errs.examConcurso = "Informe o nome do concurso";
      if (!form.examEdital.trim()) errs.examEdital = "Informe o número do edital";
      if (!form.examEmAndamento)
        errs.examEmAndamento = "Informe se a situação está ocorrendo agora";
    }
    if (descLen < config.descriptionMin)
      errs.description = `Detalhe um pouco mais o ocorrido: pelo menos ${config.descriptionMin} caracteres.`;
    if (!form.consent)
      errs.consent = "É necessário confirmar a ciência sobre o tratamento dos dados";
    if (config.turnstileSiteKey && !turnstileToken)
      errs.turnstile = "Conclua a verificação anti-spam.";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      document
        .querySelector<HTMLElement>("[data-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const receipt = await createDenuncia({
        isAnonymous: form.isAnonymous,
        reporterName: form.isAnonymous ? undefined : form.reporterName.trim(),
        reporterEmail: form.isAnonymous ? undefined : form.reporterEmail.trim() || undefined,
        reporterPhone: form.isAnonymous ? undefined : form.reporterPhone.trim() || undefined,
        category: form.category,
        otherCategory: form.otherCategory.trim() || undefined,
        relatedArea: form.relatedArea.trim() || undefined,
        ...(isExam
          ? {
              examConcurso: form.examConcurso.trim(),
              examOrgao: form.examOrgao.trim() || undefined,
              examEdital: form.examEdital.trim(),
              examCargo: form.examCargo.trim() || undefined,
              examLocal: form.examLocal.trim() || undefined,
              examDataFato: form.examDataFato || undefined,
              examEtapa: form.examEtapa || undefined,
              examEmAndamento: form.examEmAndamento === "sim",
            }
          : {}),
        physicalThreat: form.physicalThreat,
        evidenceDestructionRisk: form.evidenceDestructionRisk,
        description: form.description,
        consent: true,
        turnstileToken,
        attachments: attachments.length ? attachments : undefined,
      });
      sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
      router.push("/denuncias/confirmacao");
    } catch (e) {
      if (e instanceof ApiError && e.issues) {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.issues)) if (v[0]) mapped[k] = v[0];
        setFieldErrors(mapped);
      }
      setError(e instanceof Error ? e.message : "Não foi possível registrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (configError)
    return (
      <p
        role="alert"
        className="border-institutional-red/30 bg-institutional-red/5 text-institutional-red mt-8 rounded-lg border p-4 text-sm"
      >
        {configError}
      </p>
    );
  if (!config)
    return (
      <p className="text-text-secondary mt-8 text-sm" role="status">
        Carregando o formulário…
      </p>
    );

  const Err = ({ k }: { k: string }) =>
    fieldErrors[k] ? (
      <p className={errorText} data-error role="alert">
        {fieldErrors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} className="mt-10 space-y-10" noValidate>
      {config.turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderTurnstile}
        />
      ) : null}

      <fieldset className="border-border bg-surface shadow-low rounded-xl border p-6">
        <legend className="text-navy-primary px-2 text-lg font-bold">1. Identificação</legend>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {(
            [
              ["sim", "Quero permanecer anônimo(a)"],
              ["nao", "Quero me identificar"],
            ] as const
          ).map(([v, l]) => (
            <label
              key={v}
              className={`border-border flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-lg border px-4 ${(form.isAnonymous ? "sim" : "nao") === v ? "border-action-blue bg-action-blue/5" : ""}`}
            >
              <input
                type="radio"
                name="isAnonymous"
                checked={(form.isAnonymous ? "sim" : "nao") === v}
                onChange={() => set("isAnonymous", v === "sim")}
                className="h-4 w-4"
              />
              <span className="text-text-primary text-sm font-medium">{l}</span>
            </label>
          ))}
        </div>
        {!form.isAnonymous ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="reporterName">
                Nome
              </label>
              <input
                id="reporterName"
                value={form.reporterName}
                onChange={(e) => set("reporterName", e.target.value)}
                className={input}
                maxLength={150}
              />
              <Err k="reporterName" />
            </div>
            <div>
              <label className={label} htmlFor="reporterEmail">
                E-mail (para receber avisos)
              </label>
              <input
                id="reporterEmail"
                type="email"
                value={form.reporterEmail}
                onChange={(e) => set("reporterEmail", e.target.value)}
                className={input}
                maxLength={200}
              />
              <Err k="reporterEmail" />
            </div>
            <div>
              <label className={label} htmlFor="reporterPhone">
                Telefone (opcional)
              </label>
              <input
                id="reporterPhone"
                value={form.reporterPhone}
                onChange={(e) => set("reporterPhone", e.target.value)}
                className={input}
                maxLength={30}
              />
            </div>
          </div>
        ) : (
          <p className={hint}>
            Anônimo: ninguém saberá quem registrou. Avisos por e-mail não são enviados; acompanhe
            pelo protocolo.
          </p>
        )}
      </fieldset>

      <fieldset className="border-border bg-surface shadow-low rounded-xl border p-6">
        <legend className="text-navy-primary px-2 text-lg font-bold">2. O que aconteceu</legend>
        <div className="mt-2 grid gap-4">
          <div>
            <label className={label} htmlFor="category">
              Categoria
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={input}
            >
              <option value="">Escolha…</option>
              {config.categories.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Err k="category" />
          </div>
          {form.category === "OUTRO" ? (
            <div>
              <label className={label} htmlFor="otherCategory">
                Descreva a categoria
              </label>
              <input
                id="otherCategory"
                value={form.otherCategory}
                onChange={(e) => set("otherCategory", e.target.value)}
                className={input}
                maxLength={150}
              />
              <Err k="otherCategory" />
            </div>
          ) : null}
          {isExam ? (
            <div className="border-border grid gap-4 rounded-lg border border-dashed p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="examConcurso">
                  Concurso
                </label>
                <input
                  id="examConcurso"
                  value={form.examConcurso}
                  onChange={(e) => set("examConcurso", e.target.value)}
                  className={input}
                  maxLength={200}
                  placeholder="Ex.: Corpo de Bombeiros MT 2026"
                />
                <Err k="examConcurso" />
              </div>
              <div>
                <label className={label} htmlFor="examOrgao">
                  Órgão (opcional)
                </label>
                <input
                  id="examOrgao"
                  value={form.examOrgao}
                  onChange={(e) => set("examOrgao", e.target.value)}
                  className={input}
                  maxLength={200}
                />
              </div>
              <div>
                <label className={label} htmlFor="examEdital">
                  Número do edital
                </label>
                <input
                  id="examEdital"
                  value={form.examEdital}
                  onChange={(e) => set("examEdital", e.target.value)}
                  className={input}
                  maxLength={100}
                  placeholder="Ex.: 01/2026"
                />
                <Err k="examEdital" />
              </div>
              <div>
                <label className={label} htmlFor="examCargo">
                  Cargo (opcional)
                </label>
                <input
                  id="examCargo"
                  value={form.examCargo}
                  onChange={(e) => set("examCargo", e.target.value)}
                  className={input}
                  maxLength={150}
                />
              </div>
              <div>
                <label className={label} htmlFor="examLocal">
                  Local (opcional)
                </label>
                <input
                  id="examLocal"
                  value={form.examLocal}
                  onChange={(e) => set("examLocal", e.target.value)}
                  className={input}
                  maxLength={200}
                  placeholder="Cidade, escola, sala…"
                />
              </div>
              <div>
                <label className={label} htmlFor="examDataFato">
                  Data do fato (opcional)
                </label>
                <input
                  id="examDataFato"
                  type="date"
                  value={form.examDataFato}
                  onChange={(e) => set("examDataFato", e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <label className={label} htmlFor="examEtapa">
                  Etapa (opcional)
                </label>
                <select
                  id="examEtapa"
                  value={form.examEtapa}
                  onChange={(e) => set("examEtapa", e.target.value)}
                  className={input}
                >
                  <option value="">Escolha…</option>
                  {config.examStages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className={label}>A situação está ocorrendo agora?</span>
                <div className="mt-1.5 flex gap-3">
                  {(
                    [
                      ["sim", "Sim, está acontecendo"],
                      ["nao", "Não, já ocorreu"],
                    ] as const
                  ).map(([v, l]) => (
                    <label
                      key={v}
                      className={`border-border flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${form.examEmAndamento === v ? "border-action-blue bg-action-blue/5" : ""}`}
                    >
                      <input
                        type="radio"
                        name="examEmAndamento"
                        checked={form.examEmAndamento === v}
                        onChange={() => set("examEmAndamento", v)}
                        className="h-4 w-4"
                      />
                      {l}
                    </label>
                  ))}
                </div>
                <p className={hint}>
                  Situação em andamento (ex.: vazamento de prova) recebe prioridade crítica.
                </p>
                <Err k="examEmAndamento" />
              </div>
            </div>
          ) : (
            <div>
              <label className={label} htmlFor="relatedArea">
                Área ou setor relacionado (opcional)
              </label>
              <input
                id="relatedArea"
                value={form.relatedArea}
                onChange={(e) => set("relatedArea", e.target.value)}
                className={input}
                maxLength={150}
              />
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="border-border flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm">
              <input
                type="checkbox"
                checked={form.physicalThreat}
                onChange={(e) => set("physicalThreat", e.target.checked)}
                className="h-4 w-4"
              />
              Há ameaça à integridade física de alguém
            </label>
            <label className="border-border flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm">
              <input
                type="checkbox"
                checked={form.evidenceDestructionRisk}
                onChange={(e) => set("evidenceDestructionRisk", e.target.checked)}
                className="h-4 w-4"
              />
              Há risco de destruição de provas
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset className="border-border bg-surface shadow-low rounded-xl border p-6">
        <legend className="text-navy-primary px-2 text-lg font-bold">3. Relato</legend>
        <label className={label} htmlFor="description">
          Descreva o ocorrido
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${input} min-h-[200px]`}
          maxLength={config.descriptionMax}
          placeholder="O que aconteceu, quando, onde, quem estava envolvido, como você soube. Não é preciso incluir dados pessoais seus."
        />
        <p className={hint}>
          {descLen} caracteres (mínimo {config.descriptionMin}, máximo {config.descriptionMax}).
        </p>
        <Err k="description" />
        <div className="mt-5">
          <span className={label}>Anexos (opcional)</span>
          {config.attachmentsEnabled ? (
            <>
              <p className={hint}>
                Até {config.maxAttachments} arquivos PDF, PNG, JPG ou WEBP de 10 MB. Evite
                documentos com seus dados pessoais.
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <li
                    key={a.key}
                    className="bg-action-blue/10 text-navy-primary inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                  >
                    {a.filename}
                    <button
                      type="button"
                      onClick={() => setAttachments((x) => x.filter((i) => i.key !== a.key))}
                      aria-label={`Remover ${a.filename}`}
                      className="text-institutional-red font-bold"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              {attachments.length < config.maxAttachments ? (
                <label className={buttonClassNames("secondary", "mt-3 cursor-pointer")}>
                  {uploading ? "Enviando…" : "Adicionar arquivo"}
                  <input
                    type="file"
                    className="sr-only"
                    accept={config.allowedMimeTypes.join(",")}
                    disabled={uploading}
                    onChange={(e) => {
                      void onFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              ) : null}
            </>
          ) : (
            <p className={hint}>
              O envio de anexos não está disponível no momento. Você pode citar os documentos no
              relato.
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="border-border bg-surface shadow-low rounded-xl border p-6">
        <legend className="text-navy-primary px-2 text-lg font-bold">4. Confirmação</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-text-primary">
            Estou ciente de que os dados informados serão tratados pela Ouvidoria do Instituto
            Selecon exclusivamente para apuração desta denúncia, conforme a LGPD, e que o relato é
            de minha responsabilidade.
          </span>
        </label>
        <Err k="consent" />
        {config.turnstileSiteKey ? (
          <div className="mt-4">
            <div ref={turnstileRef} />
            <Err k="turnstile" />
          </div>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="border-institutional-red/30 bg-institutional-red/5 text-institutional-red mt-4 rounded-lg border p-3 text-sm"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitting || uploading}
            className={buttonClassNames("primary", "", "lg")}
          >
            {submitting ? "Registrando…" : "Registrar denúncia"}
          </button>
        </div>
        <p className={hint}>
          Ao registrar, você verá o protocolo e o código de acesso uma única vez.
        </p>
      </fieldset>
    </form>
  );
}
