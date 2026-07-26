import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  campaignReviewDecisionRequestSchema,
  createAdvertiserRequestSchema,
  createCampaignRequestSchema,
  type AdvertiserDto,
  type CampaignDetail,
  type CampaignReviewDecisionRequest,
  type CampaignSummary,
  type CreateAdvertiserRequest,
  type CreateCampaignRequest,
  type PlacementDto,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { AdvertisingService } from "./advertising.service.js";

@ApiTags("admin-advertising")
@Controller("admin/advertising")
export class AdminAdvertisingController {
  constructor(private readonly advertising: AdvertisingService) {}

  @Get("advertisers")
  @RequirePermission("advertising:read")
  listAdvertisers(): Promise<AdvertiserDto[]> {
    return this.advertising.listAdvertisers();
  }

  @Post("advertisers")
  @RequirePermission("advertising:write")
  createAdvertiser(
    @Body(new ZodValidationPipe(createAdvertiserRequestSchema)) body: CreateAdvertiserRequest,
  ): Promise<AdvertiserDto> {
    return this.advertising.createAdvertiser(body);
  }

  @Get("placements")
  @RequirePermission("advertising:read")
  listPlacements(): Promise<PlacementDto[]> {
    return this.advertising.listPlacements();
  }

  @Get("campaigns")
  @RequirePermission("advertising:read")
  listCampaigns(): Promise<CampaignSummary[]> {
    return this.advertising.listCampaigns();
  }

  @Get("campaigns/:id")
  @RequirePermission("advertising:read")
  getCampaign(@Param("id") id: string): Promise<CampaignDetail> {
    return this.advertising.getCampaign(id);
  }

  @Post("campaigns")
  @RequirePermission("advertising:write")
  createCampaign(
    @Body(new ZodValidationPipe(createCampaignRequestSchema)) body: CreateCampaignRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CampaignDetail> {
    return this.advertising.createCampaign(body, user.id);
  }

  @Post("campaigns/:id/submit-for-review")
  @RequirePermission("advertising:write")
  submitForReview(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CampaignDetail> {
    return this.advertising.submitForReview(id, user.id);
  }

  @Post("campaigns/:id/review")
  @RequirePermission("advertising:approve")
  review(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(campaignReviewDecisionRequestSchema))
    body: CampaignReviewDecisionRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CampaignDetail> {
    return this.advertising.review(id, user.id, body.approved);
  }

  @Post("campaigns/:id/compliance")
  @RequirePermission("advertising:approve")
  decideCompliance(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(campaignReviewDecisionRequestSchema))
    body: CampaignReviewDecisionRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CampaignDetail> {
    return this.advertising.decideCompliance(id, user.id, body.approved);
  }

  @Post("campaigns/:id/pause")
  @RequirePermission("advertising:write")
  pause(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<CampaignDetail> {
    return this.advertising.pause(id, user.id);
  }

  @Post("campaigns/:id/resume")
  @RequirePermission("advertising:write")
  resume(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<CampaignDetail> {
    return this.advertising.resume(id, user.id);
  }
}
