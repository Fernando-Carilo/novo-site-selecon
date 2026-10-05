import Link from "next/link";
import type { Metadata } from "next";
import { Accordion, Card, Container, Icon, SectionHeading, buttonClassNames } from "@selecon/ui";
import { ContestCard } from "@/components/contests/ContestCard";
import { PageHeader } from "@/components/PageHeader";
import {
  CANDIDATE_SERVICES,
  CANDIDATE_SYSTEMS,
  serviceUrl,
  type CandidateSystem,
} from "@/lib/candidate/services";
import { getContentProvider } from "@/lib/content";
import { listPopularFaq } from "@/lib/service/faq";

export const metadata: Metadata = {
  title: "Área do candidato — Serviços do candidato",
  description:
    "Login, inscrições, situação do pagamento, 2ª via de boleto, comprovante, cartão de confirmação, recursos, resultados e documentos — acessos aos sistemas de inscrição do Instituto Selecon em um só lugar.",
  alternates: { canonical: "/candidato" },
};

function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <Icon name="external-link" size={16} label="abre em nova aba" className="ml-1 inline" />
    </a>
  );
}

function SystemServices({ system }: { system: CandidateSystem }) {
  return (
    <section id={system.anchor} className="scroll-mt-24" aria-labelledby={`${system.anchor}-title`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id={`${system.anchor}-title`} className="text-navy-primary text-xl font-bold">
            {system.title}
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            Sistema de inscrição em <span className="font-semibold">{system.hostLabel}</span>. Os
            links abrem em nova aba.
          </p>
        </div>
        <ExternalLink href={system.panelUrl} className={buttonClassNames("primary")}>
          Entrar no painel do candidato
        </ExternalLink>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CANDIDATE_SERVICES.map((service) => (
          <li key={service.key}>
            <a
              href={serviceUrl(service, system)}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-surface hover:shadow-medium focus-visible:ring-action-blue group flex h-full gap-4 rounded-lg border p-5 transition-shadow focus-visible:outline-none focus-visible:ring-[3px]"
            >
              <span className="bg-wash-blue text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                <Icon name={service.icon} size={22} />
              </span>
              <span className="min-w-0">
                <span className="text-navy-primary group-hover:text-action-blue flex items-center gap-1 text-base font-bold">
                  {service.title}
                  <Icon name="external-link" size={14} label="abre em nova aba" />
                </span>
                <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                  {service.description}
                </span>
                <span className="text-text-secondary mt-2 block text-xs font-semibold uppercase tracking-wide">
                  {service.target === "panel" ? "Exige login" : "Acesso livre"}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function CandidatePage() {
  const content = getContentProvider();
  const [open, featured] = await Promise.all([
    content.listContests({ status: "ABERTOS" }),
    content.getFeaturedContests(3),
  ]);
  const hasOpen = open.items.length > 0;
  const contests = hasOpen ? open.items.slice(0, 3) : featured;
  const faq = listPopularFaq(5);

  return (
    <>
      <PageHeader
        eyebrow="Área do candidato"
        title="Serviços do candidato"
        description="Os serviços de inscrição e acompanhamento são prestados pelos sistemas de inscrição do Instituto. Este portal reúne os acessos em um só lugar."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Área do candidato" }]}
      />

      {/* Seletor de sistema */}
      <section className="py-14" aria-labelledby="sistemas-title">
        <Container>
          <SectionHeading
            id="sistemas-title"
            eyebrow="Primeiro passo"
            title="Escolha o sistema do seu concurso"
            description="Os concursos de Mato Grosso usam um sistema de inscrição próprio; os demais estados usam o sistema geral. Em dúvida, confira o link de inscrição na página do edital."
          />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {CANDIDATE_SYSTEMS.map((system) => (
              <li key={system.id}>
                <a
                  href={`#${system.anchor}`}
                  className="border-border bg-surface hover:border-action-blue focus-visible:ring-action-blue flex h-full gap-4 rounded-lg border-2 p-6 transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  <span className="bg-navy-primary text-support-cyan flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon name={system.id === "MT" ? "map-pin" : "globe"} size={24} />
                  </span>
                  <span>
                    <span className="text-navy-primary block text-lg font-bold">
                      {system.title}
                    </span>
                    <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                      {system.description}
                    </span>
                    <span className="text-action-blue mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                      Ver serviços deste sistema
                      <Icon name="chevron-down" size={16} />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Serviços por sistema */}
      <section className="bg-surface py-14" aria-labelledby="servicos-title">
        <Container className="space-y-14">
          <SectionHeading
            id="servicos-title"
            eyebrow="Serviços"
            title="O que você pode fazer em cada sistema"
            description="Login e inscrição são de acesso livre; os demais serviços exigem entrar no painel com CPF e senha."
          />
          {CANDIDATE_SYSTEMS.map((system) => (
            <SystemServices key={system.id} system={system} />
          ))}
        </Container>
      </section>

      {/* Concursos abertos */}
      <section className="py-14" aria-labelledby="abertos-title">
        <Container>
          <SectionHeading
            id="abertos-title"
            eyebrow="Concursos"
            title={hasOpen ? "Concursos com inscrições abertas" : "Concursos em destaque"}
            description={
              hasOpen
                ? "A página do edital tem o link direto de inscrição e o cronograma oficial."
                : "Não há inscrições abertas no momento. Acompanhe os certames em destaque e assine os alertas de editais."
            }
            action={
              <Link href="/concursos?status=ABERTOS" className={buttonClassNames("secondary")}>
                Ver todos os concursos
                <Icon name="arrow-right" size={16} />
              </Link>
            }
          />
          {contests.length > 0 ? (
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contests.map((contest) => (
                <li key={contest.slug}>
                  <ContestCard contest={contest} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary mt-8 text-base">
              Nenhum concurso publicado no momento.{" "}
              <Link
                href="/concursos#alertas"
                className="text-action-blue font-semibold underline underline-offset-4"
              >
                Receba alertas de novos editais
              </Link>
              .
            </p>
          )}
        </Container>
      </section>

      {/* FAQ curta + segurança */}
      <section className="bg-surface py-14" aria-labelledby="duvidas-title">
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <SectionHeading
              id="duvidas-title"
              eyebrow="Dúvidas frequentes"
              title="Perguntas mais comuns"
              action={
                <Link
                  href="/atendimento#perguntas-frequentes"
                  className={buttonClassNames("secondary")}
                >
                  Todas as perguntas
                  <Icon name="arrow-right" size={16} />
                </Link>
              }
            />
            <Accordion
              className="mt-6"
              items={faq.map((item) => ({
                id: `candidato-${item.id}`,
                title: item.question,
                content: (
                  <div className="space-y-3">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                ),
              }))}
            />
          </div>
          <div className="space-y-6">
            <Card className="border-warning-amber/40 bg-wash-amber">
              <div className="flex items-center gap-2">
                <Icon name="lock" size={22} className="text-navy-primary" />
                <h3 className="text-navy-primary text-lg font-bold">Segurança</h3>
              </div>
              <ul className="text-text-primary mt-3 space-y-2 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <Icon name="check" size={18} className="text-navy-primary mt-0.5 shrink-0" />
                  Nunca compartilhe sua senha. O Instituto não a solicita por telefone, e-mail ou
                  WhatsApp.
                </li>
                <li className="flex gap-2">
                  <Icon name="check" size={18} className="text-navy-primary mt-0.5 shrink-0" />O
                  Instituto não cobra taxas fora do boleto oficial gerado pelo sistema de inscrição.
                </li>
                <li className="flex gap-2">
                  <Icon name="check" size={18} className="text-navy-primary mt-0.5 shrink-0" />
                  Desconfie de sites, perfis e mensagens que prometem aprovação, gabarito ou vaga
                  garantida. Os endereços oficiais são os desta página.
                </li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-navy-primary text-lg font-bold">Precisa de ajuda?</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                A Central de atendimento reúne perguntas frequentes, o Fale Conosco com protocolo e
                a consulta de andamento.
              </p>
              <Link href="/atendimento" className={buttonClassNames("primary", "mt-4")}>
                Ir para o atendimento
                <Icon name="arrow-right" size={16} />
              </Link>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
