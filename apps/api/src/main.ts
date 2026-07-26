import "reflect-metadata";
import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { createLogger } from "@selecon/observability";
import { AppModule } from "./app.module";
import { loadApiEnv } from "./env";

const logger = createLogger("api");

async function bootstrap() {
  const env = loadApiEnv();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: ["error", "warn", "log"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  });

  const openApiConfig = new DocumentBuilder()
    .setTitle("Portal Integrado Selecon — API")
    .setDescription(
      "API modular do portal. Fase 0: apenas health checks. Módulos de negócio chegam nas próximas fases.",
    )
    .setVersion("0.1.0")
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(env.API_PORT, "0.0.0.0");
  logger.info({ port: env.API_PORT }, "apps/api iniciado");
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Falha ao iniciar apps/api");
  process.exitCode = 1;
});
