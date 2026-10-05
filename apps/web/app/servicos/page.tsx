import Link from "next/link";
import type { Metadata } from "next";
import { Card, Container, Icon, SectionHeading, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { INSTITUTION, MISSION } from "@/lib/content/data/institution";
import { SERVICES } from "@/lib/content/data/services";

export const metadata: Metadata = {
  title: "Serviços — concursos, processos seletivos, seleções escolares e capacitação",
  description:
    "Linhas de serviço do Instituto Selecon para órgãos públicos e instituições: concursos públicos, processos seletivos, seleções escolares e vestibulares, capacitação, pesquisas e tecnologia e segurança do certame.",
  alternates: { canonical: "/servicos" },
};

const HIRING_STEPS = [
  {
    title: "Contato",
    description:
      "O órgão envia a demanda pelo formulário comercial ou pelo e-mail da área comercial.",
  },
  {
    title: "Diagnóstico",
    description:
      "Levantamos cargos, vagas, etapas, prazos, público estimado e exigências legais do certame.",
  },
  {
    title: "Proposta técnica e de preço",
    description:
      "Apresentamos metodologia, equipe, cronograma, estrutura e custos dimensionados para o projeto.",
  },
  {
    title: "Contrato",
    description:
      "Formalização por dispensa de licitação, com objeto, obrigações e cronograma definidos.",
  },
  {
    title: "Execução",
    description:
      "Edital, inscrições, provas, recursos e resultados, com governança própria e documentação de cada etapa.",
  },
  {
    title: "Homologação",
    description:
      "Entrega do resultado final e do relatório do certame para homologação pelo órgão contratante.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Serviços"
        title="Soluções para órgãos públicos e instituições"
        description="Seis linhas de serviço cobrem do concurso público de grande porte ao curso de formação, sempre com a mesma estrutura de governança, segurança e atendimento ao candidato."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Serviços" }]}
        actions={
          <Link href="/comercial" className={buttonClassNames("primary")}>
            Solicitar proposta
            <Icon name="arrow-right" size={16} />
          </Link>
        }
      />

      <section className="py-12 sm:py-14" aria-labelledby="linhas-title">
        <Container>
          <SectionHeading
            id="linhas-title"
            eyebrow="Linhas de serviço"
            title="O que o Instituto realiza"
            description="Abra cada linha para ver o que entregamos e os certames de referência."
          />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Card interactive className="relative flex h-full flex-col">
                  <span className="bg-wash-blue text-action-blue flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon name={service.icon} size={24} />
                  </span>
                  <h3 className="text-navy-primary mt-4 text-lg font-bold leading-snug">
                    <Link
                      href={`/servicos/${service.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-text-secondary mt-2 flex-1 text-sm leading-relaxed">
                    {service.summary}
                  </p>
                  <span className="text-action-blue mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Ver detalhes
                    <Icon name="arrow-right" size={16} />
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface py-12 sm:py-14" aria-labelledby="contratar-title">
        <Container>
          <SectionHeading
            id="contratar-title"
            eyebrow="Como contratar"
            title="Contratação por dispensa de licitação"
            description={MISSION.legalBasis}
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HIRING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-border bg-background-light relative rounded-lg border p-5 pt-7"
              >
                <span className="bg-action-blue absolute -top-4 left-5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-navy-primary text-base font-bold">{step.title}</h3>
                <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-text-secondary mt-6 max-w-3xl text-sm leading-relaxed">
            {INSTITUTION.legalName}, {INSTITUTION.legalNature.toLowerCase()}, CNPJ{" "}
            {INSTITUTION.cnpj}. A documentação de habilitação é fornecida com a proposta.
          </p>
        </Container>
      </section>

      <section className="py-12 sm:py-14" aria-labelledby="cta-title">
        <Container>
          <Card padding="lg" className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                Área comercial
              </p>
              <h2 id="cta-title" className="text-navy-primary mt-1 text-2xl font-bold sm:text-3xl">
                Envie sua demanda e receba uma proposta
              </h2>
              <p className="text-text-secondary mt-2 text-base">
                Informe o órgão, o tipo de seleção, os cargos previstos e o prazo desejado. A
                solicitação entra em uma fila própria da área comercial, separada do atendimento ao
                candidato.
              </p>
              <p className="text-text-secondary mt-3 text-sm">
                Também é possível escrever para{" "}
                <a
                  href={`mailto:${INSTITUTION.emails.comercial}`}
                  className="text-action-blue font-medium underline underline-offset-4"
                >
                  {INSTITUTION.emails.comercial}
                </a>{" "}
                ou ligar para{" "}
                <a
                  href={INSTITUTION.phoneHref}
                  className="text-action-blue font-medium underline underline-offset-4"
                >
                  {INSTITUTION.phone}
                </a>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link href="/comercial" className={buttonClassNames("primary", "", "lg")}>
                Solicitar proposta
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/instituto" className={buttonClassNames("secondary", "", "lg")}>
                Conhecer o Instituto
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
