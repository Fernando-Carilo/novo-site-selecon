import { z } from "zod";

/**
 * Schema base de variáveis de ambiente compartilhadas por todos os apps.
 * Cada app (web/api/worker) estende este schema com suas próprias variáveis
 * obrigatórias e chama `parseEnv` no boot — falha rápido se algo estiver ausente
 * ou malformado, em vez de operar em estado inconsistente.
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  REDIS_URL: z.string().min(1, "REDIS_URL é obrigatório"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function parseEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  source: Record<string, string | undefined> = process.env,
): z.infer<TSchema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Configuração de ambiente inválida. Corrija as variáveis abaixo e tente novamente:\n${issues}`,
    );
  }
  return result.data;
}
