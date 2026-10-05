import Link from "next/link";
import type { Metadata } from "next";
import { Card, Container, Icon } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm, type ContactFormContestOption } from "@/components/service/ContactForm";
import { getContentProvider } from "@/lib/content";
import { INSTITUTION } from "@/lib/content/data/institution";
import { findContactSubject } from "@/lib/service/faq";

export const metadata: Metadata = {
  title: "Fale Conosco",
  description:
    "Abra um chamado com protocolo para dúvidas sobre inscrição, isenção, pagamento, cartão de confirmação, recursos, resultados, dados cadastrais, imprensa, privacidade e acessibilidade.",
  alternates: { canonical: "/fale-conosco" },
};

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const catalog = await getContentProvider().listContests({ status: "TODOS", sort: "atualizacao" });

  const contests: ContactFormContestOption[] = catalog.items.map((contest) => ({
    value: contest.slug,
    label: `${contest.organization.shortName} — ${contest.title}`,
  }));

  const requestedContest = first(params.concurso);
  const initialContestSlug = contests.some((c) => c.value === requestedContest)
    ? requestedContest
    : undefined;
  const initialSubject = findContactSubject(first(params.assunto))?.id;

  return (
    <>
      <PageHeader
        eyebrow="Atendimento"
        title="Fale Conosco"
        description="Abra um chamado e receba um protocolo. A resposta é enviada ao e-mail informado, em dias úteis, com base no edital vigente do seu concurso."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Atendimento", href: "/atendimento" },
          { label: "Fale Conosco" },
        ]}
      />

      <section className="py-14" aria-labelledby="formulario-title">
        <Container>
          <h2 id="formulario-title" className="sr-only">
            Formulário de atendimento
          </h2>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <Card padding="lg">
              <ContactForm
                contests={contests}
                initialContestSlug={initialContestSlug}
                initialSubject={initialSubject}
              />
            </Card>
            <aside className="space-y-6" aria-label="Outros canais e orientações">
              <Card>
                <h3 className="text-navy-primary text-lg font-bold">Outros canais</h3>
                <ul className="text-text-primary mt-4 space-y-3 text-sm">
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
                    <Icon name="mail" size={20} className="text-action-blue mt-0.5" />
                    <a
                      href={`mailto:${INSTITUTION.emails.faleConosco}`}
                      className="text-action-blue break-all font-semibold underline underline-offset-4"
                    >
                      {INSTITUTION.emails.faleConosco}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="clock" size={20} className="text-action-blue mt-0.5" />
                    <span>{INSTITUTION.businessHours}</span>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="map-pin" size={20} className="text-action-blue mt-0.5" />
                    <span>{INSTITUTION.address.full}</span>
                  </li>
                </ul>
              </Card>
              <Card>
                <h3 className="text-navy-primary text-lg font-bold">Para agilizar a resposta</h3>
                <ul className="text-text-secondary mt-3 space-y-2 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <Icon
                      name="check-circle"
                      size={18}
                      className="text-success-green mt-0.5 shrink-0"
                    />
                    Informe o concurso, o cargo e o número da inscrição.
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check-circle"
                      size={18}
                      className="text-success-green mt-0.5 shrink-0"
                    />
                    Descreva o que já verificou na Área do Candidato e na página do edital.
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check-circle"
                      size={18}
                      className="text-success-green mt-0.5 shrink-0"
                    />
                    Use o mesmo e-mail cadastrado na inscrição, quando houver.
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="alert-triangle"
                      size={18}
                      className="text-warning-amber mt-0.5 shrink-0"
                    />
                    Recursos contra gabarito ou resultado não são aceitos por este canal: use a Área
                    do Candidato no prazo do edital.
                  </li>
                </ul>
              </Card>
              <Card className="bg-background-light">
                <h3 className="text-navy-primary text-base font-bold">Já tem um protocolo?</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  Acompanhe o status e as mensagens do seu chamado na Central de atendimento.
                </p>
                <Link
                  href="/atendimento#protocolo"
                  className="text-action-blue mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4"
                >
                  Consultar protocolo
                  <Icon name="arrow-right" size={16} />
                </Link>
              </Card>
              <Card className="bg-background-light">
                <h3 className="text-navy-primary text-base font-bold">
                  Irregularidades e denúncias
                </h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  Relatos sobre fraude, vazamento ou conduta indevida têm canal próprio, sigiloso e
                  independente do atendimento.
                </p>
                <Link
                  href="/integridade"
                  className="text-action-blue mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4"
                >
                  Canal de integridade
                  <Icon name="arrow-right" size={16} />
                </Link>
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
