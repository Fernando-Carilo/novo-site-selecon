import Link from "next/link";
import { listContests } from "@/lib/central";
import { ContestCard } from "@/components/content/ContestCard";
import { ArrowRightIcon } from "@/components/icons";

/**
 * Concursos em destaque na home — escolhidos na Selecon Central ("Destaque na home").
 * Sem destaque marcado, mostra os concursos mais recentes no portal; sem nenhum
 * concurso publicado, a seção não aparece (nada é simulado).
 */
export async function FeaturedContests() {
  const all = await listContests();
  if (all.length === 0) return null;
  const featured = all.filter((c) => c.featured);
  const items = (featured.length ? featured : all).slice(0, 3);

  return (
    <section aria-labelledby="featured-title" className="bg-surface border-border/70 border-y">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
              Oportunidades
            </p>
            <h2
              id="featured-title"
              className="text-navy-primary mt-2 text-3xl font-bold tracking-tight"
            >
              {featured.length ? "Concursos em destaque" : "Concursos no portal"}
            </h2>
          </div>
          <Link
            href="/concursos"
            className="text-navy-primary hover:text-action-blue inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Ver todos os concursos
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.id}>
              <ContestCard contest={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
