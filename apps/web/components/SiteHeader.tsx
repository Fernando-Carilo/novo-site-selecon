import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { BrandMark, UserCircleIcon } from "@/components/icons";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLink } from "@/components/NavLink";
import { CANDIDATE_AREA, NAV_ITEMS } from "@/components/navigation";

/**
 * Cabeçalho institucional — seção 9.1. Fixo no topo com leve translucidez, navegação
 * orientada por tarefa com estado ativo e menu mobile acessível (`<dialog>` nativo).
 */
export function SiteHeader() {
  return (
    <header className="border-border/80 bg-surface/90 supports-[backdrop-filter]:bg-surface/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md"
          aria-label="Instituto Selecon — página inicial"
        >
          <BrandMark className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-navy-primary text-base font-bold tracking-tight">
              Instituto Selecon
            </span>
            <span className="text-text-secondary mt-1 hidden text-[0.6875rem] font-medium uppercase tracking-[0.14em] sm:block">
              Portal integrado
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="text-text-primary hover:text-navy-primary hover:bg-navy-primary/5 relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors"
                  activeClassName="text-navy-primary after:absolute after:inset-x-3 after:-bottom-[0.8125rem] after:h-0.5 after:rounded-full after:bg-action-blue"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={CANDIDATE_AREA.href}
            className={buttonClassNames("secondary", "hidden md:inline-flex")}
          >
            <UserCircleIcon className="h-5 w-5" />
            {CANDIDATE_AREA.label}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
