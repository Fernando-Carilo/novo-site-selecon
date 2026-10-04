import { buttonClassNames } from "@selecon/ui";
import { SearchIcon } from "@/components/icons";

/**
 * Busca de concursos do hero (seção 9.2). Formulário GET puro: funciona sem JavaScript e
 * leva a consulta para `/concursos?q=`, onde o catálogo (Fase 3) assumirá a pesquisa com
 * autocomplete, tolerância a acentos e sinônimos.
 */
export function ContestSearchForm() {
  return (
    <form role="search" action="/concursos" method="get" className="w-full">
      <label htmlFor="hero-search" className="text-navy-primary block text-sm font-semibold">
        Buscar concurso
      </label>
      <div className="border-border bg-surface shadow-medium focus-within:border-action-blue focus-within:ring-action-blue/25 mt-2 flex items-center gap-2 rounded-lg border p-1.5 pl-4 transition-[box-shadow,border-color] focus-within:ring-4">
        <SearchIcon className="text-text-secondary h-5 w-5 shrink-0" />
        <input
          id="hero-search"
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Órgão, cargo ou cidade"
          className="text-text-primary placeholder:text-text-secondary/80 min-h-11 w-full min-w-0 bg-transparent text-base outline-none focus-visible:outline-none"
        />
        <button type="submit" className={buttonClassNames("primary", "shrink-0 px-5")}>
          Buscar
        </button>
      </div>
      <p className="text-text-secondary mt-2.5 text-sm">
        Pesquise por órgão, cargo, cidade, estado ou número do edital.
      </p>
    </form>
  );
}
