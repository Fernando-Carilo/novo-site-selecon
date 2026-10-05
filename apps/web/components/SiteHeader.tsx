import Link from "next/link";
import { Container, Icon, buttonClassNames } from "@selecon/ui";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileMenu } from "@/components/MobileMenu";
import { CANDIDATE_CTA, PRIMARY_NAV, UTILITY_NAV } from "@/lib/site";

/**
 * Cabeçalho institucional — seção 9.1. Barra de utilidades (acessibilidade, transparência,
 * comercial, Fale Conosco), logotipo oficial, navegação por tarefa e CTA da Área do candidato.
 * Submenus desktop usam `<details>` nativo (teclado e leitor de tela sem JS).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface shadow-low">
      <div className="hidden bg-navy-primary text-white lg:block">
        <Container className="flex items-center justify-between py-1.5 text-xs">
          <p className="font-medium text-white/80">
            Instituto Nacional de Seleções e Concursos
          </p>
          <nav aria-label="Links úteis">
            <ul className="flex items-center gap-5">
              {UTILITY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center gap-1 text-white/90 underline-offset-4 hover:text-white hover:underline focus-visible:ring-support-cyan"
                  >
                    {item.href === "/acessibilidade" ? <Icon name="accessibility" size={14} /> : null}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
      <Container className="flex items-center justify-between gap-4 py-3">
        <BrandLogo priority />
        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) =>
              item.children ? (
                <li key={item.href} className="relative">
                  <details className="group">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-md px-3 text-sm font-semibold text-navy-primary hover:bg-background-light [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <Icon name="chevron-down" size={16} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-surface p-2 shadow-high">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-md px-3 py-2.5 text-sm text-text-primary hover:bg-background-light hover:text-action-blue"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-navy-primary hover:bg-background-light hover:text-action-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href={CANDIDATE_CTA.href} className={buttonClassNames("primary", "hidden sm:inline-flex")}>
            <Icon name="user" size={18} />
            {CANDIDATE_CTA.label}
          </Link>
          <MobileMenu primary={PRIMARY_NAV} utility={UTILITY_NAV} candidate={CANDIDATE_CTA} />
        </div>
      </Container>
    </header>
  );
}
