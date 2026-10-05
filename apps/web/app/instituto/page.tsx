import Link from "next/link";
import type { Metadata } from "next";
import { Card, Container, Icon, SectionHeading, Stat, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import {
  CAPABILITIES,
  CLIENTS,
  INSTITUTION,
  KEY_NUMBERS,
  LEADERSHIP,
  MISSION,
  RECOGNITIONS,
  TRACK_RECORD,
} from "@/lib/content/data/institution";
import { formatInteger } from "@/lib/format";

export const metadata: Metadata = {
  title: "O Instituto — quem somos, governança e estrutura",
  description:
    "Conheça o Instituto Nacional de Seleções e Concursos (Selecon): trajetória, missão, valores, governança por projeto, equipe de direção, estrutura própria no Rio de Janeiro e base legal para contratação.",
  alternates: { canonical: "/instituto" },
};

const ON_THIS_PAGE = [
  { href: "#quem-somos", label: "Quem somos" },
  { href: "#trajetoria", label: "Trajetória" },
  { href: "#missao", label: "Missão, visão e valores" },
  { href: "#governanca", label: "Governança e equipe" },
  { href: "#estrutura", label: "Estrutura e segurança" },
  { href: "#compromisso", label: "Compromisso social" },
  { href: "#base-legal", label: "Base legal" },
  { href: "#reconhecimentos", label: "Reconhecimentos" },
];

const MAIN_TRACK_RECORD = [...TRACK_RECORD]
  .sort((a, b) => b.registered - a.registered)
  .slice(0, 10);

const GOVERNANCE_AREAS = [
  { title: "Pedagógica", description: "Banca, manual de itens, revisão e recursos." },
  {
    title: "Técnica e operacional",
    description: "Cronograma, inscrições, ensalamento e aplicação.",
  },
  { title: "Jurídica", description: "Edital, atos complementares e prevenção de demandas." },
  { title: "Logística", description: "Locais de prova, equipes, malotes e transporte." },
  { title: "Gráfica", description: "Impressão própria com cadeia de custódia documentada." },
  {
    title: "Tecnologia",
    description: "Inscrição on-line, Área do Candidato e trilhas de auditoria.",
  },
  { title: "Comunicação", description: "Divulgação do certame e atendimento ao candidato." },
];

const SECURITY_FACILITIES = [
  {
    icon: "lock" as const,
    title: "Acesso por biometria",
    description: "Todos os setores da sede têm controle de acesso biométrico.",
  },
  {
    icon: "shield" as const,
    title: "Câmeras em todas as instalações",
    description: "Monitoramento contínuo das áreas de produção, guarda e expedição.",
  },
  {
    icon: "printer" as const,
    title: "Gráfica própria",
    description:
      "Impressão interna, malotes lacrados e numerados, acompanhamento em tempo real até o destino.",
  },
  {
    icon: "users" as const,
    title: "Testes de aptidão física",
    description:
      "Aplicados em locais de referência no Rio de Janeiro (CEFAN e EsEFEx), filmados inclusive por drones, com ambulância presente.",
  },
  {
    icon: "building" as const,
    title: "Auditório na sede",
    description: "Espaço próprio para cursos de formação, treinamentos de equipes e seminários.",
  },
];

export default function InstitutePage() {
  return (
    <>
      <PageHeader
        eyebrow="O Instituto"
        title="Instituto Nacional de Seleções e Concursos"
        description="Entidade privada sem fins lucrativos, sediada no Rio de Janeiro, dedicada a concursos públicos, processos seletivos, pesquisas e capacitação para órgãos e instituições de todo o país."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "O Instituto" }]}
        actions={
          <>
            <Link href="/servicos" className={buttonClassNames("primary")}>
              Conhecer os serviços
            </Link>
            <Link href="/transparencia" className={buttonClassNames("secondary")}>
              Transparência
            </Link>
          </>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
          {/* Navegação interna */}
          <nav aria-label="Nesta página" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
              Nesta página
            </p>
            <ul className="lg:border-border mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-l">
              {ON_THIS_PAGE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="border-border bg-surface text-navy-primary hover:text-action-blue lg:hover:border-action-blue inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-medium lg:-ml-px lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:bg-transparent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-16">
            {/* Quem somos */}
            <section id="quem-somos" aria-labelledby="quem-somos-title" className="scroll-mt-24">
              <SectionHeading
                id="quem-somos-title"
                eyebrow="Quem somos"
                title="Uma banca dedicada à seleção pública"
              />
              <div className="prose-selecon text-text-primary mt-6 max-w-3xl text-base">
                {MISSION.whoWeAre.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Trajetória */}
            <section id="trajetoria" aria-labelledby="trajetoria-title" className="scroll-mt-24">
              <SectionHeading
                id="trajetoria-title"
                eyebrow="Trajetória"
                title="Números que resumem a história"
                description="Os números abaixo têm procedência indicada e são atualizados a cada homologação."
              />
              <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {KEY_NUMBERS.map((number) => (
                  <Stat
                    key={number.label}
                    value={number.value}
                    label={number.label}
                    caption={number.caption}
                  />
                ))}
              </div>

              <div className="border-border bg-surface mt-10 overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <caption className="text-navy-primary px-4 py-3 text-left text-base font-bold">
                    Principais certames conduzidos, por número de inscritos
                  </caption>
                  <thead className="border-border bg-background-light text-text-secondary border-y text-xs uppercase tracking-wide">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Órgão ou entidade
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        UF
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Tipo
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        Inscritos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {MAIN_TRACK_RECORD.map((item) => (
                      <tr key={item.client}>
                        <th scope="row" className="text-navy-primary px-4 py-3 font-medium">
                          {item.client}
                        </th>
                        <td className="text-text-secondary px-4 py-3">{item.uf}</td>
                        <td className="text-text-secondary px-4 py-3">{item.kind}</td>
                        <td className="text-text-primary px-4 py-3 text-right tabular-nums">
                          {formatInteger(item.registered)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-text-secondary mt-3 text-sm">
                Dez maiores certames por inscritos. A relação completa está na página de{" "}
                <Link
                  href="/transparencia#certames"
                  className="text-action-blue underline underline-offset-4"
                >
                  Transparência
                </Link>
                .
              </p>
            </section>

            {/* Missão, visão, valores e objetivo */}
            <section id="missao" aria-labelledby="missao-title" className="scroll-mt-24">
              <SectionHeading
                id="missao-title"
                eyebrow="Identidade"
                title="Missão, visão e valores"
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card>
                  <h3 className="text-navy-primary text-lg font-bold">Missão</h3>
                  <p className="text-text-primary mt-2 text-base leading-relaxed">
                    {MISSION.mission}
                  </p>
                </Card>
                <Card>
                  <h3 className="text-navy-primary text-lg font-bold">Visão</h3>
                  <p className="text-text-primary mt-2 text-base leading-relaxed">
                    {MISSION.vision}
                  </p>
                </Card>
                <Card className="md:col-span-2">
                  <h3 className="text-navy-primary text-lg font-bold">Valores</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {MISSION.values.map((value) => (
                      <li
                        key={value}
                        className="text-text-primary flex items-center gap-2 text-base"
                      >
                        <Icon
                          name="check-circle"
                          size={18}
                          className="text-success-green shrink-0"
                        />
                        {value}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              <div className="border-action-blue bg-wash-blue mt-6 rounded-lg border-l-4 p-6">
                <h3 className="text-navy-primary text-lg font-bold">Objetivo</h3>
                <p className="text-text-primary mt-2 text-base leading-relaxed">
                  {MISSION.objective}
                </p>
              </div>
            </section>

            {/* Governança e equipe */}
            <section id="governanca" aria-labelledby="governanca-title" className="scroll-mt-24">
              <SectionHeading
                id="governanca-title"
                eyebrow="Governança"
                title="Governança por projeto"
                description="Para cada certame é montada uma estrutura de governança adequada às necessidades do contratante. Cada área responde por uma etapa e documenta o que executa."
              />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GOVERNANCE_AREAS.map((area) => (
                  <li key={area.title} className="border-border bg-surface rounded-lg border p-4">
                    <h3 className="text-navy-primary text-base font-bold">{area.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                      {area.description}
                    </p>
                  </li>
                ))}
              </ul>

              <h3 className="text-navy-primary mt-12 text-xl font-bold sm:text-2xl">
                Equipe de direção e coordenação
              </h3>
              <p className="text-text-secondary mt-2 max-w-2xl text-base">
                Profissionais com experiência comprovada em concursos públicos, gestão pública,
                direito e educação. Contatos institucionais são feitos pelos canais oficiais do
                Instituto.
              </p>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {LEADERSHIP.map((member) => (
                  <li key={member.name}>
                    <Card className="h-full">
                      <h4 className="text-navy-primary text-base font-bold">{member.name}</h4>
                      <p className="text-action-blue mt-0.5 text-sm font-semibold">{member.role}</p>
                      <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            {/* Estrutura e segurança */}
            <section id="estrutura" aria-labelledby="estrutura-title" className="scroll-mt-24">
              <SectionHeading
                id="estrutura-title"
                eyebrow="Estrutura e segurança"
                title="Estrutura própria para certames de qualquer porte"
                description="Coordenação pedagógica, assessoria jurídica, gráfica, logística, tecnologia e atendimento operam sob o mesmo teto, na sede do Instituto no centro do Rio de Janeiro."
              />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {CAPABILITIES.map((capability) => (
                  <li
                    key={capability.title}
                    className="border-border bg-surface flex gap-4 rounded-lg border p-5"
                  >
                    <span className="bg-wash-blue text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                      <Icon name={capability.icon} size={22} />
                    </span>
                    <div>
                      <h3 className="text-navy-primary text-base font-bold">{capability.title}</h3>
                      <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                        {capability.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bg-navy-primary mt-10 rounded-lg p-6 text-white sm:p-8">
                <h3 className="text-xl font-bold">Segurança física e cadeia de custódia</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
                  O sigilo das provas depende de controle de ponta a ponta. Da elaboração à
                  aplicação, cada etapa acontece em ambiente monitorado e documentado.
                </p>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SECURITY_FACILITIES.map((item) => (
                    <li
                      key={item.title}
                      className="rounded-lg border border-white/15 bg-white/5 p-4"
                    >
                      <Icon name={item.icon} size={22} className="text-support-cyan" />
                      <h4 className="mt-3 text-base font-bold">{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-white/80">Sede: {INSTITUTION.address.full}.</p>
              </div>
            </section>

            {/* Compromisso social e amplitude nacional */}
            <section id="compromisso" aria-labelledby="compromisso-title" className="scroll-mt-24">
              <SectionHeading
                id="compromisso-title"
                eyebrow="Compromisso social"
                title="Responsabilidade social e amplitude nacional"
              />
              <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                <div className="prose-selecon text-text-primary max-w-3xl text-base">
                  <p>
                    Responsabilidade social, isonomia e universalidade estão entre os valores do
                    Instituto. Na prática, isso significa editais claros, inscrições com isenção e
                    cotas conforme a lei, atendimento ao candidato com protocolo e campanhas de
                    divulgação segmentadas — em mídia impressa, digital, outdoor e busdoor — para
                    ampliar o alcance e a participação nos certames.
                  </p>
                  <p>
                    O Instituto já conduziu certames em dez estados (RJ, MT, MS, MG, RR, MA, BA, SP,
                    SE e SC), para prefeituras, câmaras municipais, secretarias estaduais, empresas
                    públicas e instituições federais de ensino, com estrutura dimensionada para
                    seleções de dezenas a centenas de milhares de candidatos.
                  </p>
                </div>
                <div className="border-border bg-surface rounded-lg border p-5">
                  <h3 className="text-navy-primary text-base font-bold">
                    Órgãos e instituições atendidos
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Clientes e parceiros">
                    {CLIENTS.map((client) => (
                      <li
                        key={client}
                        className="border-border bg-background-light text-navy-primary rounded-full border px-3 py-1 text-sm font-medium"
                      >
                        {client}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Base legal */}
            <section id="base-legal" aria-labelledby="base-legal-title" className="scroll-mt-24">
              <SectionHeading
                id="base-legal-title"
                eyebrow="Base legal"
                title="Natureza jurídica e contratação"
              />
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="border-border bg-surface rounded-lg border p-5">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    Razão social
                  </dt>
                  <dd className="text-navy-primary mt-1 text-base font-medium">
                    {INSTITUTION.legalName}
                  </dd>
                </div>
                <div className="border-border bg-surface rounded-lg border p-5">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    CNPJ e natureza
                  </dt>
                  <dd className="text-navy-primary mt-1 text-base font-medium">
                    {INSTITUTION.cnpj} — {INSTITUTION.legalNature}
                  </dd>
                </div>
                <div className="border-border bg-surface rounded-lg border p-5 md:col-span-2">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    Registro
                  </dt>
                  <dd className="text-text-primary mt-1 text-base leading-relaxed">
                    {INSTITUTION.registry}
                  </dd>
                </div>
                <div className="border-action-blue bg-wash-blue rounded-lg border-l-4 p-5 md:col-span-2">
                  <dt className="text-navy-primary text-sm font-semibold uppercase tracking-wide">
                    Contratação
                  </dt>
                  <dd className="text-text-primary mt-1 text-base leading-relaxed">
                    {MISSION.legalBasis}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Reconhecimentos */}
            <section
              id="reconhecimentos"
              aria-labelledby="reconhecimentos-title"
              className="scroll-mt-24"
            >
              <SectionHeading
                id="reconhecimentos-title"
                eyebrow="Reconhecimentos"
                title="Reconhecimentos públicos"
              />
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {RECOGNITIONS.map((item) => (
                  <li
                    key={item.title}
                    className="border-border bg-surface flex gap-4 rounded-lg border p-5"
                  >
                    <Icon name="award" size={28} className="text-action-blue shrink-0" />
                    <div>
                      <h3 className="text-navy-primary text-base font-bold">{item.title}</h3>
                      <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* CTA */}
            <section aria-labelledby="cta-title">
              <Card padding="lg" className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                    Para órgãos públicos e instituições
                  </p>
                  <h2 id="cta-title" className="text-navy-primary mt-1 text-2xl font-bold">
                    Precisa realizar um concurso ou processo seletivo?
                  </h2>
                  <p className="text-text-secondary mt-2 text-base">
                    Conheça as linhas de serviço ou envie sua demanda para receber uma proposta
                    técnica e de preço.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                  <Link href="/comercial" className={buttonClassNames("primary", "", "lg")}>
                    Solicitar proposta
                    <Icon name="arrow-right" size={18} />
                  </Link>
                  <Link href="/servicos" className={buttonClassNames("secondary", "", "lg")}>
                    Ver serviços
                  </Link>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
