import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin } from "./helpers";

test.describe("Atendimento — protocolo público e resposta administrativa", () => {
  test("9-11. abrir solicitação, consultar protocolo e responder", async ({ page }) => {
    const subject = `Assunto E2E ${Date.now()}`;

    // 9. Criar ticket (público, sem conta)
    await gotoAndReady(page, "/atendimento/novo");
    await page.getByLabel("Nome completo").fill("Cidadão de Teste E2E");
    await page.getByLabel("E-mail").fill("cidadao.e2e@example.com");
    await page.getByLabel("Assunto").fill(subject);
    await page.getByLabel("Descreva sua solicitação").fill("Descrição fictícia de teste E2E.");
    await page.getByLabel(/estou ciente/i).check();
    await page.getByRole("button", { name: "Enviar solicitação" }).click();

    await expect(page.getByRole("heading", { name: "Solicitação registrada" })).toBeVisible();
    const protocol = (await page.locator("p.font-mono").textContent())!.trim();
    expect(protocol).toMatch(/^AT-/);

    // 10. Consultar protocolo
    await gotoAndReady(page, "/atendimento/consultar");
    await page.getByLabel(/protocolo/i).fill(protocol);
    await page.getByRole("button", { name: "Consultar" }).click();
    await expect(page.getByText(subject)).toBeVisible();

    // 11. Responder (admin)
    await loginAsAdmin(page, "atendimento.demo@selecon.example");
    await gotoAndReady(page, "/admin/atendimento");
    await page.locator("tr", { hasText: protocol }).click();
    await page.getByLabel("Responder").fill("Resposta fictícia de teste E2E.");
    await page.getByRole("button", { name: "Enviar resposta" }).click();
    await expect(page.getByText("Resposta fictícia de teste E2E.")).toBeVisible();

    // Confirma que a resposta aparece na consulta pública também.
    await gotoAndReady(page, "/atendimento/consultar");
    await page.getByLabel(/protocolo/i).fill(protocol);
    await page.getByRole("button", { name: "Consultar" }).click();
    await expect(page.getByText("Resposta fictícia de teste E2E.")).toBeVisible();
  });
});
