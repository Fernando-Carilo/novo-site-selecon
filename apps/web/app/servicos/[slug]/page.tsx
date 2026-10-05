import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, Container, Icon, SectionHeading, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { MISSION } from "@/lib/content/data/institution";
import { SERVICES } from "@/lib/content/data/services";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) return { title: "Serviço não encontrado" };
  return {
    title: `${service.title} — Serviços`,
    description: service.summary,
    alternates: { canonical: `/servicos/${service.slug}` },
    openGraph: { title: service.title, description: service.summary },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) notFound();

  const others = SERVICES.filter((item) => item.slug !== service.slug);

  return (
    <>
      <PageHeader
        eyebrow="Serviços"
        title={service.title}
        description={service.summary}
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Serviços", href: "/servicos" },
          { label: service.shortTitle },
        ]}
        actions={
          <Link href="/comercial" className={buttonClassNames("primary")}>
            Solicitar proposta
            <Icon name="arrow-right" size={16} />
          </Link>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-14">
            <section aria-labelledby="descricao-title">
              <h2 id="descricao-title" className="sr-only">
                Descrição do serviço
              </h2>
              <div className="prose-selecon text-text-primary max-w-3xl text-base">
                {service.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="entregas-title">
              <SectionHeading id="entregas-title" eyebrow="Escopo" title="O que entregamos" />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    className="border-border bg-surface text-text-primary flex gap-3 rounded-lg border p-4 text-base"
                  >
                    <Icon
                      name="check-circle"
                      size={20}
                      className="text-success-green mt-0.5 shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="cases-title">
              <SectionHeading
                id="cases-title"
                eyebrow="Experiência"
                title="Certames de referência"
                description="Exemplos de certames já conduzidos nesta linha de serviço."
              />
              <ul className="divide-border border-border bg-surface mt-6 divide-y rounded-lg border">
                {service.cases.map((item) => (
                  <li key={item} className="text-text-primary flex gap-3 px-4 py-3 text-base">
                    <Icon name="award" size={20} className="text-action-blue mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="proposta-title">
              <Card padding="lg" className="bg-wash-blue">
                <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                  Contratação
                </p>
                <h2 id="proposta-title" className="text-navy-primary mt-1 text-2xl font-bold">
                  Solicite uma proposta técnica e de preço
                </h2>
                <p className="text-text-secondary mt-2 max-w-2xl text-base">{MISSION.legalBasis}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/comercial" className={buttonClassNames("primary", "", "lg")}>
                    Solicitar proposta
                    <Icon name="arrow-right" size={18} />
                  </Link>
                  <Link
                    href="/servicos#contratar-title"
                    className={buttonClassNames("secondary", "", "lg")}
                  >
                    Como funciona a contratação
                  </Link>
                </div>
              </Card>
            </section>
          </div>

          <aside aria-labelledby="outros-title" className="lg:sticky lg:top-24 lg:self-start">
            <h2
              id="outros-title"
              className="text-action-blue text-sm font-semibold uppercase tracking-wide"
            >
              Outros serviços
            </h2>
            <ul className="divide-border border-border bg-surface mt-3 divide-y rounded-lg border">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/servicos/${item.slug}`}
                    className="text-navy-primary hover:bg-background-light hover:text-action-blue flex min-h-12 items-center gap-3 px-4 py-3 text-base font-medium"
                  >
                    <Icon name={item.icon} size={20} className="text-action-blue shrink-0" />
                    <span className="flex-1">{item.shortTitle}</span>
                    <Icon name="chevron-right" size={16} className="text-text-secondary shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </>
  );
}
