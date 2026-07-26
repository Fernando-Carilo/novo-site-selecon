import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { IntegrationsModule } from "./integrations/integrations.module";

@Module({
  imports: [IntegrationsModule, HealthModule],
})
export class AppModule {}
