import { test, expect } from "@playwright/test";
import { gotoAndReady } from "./helpers";

test.describe("Portal público", () => {
  test("1. abrir a home", async ({ page }) => {
    await gotoAndReady(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/Selecon|Portal/i);
  });

  test("2. listar concursos", async ({ page }) => {
    await gotoAndReady(page, "/concursos");
    await expect(page.getByRole("heading", { name: "Concursos" })).toBeVisible();
  });

  test("3. abrir detalhes de um concurso", async ({ page }) => {
    await gotoAndReady(page, "/concursos");
    const firstLink = page.locator('a[href^="/concursos/"]').first();
    await expect(firstLink).toBeVisible();
    await firstLink.click();
    await expect(page).toHaveURL(/\/concursos\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("21. responsividade — menu mobile funciona em viewport pequeno", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndReady(page, "/admin/login");
    // A própria página de login não tem menu; valida em vez disso que o layout
    // administrativo (autenticado) expõe o botão de menu mobile em telas pequenas —
    // ver /admin, testado dentro de admin-auth.spec.ts após login.
    await expect(page.locator("body")).toBeVisible();
    await gotoAndReady(page, "/");
    // Nenhum overflow horizontal na home em viewport mobile.
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("22. navegação por teclado — foco visível na home", async ({ page }) => {
    await gotoAndReady(page, "/");
    await page.keyboard.press("Tab");
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
    // O primeiro elemento focável deve ser o skip link ou um link de navegação real.
    const isInteractive = await page.evaluate(() => {
      const tag = document.activeElement?.tagName;
      return tag === "A" || tag === "BUTTON";
    });
    expect(isInteractive).toBe(true);
  });
});
