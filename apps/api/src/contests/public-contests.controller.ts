import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  contestCatalogFiltersSchema,
  type ContestCatalogFilters,
  type ContestDetail,
  type ContestSummary,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { Public } from "../auth/public.decorator.js";
import { ContestsService } from "./contests.service.js";

@ApiTags("public-contests")
@Controller("public/contests")
@Public()
export class PublicContestsController {
  constructor(private readonly contests: ContestsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(contestCatalogFiltersSchema)) filters: ContestCatalogFilters,
  ): Promise<ContestSummary[]> {
    return this.contests.findPublicCatalog(filters);
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string): Promise<ContestDetail> {
    return this.contests.findPublicBySlug(slug);
  }
}
