const SERVICES = [
  {
    icon: "📋",
    title: "Concursos Públicos",
    description:
      "Planejamento, organização e execução de concursos públicos com total segurança e conformidade legal.",
  },
  {
    icon: "🎓",
    title: "Processos Seletivos",
    description:
      "Seleções simplificadas e processos seletivos para contratação temporária em órgãos públicos.",
  },
  {
    icon: "📊",
    title: "Avaliações Educacionais",
    description:
      "Elaboração e aplicação de avaliações de desempenho e diagnósticas para redes de ensino.",
  },
  {
    icon: "🚚",
    title: "Logística de Provas",
    description:
      "Impressão, distribuição, aplicação e correção de provas com cadeia de custódia auditável.",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="services-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Nossos serviços
        </p>
        <h2
          id="services-heading"
          className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
        >
          Soluções completas para a administração pública
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Oferecemos um portfólio integrado de serviços para garantir processos seletivos
          justos, transparentes e tecnologicamente avançados.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
            >
              <span className="text-3xl" role="img" aria-hidden="true">
                {service.icon}
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink">{service.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
