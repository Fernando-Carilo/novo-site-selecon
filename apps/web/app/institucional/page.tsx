import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem Somos | Instituto Selecon",
  description:
    "Conheça a história, missão, visão e valores do Instituto Selecon — referência em concursos públicos e processos seletivos.",
};

const VALUES = [
  {
    title: "Transparência",
    description: "Todos os processos são públicos, auditáveis e acessíveis.",
  },
  {
    title: "Segurança",
    description: "Cadeia de custódia rigorosa do edital até a homologação.",
  },
  {
    title: "Inovação",
    description: "Tecnologia de ponta para garantir eficiência e confiabilidade.",
  },
  {
    title: "Imparcialidade",
    description: "Compromisso absoluto com a isonomia entre todos os candidatos.",
  },
  {
    title: "Excelência",
    description: "Padrão de qualidade reconhecido por órgãos públicos em todo o Brasil.",
  },
  {
    title: "Responsabilidade Social",
    description: "Contribuição para a profissionalização do serviço público.",
  },
];

const DIRECTORS = [
  { name: "Diretor(a) Geral", role: "Direção Geral" },
  { name: "Diretor(a) Técnico(a)", role: "Direção Técnica" },
  { name: "Diretor(a) Administrativo(a)", role: "Direção Administrativa" },
  { name: "Diretor(a) Jurídico(a)", role: "Direção Jurídica" },
];

export default function InstitucionalPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-[92px]"
        aria-label="Quem Somos"
      >
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">
            Institucional
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Quem Somos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Há mais de uma década atuando com excelência na organização de concursos públicos e
            processos seletivos para a administração pública brasileira.
          </p>
        </div>
      </section>

      {/* História */}
      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="history-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
            Nossa história
          </p>
          <h2
            id="history-heading"
            className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
          >
            Tradição e compromisso com o serviço público
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>
              O Instituto Selecon nasceu com a missão de profissionalizar a seleção de
              servidores públicos, unindo conhecimento técnico, tecnologia e governança para
              entregar processos seletivos íntegros e eficientes.
            </p>
            <p>
              Ao longo dos anos, construímos uma reputação sólida junto a prefeituras, câmaras
              municipais, autarquias e instituições de ensino, acumulando centenas de concursos
              realizados com excelência operacional.
            </p>
            <p>
              Nossa equipe multidisciplinar reúne profissionais das áreas de educação, direito,
              tecnologia da informação e logística, garantindo cobertura completa de todas as
              etapas do processo seletivo.
            </p>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="bg-soft py-16 sm:py-[92px]" aria-labelledby="mvv-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
            Propósito
          </p>
          <h2 id="mvv-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Missão, Visão e Valores
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-green-700">
                Missão
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Organizar e executar concursos públicos e processos seletivos com excelência,
                transparência e inovação, contribuindo para a valorização do serviço público
                brasileiro.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-green-700">
                Visão
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Ser reconhecida como a instituição de referência nacional na organização de
                processos seletivos, pela qualidade técnica, segurança e compromisso com a
                sociedade.
              </p>
            </div>
          </div>

          <h3 className="mt-10 text-lg font-extrabold text-ink">Nossos valores</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
              >
                <h4 className="text-sm font-bold text-ink">{value.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Governança */}
      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="governance-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
            Governança
          </p>
          <h2
            id="governance-heading"
            className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
          >
            Diretoria
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Nossa diretoria é composta por profissionais experientes e comprometidos com a
            missão institucional.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIRECTORS.map((director) => (
              <div
                key={director.role}
                className="flex flex-col items-center rounded-lg border border-line bg-white p-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft">
                  <span className="text-lg font-bold text-muted" aria-hidden="true">
                    {director.name.charAt(0)}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-ink">{director.name}</p>
                <p className="mt-1 text-xs text-muted">{director.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
