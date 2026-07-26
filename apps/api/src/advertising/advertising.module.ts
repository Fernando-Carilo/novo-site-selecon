import { Module } from "@nestjs/common";
import { AdminAdvertisingController } from "./admin-advertising.controller.js";
import { PublicAdvertisingController } from "./public-advertising.controller.js";
import { AdvertisingService } from "./advertising.service.js";

@Module({
  controllers: [AdminAdvertisingController, PublicAdvertisingController],
  providers: [AdvertisingService],
})
export class AdvertisingModule {}
