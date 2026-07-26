import { Module } from "@nestjs/common";
import { AdminTicketsController } from "./admin-tickets.controller.js";
import { PublicTicketsController } from "./public-tickets.controller.js";
import { TicketsService } from "./tickets.service.js";

@Module({
  controllers: [AdminTicketsController, PublicTicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
