"use client";

import { useState } from "react";

export default function ConsultarDenunciaPage() {
  const [protocol, setProtocol] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [result, setResult] = useState<null | { status: string; messages: { author: string; body: string; date: string }[] }>(null);
  const [error, setError] = useState("");

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!protocol || !accessCode) { setError("Preencha protocolo e código de acesso."); return; }
    // Mock lookup
    setResult({
      status: "EM INVESTIGAÇÃO",
      messages: [
        { author: "EQUIPE", body: "Sua denúncia foi recebida e está sendo analisada pela ouvidoria.", date: "28/07/2026 10:30" },
        { author: "DENUNCIANTE", body: "Gostaria de adicionar que a situação continua ocorrendo.", date: "28/07/2026 14:15" },
      ]
    });
  }

  const inputCls = "mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted";

  return (
    <section className="bg-white py-16 sm:py-[92px]">
      <div className="w-[min(700px,calc(100%-40px))] mx-auto">
        <h1 className="text-2xl font-extrabold text-ink">Consultar Denúncia</h1>
        <p className="mt-2 text-sm text-muted">Informe o protocolo e código de acesso recebidos no momento do registro.</p>

        <form onSubmit={handleLookup} className="mt-8 rounded-lg border border-line p-6 space-y-4">
          <div><label className={labelCls}>Protocolo *</label><input value={protocol} onChange={(e) => setProtocol(e.target.value)} className={inputCls} placeholder="SC-2026-123456" /></div>
          <div><label className={labelCls}>Código de acesso *</label><input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className={inputCls} placeholder="ABCDEFG-HJKMNPQ-RSTUVWX-YZ23456" /></div>
          {error && <p className="text-xs text-red font-semibold">{error}</p>}
          <button type="submit" className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">Consultar</button>
        </form>

        {result && (
          <div className="mt-8 rounded-lg border border-line p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Protocolo: {protocol}</h2>
              <span className="rounded-full bg-soft-blue px-2.5 py-1 text-[11px] font-black uppercase text-blue-700">{result.status}</span>
            </div>
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-ink">Mensagens</h3>
              {result.messages.map((msg, i) => (
                <div key={i} className={`rounded-lg p-4 text-sm ${msg.author === "EQUIPE" ? "bg-soft border border-line" : "bg-green-soft border border-green/20"}`}>
                  <div className="flex justify-between text-xs text-muted">
                    <span className="font-semibold">{msg.author === "EQUIPE" ? "Equipe Ouvidoria" : "Você"}</span>
                    <span>{msg.date}</span>
                  </div>
                  <p className="mt-2 text-ink">{msg.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
