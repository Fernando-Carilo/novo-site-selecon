import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin, logout, uniqueSlug } from "./helpers";

test.describe("Concursos — fluxo completo com separação de funções", () => {
  test("6-8, 20. criar, publicar com separação de funções, exibir no público e auditar", async ({
    page,
  }) => {
    const slug = uniqueSlug("concurso");
    const title = `Concurso E2E ${Date.now()}`;

    // 6. Criar concurso (autor: editor de concursos)
    await loginAsAdmin(page, "concursos.demo@selecon.example");
    await gotoAndReady(page, "/admin/concursos");
    await page.getByRole("button", { name: "Novo concurso" }).click();
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Slug (URL)").fill(slug);
    await page.getByLabel("Descrição curta").fill("Descrição fictícia de teste E2E.");
    await page.getByRole("button", { name: "Salvar rascunho" }).click();

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();

    // Mesmo autor não deve conseguir publicar (separação de funções é aplicada mesmo
    // que a UI ofereça o botão — a API rejeita).
    await row.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    await logout(page);

    // 7. Publicar com um aprovador diferente do autor
    await loginAsAdmin(page, "admin.demo@selecon.example");
    await gotoAndReady(page, "/admin/concursos");
    const rowAsApprover = page.locator("tr", { hasText: title });
    await rowAsApprover.getByRole("button", { name: "Publicar" }).click();
    await expect(rowAsApprover.getByText("Publicado")).toBeVisible();

    // 8. Confirmar exibição pública
    await gotoAndReady(page, `/concursos/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    // 20. Conferir auditoria
    await gotoAndReady(page, "/admin/auditoria");
    await page.getByLabel("Ação").fill("CONTEST_PUBLISHED");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page.getByText("CONTEST_PUBLISHED").first()).toBeVisible();
  });
});
