import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin } from "./helpers";

test.describe("Canal de denúncias — registro, consulta e acesso com justificativa", () => {
  test("12-14. abrir denúncia, consultar e acessar com justificativa", async ({ page }) => {
    // 12. Abrir denúncia (público, anônimo)
    await gotoAndReady(page, "/denuncias/nova");
    await page.getByLabel("Categoria").selectOption({ index: 1 });
    await page
      .getByLabel("Descreva o ocorrido")
      .fill("Relato fictício de teste E2E com conteúdo suficientemente longo.");
    await page.getByRole("button", { name: "Registrar denúncia" }).click();

    await expect(page.getByRole("heading", { name: "Denúncia registrada" })).toBeVisible();
    const protocol = (await page.locator("dd.font-mono").nth(0).textContent())!.trim();
    const accessCode = (await page.locator("dd.font-mono").nth(1).textContent())!.trim();
    expect(protocol).toMatch(/^DEN-/);

    // 13. Consultar denúncia (público, com protocolo + código)
    await gotoAndReady(page, "/denuncias/consultar");
    await page.getByLabel("Protocolo").fill(protocol);
    await page.getByLabel("Código de acesso").fill(accessCode);
    await page.getByRole("button", { name: "Consultar" }).click();
    await expect(page.getByText("Recebida")).toBeVisible();

    // 14. Acessar denúncia com justificativa (admin de integridade)
    await loginAsAdmin(page, "integridade.demo@selecon.example");
    await gotoAndReady(page, "/admin/denuncias");
    await page.locator("tr", { hasText: protocol }).click();
    await page
      .getByPlaceholder(/verificação de rotina/i)
      .fill("Verificação de rotina do caso para teste E2E automatizado.");
    await page.getByRole("button", { name: "Acessar caso" }).click();
    await expect(page.getByText("Recebida")).toBeVisible();
  });
});
