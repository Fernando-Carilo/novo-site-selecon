import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  accessWhistleblowingCaseRequestSchema,
  addWhistleblowingDecisionRequestSchema,
  updateWhistleblowingStatusRequestSchema,
  type AccessWhistleblowingCaseRequest,
  type AddWhistleblowingDecisionRequest,
  type UpdateWhistleblowingStatusRequest,
  type WhistleblowingCaseDetail,
  type WhistleblowingCaseStatus,
  type WhistleblowingCaseSummary,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { WhistleblowingService } from "./whistleblowing.service.js";

/**
 * Acesso restrito a perfis INTEGRITY_* (integrity:read/triage/decide) — nenhum
 * outro papel (nem PORTAL_ADMIN por si só via outras permissões) alcança estas
 * rotas sem essas permissões específicas, mantendo o isolamento do domínio
 * (regra 10.5: "Somente perfis autorizados devem visualizar este módulo").
 */
@ApiTags("admin-whistleblowing")
@Controller("admin/whistleblowing")
export class AdminWhistleblowingController {
  constructor(private readonly whistleblowing: WhistleblowingService) {}

  @Get("cases")
  @RequirePermission("integrity:read")
  list(@Query("status") status?: WhistleblowingCaseStatus): Promise<WhistleblowingCaseSummary[]> {
    return this.whistleblowing.listCasesAdmin(status);
  }

  @Post("cases/:id/access")
  @RequirePermission("integrity:read")
  access(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(accessWhistleblowingCaseRequestSchema))
    body: AccessWhistleblowingCaseRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WhistleblowingCaseDetail> {
    return this.whistleblowing.getCaseAdmin(id, user.id, body.justification);
  }

  @Post("cases/:id/status")
  @RequirePermission("integrity:triage")
  updateStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateWhistleblowingStatusRequestSchema))
    body: UpdateWhistleblowingStatusRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WhistleblowingCaseDetail> {
    return this.whistleblowing.updateStatus(id, body.status, body.justification, user.id);
  }

  @Post("cases/:id/messages")
  @RequirePermission("integrity:triage")
  addMessage(
    @Param("id") id: string,
    @Body("body") body: string,
    @Body("justification") justification: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WhistleblowingCaseDetail> {
    return this.whistleblowing.addInstitutionMessage(id, body, user.id, justification);
  }

  @Post("cases/:id/assign")
  @RequirePermission("integrity:triage")
  assign(
    @Param("id") id: string,
    @Body("analystUserId") analystUserId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WhistleblowingCaseDetail> {
    return this.whistleblowing.assign(id, analystUserId, user.id);
  }

  @Post("cases/:id/decision")
  @RequirePermission("integrity:decide")
  addDecision(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addWhistleblowingDecisionRequestSchema))
    body: AddWhistleblowingDecisionRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WhistleblowingCaseDetail> {
    return this.whistleblowing.addDecision(id, body, user.id);
  }
}
