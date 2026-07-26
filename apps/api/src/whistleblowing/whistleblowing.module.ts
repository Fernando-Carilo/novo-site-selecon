import { Module } from "@nestjs/common";
import { AdminWhistleblowingController } from "./admin-whistleblowing.controller.js";
import { PublicWhistleblowingController } from "./public-whistleblowing.controller.js";
import { WhistleblowingService } from "./whistleblowing.service.js";

@Module({
  controllers: [PublicWhistleblowingController, AdminWhistleblowingController],
  providers: [WhistleblowingService],
})
export class WhistleblowingModule {}
