import Link from "next/link";

const STATS = [
  { value: "17", label: "Em andamento" },
  { value: "2", label: "Inscrições abertas" },
  { value: "248", label: "Encerrados" },
  { value: "265", label: "Todos os processos" },
];

export function SearchPanel() {
  return (
    <section className="relative z-10 -mt-8" aria-label="Buscar concursos">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <div className="rounded-lg border border-line bg-white p-4 shadow-md sm:p-6">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="search"
                placeholder="Buscar concurso por nome, órgão ou cargo..."
                className="h-11 w-full rounded-md bg-soft pl-10 pr-4 text-sm text-ink outline-none ring-1 ring-line transition-all duration-fast placeholder:text-muted focus:ring-2 focus:ring-green"
                aria-label="Buscar concursos"
              />
            </div>
            <Link
              href="/concursos"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
            >
              Buscar
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-lg font-bold text-ink">{stat.value}</span>
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
