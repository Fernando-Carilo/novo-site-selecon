import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin, logout } from "./helpers";

test.describe("Anúncios — criação, revisão e aprovação (compliance)", () => {
  test("16-18. criar campanha, revisar e aprovar com atores diferentes", async ({ page }) => {
    const campaignName = `Campanha E2E ${Date.now()}`;

    // 16. Criar campanha (comercial)
    await loginAsAdmin(page, "comercial.demo@selecon.example");
    await gotoAndReady(page, "/admin/anuncios");
    await page.getByRole("button", { name: "Nova campanha" }).click();
    await page.getByLabel("Anunciante").selectOption({ index: 1 });
    await page.getByLabel("Nome da campanha").fill(campaignName);
    const now = new Date();
    const starts = new Date(now.getTime() - 60_000).toISOString().slice(0, 16);
    const ends = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await page.getByLabel("Início").fill(starts);
    await page.getByLabel("Fim").fill(ends);
    await page.getByText("Barra lateral da home").click();
    await page.getByLabel("Chave do objeto (S3)").fill("e2e/creative.png");
    await page.getByLabel("URL de destino").fill("https://example.com/e2e-anuncio");
    await page.getByRole("button", { name: "Criar campanha (rascunho)" }).click();

    await page.locator("tr", { hasText: campaignName }).click();
    await page.getByRole("button", { name: "Enviar para revisão" }).click();
    await logout(page);

    // 17. Executar revisão (revisor diferente do criador)
    await loginAsAdmin(page, "comercial.revisor.demo@selecon.example");
    await gotoAndReady(page, "/admin/anuncios");
    await page.locator("tr", { hasText: campaignName }).click();
    await page.getByRole("button", { name: "Aprovar revisão" }).click();
    await expect(page.getByText("Aguardando compliance")).toBeVisible();
    await logout(page);

    // 18. Executar aprovação de compliance (terceiro ator, diferente do criador e do revisor)
    await loginAsAdmin(page, "admin.demo@selecon.example");
    await gotoAndReady(page, "/admin/anuncios");
    await page.locator("tr", { hasText: campaignName }).click();
    await page.getByRole("button", { name: "Aprovar compliance" }).click();
    await expect(page.getByText("Aprovada")).toBeVisible();
  });
});
