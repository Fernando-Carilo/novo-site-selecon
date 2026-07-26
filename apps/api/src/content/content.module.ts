import { Module } from "@nestjs/common";
import { AdminContentController } from "./admin-content.controller.js";
import { PublicContentController } from "./public-content.controller.js";
import { ContentService } from "./content.service.js";

@Module({
  controllers: [AdminContentController, PublicContentController],
  providers: [ContentService],
})
export class ContentModule {}
