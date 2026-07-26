"use client";

import { useEffect, useState } from "react";
import type { AdServeResponse } from "@selecon/contracts";
import { apiFetch } from "@/lib/api-client";

/**
 * Espaço de anúncio real (seção 9.9) — busca um criativo elegível para o placement e
 * registra clique antes de navegar. Sem imagem real (S3/CDN mock nesta fase — ver
 * docs/INTEGRATIONS.md), renderiza um cartão com a chave do objeto como espaço reservado.
 */
export function AdSlot({ placementKey }: { placementKey: string }) {
  const [ad, setAd] = useState<AdServeResponse | null>(null);

  useEffect(() => {
    apiFetch<AdServeResponse | null>(`/public/ads/placements/${placementKey}`)
      .then(setAd)
      .catch(() => setAd(null));
  }, [placementKey]);

  if (!ad) return null;

  async function handleClick() {
    try {
      await apiFetch(`/public/ads/creatives/${ad!.creativeId}/click`, { method: "POST" });
    } finally {
      window.open(ad!.destinationUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border-border bg-surface hover:bg-background-light block w-full rounded-lg border p-4 text-left text-sm"
    >
      <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">Publicidade</p>
      <p className="text-text-secondary mt-1">{ad.objectKey}</p>
    </button>
  );
}
