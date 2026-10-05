import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { DEFAULT_PAGE_SECTIONS, type PageSectionKey } from "@/lib/content";
import {
  Accordion,
  Alert,
  Breadcrumbs,
  Card,
  Container,
  Icon,
  buttonClassNames,
  type AccordionItem,
} from "@selecon/ui";
import { ContestCard, registrationDeadlineLabel } from "@/components/contests/ContestCard";
import { ContestCover } from "@/components/contests/ContestCover";
import { ContestJsonLd } from "@/components/contests/ContestJsonLd";
import { ContestPositions } from "@/components/contests/ContestPositions";
import { ContestPublications } from "@/components/contests/ContestPublications";
import { ContestServiceLinks } from "@/components/contests/ContestServiceLinks";
import { ContestTimeline } from "@/components/contests/ContestTimeline";
import { StatusBadge } from "@/components/contests/StatusBadge";
import { AlertsForm } from "@/components/home/AlertsForm";
import { getContentProvider } from "@/lib/content";
import { INSTITUTION } from "@/lib/content/data/institution";
import { CONTEST_KIND_LABEL, EDUCATION_LEVEL_LABEL, UF_LABEL } from "@/lib/content/labels";
import type { Contest } from "@/lib/content/types";
import { catalogHref } from "@/lib/contests/search-params";
import { formatCurrency, formatDate, formatDateRange, formatInteger } from "@/lib/format";

interface ContestPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { contests } = await getContentProvider().listAllSlugs();
  return contests.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const contest = await getContentProvider().getContest(slug);
  if (!contest) {
    return { title: "Concurso não encontrado", robots: { index: false, follow: true } };
  }
  const path = `/concursos/${contest.slug}`;
  return {
    title: contest.seo?.title ?? contest.title,
    description: contest.seo?.description ?? contest.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      siteName: "Instituto Selecon",
      title: contest.seo?.title ?? contest.title,
      description: contest.seo?.description ?? contest.summary,
      url: path,
      modifiedTime: contest.updatedAt,
      images: contest.cover.imageUrl
        ? [{ url: contest.cover.imageUrl, alt: contest.cover.imageAlt ?? contest.title }]
        : [
            {
              url: "/brand/selecon-logo-1280.png",
              width: 1280,
              height: 640,
              alt: "Instituto Selecon",
            },
          ],
    },
  };
}

function BreadcrumbLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const NAVY_OUTLINE_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-base hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-support-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-primary";

/** Rótulos da navegação "Nesta página" (só seções da coluna principal). */
const NAV_LABELS = {
  resumo: "Resumo",
  video: "Vídeo",
  cronograma: "Cronograma",
  cargos: "Cargos e requisitos",
  publicacoes: "Publicações",
  perguntas: "Perguntas frequentes",
  contato: "Atendimento",
} as const;

/** URL de incorporação de vídeo (YouTube/Vimeo); outras origens voltam como link. */
function videoEmbedUrl(url: string): string | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(
    url,
  );
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

/** Perguntas gerais do candidato, usadas quando o certame ainda não tem FAQ própria. */
const DEFAULT_FAQS = [
  {
    question: "Como faço a inscrição e pago a taxa?",
    answer:
      "A inscrição é feita exclusivamente pela internet, na Área do Candidato, dentro do período previsto no edital. Após preencher o formulário, gere o boleto e pague até a data de vencimento: a inscrição só é confirmada após a compensação bancária. Pedidos de isenção da taxa têm prazo e documentação próprios, descritos no edital de abertura.",
  },
  {
    question: "Onde consulto o cartão de confirmação e o local de prova?",
    answer:
      "O cartão de confirmação de inscrição, com local, sala e horário da prova, é disponibilizado na Área do Candidato na data prevista no cronograma. Confira seus dados com antecedência; em caso de divergência, abra uma solicitação pelo Fale Conosco dentro do prazo estabelecido no edital.",
  },
  {
    question: "Como apresento um recurso?",
    answer:
      "Recursos contra o gabarito preliminar, o resultado de uma etapa ou o indeferimento da inscrição são enviados pela Área do Candidato, no prazo fixado no cronograma do edital. Cada recurso deve ser fundamentado e indicar a questão ou etapa contestada. O resultado dos recursos é publicado na seção de publicações deste concurso.",
  },
];

interface KeyFact {
  label: string;
  value: string;
  caption?: string;
}

function buildKeyFacts(contest: Contest): KeyFact[] {
  const facts: KeyFact[] = [];
  const { opensAt, closesAt } = contest.registration;
  if (opensAt || closesAt) {
    facts.push({ label: "Inscrições", value: formatDateRange(opensAt, closesAt) });
  }
  if (contest.vacancies !== null && contest.vacancies !== undefined) {
    facts.push({
      label: "Vagas",
      value: `${formatInteger(contest.vacancies)} ${contest.vacancies === 1 ? "vaga" : "vagas"}`,
      caption: contest.reserveVacancies
        ? `+ ${formatInteger(contest.reserveVacancies)} cadastro de reserva`
        : undefined,
    });
  } else if (contest.reserveVacancies) {
    facts.push({
      label: "Vagas",
      value: `${formatInteger(contest.reserveVacancies)} cadastro de reserva`,
    });
  } else if (contest.positions.length > 0) {
    facts.push({ label: "Vagas", value: "Cadastro de reserva" });
  }
  if (contest.educationLevels.length > 0) {
    facts.push({
      label: "Escolaridade",
      value: contest.educationLevels.map((level) => EDUCATION_LEVEL_LABEL[level]).join(", "),
    });
  }
  if (contest.salaryMaxCents) {
    facts.push({ label: "Salário até", value: formatCurrency(contest.salaryMaxCents) });
  }
  if (contest.feeCents && contest.feeCents.length > 0) {
    const fees = [...contest.feeCents].sort((a, b) => a - b).map((fee) => formatCurrency(fee));
    const lastFee = fees[fees.length - 1] ?? "";
    facts.push({
      label: fees.length === 1 ? "Taxa de inscrição" : "Taxas de inscrição",
      value: fees.length === 1 ? lastFee : `${fees.slice(0, -1).join(", ")} e ${lastFee}`,
      caption: fees.length > 1 ? "Conforme o cargo" : undefined,
    });
  }
  if (contest.examDate) {
    facts.push({ label: "Data da prova", value: formatDate(contest.examDate) });
  }
  if (contest.registeredCandidates) {
    facts.push({
      label: "Inscritos",
      value: `${formatInteger(contest.registeredCandidates)} candidatos`,
    });
  }
  return facts;
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-navy-primary text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card as="section" aria-label={title}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-navy-primary text-base font-bold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export default async function ContestPage({ params }: ContestPageProps) {
  const { slug } = await params;
  const content = getContentProvider();
  const contest = await content.getContest(slug);
  if (!contest) notFound();

  const [sameUf, sameArea] = await Promise.all([
    content.listContests({ uf: contest.organization.uf, status: "TODOS" }),
    content.listContests({ area: contest.area, status: "TODOS" }),
  ]);
  const seen = new Set<string>([contest.slug]);
  const related = [...sameUf.items, ...sameArea.items]
    .filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .slice(0, 3);

  const registrationOpen = contest.status === "INSCRICOES_ABERTAS";
  const inscricao = contest.serviceLinks.find((link) => link.key === "INSCRICAO");
  const areaDoCandidato = contest.serviceLinks.find((link) => link.key === "AREA_DO_CANDIDATO");
  const deadline = registrationDeadlineLabel(contest);
  const keyFacts = buildKeyFacts(contest);

  const sections = [...(contest.pageSections ?? DEFAULT_PAGE_SECTIONS)]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
  const on = (key: PageSectionKey) => sections.some((s) => s.key === key);
  const navItems = sections
    .filter((s) => s.key in NAV_LABELS && (s.key !== "video" || Boolean(contest.videoUrl)))
    .map((s) => ({ id: s.key, label: NAV_LABELS[s.key as keyof typeof NAV_LABELS] }));

  const faqItems: AccordionItem[] = (contest.faqs.length > 0 ? contest.faqs : DEFAULT_FAQS).map(
    (faq, index) => ({
      id: `pergunta-${index + 1}`,
      title: faq.question,
      content: <p>{faq.answer}</p>,
    }),
  );

  const sectionBlocks: Partial<Record<PageSectionKey, ReactNode>> = {
    resumo: (
      <section id="resumo" aria-labelledby="resumo-title" className="scroll-mt-24">
        <SectionTitle id="resumo-title">Resumo</SectionTitle>
        <p className="text-text-primary mt-4 text-base leading-relaxed">{contest.summary}</p>
        {contest.highlights.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Destaques do concurso">
            {contest.highlights.map((highlight) => (
              <li
                key={highlight}
                className="bg-wash-blue text-navy-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
              >
                <Icon name="check" size={14} className="text-action-blue" />
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}
        {contest.tags && contest.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
            {contest.tags.map((tag) => (
              <li
                key={tag}
                className="border-border text-text-secondary rounded-full border px-3 py-1 text-xs font-semibold"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    ),
    video: contest.videoUrl ? (
      <section id="video" aria-labelledby="video-title" className="scroll-mt-24">
        <SectionTitle id="video-title">Vídeo de apresentação</SectionTitle>
        {videoEmbedUrl(contest.videoUrl!) ? (
          <div className="border-border mt-6 aspect-video overflow-hidden rounded-lg border bg-black">
            <iframe
              src={videoEmbedUrl(contest.videoUrl!)!}
              title={`Vídeo de apresentação — ${contest.title}`}
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <a
            href={contest.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassNames("secondary", "mt-6")}
          >
            Assistir ao vídeo
            <Icon name="external-link" size={16} label="abre em nova aba" />
          </a>
        )}
      </section>
    ) : null,
    cronograma: (
      <section id="cronograma" aria-labelledby="cronograma-title" className="scroll-mt-24">
        <SectionTitle id="cronograma-title">Cronograma</SectionTitle>
        <p className="text-text-secondary mt-2 text-sm">
          Etapas conforme o edital e os comunicados publicados. Datas previstas podem ser alteradas
          por retificação — confira sempre o documento vigente.
        </p>
        <div className="mt-6">
          <ContestTimeline timeline={contest.timeline} />
        </div>
      </section>
    ),
    cargos: (
      <section id="cargos" aria-labelledby="cargos-title" className="scroll-mt-24">
        <SectionTitle id="cargos-title">Cargos e requisitos</SectionTitle>
        <p className="text-text-secondary mt-2 text-sm">
          Distribuição de vagas por cargo. Requisitos completos, atribuições e critérios de reserva
          constam no edital de abertura.
        </p>
        <div className="mt-6">
          <ContestPositions positions={contest.positions} editalNumber={contest.editalNumber} />
        </div>
      </section>
    ),
    publicacoes: (
      <section id="publicacoes" aria-labelledby="publicacoes-title" className="scroll-mt-24">
        <SectionTitle id="publicacoes-title">Publicações oficiais</SectionTitle>
        <p className="text-text-secondary mt-2 text-sm">
          Editais, retificações, comunicados, gabaritos, convocações e resultados, do mais recente
          ao mais antigo.
        </p>
        <div className="mt-6">
          <ContestPublications publications={contest.publications} />
        </div>
      </section>
    ),
    perguntas: (
      <section id="perguntas" aria-labelledby="perguntas-title" className="scroll-mt-24">
        <SectionTitle id="perguntas-title">Perguntas frequentes</SectionTitle>
        <p className="text-text-secondary mt-2 text-sm">
          {contest.faqs.length > 0
            ? "Respostas específicas deste concurso. Em caso de divergência, prevalece o edital."
            : "Este concurso ainda não tem perguntas específicas publicadas. As respostas abaixo valem para os certames do Instituto; em caso de divergência, prevalece o edital."}
        </p>
        <div className="mt-6">
          <Accordion items={faqItems} />
        </div>
        <p className="text-text-secondary mt-4 text-sm">
          Não encontrou sua dúvida?{" "}
          <Link
            href="/atendimento#perguntas-frequentes"
            className="text-action-blue font-semibold underline underline-offset-4"
          >
            Veja as perguntas frequentes gerais
          </Link>{" "}
          ou fale com a equipe na seção de atendimento abaixo.
        </p>
      </section>
    ),
    contato: (
      <section id="contato" aria-labelledby="contato-title" className="scroll-mt-24">
        <SectionTitle id="contato-title">Atendimento sobre este concurso</SectionTitle>
        <Card className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-navy-primary text-base font-bold">Fale Conosco com protocolo</h3>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              Abra uma solicitação já vinculada a este concurso. Você recebe um número de protocolo
              para acompanhar a resposta. Informe o edital:{" "}
              <span className="text-text-primary font-semibold">{contest.editalNumber}</span>.
            </p>
            <Link
              href={`/fale-conosco?concurso=${encodeURIComponent(contest.slug)}`}
              className={buttonClassNames("primary", "mt-4")}
            >
              <Icon name="message-circle" size={18} />
              Abrir solicitação
            </Link>
          </div>
          <div>
            <h3 className="text-navy-primary text-base font-bold">Telefone e horário</h3>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              <a
                href={INSTITUTION.phoneHref}
                className="text-action-blue font-semibold underline underline-offset-4"
              >
                {INSTITUTION.phone}
              </a>
              <br />
              {INSTITUTION.businessHours}
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-relaxed">
              Dúvidas comuns sobre inscrição, boleto e recursos estão nas{" "}
              <Link
                href="/atendimento#perguntas-frequentes"
                className="text-action-blue font-semibold underline underline-offset-4"
              >
                perguntas frequentes
              </Link>
              .
            </p>
          </div>
        </Card>
      </section>
    ),
  };

  return (
    <>
      <ContestJsonLd contest={contest} />

      {/* Cabeçalho do edital */}
      <section className="bg-navy-primary text-white">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Concursos", href: "/concursos" },
              { label: contest.title },
            ]}
            linkComponent={BreadcrumbLink}
            className="[&_a:hover]:text-white [&_a]:text-white/80 [&_span[aria-hidden]]:text-white/50 [&_span]:text-white"
          />
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={contest.status} />
                <span className="text-support-cyan text-xs font-semibold uppercase tracking-wide">
                  {CONTEST_KIND_LABEL[contest.kind]}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-white/85">
                {contest.organization.name}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {contest.title}
              </h1>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                <div className="flex items-center gap-2">
                  <Icon name="file-text" size={16} className="text-support-cyan" />
                  <dt className="sr-only">Edital</dt>
                  <dd>{contest.editalNumber}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="map-pin" size={16} className="text-support-cyan" />
                  <dt className="sr-only">Local</dt>
                  <dd>
                    {contest.organization.city}/{contest.organization.uf} —{" "}
                    {UF_LABEL[contest.organization.uf]}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="clock" size={16} className="text-support-cyan" />
                  <dt className="sr-only">Última atualização</dt>
                  <dd>
                    Atualizado em{" "}
                    <time dateTime={contest.updatedAt} className="tabular-nums">
                      {formatDate(contest.updatedAt)}
                    </time>
                  </dd>
                </div>
              </dl>
              {deadline ? (
                <p className="mt-4 flex items-center gap-2 text-base font-semibold text-white">
                  <Icon name="calendar" size={18} className="text-support-cyan" />
                  {deadline}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {registrationOpen && inscricao ? (
                  <a
                    href={inscricao.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClassNames("cyan", "", "lg")}
                  >
                    Inscreva-se
                    <Icon name="external-link" size={14} label="abre em nova aba" />
                  </a>
                ) : null}
                {areaDoCandidato ? (
                  <a
                    href={areaDoCandidato.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClassNames("inverse", "", "lg")}
                  >
                    <Icon name="user" size={18} />
                    Área do candidato
                    <Icon name="external-link" size={14} label="abre em nova aba" />
                  </a>
                ) : (
                  <Link href="/candidato" className={buttonClassNames("inverse", "", "lg")}>
                    <Icon name="user" size={18} />
                    Área do candidato
                  </Link>
                )}
                <a href="#publicacoes" className={NAVY_OUTLINE_BUTTON}>
                  <Icon name="file-text" size={18} />
                  Ver publicações
                </a>
                <a href="#alertas" className={NAVY_OUTLINE_BUTTON}>
                  <Icon name="bell" size={18} />
                  Receber alertas
                </a>
              </div>
            </div>
            <ContestCover
              cover={contest.cover}
              label={contest.organization.shortName}
              uf={contest.organization.uf}
              size="hero"
              priority
              className="shadow-high aspect-[21/9] rounded-lg lg:aspect-[16/10]"
            />
          </div>
        </Container>
      </section>

      {/* Dados-chave */}
      {on("numeros") && keyFacts.length > 0 ? (
        <section aria-label="Dados-chave do concurso" className="border-border bg-surface border-b">
          <Container className="py-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                    {fact.label}
                  </dt>
                  <dd className="text-navy-primary mt-1 text-base font-bold tabular-nums sm:text-lg">
                    {fact.value}
                  </dd>
                  {fact.caption ? (
                    <dd className="text-text-secondary mt-0.5 text-sm">{fact.caption}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </Container>
        </section>
      ) : null}

      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Conteúdo principal */}
          <div className="min-w-0 space-y-12">
            {contest.legacyUrl ? (
              <Alert tone="info" title="Origem dos documentos">
                Os documentos oficiais deste concurso ainda são servidos pelo site atual; a migração
                para este portal preserva todas as versões.{" "}
                <a
                  href={contest.legacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action-blue inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                >
                  Abrir a página no site atual
                  <Icon name="external-link" size={14} label="abre em nova aba" />
                </a>
              </Alert>
            ) : null}

            <nav
              aria-label="Nesta página"
              className="border-border bg-surface rounded-lg border px-5 py-4"
            >
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                Nesta página
              </p>
              <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                {navItems.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-action-blue inline-flex min-h-10 items-center text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {sections.map((section) => (
              <Fragment key={section.key}>{sectionBlocks[section.key] ?? null}</Fragment>
            ))}
          </div>

          {/* Sidebar */}
          <aside
            aria-label="Serviços, alertas e contato"
            className="space-y-6 lg:sticky lg:top-24 lg:-m-1 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:p-1"
          >
            <SidebarCard
              title="Serviços do candidato"
              icon={<Icon name="list-checks" size={20} className="text-action-blue" />}
            >
              <ContestServiceLinks
                serviceLinks={contest.serviceLinks}
                registrationOpen={registrationOpen}
              />
            </SidebarCard>

            <div id="alertas" className="scroll-mt-24">
              <SidebarCard
                title="Alertas deste concurso"
                icon={<Icon name="bell" size={20} className="text-action-blue" />}
              >
                <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                  Receba por e-mail cada publicação oficial deste certame: retificações,
                  convocações, gabaritos e resultados.
                </p>
                <AlertsForm contestSlug={contest.slug} compact />
              </SidebarCard>
            </div>

            <SidebarCard
              title="Dúvidas sobre este concurso"
              icon={<Icon name="headset" size={20} className="text-action-blue" />}
            >
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/fale-conosco?concurso=${encodeURIComponent(contest.slug)}`}
                    className="border-border text-navy-primary hover:border-action-blue hover:bg-background-light hover:text-action-blue flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <Icon name="message-circle" size={18} className="text-action-blue" />
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link
                    href="/atendimento#perguntas-frequentes"
                    className="border-border text-navy-primary hover:border-action-blue hover:bg-background-light hover:text-action-blue flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <Icon name="info" size={18} className="text-action-blue" />
                    Perguntas frequentes
                  </Link>
                </li>
              </ul>
            </SidebarCard>

            <section
              aria-label="Canal de denúncias"
              className="border-border bg-background-light rounded-lg border p-4"
            >
              <p className="text-text-secondary text-sm leading-relaxed">
                <Icon
                  name="shield"
                  size={16}
                  className="text-text-secondary mr-1.5 inline-block align-text-bottom"
                />
                Viu alguma irregularidade neste certame? Relate de forma sigilosa pelo{" "}
                <Link
                  href="/integridade"
                  className="text-navy-primary font-semibold underline underline-offset-4"
                >
                  canal de denúncias
                </Link>
                .
              </p>
            </section>
          </aside>
        </div>
      </Container>

      {/* Concursos relacionados */}
      {on("relacionados") && related.length > 0 ? (
        <section className="bg-surface py-14" aria-labelledby="relacionados-title">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                  Veja também
                </p>
                <h2
                  id="relacionados-title"
                  className="text-navy-primary mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  Concursos relacionados
                </h2>
                <p className="text-text-secondary mt-2 text-sm">
                  Outros certames em {UF_LABEL[contest.organization.uf]} ou na mesma área de
                  atuação.
                </p>
              </div>
              <Link
                href={catalogHref({}, { uf: contest.organization.uf })}
                className={buttonClassNames("secondary")}
              >
                Todos em {contest.organization.uf}
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <ContestCard contest={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
