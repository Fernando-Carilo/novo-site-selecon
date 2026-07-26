import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  addWhistleblowingMessageRequestSchema,
  createWhistleblowingCaseRequestSchema,
  lookupWhistleblowingCaseRequestSchema,
  type AddWhistleblowingMessageRequest,
  type CreateWhistleblowingCaseRequest,
  type LookupWhistleblowingCaseRequest,
  type WhistleblowingCasePublicView,
  type WhistleblowingCategoryDto,
  type WhistleblowingCredentials,
} from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { Public } from "../auth/public.decorator.js";
import { WhistleblowingService } from "./whistleblowing.service.js";

@ApiTags("public-whistleblowing")
@Controller("public/whistleblowing")
@Public()
export class PublicWhistleblowingController {
  constructor(private readonly whistleblowing: WhistleblowingService) {}

  @Get("categories")
  async categories(): Promise<WhistleblowingCategoryDto[]> {
    const categories = await prisma.whistleblowingCategory.findMany({ orderBy: { name: "asc" } });
    return categories.map((c) => ({ id: c.id, name: c.name, description: c.description }));
  }

  @Post("cases")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(
    @Body(new ZodValidationPipe(createWhistleblowingCaseRequestSchema))
    body: CreateWhistleblowingCaseRequest,
  ): Promise<WhistleblowingCredentials> {
    return this.whistleblowing.createCase(body);
  }

  /**
   * Consulta protegida — limite de tentativas mais estrito que o padrão geral
   * (proteção reforçada contra força bruta de código, regra 12.3).
   */
  @Post("cases/lookup")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  lookup(
    @Body(new ZodValidationPipe(lookupWhistleblowingCaseRequestSchema))
    body: LookupWhistleblowingCaseRequest,
  ): Promise<WhistleblowingCasePublicView> {
    return this.whistleblowing.lookupPublic(body.protocol, body.accessCode);
  }

  @Post("cases/messages")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  addMessage(
    @Body(new ZodValidationPipe(addWhistleblowingMessageRequestSchema))
    body: AddWhistleblowingMessageRequest,
  ): Promise<WhistleblowingCasePublicView> {
    return this.whistleblowing.addReporterMessage(body.protocol, body.accessCode, body.body);
  }
}
