import { Global, Module } from "@nestjs/common";
import { AdminAuditController } from "./admin-audit.controller.js";
import { AuditService } from "./audit.service.js";

@Global()
@Module({
  controllers: [AdminAuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
