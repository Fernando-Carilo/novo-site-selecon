"use client";

import Script from "next/script";

/**
 * Chat de atendimento da Selecon Central embutido no portal: o widget abre uma
 * conversa que cai na fila dos atendentes (com protocolo e histórico).
 * Só carrega quando SITE_CENTRAL_URL está configurada no ambiente.
 */
export function CentralChat({ centralUrl }: { centralUrl: string }) {
  const base = centralUrl.replace(/\/+$/, "");
  return (
    <Script
      src={`${base}/widget/selecon-chat.js`}
      data-api={`${base}/api`}
      strategy="afterInteractive"
    />
  );
}
