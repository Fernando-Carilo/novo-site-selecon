const PROFILES = [
  {
    number: "01",
    title: "Candidatos",
    description: "Inscrições, acompanhamento, recursos e área personalizada com histórico completo.",
  },
  {
    number: "02",
    title: "Órgãos",
    description: "Painel do contratante com visão consolidada de processos, cronograma e resultados.",
  },
  {
    number: "03",
    title: "Empresas",
    description: "Acesso SaaS ao sistema operacional com módulos sob demanda e suporte dedicado.",
  },
  {
    number: "04",
    title: "Imprensa",
    description: "Sala de imprensa com comunicados, dados públicos e canal de assessoria direta.",
  },
  {
    number: "05",
    title: "Equipe",
    description: "Ambiente operacional com RBAC granular, auditoria e dashboards em tempo real.",
  },
];

export function ProfilesSection() {
  return (
    <section className="py-16 sm:py-[92px]" aria-labelledby="profiles-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Experiências personalizadas
        </p>
        <h2 id="profiles-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Acesso por perfil
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Cada perfil tem sua jornada otimizada — do candidato ao gestor, da imprensa à equipe operacional.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {PROFILES.map((profile) => (
            <article
              key={profile.number}
              className="group rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-soft text-xs font-black text-green-700">
                {profile.number}
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink">{profile.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{profile.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
