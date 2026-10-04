import Link from "next/link";
import { BrandMark } from "@/components/icons";
import { CANDIDATE_AREA, NAV_ITEMS } from "@/components/navigation";

const SERVICE_LINKS = [...NAV_ITEMS, CANDIDATE_AREA];

/**
 * Rodapé institucional. Lista apenas rotas existentes (regra 3.11); política de
 * privacidade, transparência e contatos oficiais entram com o CMS (Fase 2).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-primary text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 rounded-md">
              <BrandMark className="h-9 w-9 [&_rect]:fill-white/10" />
              <span className="text-base font-bold tracking-tight">Instituto Selecon</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Portal integrado para concursos públicos, atendimento ao candidato e canal de
              integridade — com transparência, acessibilidade e proteção de dados.
            </p>
          </div>

          <nav aria-label="Serviços" className="md:col-span-3 md:col-start-7">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Serviços
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center text-sm text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3 md:col-start-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Status do portal
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Fase 0 — fundação. Conteúdo institucional, política de privacidade e transparência
              serão publicados nas próximas fases.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Instituto Selecon. Todos os direitos reservados.</p>
          <p>Compromisso com a acessibilidade (WCAG 2.2 AA) e com a LGPD.</p>
        </div>
      </div>
    </footer>
  );
}
