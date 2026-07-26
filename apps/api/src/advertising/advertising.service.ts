import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AdServeResponse,
  AdvertiserDto,
  CampaignDetail,
  CampaignSummary,
  CreateAdvertiserRequest,
  CreateCampaignRequest,
  PlacementDto,
} from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { AuditService } from "../audit/audit.service.js";
import { toCampaignDetail, toCampaignSummary } from "./advertising.mapper.js";

const CAMPAIGN_INCLUDE = {
  advertiser: true,
  creatives: true,
  campaignPlacements: { include: { placement: true } },
  schedule: true,
  approval: true,
} as const;

/** Campanhas nestes estados podem estar veiculando ativamente (seção 9.9). */
const SERVABLE_STATUSES = ["APPROVED", "ACTIVE"] as const;

@Injectable()
export class AdvertisingService {
  constructor(private readonly audit: AuditService) {}

  async createAdvertiser(input: CreateAdvertiserRequest): Promise<AdvertiserDto> {
    const advertiser = await prisma.advertiser.create({
      data: { legalName: input.legalName, taxId: input.taxId },
    });
    return { id: advertiser.id, legalName: advertiser.legalName, taxId: advertiser.taxId };
  }

  async listAdvertisers(): Promise<AdvertiserDto[]> {
    const advertisers = await prisma.advertiser.findMany({ orderBy: { legalName: "asc" } });
    return advertisers.map((a) => ({ id: a.id, legalName: a.legalName, taxId: a.taxId }));
  }

  async listPlacements(): Promise<PlacementDto[]> {
    const placements = await prisma.placement.findMany({ orderBy: { key: "asc" } });
    return placements.map((p) => ({ id: p.id, key: p.key, name: p.name, page: p.page }));
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    const campaigns = await prisma.campaign.findMany({
      include: CAMPAIGN_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return campaigns.map(toCampaignSummary);
  }

  async getOrThrow(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id }, include: CAMPAIGN_INCLUDE });
    if (!campaign) throw new NotFoundException("Campanha não encontrada");
    return campaign;
  }

  async getCampaign(id: string): Promise<CampaignDetail> {
    return toCampaignDetail(await this.getOrThrow(id));
  }

  async createCampaign(input: CreateCampaignRequest, actorUserId: string): Promise<CampaignDetail> {
    const placements = await prisma.placement.findMany({
      where: { key: { in: input.placementKeys } },
    });
    if (placements.length !== input.placementKeys.length) {
      throw new BadRequestException("Um ou mais placements informados não existem");
    }

    const campaign = await prisma.campaign.create({
      data: {
        advertiserId: input.advertiserId,
        contractId: input.contractId,
        name: input.name,
        status: "DRAFT",
        createdByUserId: actorUserId,
        creatives: { create: input.creatives },
        campaignPlacements: {
          create: placements.map((placement) => ({ placementId: placement.id })),
        },
        schedule: {
          create: { startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) },
        },
      },
      include: CAMPAIGN_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CAMPAIGN_CREATED",
      resourceType: "campaign",
      resourceId: campaign.id,
      afterData: { name: campaign.name, status: campaign.status },
    });

    return toCampaignDetail(campaign);
  }

  async submitForReview(id: string, actorUserId: string): Promise<CampaignDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        "Somente campanhas em rascunho podem ser enviadas para revisão",
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: "PENDING_REVIEW" },
      include: CAMPAIGN_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CAMPAIGN_SUBMITTED_FOR_REVIEW",
      resourceType: "campaign",
      resourceId: id,
    });

    return toCampaignDetail(campaign);
  }

  /**
   * Etapa 1 de governança (revisão de conteúdo/marca). O revisor nunca pode ser o
   * criador da campanha (separação de funções, mesma regra usada em concursos).
   */
  async review(id: string, actorUserId: string, approved: boolean): Promise<CampaignDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "PENDING_REVIEW") {
      throw new BadRequestException("Campanha não está aguardando revisão");
    }
    if (existing.createdByUserId === actorUserId) {
      throw new ForbiddenException(
        "O revisor deve ser um usuário diferente do criador da campanha (separação de funções)",
      );
    }

    const nextStatus = approved ? "PENDING_COMPLIANCE" : "REJECTED";
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: nextStatus,
        approval: {
          upsert: {
            create: {
              reviewerUserId: actorUserId,
              approved: approved ? null : false,
              decidedAt: approved ? null : new Date(),
            },
            update: {
              reviewerUserId: actorUserId,
              approved: approved ? null : false,
              decidedAt: approved ? null : new Date(),
            },
          },
        },
      },
      include: CAMPAIGN_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: approved ? "CAMPAIGN_REVIEW_APPROVED" : "CAMPAIGN_REVIEW_REJECTED",
      resourceType: "campaign",
      resourceId: id,
      riskLevel: "medium",
    });

    return toCampaignDetail(campaign);
  }

  /**
   * Etapa 2 de governança (compliance) — decisão final. O responsável por compliance
   * deve ser diferente do criador e do revisor (separação de funções em três papéis).
   */
  async decideCompliance(
    id: string,
    actorUserId: string,
    approved: boolean,
  ): Promise<CampaignDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "PENDING_COMPLIANCE") {
      throw new BadRequestException("Campanha não está aguardando decisão de compliance");
    }
    if (
      existing.createdByUserId === actorUserId ||
      existing.approval?.reviewerUserId === actorUserId
    ) {
      throw new ForbiddenException(
        "O responsável por compliance deve ser diferente do criador e do revisor da campanha (separação de funções)",
      );
    }

    if (approved) {
      await prisma.creative.updateMany({ where: { campaignId: id }, data: { approved: true } });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        approval: {
          update: { complianceUserId: actorUserId, approved, decidedAt: new Date() },
        },
      },
      include: CAMPAIGN_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: approved ? "CAMPAIGN_COMPLIANCE_APPROVED" : "CAMPAIGN_COMPLIANCE_REJECTED",
      resourceType: "campaign",
      resourceId: id,
      riskLevel: "high",
    });

    return toCampaignDetail(campaign);
  }

  async pause(id: string, actorUserId: string): Promise<CampaignDetail> {
    const existing = await this.getOrThrow(id);
    if (!["APPROVED", "ACTIVE"].includes(existing.status)) {
      throw new BadRequestException("Somente campanhas aprovadas ou ativas podem ser pausadas");
    }
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: "PAUSED" },
      include: CAMPAIGN_INCLUDE,
    });
    await this.audit.log({
      actorUserId,
      action: "CAMPAIGN_PAUSED",
      resourceType: "campaign",
      resourceId: id,
    });
    return toCampaignDetail(campaign);
  }

  async resume(id: string, actorUserId: string): Promise<CampaignDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "PAUSED") {
      throw new BadRequestException("Somente campanhas pausadas podem ser retomadas");
    }
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: "APPROVED" },
      include: CAMPAIGN_INCLUDE,
    });
    await this.audit.log({
      actorUserId,
      action: "CAMPAIGN_RESUMED",
      resourceType: "campaign",
      resourceId: id,
    });
    return toCampaignDetail(campaign);
  }

  /**
   * Veiculação pública (seção 9.9): retorna um criativo elegível para o placement,
   * respeitando janela de agendamento, e incrementa o agregado diário de impressões.
   * Nunca expõe dados internos da campanha (anunciante, aprovação etc.).
   */
  async serve(placementKey: string): Promise<AdServeResponse | null> {
    const now = new Date();
    const campaign = await prisma.campaign.findFirst({
      where: {
        status: { in: [...SERVABLE_STATUSES] },
        schedule: { startsAt: { lte: now }, endsAt: { gte: now } },
        campaignPlacements: { some: { placement: { key: placementKey } } },
        creatives: { some: { approved: true } },
      },
      include: { creatives: { where: { approved: true } } },
      orderBy: { createdAt: "asc" },
    });
    if (!campaign || campaign.creatives.length === 0) return null;

    const creative = campaign.creatives[0]!;
    const today = new Date(now.toISOString().slice(0, 10));
    await prisma.impressionAggregate.upsert({
      where: { campaignId_date: { campaignId: campaign.id, date: today } },
      create: { campaignId: campaign.id, date: today, count: 1 },
      update: { count: { increment: 1 } },
    });

    return {
      creativeId: creative.id,
      campaignId: campaign.id,
      format: creative.format,
      objectKey: creative.objectKey,
      destinationUrl: creative.destinationUrl,
    };
  }

  async recordClick(creativeId: string): Promise<{ destinationUrl: string }> {
    const creative = await prisma.creative.findUnique({ where: { id: creativeId } });
    if (!creative) throw new NotFoundException("Criativo não encontrado");

    const today = new Date(new Date().toISOString().slice(0, 10));
    await prisma.clickAggregate.upsert({
      where: { campaignId_date: { campaignId: creative.campaignId, date: today } },
      create: { campaignId: creative.campaignId, date: today, count: 1 },
      update: { count: { increment: 1 } },
    });

    return { destinationUrl: creative.destinationUrl };
  }
}
