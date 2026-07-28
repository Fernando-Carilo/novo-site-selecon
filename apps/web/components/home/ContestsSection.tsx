import Link from "next/link";

const CONTESTS = [
  {
    status: "Inscrições abertas",
    statusColor: "bg-green-soft text-green-700",
    title: "Prefeitura de Curitiba — Técnico Administrativo",
    description: "Processo seletivo para cargos de nível médio e superior na administração municipal.",
    vagas: "120 vagas",
    salario: "R$ 4.200 – 8.900",
    href: "/concursos/curitiba-2025",
  },
  {
    status: "Em andamento",
    statusColor: "bg-soft-blue text-blue-700",
    title: "Câmara Municipal de Goiânia — Assessor Jurídico",
    description: "Seleção para assessoria jurídica com exigência de OAB ativa e experiência mínima.",
    vagas: "8 vagas",
    salario: "R$ 12.500",
    href: "/concursos/goiania-2025",
  },
  {
    status: "Resultado parcial",
    statusColor: "bg-soft-blue text-blue-700",
    title: "Governo do Estado do Paraná — Agente de Saúde",
    description: "Concurso público para agente comunitário de saúde em municípios do interior.",
    vagas: "450 vagas",
    salario: "R$ 2.800 – 3.500",
    href: "/concursos/parana-saude-2025",
  },
  {
    status: "Inscrições abertas",
    statusColor: "bg-green-soft text-green-700",
    title: "TRF 4ª Região — Analista Judiciário",
    description: "Vagas para analista nas áreas administrativa, contábil e de tecnologia da informação.",
    vagas: "35 vagas",
    salario: "R$ 13.200",
    href: "/concursos/trf4-2025",
  },
];

const SIDEBAR_ITEMS = ["SEO", "FAQ", "Docs", "IA"];

export function ContestsSection() {
  return (
    <section className="bg-soft py-16 sm:py-[92px]" aria-labelledby="contests-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Oportunidades
        </p>
        <h2 id="contests-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Concursos em destaque
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Contest list */}
          <div className="space-y-4">
            {CONTESTS.map((contest) => (
              <article
                key={contest.title}
                className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${contest.statusColor}`}
                >
                  {contest.status}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{contest.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{contest.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                  <span>{contest.vagas}</span>
                  <span>{contest.salario}</span>
                  <Link
                    href={contest.href}
                    className="ml-auto font-bold text-green-700 transition-colors hover:text-green"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-lg bg-blue-950 p-6 text-white">
              <h3 className="text-lg font-bold">Central de concursos</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Acesse informações completas, documentos, editais e acompanhe cada etapa
                dos processos seletivos.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-bold text-white/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/concursos"
                className="mt-5 min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center justify-center w-full bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
              >
                Ver todos os concursos
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
