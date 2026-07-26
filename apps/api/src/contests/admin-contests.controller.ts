import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createContestFaqRequestSchema,
  createContestPositionRequestSchema,
  createContestRequestSchema,
  publishContestRequestSchema,
  updateContestRequestSchema,
  type ContestDetail,
  type ContestStatus,
  type ContestSummary,
  type CreateContestFaqRequest,
  type CreateContestPositionRequest,
  type CreateContestRequest,
  type UpdateContestRequest,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { ContestsService } from "./contests.service.js";

@ApiTags("admin-contests")
@Controller("admin/contests")
export class AdminContestsController {
  constructor(private readonly contests: ContestsService) {}

  @Get()
  @RequirePermission("contest:read")
  list(@Query("status") status?: ContestStatus): Promise<ContestSummary[]> {
    return this.contests.findAllAdmin(status);
  }

  @Get(":id")
  @RequirePermission("contest:read")
  get(@Param("id") id: string): Promise<ContestDetail> {
    return this.contests.findByIdAdmin(id);
  }

  @Post()
  @RequirePermission("contest:write")
  create(
    @Body(new ZodValidationPipe(createContestRequestSchema)) body: CreateContestRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.createDraft(body, user.id);
  }

  @Post(":id")
  @RequirePermission("contest:write")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateContestRequestSchema)) body: UpdateContestRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.update(id, body, user.id);
  }

  @Post(":id/submit-for-review")
  @RequirePermission("contest:write")
  submitForReview(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.submitForReview(id, user.id);
  }

  @Post(":id/publish")
  @RequirePermission("contest:publish")
  publish(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(publishContestRequestSchema)) _body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.publish(id, user.id);
  }

  @Post(":id/suspend")
  @RequirePermission("contest:approve")
  suspend(
    @Param("id") id: string,
    @Body("justification") justification: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.suspend(id, user.id, justification);
  }

  @Post(":id/close")
  @RequirePermission("contest:approve")
  close(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<ContestDetail> {
    return this.contests.close(id, user.id);
  }

  @Post(":id/archive")
  @RequirePermission("contest:write")
  archive(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<ContestDetail> {
    return this.contests.archive(id, user.id);
  }

  @Post(":id/faqs")
  @RequirePermission("contest:write")
  addFaq(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(createContestFaqRequestSchema)) body: CreateContestFaqRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.addFaq(id, body, user.id);
  }

  @Post(":id/positions")
  @RequirePermission("contest:write")
  addPosition(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(createContestPositionRequestSchema))
    body: CreateContestPositionRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestDetail> {
    return this.contests.addPosition(id, body, user.id);
  }
}
