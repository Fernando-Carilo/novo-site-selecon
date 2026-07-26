"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SkipLink } from "@selecon/ui";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Todo o subárvore /admin (login, troca de senha e o dashboard autenticado)
 * já traz seu próprio cabeçalho/rodapé — o dashboard tem sidebar + header
 * próprios, e login/troca-de-senha são telas isoladas. Sem esse desvio, o
 * header/footer institucional (público) do layout raiz aparecia *em cima* do
 * shell do admin em toda página autenticada, e em viewport mobile chegava a
 * cobrir botões da própria página (bug real encontrado pela suíte E2E: clique
 * em "Novo usuário"/"Novo concurso" interceptado pelo header público).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
