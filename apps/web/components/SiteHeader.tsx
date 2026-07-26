import Link from "next/link";

// Menu completo (O Instituto, Notícias, Fale Conosco) chega nas Fases 2 e 5, quando essas
// páginas existirem de fato — nenhum item aponta para uma rota inexistente (regra 3.11).
const NAV_ITEMS = [
  { href: "/concursos", label: "Concursos" },
  { href: "/atendimento", label: "Atendimento" },
  { href: "/denuncias", label: "Integridade" },
  { href: "/candidato", label: "Área do candidato" },
];

/**
 * Cabeçalho institucional — seção 9.1. Navegação orientada por tarefa, com menu mobile
 * acessível a implementar na Fase 1 (foco preso + fechamento por Esc). Nesta fase (Fase 0)
 * o header é um placeholder funcional de navegação desktop.
 */
export function SiteHeader() {
  return (
    <header className="border-border bg-surface border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-navy-primary text-lg font-bold">
          Instituto Selecon
        </Link>
        <nav aria-label="Navegação principal">
          <ul className="text-text-primary hidden gap-6 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-action-blue">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
