import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin, logout } from "./helpers";

test.describe("Autenticação administrativa e RBAC", () => {
  test("4. fazer login administrativo", async ({ page }) => {
    await loginAsAdmin(page, "admin.demo@selecon.example");
    await expect(page.getByRole("heading", { name: "Command Center" })).toBeVisible();
  });

  test("5. trocar senha inicial (criação de usuário -> primeiro login -> troca obrigatória)", async ({
    page,
  }) => {
    await loginAsAdmin(page, "admin.demo@selecon.example");

    await gotoAndReady(page, "/admin/usuarios");
    await page.getByRole("button", { name: "Novo usuário" }).click();
    const email = `e2e-trocar-senha-${Date.now()}@selecon.example`;
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Nome").fill("Usuário E2E Trocar Senha");
    await page.getByLabel("Perfil").selectOption("READ_ONLY");
    await page.getByRole("button", { name: "Criar usuário" }).click();

    const credentialText = await page
      .locator("p.font-mono")
      .first()
      .textContent({ timeout: 10_000 });
    expect(credentialText).toBeTruthy();
    const temporaryPassword = credentialText!.trim();

    await logout(page);

    await gotoAndReady(page, "/admin/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(temporaryPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/admin/trocar-senha");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("15. validar restrição de perfil (SERVICE_AGENT não acessa denúncias)", async ({ page }) => {
    await loginAsAdmin(page, "atendimento.demo@selecon.example");
    const response = await page.request.get("/api/admin/whistleblowing/cases");
    expect(response.status()).toBe(403);
  });

  test("mobile: menu hambúrguer abre e navega (responsividade real do admin)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page, "admin.demo@selecon.example");
    const menuButton = page.getByRole("button", { name: /abrir menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await page.getByRole("link", { name: "Concursos" }).click();
    await expect(page).toHaveURL("/admin/concursos");
  });
});
