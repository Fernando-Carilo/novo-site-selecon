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
import { ContestCard } from "@/components/contests/ContestCard";
import { AlertsForm } from "@/components/home/AlertsForm";
import { ContestSearchForm } from "@/components/home/ContestSearchForm";
import { FeaturedHero } from "@/components/home/FeaturedHero";
import { getContentProvider } from "@/lib/content";
import { CAPABILITIES, CLIENTS, KEY_NUMBERS, RECOGNITIONS } from "@/lib/content/data/institution";
import { PUBLICATION_KIND_LABEL } from "@/lib/content/labels";
import { formatDate } from "@/lib/format";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Instituto Selecon — Concursos públicos e processos seletivos",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const SHORTCUTS: {
  href: string;
  label: string;
  description: string;
  icon: IconName;
  tone: "blue" | "cyan" | "red" | "navy";
}[] = [
  {
    href: "/concursos",
    label: "Encontrar concurso",
    description: "Catálogo completo com filtros por situação, estado, área e escolaridade.",
    icon: "search",
    tone: "blue",
  },
  {
    href: "/candidato",
    label: "Área do candidato",
    description: "Inscrição, boleto, cartão de confirmação, recursos e resultados.",
    icon: "user",
    tone: "navy",
  },
  {
    href: "/atendimento",
    label: "Atendimento",
    description: "Perguntas frequentes, Fale Conosco com protocolo e consulta de andamento.",
    icon: "headset",
    tone: "cyan",
  },
  {
    href: "/integridade",
    label: "Canal de denúncias",
    description: "Relato sigiloso, anônimo ou identificado, com protocolo e código de acesso.",
    icon: "shield",
    tone: "red",
  },
];

const SHORTCUT_TONE = {
  blue: "bg-wash-blue text-action-blue",
  cyan: "bg-wash-cyan text-navy-secondary",
  red: "bg-wash-red text-institutional-red",
  navy: "bg-navy-primary text-white",
} as const;

const JOURNEY: { step: string; title: string; description: string; icon: IconName }[] = [
  {
    step: "1",
    title: "Encontre o edital",
    description:
      "Pesquise por órgão, cargo ou cidade e leia a página do edital, com cronograma, cargos e documentos vigentes.",
    icon: "search",
  },
  {
    step: "2",
    title: "Inscreva-se",
    description:
      "Faça a inscrição on-line, pague a taxa ou solicite isenção dentro do prazo e guarde o comprovante.",
    icon: "list-checks",
  },
  {
    step: "3",
    title: "Acompanhe cada fase",
    description:
      "Cartão de confirmação, local de prova, gabaritos, recursos e resultados ficam na Área do Candidato.",
    icon: "bell",
  },
  {
    step: "4",
    title: "Conte com o atendimento",
    description:
      "Dúvidas são respondidas com protocolo pelo Fale Conosco; irregularidades vão ao canal de denúncias.",
    icon: "headset",
  },
];

export default async function HomePage() {
  const content = getContentProvider();
  const [featured, open, catalog, publications, news] = await Promise.all([
    content.getFeaturedContests(5),
    content.getOpenContests(3),
    content.listContests({ status: "TODOS" }),
    content.getRecentPublications(6),
    content.listNews(3),
  ]);

  const suggestions = Array.from(
    new Set(
      catalog.items
        .concat(featured)
        .flatMap((c) => [c.organization.shortName, c.organization.city, c.editalNumber])
        .filter(Boolean),
    ),
  ).slice(0, 40);

  const openContests = open.length > 0 ? open : featured.slice(0, 3);

  return (
    <>
      {/* 1. Hero institucional com concursos em destaque e busca */}
      <section
        className="bg-navy-primary pb-10 pt-8 text-white sm:pt-12"
        aria-labelledby="hero-title"
      >
        <Container>
          <div className="mb-8 max-w-3xl">
            <p className="text-support-cyan text-sm font-semibold uppercase tracking-wide">
              Instituto Nacional de Seleções e Concursos
            </p>
            <h1
              id="hero-title"
              className="mt-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
            >
              Concursos públicos com segurança, transparência e isonomia
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
              Mais de 1,8 milhão de candidatos já se inscreveram em certames conduzidos pelo
              Instituto. Encontre seu edital, inscreva-se e acompanhe cada etapa em um único lugar.
            </p>
          </div>
          <FeaturedHero contests={featured} />
          <div className="mt-8">
            <ContestSearchForm suggestions={suggestions} />
            <p className="mt-2 text-sm text-white/70">
              Pesquise por órgão, cargo, cidade, estado, número do edital ou palavra-chave.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Atalhos principais */}
      <section className="-mt-6 pb-4" aria-label="Atalhos principais">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHORTCUTS.map((shortcut) => (
              <li key={shortcut.href}>
                <Link
                  href={shortcut.href}
                  className="border-border bg-surface shadow-medium hover:shadow-high focus-visible:ring-action-blue group flex h-full gap-4 rounded-lg border p-5 transition-shadow focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${SHORTCUT_TONE[shortcut.tone]}`}
                  >
                    <Icon name={shortcut.icon} size={24} />
                  </span>
                  <span>
                    <span className="text-navy-primary group-hover:text-action-blue block text-base font-bold">
                      {shortcut.label}
                    </span>
                    <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                      {shortcut.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Concursos com inscrições abertas */}
      <section className="py-14" aria-labelledby="abertos-title">
        <Container>
          <SectionHeading
            id="abertos-title"
            eyebrow="Inscrições"
            title={
              open.length > 0 ? "Inscrições abertas e editais previstos" : "Concursos em destaque"
            }
            description="Prazos, vagas, escolaridade e salário em cada card. Abra a página do edital para o cronograma completo e os documentos vigentes."
            action={
              <Link href="/concursos?status=ABERTOS" className={buttonClassNames("secondary")}>
                Ver inscrições abertas
                <Icon name="arrow-right" size={16} />
              </Link>
            }
          />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {openContests.map((contest) => (
              <li key={contest.slug}>
                <ContestCard contest={contest} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 4. Publicações recentes */}
      <section className="bg-surface py-14" aria-labelledby="publicacoes-title">
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading
              id="publicacoes-title"
              eyebrow="Publicações oficiais"
              title="Últimas publicações"
              description="Editais, retificações, gabaritos, convocações e resultados, em ordem de publicação."
            />
            <ol className="divide-border border-border mt-6 divide-y rounded-lg border">
              {publications.map((publication) => (
                <li
                  key={`${publication.contestSlug}-${publication.title}`}
                  className="flex gap-4 p-4"
                >
                  <time
                    dateTime={publication.publishedAt}
                    className="text-text-secondary w-24 shrink-0 text-sm font-semibold tabular-nums"
                  >
                    {formatDate(publication.publishedAt)}
                  </time>
                  <div className="min-w-0">
                    <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                      {PUBLICATION_KIND_LABEL[publication.kind]} · {publication.organization}
                    </p>
                    <Link
                      href={`/concursos/${publication.contestSlug}#publicacoes`}
                      className="text-navy-primary hover:text-action-blue mt-0.5 block text-base font-semibold underline-offset-4 hover:underline"
                    >
                      {publication.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div id="alertas" className="border-border bg-background-light rounded-lg border p-6">
            <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
              Alertas de editais
            </p>
            <h3 className="text-navy-primary mt-1 text-xl font-bold">
              Receba novos editais por e-mail
            </h3>
            <p className="text-text-secondary mt-2 text-sm">
              Avisamos quando um edital é publicado ou retificado. Sem spam: apenas publicações
              oficiais.
            </p>
            <div className="mt-5">
              <AlertsForm />
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Jornada do candidato */}
      <section className="py-14" aria-labelledby="jornada-title">
        <Container>
          <SectionHeading
            id="jornada-title"
            eyebrow="Como funciona"
            title="A jornada do candidato, passo a passo"
            description="Do edital ao resultado, cada etapa tem um lugar certo no portal."
            align="center"
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((item) => (
              <li
                key={item.step}
                className="border-border bg-surface relative rounded-lg border p-6"
              >
                <span className="bg-action-blue absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                  {item.step}
                </span>
                <Icon name={item.icon} size={28} className="text-action-blue mt-2" />
                <h3 className="text-navy-primary mt-4 text-lg font-bold">{item.title}</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6. Bloco institucional e capacidade operacional */}
      <section className="bg-navy-primary py-16 text-white" aria-labelledby="instituto-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <SectionHeading
                id="instituto-title"
                eyebrow="O Instituto"
                title="Estrutura própria para certames de qualquer porte"
                description="Coordenação pedagógica, assessoria jurídica, gráfica monitorada, logística de malotes lacrados, tecnologia e call center — tudo sob o mesmo teto, no centro do Rio de Janeiro."
                tone="inverse"
              />
              <div className="mt-8 grid grid-cols-2 gap-6">
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
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/instituto" className={buttonClassNames("inverse")}>
                  Conheça o Instituto
                </Link>
                <Link href="/servicos" className={buttonClassNames("cyan")}>
                  Nossos serviços
                </Link>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.slice(0, 6).map((capability) => (
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
          </div>
        </Container>
      </section>

      {/* 7. Para órgãos públicos (comercial) */}
      <section className="py-14" aria-labelledby="comercial-title">
        <Container>
          <Card padding="lg" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                Para órgãos públicos e instituições
              </p>
              <h2
                id="comercial-title"
                className="text-navy-primary mt-1 text-2xl font-bold sm:text-3xl"
              >
                Precisa realizar um concurso ou processo seletivo?
              </h2>
              <p className="text-text-secondary mt-3 text-base">
                Entidade sem fins lucrativos, contratável por dispensa de licitação (Lei nº
                14.133/2021). Envie sua demanda e receba uma proposta técnica dimensionada para o
                seu certame.
              </p>
              <ul className="text-text-primary mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  "Concursos públicos",
                  "Processos seletivos simplificados",
                  "Seleções escolares e vestibulares",
                  "Cursos de formação e capacitação",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Icon name="check-circle" size={18} className="text-success-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link href="/comercial" className={buttonClassNames("primary", "", "lg")}>
                Solicitar proposta
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/servicos" className={buttonClassNames("secondary", "", "lg")}>
                Conhecer os serviços
              </Link>
            </div>
          </Card>
        </Container>
      </section>

      {/* 8. Notícias e comunicados */}
      <section className="bg-surface py-14" aria-labelledby="noticias-title">
        <Container>
          <SectionHeading
            id="noticias-title"
            eyebrow="Notícias"
            title="Notícias e comunicados"
            action={
              <Link href="/noticias" className={buttonClassNames("secondary")}>
                Todas as notícias
                <Icon name="arrow-right" size={16} />
              </Link>
            }
          />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {news.map((post) => (
              <li key={post.slug}>
                <Card as="article" interactive className="relative flex h-full flex-col">
                  <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                    {post.category === "CONCURSOS"
                      ? "Concursos"
                      : post.category === "RESULTADOS"
                        ? "Resultados"
                        : post.category === "INSTITUCIONAL"
                          ? "Institucional"
                          : "Comunicados"}
                    {" · "}
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </p>
                  <h3 className="text-navy-primary mt-2 text-lg font-bold leading-snug">
                    <Link
                      href={`/noticias/${post.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-text-secondary mt-2 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 9. Clientes e reconhecimentos */}
      <section className="py-14" aria-labelledby="clientes-title">
        <Container>
          <SectionHeading
            id="clientes-title"
            eyebrow="Confiança"
            title="Órgãos e instituições que já realizaram certames com o Instituto"
            description="Clientes em dez estados, de prefeituras a secretarias estaduais, empresas públicas e instituições federais de ensino."
          />
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Clientes e parceiros">
            {CLIENTS.map((client) => (
              <li
                key={client}
                className="border-border bg-surface text-navy-primary rounded-full border px-3.5 py-1.5 text-sm font-medium"
              >
                {client}
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
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
        </Container>
      </section>
    </>
  );
}
