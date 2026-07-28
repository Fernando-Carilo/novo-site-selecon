"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

const SERVICES = [
  { icon: "📋", title: "Concursos Públicos", description: "Planejamento, organização e execução de concursos públicos com total segurança, transparência e conformidade legal.", color: "from-blue-700/20 to-blue-700/5" },
  { icon: "🎓", title: "Processos Seletivos", description: "Seleções simplificadas e processos seletivos para contratação temporária em órgãos públicos de todas as esferas.", color: "from-green/20 to-green/5" },
  { icon: "📊", title: "Avaliações Educacionais", description: "Elaboração e aplicação de avaliações de desempenho, diagnósticas e formativas para redes públicas de ensino.", color: "from-teal-500/20 to-teal-500/5" },
  { icon: "🚚", title: "Logística de Provas", description: "Impressão, distribuição, aplicação e correção com cadeia de custódia auditável e rastreabilidade completa.", color: "from-purple-500/20 to-purple-500/5" },
];

export function ServicesSection() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="services-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <AnimatedSection>
          <p className="text-[13px] font-black uppercase tracking-widest text-green-700">Nossos serviços</p>
          <h2 id="services-heading" className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            Soluções completas para a administração pública
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Portfólio integrado de serviços para processos seletivos justos, transparentes e tecnologicamente avançados.
          </p>
        </AnimatedSection>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.15} direction="up">
              <article className={`group relative overflow-hidden rounded-xl border border-line bg-gradient-to-br ${service.color} p-6 transition-all duration-300 hover:-translate-y-2 hover:border-green/40 hover:shadow-[0_20px_50px_rgba(0,167,131,0.12)]`}>
                <span className="text-4xl" role="img" aria-hidden="true">{service.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-ink">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-gradient-to-br from-green/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
