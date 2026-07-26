"use client";

import { useEffect } from "react";

/**
 * Marca `<html data-hydrated="true">` assim que o React termina de hidratar e
 * anexar os event listeners. Sem isso, testes E2E que clicam em um formulário
 * logo após `waitForLoadState("networkidle")` podem clicar antes do
 * `onSubmit` estar anexado, disparando o submit nativo do navegador — bug
 * real encontrado pela suíte E2E (ver e2e/tests/helpers.ts, gotoAndReady).
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "true");
  }, []);
  return null;
}
