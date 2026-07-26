import { defineConfig, devices } from "@playwright/test";

/**
 * E2E do Portal Selecon (seção 21/26 do prompt mestre). Roda contra o portal já em pé
 * localmente (apps/web:3000 + apps/api:3001 + Postgres/Redis) — nunca inicia os
 * serviços sozinho, para reutilizar o mesmo processo já validado por
 * lint/typecheck/test/build. Ver docs/TEST_REPORT.md para instruções de execução.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // os testes de admin compartilham sessão/estado — série é mais previsível
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: "/opt/pw-browsers/chromium" } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath: "/opt/pw-browsers/chromium" } },
    },
  ],
});
