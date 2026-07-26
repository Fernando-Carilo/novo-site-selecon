import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { HealthStatus } from "@selecon/contracts";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("live")
  @ApiOkResponse({ description: "Processo no ar (liveness)." })
  live(): HealthStatus {
    return this.healthService.liveness();
  }

  @Get("ready")
  @ApiOkResponse({ description: "Dependências (Postgres, Redis) disponíveis (readiness)." })
  async ready(): Promise<HealthStatus> {
    return this.healthService.readiness();
  }
}
