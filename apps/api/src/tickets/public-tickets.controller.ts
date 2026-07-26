import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  createTicketRequestSchema,
  type CreateTicketRequest,
  type TicketPublicView,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { Public } from "../auth/public.decorator.js";
import { TicketsService } from "./tickets.service.js";

@ApiTags("public-tickets")
@Controller("public/tickets")
@Public()
export class PublicTicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  create(
    @Body(new ZodValidationPipe(createTicketRequestSchema)) body: CreateTicketRequest,
  ): Promise<{ protocol: string }> {
    return this.tickets.create(body);
  }

  @Get(":protocol")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  getByProtocol(@Param("protocol") protocol: string): Promise<TicketPublicView> {
    return this.tickets.findPublicByProtocol(protocol);
  }
}
