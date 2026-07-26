import { prisma } from "@selecon/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuditService } from "../audit/audit.service.js";
import { AdvertisingService } from "./advertising.service.js";

describe("AdvertisingService (integração real com Postgres)", () => {
  const service = new AdvertisingService(new AuditService());
  const suffix = Date.now();
  const creatorUserId = "11111111-1111-1111-1111-111111111111";
  const reviewerUserId = "22222222-2222-2222-2222-222222222222";
  const complianceUserId = "33333333-3333-3333-3333-333333333333";

  let advertiserId: string;
  let placementKey: string;
  const createdCampaignIds: string[] = [];

  beforeAll(async () => {
    const advertiser = await prisma.advertiser.create({
      data: { legalName: `Anunciante de teste ${suffix}` },
    });
    advertiserId = advertiser.id;

    placementKey = `TEST_PLACEMENT_${suffix}`;
    await prisma.placement.create({
      data: { key: placementKey, name: "Placement de teste", page: "test" },
    });
  });

  afterAll(async () => {
    await prisma.impressionAggregate.deleteMany({
      where: { campaignId: { in: createdCampaignIds } },
    });
    await prisma.clickAggregate.deleteMany({ where: { campaignId: { in: createdCampaignIds } } });
    await prisma.campaignApproval.deleteMany({ where: { campaignId: { in: createdCampaignIds } } });
    await prisma.campaignSchedule.deleteMany({ where: { campaignId: { in: createdCampaignIds } } });
    await prisma.campaignPlacement.deleteMany({
      where: { campaignId: { in: createdCampaignIds } },
    });
    await prisma.creative.deleteMany({ where: { campaignId: { in: createdCampaignIds } } });
    await prisma.campaign.deleteMany({ where: { id: { in: createdCampaignIds } } });
    await prisma.placement.delete({ where: { key: placementKey } });
    await prisma.advertiser.delete({ where: { id: advertiserId } });
    await prisma.$disconnect();
  });

  async function createCampaign(overrides?: {
    startsAt?: Date;
    endsAt?: Date;
    placementKeys?: string[];
  }) {
    const now = new Date();
    const startsAt = overrides?.startsAt ?? new Date(now.getTime() - 60_000);
    const endsAt = overrides?.endsAt ?? new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const detail = await service.createCampaign(
      {
        advertiserId,
        name: `Campanha de teste ${Date.now()}`,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        placementKeys: overrides?.placementKeys ?? [placementKey],
        creatives: [
          {
            format: "DESKTOP",
            objectKey: "test/creative.png",
            destinationUrl: "https://example.com/teste",
          },
        ],
      },
      creatorUserId,
    );
    createdCampaignIds.push(detail.id);
    return detail;
  }

  it("cria campanha em DRAFT com criativo não aprovado", async () => {
    const detail = await createCampaign();
    expect(detail.status).toBe("DRAFT");
    expect(detail.creatives[0]?.approved).toBe(false);
  });

  it("impede que o criador revise a própria campanha (separação de funções)", async () => {
    const detail = await createCampaign();
    await service.submitForReview(detail.id, creatorUserId);
    await expect(service.review(detail.id, creatorUserId, true)).rejects.toThrow();
  });

  it("impede que o revisor também decida o compliance da mesma campanha", async () => {
    const detail = await createCampaign();
    await service.submitForReview(detail.id, creatorUserId);
    await service.review(detail.id, reviewerUserId, true);
    await expect(service.decideCompliance(detail.id, reviewerUserId, true)).rejects.toThrow();
  });

  it("fluxo completo (revisão + compliance) aprova a campanha e marca criativos como aprovados", async () => {
    const detail = await createCampaign();
    await service.submitForReview(detail.id, creatorUserId);
    await service.review(detail.id, reviewerUserId, true);
    const final = await service.decideCompliance(detail.id, complianceUserId, true);
    expect(final.status).toBe("APPROVED");
    expect(final.creatives.every((c) => c.approved)).toBe(true);
    expect(final.approval?.reviewerUserId).toBe(reviewerUserId);
    expect(final.approval?.complianceUserId).toBe(complianceUserId);
  });

  it("revisor rejeitando encerra a campanha em REJECTED sem passar por compliance", async () => {
    const detail = await createCampaign();
    await service.submitForReview(detail.id, creatorUserId);
    const reviewed = await service.review(detail.id, reviewerUserId, false);
    expect(reviewed.status).toBe("REJECTED");
  });

  it("veiculação pública só retorna campanhas aprovadas dentro da janela de agendamento e incrementa impressões", async () => {
    const servePlacementKey = `TEST_PLACEMENT_SERVE_${Date.now()}`;
    const servePlacement = await prisma.placement.create({
      data: { key: servePlacementKey, name: "Placement de teste (serve)", page: "test" },
    });

    try {
      const outsideWindow = await createCampaign({
        startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        placementKeys: [servePlacementKey],
      });
      await service.submitForReview(outsideWindow.id, creatorUserId);
      await service.review(outsideWindow.id, reviewerUserId, true);
      await service.decideCompliance(outsideWindow.id, complianceUserId, true);

      const noneYet = await service.serve(servePlacementKey);
      expect(noneYet).toBeNull();

      const inWindow = await createCampaign({ placementKeys: [servePlacementKey] });
      await service.submitForReview(inWindow.id, creatorUserId);
      await service.review(inWindow.id, reviewerUserId, true);
      await service.decideCompliance(inWindow.id, complianceUserId, true);

      const served = await service.serve(servePlacementKey);
      expect(served).not.toBeNull();
      expect(served?.campaignId).toBe(inWindow.id);

      const impression = await prisma.impressionAggregate.findFirst({
        where: { campaignId: inWindow.id },
      });
      expect(impression?.count).toBe(1);

      const click = await service.recordClick(served!.creativeId);
      expect(click.destinationUrl).toBe("https://example.com/teste");
      const clickAggregate = await prisma.clickAggregate.findFirst({
        where: { campaignId: inWindow.id },
      });
      expect(clickAggregate?.count).toBe(1);
    } finally {
      await prisma.campaignPlacement.deleteMany({ where: { placementId: servePlacement.id } });
      await prisma.placement.delete({ where: { key: servePlacementKey } });
    }
  });
});
