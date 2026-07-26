import { baseEnvSchema, parseEnv } from "@selecon/config";

export type WorkerEnv = ReturnType<typeof loadWorkerEnv>;

export function loadWorkerEnv() {
  return parseEnv(baseEnvSchema);
}
