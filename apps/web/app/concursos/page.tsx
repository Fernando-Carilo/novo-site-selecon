import type { Metadata } from "next";
import { SearchIcon } from "@/components/icons";
import { PlaceholderPage } from "../_placeholder";

export const metadata: Metadata = {
  title: "Catálogo de concursos",
  description: "Editais abertos, em andamento e encerrados organizados pelo Instituto Selecon.",
};

interface ContestsPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function ContestsPage({ searchParams }: ContestsPageProps) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();

  return (
    <PlaceholderPage
      title="Catálogo de concursos"
      phase="Fase 3"
      currentPath="/concursos"
      description="O catálogo com filtros, busca e páginas de edital será implementado na Fase 3, conforme docs/IMPLEMENTATION_PLAN.md."
    >
      {query ? (
        <div
          role="status"
          className="border-border bg-surface shadow-low flex items-start gap-3 rounded-lg border p-4"
        >
          <span className="bg-action-blue/10 text-action-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            <SearchIcon className="h-5 w-5" />
          </span>
          <p className="text-text-secondary text-sm leading-relaxed">
            Você buscou por <strong className="text-navy-primary font-semibold">“{query}”</strong>.
            A pesquisa ainda não está ativa: assim que o catálogo for publicado, esta mesma consulta
            passará a retornar concursos.
          </p>
        </div>
      ) : null}
    </PlaceholderPage>
  );
}
