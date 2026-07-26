import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { HealthStatus } from "@selecon/contracts";
import { Public } from "../auth/public.decorator.js";
import { HealthService } from "./health.service";

/**
 * `@Public()` na classe inteira: health checks nunca podem exigir sessão — quem os chama
 * é o ALB/ECS (sem cookie nenhum), não um usuário autenticado. Bug real encontrado ao
 * validar o ambiente AWS: o SessionGuard global (regra 12.1: nenhuma rota protegida "por
 * esquecimento") barrava /health/live e /health/ready com 401 desde que a autenticação foi
 * introduzida, o que teria deixado o serviço permanentemente "unhealthy" no ECS/ALB.
 */
@Public()
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
