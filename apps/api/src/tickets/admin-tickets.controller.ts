import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  addInternalNoteRequestSchema,
  addTicketMessageRequestSchema,
  assignTicketRequestSchema,
  type AddInternalNoteRequest,
  type AddTicketMessageRequest,
  type AssignTicketRequest,
  type TicketDetail,
  type TicketStatus,
  type TicketSummary,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { TicketsService } from "./tickets.service.js";

@ApiTags("admin-tickets")
@Controller("admin/tickets")
export class AdminTicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  @RequirePermission("service:read")
  list(@Query("status") status?: TicketStatus): Promise<TicketSummary[]> {
    return this.tickets.findAllAdmin(status);
  }

  @Get(":id")
  @RequirePermission("service:read")
  get(@Param("id") id: string): Promise<TicketDetail> {
    return this.tickets.findByIdAdmin(id);
  }

  @Post(":id/assign")
  @RequirePermission("service:assign")
  assign(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(assignTicketRequestSchema)) body: AssignTicketRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketDetail> {
    return this.tickets.assign(id, body, user.id);
  }

  @Post(":id/messages")
  @RequirePermission("service:respond")
  addMessage(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addTicketMessageRequestSchema)) body: AddTicketMessageRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketDetail> {
    return this.tickets.addMessage(id, body, user.id);
  }

  @Post(":id/notes")
  @RequirePermission("service:respond")
  addInternalNote(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addInternalNoteRequestSchema)) body: AddInternalNoteRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketDetail> {
    return this.tickets.addInternalNote(id, body, user.id);
  }

  @Post(":id/close")
  @RequirePermission("service:respond")
  close(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<TicketDetail> {
    return this.tickets.close(id, user.id);
  }

  @Post(":id/reopen")
  @RequirePermission("service:supervise")
  reopen(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<TicketDetail> {
    return this.tickets.reopen(id, user.id);
  }
}
