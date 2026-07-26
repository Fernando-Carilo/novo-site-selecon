import type { Page } from "@playwright/test";

export const E2E_PASSWORD = "E2E-teste-local-2026!";

/**
 * Navega e aguarda a hidratação do React terminar antes de devolver o controle —
 * interagir com um formulário client-side logo após `page.goto` pode disparar o
 * submit nativo do navegador (GET com os campos na query string) se o clique
 * acontecer antes do React anexar o `onSubmit`. Bug real encontrado pela própria
 * suíte E2E na primeira execução (ver tests/admin-auth.spec.ts).
 *
 * `networkidle` sozinho não é suficiente: sob CPU sob carga (Chromium headless
 * com renderização via software), a rede pode ficar ociosa antes do React
 * terminar de commitar os event listeners, reproduzindo o mesmo bug de forma
 * intermitente. `<html data-hydrated="true">` (ver components/HydrationMarker.tsx)
 * só é definido depois que o React monta, então esperar por ele é determinístico.
 */
export async function gotoAndReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("html[data-hydrated='true']", { state: "attached" });
}

export async function loginAsAdmin(page: Page, email: string): Promise<void> {
  await gotoAndReady(page, "/admin/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => url.pathname === "/admin" || url.pathname === "/admin/trocar-senha");
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: /sair/i }).click();
  await page.waitForURL("/admin/login");
}

export function uniqueSlug(prefix: string): string {
  return `${prefix}-e2e-${Date.now()}`;
}
