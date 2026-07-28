const MODULES = [
  {
    badge: "Core",
    badgeColor: "bg-green-soft text-green-700",
    title: "CMS Enterprise",
    description:
      "Gestão de conteúdo institucional com versionamento, workflows de publicação e SEO automático.",
  },
  {
    badge: "Operação",
    badgeColor: "bg-soft-blue text-blue-700",
    title: "Gestão de Concursos",
    description:
      "Ciclo completo do processo seletivo — edital, inscrição, provas, recursos e homologação.",
  },
  {
    badge: "Serviço",
    badgeColor: "bg-soft-blue text-blue-700",
    title: "Atendimento",
    description:
      "Central multicanal com protocolo automático, SLA configurável e painel de métricas.",
  },
  {
    badge: "Compliance",
    badgeColor: "bg-green-soft text-green-700",
    title: "Canal de Denúncias",
    description:
      "Recebimento anônimo, triagem por categoria, prazos legais e relatórios de integridade.",
  },
  {
    badge: "IA",
    badgeColor: "bg-green-soft text-green-700",
    title: "Chat Inteligente",
    description:
      "Assistente com RAG sobre base documental, respostas contextuais e escalação humana.",
  },
  {
    badge: "Gestão",
    badgeColor: "bg-soft-blue text-blue-700",
    title: "Financeiro",
    description:
      "Controle de taxas, boletos, conciliação bancária e relatórios contábeis integrados.",
  },
  {
    badge: "Operação",
    badgeColor: "bg-soft-blue text-blue-700",
    title: "Logística",
    description:
      "Planejamento de locais de prova, alocação de fiscais, distribuição de materiais.",
  },
  {
    badge: "Novo",
    badgeColor: "bg-green-soft text-green-700",
    title: "Analytics e CRM",
    description:
      "Dashboards em tempo real, funil de conversão, segmentação de candidatos e campanhas.",
  },
];

export function SystemSection() {
  return (
    <section className="bg-blue-950 py-16 sm:py-[92px]" aria-labelledby="system-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green">
          Plataforma operacional
        </p>
        <h2 id="system-heading" className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Sistema completo
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
          Oito módulos integrados que cobrem todo o ciclo de vida de processos seletivos — do
          planejamento à homologação.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => (
            <article
              key={mod.title}
              className="bg-blue-950 p-5 transition-all duration-base hover:bg-blue-900"
            >
              <span
                className={`inline-flex h-6 items-center rounded-full px-2 text-[10px] font-black uppercase ${mod.badgeColor}`}
              >
                {mod.badge}
              </span>
              <h3 className="mt-3 text-sm font-bold text-white">{mod.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">{mod.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
