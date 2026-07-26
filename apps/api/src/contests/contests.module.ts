import { Module } from "@nestjs/common";
import { AdminContestsController } from "./admin-contests.controller.js";
import { PublicContestsController } from "./public-contests.controller.js";
import { ContestsService } from "./contests.service.js";

@Module({
  controllers: [AdminContestsController, PublicContestsController],
  providers: [ContestsService],
})
export class ContestsModule {}
