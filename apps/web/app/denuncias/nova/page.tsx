"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { value: "FRAUDE_EM_CONCURSO", label: "Fraude em concurso" },
  { value: "IRREGULARIDADE_PROCESSO_SELETIVO", label: "Irregularidade em processo seletivo" },
  { value: "ASSEDIO_MORAL", label: "Assédio moral" },
  { value: "ASSEDIO_SEXUAL", label: "Assédio sexual" },
  { value: "DISCRIMINACAO", label: "Discriminação" },
  { value: "CORRUPCAO_FRAUDE", label: "Corrupção ou fraude" },
  { value: "CONFLITO_DE_INTERESSE", label: "Conflito de interesse" },
  { value: "DESVIO_DE_CONDUTA", label: "Desvio de conduta" },
  { value: "OUTRO", label: "Outro" },
];

type Step = "identity" | "category" | "description" | "success";

export default function NovaDenunciaPage() {
  const [step, setStep] = useState<Step>("identity");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [protocol, setProtocol] = useState("");
  const [accessCode, setAccessCode] = useState("");

  function handleSubmit() {
    // Mock — in production this calls the API
    setProtocol(`SC-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    setAccessCode("ABCDEFG-HJKMNPQ-RSTUVWX-YZ23456");
    setStep("success");
  }

  const inputCls = "mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted";

  if (step === "success") {
    return (
      <section className="bg-white py-16 sm:py-[92px]">
        <div className="w-[min(600px,calc(100%-40px))] mx-auto text-center">
          <div className="rounded-lg border border-green/30 bg-green-soft p-8">
            <p className="text-3xl">✅</p>
            <h1 className="mt-4 text-2xl font-extrabold text-ink">Denúncia registrada</h1>
            <p className="mt-2 text-sm text-muted">Guarde as informações abaixo com segurança. Elas são sua única forma de acompanhar esta denúncia.</p>
            <div className="mt-6 space-y-3 text-left">
              <div className="rounded-md border border-line bg-white p-4">
                <p className={labelCls}>Protocolo</p>
                <p className="mt-1 text-lg font-bold text-ink">{protocol}</p>
              </div>
              <div className="rounded-md border border-line bg-white p-4">
                <p className={labelCls}>Código de acesso</p>
                <p className="mt-1 font-mono text-sm font-bold text-ink">{accessCode}</p>
              </div>
            </div>
            <Link href="/denuncias/consultar" className="mt-6 min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">
              Consultar minha denúncia
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-[92px]">
      <div className="w-[min(700px,calc(100%-40px))] mx-auto">
        <h1 className="text-2xl font-extrabold text-ink">Nova Denúncia</h1>
        <p className="mt-2 text-sm text-muted">Preencha as informações abaixo. Todos os campos marcados com * são obrigatórios.</p>

        <div className="mt-4 flex gap-2 text-xs font-semibold text-muted">
          <span className={step === "identity" ? "text-green-700" : ""}>1. Identificação</span>
          <span>→</span>
          <span className={step === "category" ? "text-green-700" : ""}>2. Categoria</span>
          <span>→</span>
          <span className={step === "description" ? "text-green-700" : ""}>3. Relato</span>
        </div>

        <div className="mt-8 rounded-lg border border-line p-6">
          {step === "identity" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Identificação</h2>
              <div className="flex gap-3">
                <button onClick={() => setIsAnonymous(true)} className={`flex-1 rounded-md border p-3 text-sm font-semibold transition-all ${isAnonymous ? "border-green bg-green-soft text-green-700" : "border-line text-muted hover:border-green/40"}`}>
                  Anônimo
                </button>
                <button onClick={() => setIsAnonymous(false)} className={`flex-1 rounded-md border p-3 text-sm font-semibold transition-all ${!isAnonymous ? "border-green bg-green-soft text-green-700" : "border-line text-muted hover:border-green/40"}`}>
                  Identificado
                </button>
              </div>
              {!isAnonymous && (
                <div className="space-y-3">
                  <div><label className={labelCls}>Nome *</label><input className={inputCls} placeholder="Seu nome completo" /></div>
                  <div><label className={labelCls}>E-mail</label><input type="email" className={inputCls} placeholder="email@exemplo.com" /></div>
                  <div><label className={labelCls}>Telefone</label><input className={inputCls} placeholder="(99) 99999-9999" /></div>
                </div>
              )}
              <button onClick={() => setStep("category")} className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">
                Próximo
              </button>
            </div>
          )}

          {step === "category" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Categoria da denúncia *</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => setCategory(c.value)} className={`rounded-md border p-3 text-left text-sm font-medium transition-all ${category === c.value ? "border-green bg-green-soft text-green-700" : "border-line text-ink hover:border-green/40"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("identity")} className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center border border-line text-ink hover:border-green/40 transition-all duration-base">Voltar</button>
                <button onClick={() => setStep("description")} disabled={!category} className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base disabled:opacity-50">Próximo</button>
              </div>
            </div>
          )}

          {step === "description" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink">Descreva o ocorrido *</h2>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={inputCls} placeholder="Descreva com o máximo de detalhes o que aconteceu, quando, onde e quem estava envolvido..." />
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" className="mt-0.5" required />
                <span>Declaro ciência de que o tratamento dos dados pessoais eventualmente fornecidos seguirá a LGPD.</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setStep("category")} className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center border border-line text-ink hover:border-green/40 transition-all duration-base">Voltar</button>
                <button onClick={handleSubmit} disabled={description.length < 20} className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base disabled:opacity-50">Enviar denúncia</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
