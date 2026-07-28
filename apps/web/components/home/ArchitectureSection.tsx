const ITEMS = [
  {
    number: "01",
    title: "Multi-tenant",
    description:
      "Arquitetura isolada por tenant com schemas independentes, conexões pool por contexto e deploy individual por cliente.",
  },
  {
    number: "02",
    title: "RBAC e auditoria",
    description:
      "Controle granular de permissões por papel, registro imutável de todas as ações e compliance automatizado.",
  },
  {
    number: "03",
    title: "AWS Cloud Native",
    description:
      "ECS Fargate, RDS Multi-AZ, S3 com replicação, CloudFront CDN e escalabilidade automática por demanda.",
  },
  {
    number: "04",
    title: "LGPD / WCAG / SEO",
    description:
      "Conformidade com lei de dados pessoais, acessibilidade AA nativa e otimização para mecanismos de busca.",
  },
];

export function ArchitectureSection() {
  return (
    <section className="py-16 sm:py-[92px]" aria-labelledby="arch-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto grid gap-12 lg:grid-cols-2">
        {/* Left — sticky description */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
            Infraestrutura
          </p>
          <h2 id="arch-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Arquitetura enterprise
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Projetada para escala, segurança e conformidade regulatória. Cada decisão
            arquitetural reflete anos de operação em processos seletivos de alta complexidade
            e volume.
          </p>
        </div>

        {/* Right — scrollable list */}
        <div className="space-y-4">
          {ITEMS.map((item) => (
            <article
              key={item.number}
              className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-soft text-xs font-black text-green-700">
                {item.number}
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
