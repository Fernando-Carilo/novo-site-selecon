import { baseEnvSchema, parseEnv } from "@selecon/config";
import { z } from "zod";

const apiEnvSchema = baseEnvSchema.extend({
  API_PORT: z.coerce.number().int().positive().default(3001),
  INTEGRATIONS_MODE: z.enum(["mock", "real"]).default("mock"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(): ApiEnv {
  return parseEnv(apiEnvSchema);
}
