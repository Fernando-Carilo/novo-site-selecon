import Link from "next/link";

const KPI_ITEMS = [
  { label: "Inscritos", value: "12.847" },
  { label: "Aprovados", value: "3.210" },
  { label: "Em análise", value: "492" },
];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"
      aria-label="Apresentação do Instituto Selecon"
    >
      {/* Gradient overlay top */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

      <div className="w-[min(1200px,calc(100%-40px))] mx-auto grid min-h-[600px] items-center gap-12 py-20 lg:grid-cols-2 lg:py-[92px]">
        {/* Copy */}
        <div className="relative z-10">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">
            Portal público e sistema operacional
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-[3.5rem]">
            Instituto Selecon
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
            Plataforma completa para gestão e execução de concursos públicos. Portal do candidato,
            CMS institucional, sistema operacional e infraestrutura enterprise — tudo em um
            único ecossistema.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/concursos"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
            >
              Ver concursos abertos
            </Link>
            <Link
              href="/institucional/sobre"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-white/10 text-white border border-white/25 backdrop-blur-md hover:bg-white/20 transition-all duration-base"
            >
              Conheça o Instituto
            </Link>
            <Link
              href="/contato"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-blue-950 text-white shadow-dark hover:bg-blue-900 transition-all duration-base"
            >
              Solicitar demo
            </Link>
          </div>
        </div>

        {/* System window mock */}
        <div className="relative z-10 animate-rise">
          <div className="rounded-lg border border-white/10 bg-blue-950/80 shadow-lg backdrop-blur-md">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
              <span className="ml-3 text-[11px] text-white/40">sistema.selecon.org.br</span>
            </div>

            <div className="flex min-h-[320px]">
              {/* Sidebar */}
              <div className="hidden w-40 border-r border-white/10 p-3 sm:block">
                <div className="space-y-2">
                  {["Dashboard", "Concursos", "Candidatos", "Provas", "Relatórios"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded px-2 py-1.5 text-[11px] text-white/50 first:bg-white/10 first:text-white/90"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex-1 p-4">
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-2">
                  {KPI_ITEMS.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded border border-white/10 bg-white/5 p-2.5 text-center"
                    >
                      <p className="text-lg font-bold text-white">{kpi.value}</p>
                      <p className="text-[10px] text-white/50">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart bars */}
                <div className="mt-4 flex items-end gap-1.5">
                  {[40, 65, 50, 80, 72, 90, 60, 85, 45, 70, 55, 78].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-green/30"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                {/* Info cards */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <p className="text-[10px] text-white/40">Próxima prova</p>
                    <p className="text-xs font-semibold text-white/80">15 Mar 2025</p>
                  </div>
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <p className="text-[10px] text-white/40">Status</p>
                    <p className="text-xs font-semibold text-green">Operacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
