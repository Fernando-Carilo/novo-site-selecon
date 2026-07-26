import { test, expect } from "@playwright/test";
import { gotoAndReady, loginAsAdmin, uniqueSlug } from "./helpers";

test.describe("CMS — publicação de conteúdo", () => {
  test("19. publicar notícia e confirmar visibilidade pública", async ({ page }) => {
    const slug = uniqueSlug("noticia");
    const title = `Notícia E2E ${Date.now()}`;

    await loginAsAdmin(page, "conteudo.demo@selecon.example");
    await gotoAndReady(page, "/admin/conteudo");
    await page.getByRole("button", { name: "Nova notícia" }).click();
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Conteúdo").fill("Conteúdo fictício de teste E2E para a notícia.");
    await page.getByRole("button", { name: "Criar notícia (rascunho)" }).click();

    await page.locator("tr", { hasText: title }).click();
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Publicado")).toBeVisible();

    await gotoAndReady(page, `/noticias/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await gotoAndReady(page, "/noticias");
    await expect(page.getByText(title)).toBeVisible();
  });
});
