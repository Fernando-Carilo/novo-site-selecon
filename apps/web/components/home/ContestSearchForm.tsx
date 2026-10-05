import { Icon } from "@selecon/ui";

interface ContestSearchFormProps {
  suggestions: string[];
  defaultValue?: string;
  variant?: "hero" | "inline";
}

/**
 * Busca de concursos (seção 9.2): aceita órgão, cargo, cidade, estado, número do edital e
 * palavras-chave. Envia por GET para o catálogo (`/concursos?q=`), que persiste o filtro na URL.
 * O `<datalist>` oferece autocompletar nativo e acessível sem JavaScript.
 */
export function ContestSearchForm({ suggestions, defaultValue = "", variant = "hero" }: ContestSearchFormProps) {
  const hero = variant === "hero";
  return (
    <form action="/concursos" method="get" role="search" className="w-full">
      <label htmlFor="busca-concursos" className={hero ? "sr-only" : "mb-1.5 block text-sm font-semibold text-navy-primary"}>
        Buscar concurso por órgão, cargo, cidade, estado ou número do edital
      </label>
      <div className={`flex gap-2 ${hero ? "rounded-lg bg-white p-2 shadow-high" : ""}`}>
        <div className="relative flex-1">
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            id="busca-concursos"
            name="q"
            type="search"
            list="busca-concursos-sugestoes"
            defaultValue={defaultValue}
            placeholder="Ex.: guarda municipal, Cuiabá, CEFET, enfermeiro, edital 001/2026"
            autoComplete="off"
            className="block min-h-12 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3 text-base text-text-primary placeholder:text-text-secondary/80 focus:border-action-blue focus:outline-none focus:ring-[3px] focus:ring-action-blue/40"
          />
          <datalist id="busca-concursos-sugestoes">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-action-blue px-5 text-base font-semibold text-white transition-colors hover:bg-action-blue-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-action-blue focus-visible:ring-offset-2"
        >
          <Icon name="search" size={18} className="sm:hidden" label="Buscar" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </form>
  );
}
