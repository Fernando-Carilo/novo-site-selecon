import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { ArrowRightIcon } from "@/components/icons";
import { CANDIDATE_AREA, NAV_ITEMS } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
          Erro 404
        </p>
        <h1 className="text-navy-primary mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Não encontramos esta página.
        </h1>
        <p className="text-text-secondary mt-5 text-lg leading-relaxed">
          O endereço pode ter mudado ou nunca ter existido. Use os atalhos abaixo para continuar —
          ou volte para a página inicial.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonClassNames("primary")}>
            Ir para a página inicial
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/atendimento" className={buttonClassNames("secondary")}>
            Falar com o atendimento
          </Link>
        </div>
      </div>

      <nav aria-label="Seções do portal" className="mt-14">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...NAV_ITEMS, CANDIDATE_AREA].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="border-border bg-surface shadow-low hover:border-action-blue/40 hover:shadow-medium block h-full rounded-xl border p-5 transition-[box-shadow,border-color]"
              >
                <span className="text-navy-primary block font-semibold">{item.label}</span>
                <span className="text-text-secondary mt-1 block text-sm">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
