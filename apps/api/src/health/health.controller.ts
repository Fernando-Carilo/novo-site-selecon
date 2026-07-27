import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
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

  /**
   * Rota usada pelo health check do Elastic Beanstalk (ambiente Docker de container
   * único — ver Dockerfile/docker/entrypoint.sh). Reaproveita a mesma verificação de
   * `ready()` (Postgres + Redis) — o container roda um `redis-server` local só para
   * satisfazer o schema de env (`REDIS_URL` obrigatório) e o próprio health check;
   * nenhum ElastiCache é provisionado (ver docs/ASSUMPTIONS.md). Diferente de
   * `ready()`, responde com HTTP 503 (não 200) quando alguma dependência está fora do
   * ar — o EB só considera a instância saudável com um HTTP 200 real nesta rota.
   */
  @Get()
  @ApiOkResponse({ description: "Health check consolidado para o Elastic Beanstalk." })
  async check(): Promise<HealthStatus> {
    const result = await this.healthService.readiness();
    if (result.status !== "ok") {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

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
