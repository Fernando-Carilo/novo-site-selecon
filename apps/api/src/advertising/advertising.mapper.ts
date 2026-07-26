import type {
  Advertiser,
  Campaign,
  CampaignApproval,
  CampaignPlacement,
  Creative,
  Placement,
} from "@selecon/db";
import type { CampaignDetail, CampaignSummary } from "@selecon/contracts";

type CampaignWithRelations = Campaign & {
  advertiser: Advertiser;
  creatives: Creative[];
  campaignPlacements: (CampaignPlacement & { placement: Placement })[];
  schedule: { startsAt: Date; endsAt: Date } | null;
  approval: CampaignApproval | null;
};

export function toCampaignSummary(campaign: CampaignWithRelations): CampaignSummary {
  return {
    id: campaign.id,
    name: campaign.name,
    advertiserName: campaign.advertiser.legalName,
    status: campaign.status,
    startsAt: (campaign.schedule?.startsAt ?? campaign.createdAt).toISOString(),
    endsAt: (campaign.schedule?.endsAt ?? campaign.createdAt).toISOString(),
    createdAt: campaign.createdAt.toISOString(),
  };
}

export function toCampaignDetail(campaign: CampaignWithRelations): CampaignDetail {
  return {
    ...toCampaignSummary(campaign),
    advertiserId: campaign.advertiserId,
    createdByUserId: campaign.createdByUserId,
    creatives: campaign.creatives.map((creative) => ({
      id: creative.id,
      format: creative.format,
      objectKey: creative.objectKey,
      destinationUrl: creative.destinationUrl,
      approved: creative.approved,
    })),
    placements: campaign.campaignPlacements.map((cp) => ({
      key: cp.placement.key,
      name: cp.placement.name,
    })),
    approval: campaign.approval
      ? {
          reviewerUserId: campaign.approval.reviewerUserId,
          complianceUserId: campaign.approval.complianceUserId,
          approved: campaign.approval.approved,
          decidedAt: campaign.approval.decidedAt?.toISOString() ?? null,
        }
      : null,
  };
}
