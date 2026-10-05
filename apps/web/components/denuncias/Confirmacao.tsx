"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { RECEIPT_KEY, formatDateTime, type DenunciaReceipt } from "@/lib/denuncias";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Comprovante exibido uma única vez (vem de sessionStorage, nunca da URL). */
export function Confirmacao() {
  const [receipt, setReceipt] = useState<DenunciaReceipt | null | undefined>(undefined);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECEIPT_KEY);
      setReceipt(raw ? (JSON.parse(raw) as DenunciaReceipt) : null);
    } catch {
      setReceipt(null);
    }
  }, []);

  if (receipt === undefined)
    return (
      <p className="text-text-secondary text-sm" role="status">
        Carregando…
      </p>
    );
  if (!receipt) {
    return (
      <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
        <h1 className="text-navy-primary text-2xl font-bold">Nenhum comprovante nesta sessão</h1>
        <p className="text-text-secondary mt-2 text-sm">
          O protocolo e o código só aparecem logo após o registro. Se você já os guardou, use a
          consulta.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/denuncias/consultar" className={buttonClassNames("primary")}>
            Consultar denúncia
          </Link>
          <Link href="/denuncias/nova" className={buttonClassNames("secondary")}>
            Registrar nova denúncia
          </Link>
        </div>
      </div>
    );
  }

  const Item = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p
          className={`text-navy-primary mt-1 break-all text-lg font-bold ${mono ? "font-mono tracking-wide" : ""}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => setCopied((await copy(value)) ? label : "erro")}
        className={buttonClassNames("secondary", "shrink-0")}
      >
        {copied === label ? "Copiado" : "Copiar"}
      </button>
    </div>
  );

  return (
    <div className="print:text-black">
      <p className="text-success-green text-xs font-semibold uppercase tracking-[0.12em]">
        Denúncia registrada
      </p>
      <h1 className="text-navy-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Guarde estes dados agora
      </h1>
      <p className="text-text-secondary mt-4 text-base leading-relaxed">
        Registrada em {formatDateTime(receipt.createdAt)}. O{" "}
        <strong>código de acesso aparece só desta vez</strong> e não é enviado por e-mail: sem ele,
        não há como consultar nem responder à Ouvidoria.
      </p>
      <div className="mt-8 space-y-3">
        <Item label="Protocolo" value={receipt.protocol} mono />
        <Item label="Código de acesso" value={receipt.accessCode} mono />
      </div>
      {copied === "erro" ? (
        <p className="text-institutional-red mt-2 text-sm">
          Não foi possível copiar automaticamente. Selecione e copie manualmente.
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className={buttonClassNames("secondary")}
        >
          Imprimir ou salvar em PDF
        </button>
        <Link href="/denuncias/consultar" className={buttonClassNames("primary")}>
          Ir para a consulta
        </Link>
      </div>
      <p className="text-text-secondary mt-6 text-sm">
        A Ouvidoria faz a triagem em até 2 dias úteis. Acompanhe pelo protocolo; se precisar
        acrescentar informações, use a consulta e envie uma mensagem.
      </p>
    </div>
  );
}
