"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type {
  AdvertiserDto,
  CampaignDetail,
  CampaignSummary,
  CreativeFormat,
  PlacementDto,
} from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<CampaignSummary["status"], string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando revisão",
  PENDING_COMPLIANCE: "Aguardando compliance",
  APPROVED: "Aprovada",
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  FINISHED: "Encerrada",
  REJECTED: "Rejeitada",
};

export default function AdminAdvertisingPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserDto[]>([]);
  const [placements, setPlacements] = useState<PlacementDto[]>([]);
  const [selected, setSelected] = useState<CampaignDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [campaignList, advertiserList, placementList] = await Promise.all([
        apiFetch<CampaignSummary[]>("/admin/advertising/campaigns"),
        apiFetch<AdvertiserDto[]>("/admin/advertising/advertisers"),
        apiFetch<PlacementDto[]>("/admin/advertising/placements"),
      ]);
      setCampaigns(campaignList);
      setAdvertisers(advertiserList);
      setPlacements(placementList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar anúncios");
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function openCampaign(id: string) {
    setError(null);
    try {
      setSelected(await apiFetch<CampaignDetail>(`/admin/advertising/campaigns/${id}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao abrir campanha");
    }
  }

  async function refreshSelected(id: string) {
    setSelected(await apiFetch<CampaignDetail>(`/admin/advertising/campaigns/${id}`));
    await loadAll();
  }

  async function handleCreateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const placementKeys = form.getAll("placementKeys") as string[];
    try {
      const created = await apiFetch<CampaignDetail>("/admin/advertising/campaigns", {
        method: "POST",
        body: JSON.stringify({
          advertiserId: form.get("advertiserId"),
          name: form.get("name"),
          startsAt: new Date(form.get("startsAt") as string).toISOString(),
          endsAt: new Date(form.get("endsAt") as string).toISOString(),
          placementKeys,
          creatives: [
            {
              format: form.get("format") as CreativeFormat,
              objectKey: form.get("objectKey"),
              destinationUrl: form.get("destinationUrl"),
            },
          ],
        }),
      });
      setShowNewForm(false);
      event.currentTarget.reset();
      await loadAll();
      setSelected(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao criar campanha");
    }
  }

  async function runAction(action: string) {
    if (!selected) return;
    setError(null);
    try {
      await apiFetch(`/admin/advertising/campaigns/${selected.id}/${action}`, {
        method: "POST",
        body: "{}",
      });
      await refreshSelected(selected.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao executar ação");
    }
  }

  async function runDecision(action: "review" | "compliance", approved: boolean) {
    if (!selected) return;
    setError(null);
    try {
      await apiFetch(`/admin/advertising/campaigns/${selected.id}/${action}`, {
        method: "POST",
        body: JSON.stringify({ approved }),
      });
      await refreshSelected(selected.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao registrar decisão");
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-navy-primary text-2xl font-bold">Anúncios e campanhas</h1>
        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className={buttonClassNames("primary")}
        >
          {showNewForm ? "Cancelar" : "Nova campanha"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      {showNewForm && (
        <form
          onSubmit={handleCreateCampaign}
          className="border-border bg-surface mt-4 space-y-3 rounded-lg border p-4"
        >
          <div>
            <label htmlFor="advertiserId" className="text-sm font-medium">
              Anunciante
            </label>
            <select
              id="advertiserId"
              name="advertiserId"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Selecione…</option>
              {advertisers.map((advertiser) => (
                <option key={advertiser.id} value={advertiser.id}>
                  {advertiser.legalName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nome da campanha
            </label>
            <input
              id="name"
              name="name"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="startsAt" className="text-sm font-medium">
                Início
              </label>
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                required
                className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="endsAt" className="text-sm font-medium">
                Fim
              </label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                required
                className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <fieldset className="border-border rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">Placements</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {placements.map((placement) => (
                <label key={placement.key} className="flex items-center gap-2">
                  <input type="checkbox" name="placementKeys" value={placement.key} />
                  {placement.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="format" className="text-sm font-medium">
                Formato do criativo
              </label>
              <select
                id="format"
                name="format"
                className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="DESKTOP">Desktop</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>
            <div>
              <label htmlFor="objectKey" className="text-sm font-medium">
                Chave do objeto (S3)
              </label>
              <input
                id="objectKey"
                name="objectKey"
                required
                placeholder="campanhas/banner.png"
                className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="destinationUrl" className="text-sm font-medium">
              URL de destino
            </label>
            <input
              id="destinationUrl"
              name="destinationUrl"
              type="url"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className={buttonClassNames("primary")}>
            Criar campanha (rascunho)
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <caption className="sr-only">Campanhas</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Nome
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Anunciante
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`border-border hover:bg-background-light cursor-pointer border-b ${selected?.id === campaign.id ? "bg-background-light" : ""}`}
                  onClick={() => openCampaign(campaign.id)}
                >
                  <td className="py-2 pr-4">{campaign.name}</td>
                  <td className="py-2 pr-4">{campaign.advertiserName}</td>
                  <td className="py-2">{STATUS_LABEL[campaign.status]}</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-text-secondary py-6 text-center">
                    Nenhuma campanha cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="border-border bg-surface rounded-lg border p-5">
            <h2 className="text-navy-primary text-lg font-semibold">{selected.name}</h2>
            <p className="bg-background-light mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium">
              {STATUS_LABEL[selected.status]}
            </p>
            <p className="text-text-secondary mt-2 text-sm">
              Placements: {selected.placements.map((p) => p.name).join(", ") || "nenhum"}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {selected.creatives.map((creative) => (
                <li key={creative.id}>
                  {creative.format} — {creative.objectKey}{" "}
                  {creative.approved ? "(aprovado)" : "(pendente)"}
                </li>
              ))}
            </ul>

            {selected.approval && (
              <div className="text-text-secondary mt-3 text-xs">
                <p>Revisor: {selected.approval.reviewerUserId ?? "—"}</p>
                <p>Compliance: {selected.approval.complianceUserId ?? "—"}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {selected.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => runAction("submit-for-review")}
                  className={buttonClassNames("primary")}
                >
                  Enviar para revisão
                </button>
              )}
              {selected.status === "PENDING_REVIEW" && (
                <>
                  <button
                    type="button"
                    onClick={() => runDecision("review", true)}
                    className={buttonClassNames("primary")}
                  >
                    Aprovar revisão
                  </button>
                  <button
                    type="button"
                    onClick={() => runDecision("review", false)}
                    className={buttonClassNames("secondary")}
                  >
                    Rejeitar
                  </button>
                </>
              )}
              {selected.status === "PENDING_COMPLIANCE" && (
                <>
                  <button
                    type="button"
                    onClick={() => runDecision("compliance", true)}
                    className={buttonClassNames("primary")}
                  >
                    Aprovar compliance
                  </button>
                  <button
                    type="button"
                    onClick={() => runDecision("compliance", false)}
                    className={buttonClassNames("secondary")}
                  >
                    Rejeitar
                  </button>
                </>
              )}
              {(selected.status === "APPROVED" || selected.status === "ACTIVE") && (
                <button
                  type="button"
                  onClick={() => runAction("pause")}
                  className={buttonClassNames("secondary")}
                >
                  Pausar
                </button>
              )}
              {selected.status === "PAUSED" && (
                <button
                  type="button"
                  onClick={() => runAction("resume")}
                  className={buttonClassNames("primary")}
                >
                  Retomar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
