import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  Container,
  Icon,
  SectionHeading,
  Stat,
  buttonClassNames,
  type IconName,
} from "@selecon/ui";
import { CommercialLeadForm } from "@/components/commercial/CommercialLeadForm";
import { PageHeader } from "@/components/PageHeader";
import {
  CAPABILITIES,
  INSTITUTION,
  KEY_NUMBERS,
  MISSION,
  TRACK_RECORD,
} from "@/lib/content/data/institution";
import { SERVICES } from "@/lib/content/data/services";
import { formatInteger } from "@/lib/format";

export const metadata: Metadata = {
  title: "Para órgãos públicos — Realize seu concurso com o Instituto Selecon",
  description:
    "Entidade sem fins lucrativos contratável por dispensa de licitação (Lei nº 14.133/2021), com estrutura própria para concursos públicos, processos seletivos, seleções escolares e capacitação. Solicite uma proposta.",
  alternates: { canonical: "/comercial" },
};

const VALUE_POINTS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "scale",
    title: "Contratação por dispensa de licitação",
    description: MISSION.legalBasis,
  },
  {
    icon: "building",
    title: "Estrutura própria, sob o mesmo teto",
    description:
      "Coordenação pedagógica, assessoria jurídica, gráfica própria monitorada, logística de malotes lacrados, tecnologia da informação e call center na sede, no centro do Rio de Janeiro.",
  },
  {
    icon: "users",
    title: "Experiência em escala",
    description:
      "Mais de 1,8 milhão de candidatos inscritos em 276 certames, incluindo concursos com mais de 200 mil inscritos e seleções de prefeituras de pequeno porte.",
  },
  {
    icon: "globe",
    title: "Amplitude nacional",
    description:
      "Certames conduzidos em dez estados, para prefeituras, secretarias estaduais, câmaras, empresas públicas e instituições federais de ensino.",
  },
];

const PROCESS_STEPS: { title: string; description: string; deliverable: string }[] = [
  {
    title: "Solicitação",
    description:
      "O órgão descreve a demanda pelo formulário desta página ou pelo e-mail comercial. A equipe comercial responde pelo e-mail informado, em dias úteis.",
    deliverable: "Protocolo COM e primeiro contato da equipe comercial.",
  },
  {
    title: "Diagnóstico e termo de referência",
    description:
      "Levantamento de cargos, vagas, requisitos, etapas, público estimado e legislação aplicável. Quando o órgão já tem termo de referência ou estudo técnico preliminar, ele é a base; caso contrário, o Instituto apoia sua elaboração.",
    deliverable: "Minuta de termo de referência e cronograma preliminar.",
  },
  {
    title: "Proposta técnica e de preço",
    description:
      "Proposta dimensionada para o certame: equipe, etapas, logística, tecnologia e atendimento, com a planilha de custos e a forma de remuneração (em geral, pelas taxas de inscrição ou por valor fixo).",
    deliverable: "Proposta técnica, proposta de preço e documentação de habilitação.",
  },
  {
    title: "Contrato por dispensa de licitação",
    description:
      "Instrução do processo de dispensa com base na Lei nº 14.133/2021, com a documentação institucional e a comprovação de capacidade técnica.",
    deliverable: "Contrato assinado e publicado pelo órgão.",
  },
  {
    title: "Execução com governança própria",
    description:
      "Estrutura de governança montada para o projeto: comissão do órgão, coordenação do Instituto, banca, jurídico, logística, TI e atendimento ao candidato, com relatórios por etapa.",
    deliverable: "Edital, inscrições, provas, recursos e resultados, documentados.",
  },
  {
    title: "Homologação e relatório final",
    description:
      "Resultado final, listas de classificação, respostas a recursos e relatório consolidado para a homologação pelo órgão e para eventual controle externo.",
    deliverable: "Relatório final e acervo documental do certame.",
  },
];

export default function CommercialPage() {
  const reference = [...TRACK_RECORD].sort((a, b) => b.registered - a.registered).slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Para órgãos públicos e instituições"
        title="Realize seu concurso ou processo seletivo com o Instituto Selecon"
        description="Planejamento, edital, inscrições, provas, recursos e resultados com uma estrutura de governança própria para cada certame — de prefeituras a secretarias estaduais e órgãos federais."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Para órgãos públicos" }]}
        actions={
          <>
            <a href="#solicitar-proposta" className={buttonClassNames("primary", "", "lg")}>
              Solicitar proposta
              <Icon name="arrow-right" size={18} />
            </a>
            <Link href="/servicos" className={buttonClassNames("secondary", "", "lg")}>
              Conhecer os serviços
            </Link>
          </>
        }
      />

      {/* 1. Proposta de valor */}
      <section className="py-14" aria-labelledby="valor-title">
        <Container>
          <SectionHeading
            id="valor-title"
            eyebrow="Por que contratar"
            title="Segurança jurídica, estrutura própria e experiência em escala"
          />
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {VALUE_POINTS.map((point) => (
              <li
                key={point.title}
                className="border-border bg-surface flex gap-4 rounded-lg border p-6"
              >
                <span className="bg-wash-blue text-action-blue flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <Icon name={point.icon} size={24} />
                </span>
                <div>
                  <h3 className="text-navy-primary text-lg font-bold">{point.title}</h3>
                  <p className="text-text-secondary mt-2 text-base leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 2. O que fazemos */}
      <section className="bg-surface py-14" aria-labelledby="servicos-title">
        <Container>
          <SectionHeading
            id="servicos-title"
            eyebrow="O que fazemos"
            title="Linhas de serviço"
            description="Cada linha tem página própria com escopo, entregáveis e certames de referência."
            action={
              <Link href="/servicos" className={buttonClassNames("secondary")}>
                Todos os serviços
                <Icon name="arrow-right" size={16} />
              </Link>
            }
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Card as="article" interactive className="relative flex h-full flex-col">
                  <Icon name={service.icon} size={28} className="text-action-blue" />
                  <h3 className="text-navy-primary mt-4 text-lg font-bold leading-snug">
                    <Link
                      href={`/servicos/${service.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                    {service.summary}
                  </p>
                  <p className="text-action-blue mt-auto pt-4 text-sm font-semibold">
                    Ver detalhes
                    <Icon name="arrow-right" size={16} className="ml-1 inline" />
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Como funciona a contratação */}
      <section className="py-14" aria-labelledby="processo-title">
        <Container>
          <SectionHeading
            id="processo-title"
            eyebrow="Como funciona a contratação"
            title="Da solicitação à homologação, em seis etapas"
            description="O ritmo de cada etapa depende do porte do certame e dos prazos legais do órgão; o cronograma é definido em conjunto no diagnóstico."
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-border bg-surface relative rounded-lg border p-6 pt-7"
              >
                <span
                  aria-hidden="true"
                  className="bg-action-blue absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="text-navy-primary text-lg font-bold">
                  <span className="sr-only">Etapa {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  {step.description}
                </p>
                <p className="text-text-primary mt-3 text-sm">
                  <span className="text-navy-primary font-semibold">Entregável: </span>
                  {step.deliverable}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 4. Por que o Selecon */}
      <section className="bg-navy-primary py-16 text-white" aria-labelledby="capacidades-title">
        <Container>
          <SectionHeading
            id="capacidades-title"
            eyebrow="Por que o Selecon"
            title="Capacidade operacional completa"
            tone="inverse"
          />
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {KEY_NUMBERS.map((number) => (
              <Stat
                key={number.label}
                value={number.value}
                label={number.label}
                caption={number.caption}
                tone="inverse"
              />
            ))}
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((capability) => (
              <li
                key={capability.title}
                className="rounded-lg border border-white/15 bg-white/5 p-5"
              >
                <Icon name={capability.icon} size={24} className="text-support-cyan" />
                <h3 className="mt-3 text-base font-bold">{capability.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                  {capability.description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5. Certames de referência */}
      <section className="py-14" aria-labelledby="referencia-title">
        <Container>
          <SectionHeading
            id="referencia-title"
            eyebrow="Certames de referência"
            title="Os maiores certames conduzidos pelo Instituto"
            description="Número oficial de inscritos, conforme a apresentação institucional."
          />
          <div className="border-border bg-surface mt-8 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">
                Oito certames com maior número de inscritos conduzidos pelo Instituto Selecon, com
                órgão, estado, tipo e inscritos.
              </caption>
              <thead className="bg-background-light text-text-secondary text-xs font-semibold uppercase tracking-wide">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Órgão contratante
                  </th>
                  <th scope="col" className="px-4 py-3">
                    UF
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Inscritos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {reference.map((item) => (
                  <tr key={item.client}>
                    <th scope="row" className="text-navy-primary px-4 py-3 font-semibold">
                      {item.client}
                    </th>
                    <td className="text-text-primary px-4 py-3">{item.uf}</td>
                    <td className="text-text-primary px-4 py-3">{item.kind}</td>
                    <td className="text-text-primary px-4 py-3 text-right tabular-nums">
                      {formatInteger(item.registered)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* 6. Solicitar proposta */}
      <section
        id="solicitar-proposta"
        className="bg-surface scroll-mt-24 py-14"
        aria-labelledby="proposta-title"
      >
        <Container>
          <SectionHeading
            id="proposta-title"
            eyebrow="Solicitar proposta"
            title="Conte-nos sobre o seu certame"
            description="Quanto mais detalhes, mais precisa será a proposta técnica. Campos marcados com * são obrigatórios."
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <Card padding="lg">
              <CommercialLeadForm />
            </Card>
            <aside className="space-y-6" aria-label="Contato direto com a área comercial">
              <Card>
                <h3 className="text-navy-primary text-lg font-bold">Contato direto</h3>
                <ul className="text-text-primary mt-4 space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Icon name="mail" size={20} className="text-action-blue mt-0.5" />
                    <a
                      href={`mailto:${INSTITUTION.emails.comercial}`}
                      className="text-action-blue font-semibold underline underline-offset-4"
                    >
                      {INSTITUTION.emails.comercial}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="phone" size={20} className="text-action-blue mt-0.5" />
                    <a
                      href={INSTITUTION.phoneHref}
                      className="text-action-blue font-semibold underline underline-offset-4"
                    >
                      {INSTITUTION.phone}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="map-pin" size={20} className="text-action-blue mt-0.5" />
                    <span>{INSTITUTION.address.full}</span>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="clock" size={20} className="text-action-blue mt-0.5" />
                    <span>{INSTITUTION.businessHours}</span>
                  </li>
                </ul>
              </Card>
              <Card>
                <h3 className="text-navy-primary text-lg font-bold">Visita técnica à sede</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  Comissões de concurso podem conhecer a gráfica própria, a área de logística com
                  malotes lacrados, o call center e o auditório na sede do Instituto, no centro do
                  Rio de Janeiro. Agende pelo e-mail comercial ou pelo formulário, informando no
                  campo de descrição.
                </p>
              </Card>
              <Card className="bg-background-light">
                <h3 className="text-navy-primary text-base font-bold">
                  Documentação institucional
                </h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  {INSTITUTION.legalName}, CNPJ {INSTITUTION.cnpj}. {INSTITUTION.legalNature}.{" "}
                  Estatuto, certidões e atestados de capacidade técnica são enviados com a proposta.
                </p>
                <Link
                  href="/transparencia"
                  className="text-action-blue mt-3 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Transparência institucional
                </Link>
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
