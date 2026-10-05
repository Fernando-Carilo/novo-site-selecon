import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, Container, Icon, SectionHeading, Stat, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { getContentProvider, type NewsPost } from "@/lib/content";
import { INSTITUTION, KEY_NUMBERS } from "@/lib/content/data/institution";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Imprensa — assessoria de comunicação",
  description:
    "Sala de imprensa do Instituto Selecon: contato da assessoria de comunicação, orientações para jornalistas, releases e notícias, números-chave e logotipo oficial para download.",
  alternates: { canonical: "/imprensa" },
};

const CATEGORY_LABEL: Record<NewsPost["category"], string> = {
  CONCURSOS: "Concursos",
  INSTITUCIONAL: "Institucional",
  RESULTADOS: "Resultados",
  COMUNICADOS: "Comunicados",
};

const PRESS_MAILTO = `mailto:${INSTITUTION.emails.faleConosco}?subject=${encodeURIComponent("Imprensa")}`;

const BRAND_RULES = [
  "Não distorcer, inclinar ou alterar as proporções do logotipo.",
  "Não recolorir nem aplicar efeitos (sombra, contorno, gradiente).",
  "Aplicar sobre fundo claro, com área de respiro ao redor.",
  "Não combinar o logotipo com marcas de terceiros de forma que sugira coautoria ou endosso.",
];

export default async function PressPage() {
  const news = await getContentProvider().listNews(6);

  return (
    <>
      <PageHeader
        eyebrow="Imprensa"
        title="Sala de imprensa"
        description="Informações, contatos e materiais para jornalistas e veículos de comunicação que cobrem concursos públicos e processos seletivos conduzidos pelo Instituto."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Imprensa" }]}
        actions={
          <a href={PRESS_MAILTO} className={buttonClassNames("primary")}>
            <Icon name="mail" size={16} />
            Falar com a assessoria
          </a>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="space-y-16">
          {/* Contato */}
          <section aria-labelledby="contato-title">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <SectionHeading
                  id="contato-title"
                  eyebrow="Contato"
                  title="Assessoria de comunicação"
                />
                <p className="text-text-secondary mt-4 text-base leading-relaxed">
                  Pedidos de entrevista, dados sobre certames, esclarecimentos e confirmação de
                  informações publicadas. Para que o pedido chegue à pessoa certa, use o assunto{" "}
                  <strong>Imprensa</strong>.
                </p>
              </div>
              <Card>
                <ul className="space-y-4 text-base">
                  <li className="flex gap-3">
                    <Icon name="mail" size={22} className="text-action-blue mt-0.5 shrink-0" />
                    <div>
                      <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                        E-mail
                      </p>
                      <a
                        href={PRESS_MAILTO}
                        className="text-action-blue break-all font-medium underline underline-offset-4"
                      >
                        {INSTITUTION.emails.faleConosco}
                      </a>
                      <p className="text-text-secondary mt-0.5 text-sm">Assunto: Imprensa</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="phone" size={22} className="text-action-blue mt-0.5 shrink-0" />
                    <div>
                      <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                        Telefone
                      </p>
                      <a
                        href={INSTITUTION.phoneHref}
                        className="text-action-blue font-medium underline underline-offset-4"
                      >
                        {INSTITUTION.phone}
                      </a>
                      <p className="text-text-secondary mt-0.5 text-sm">
                        {INSTITUTION.businessHours}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="map-pin" size={22} className="text-action-blue mt-0.5 shrink-0" />
                    <div>
                      <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                        Sede
                      </p>
                      <p className="text-text-primary">{INSTITUTION.address.full}</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Orientações */}
          <section aria-labelledby="orientacoes-title">
            <SectionHeading
              id="orientacoes-title"
              eyebrow="Orientações"
              title="Para jornalistas"
              description="O que ajuda a assessoria a responder com rapidez e precisão."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-navy-primary text-base font-bold">O que informar no pedido</h3>
                <ul className="text-text-primary mt-3 space-y-2 text-sm leading-relaxed">
                  {[
                    "Veículo, nome e função de quem assina a pauta",
                    "Concurso ou processo seletivo a que se refere (órgão e número do edital)",
                    "Pergunta objetiva ou tema da entrevista",
                    "Prazo de fechamento e formato desejado (texto, áudio ou vídeo)",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Icon name="check" size={18} className="text-success-green mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-navy-primary text-base font-bold">Prazos e fontes</h3>
                <ul className="text-text-primary mt-3 space-y-2 text-sm leading-relaxed">
                  {[
                    "Pedidos são atendidos em horário comercial; informe o prazo de fechamento para priorização.",
                    "Números de inscritos, datas e resultados só são confirmados após publicação oficial na página do concurso.",
                    "Dados pessoais de candidatos não são fornecidos à imprensa.",
                    "Documentos oficiais (editais, retificações, resultados) estão nas páginas de cada concurso e podem ser citados livremente.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Icon name="info" size={18} className="text-action-blue mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* Números-chave */}
          <section aria-labelledby="numeros-title">
            <SectionHeading
              id="numeros-title"
              eyebrow="Números-chave"
              title="O Instituto em números"
              description="Números públicos, com procedência indicada. Podem ser citados com a fonte Instituto Selecon."
            />
            <div className="border-border bg-surface mt-8 grid grid-cols-2 gap-6 rounded-lg border p-6 lg:grid-cols-4">
              {KEY_NUMBERS.map((number) => (
                <Stat
                  key={number.label}
                  value={number.value}
                  label={number.label}
                  caption={number.caption}
                />
              ))}
            </div>
          </section>

          {/* Releases e notícias */}
          <section aria-labelledby="releases-title">
            <SectionHeading
              id="releases-title"
              eyebrow="Releases"
              title="Releases e notícias"
              description="Últimas publicações da Assessoria de Comunicação."
              action={
                <Link href="/noticias" className={buttonClassNames("secondary")}>
                  Todas as notícias
                  <Icon name="arrow-right" size={16} />
                </Link>
              }
            />
            <ul className="divide-border border-border bg-surface mt-6 divide-y rounded-lg border">
              {news.map((post) => (
                <li key={post.slug} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
                  <time
                    dateTime={post.publishedAt}
                    className="text-text-secondary shrink-0 text-sm font-semibold tabular-nums sm:w-24"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                  <div className="min-w-0">
                    <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                      {CATEGORY_LABEL[post.category]}
                    </p>
                    <Link
                      href={`/noticias/${post.slug}`}
                      className="text-navy-primary hover:text-action-blue mt-0.5 block text-base font-semibold underline-offset-4 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Marca */}
          <section aria-labelledby="marca-title">
            <SectionHeading
              id="marca-title"
              eyebrow="Marca"
              title="Logotipo oficial"
              description="Use apenas o arquivo oficial, sem alterações. Para outras versões ou formatos, fale com a assessoria."
            />
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
              <Card className="bg-surface flex flex-col items-center justify-center gap-5">
                <Image
                  src="/brand/selecon-logo-1280.png"
                  alt="Logotipo oficial do Instituto Selecon"
                  width={640}
                  height={320}
                  className="h-auto w-full max-w-xs"
                />
                <a
                  href="/brand/selecon-logo-1280.png"
                  download="selecon-logo-1280.png"
                  className={buttonClassNames("primary")}
                >
                  <Icon name="download" size={18} />
                  Baixar logotipo (PNG, 1280×640)
                </a>
              </Card>
              <Card>
                <h3 className="text-navy-primary text-base font-bold">Regras de uso</h3>
                <ul className="text-text-primary mt-3 space-y-2 text-sm leading-relaxed">
                  {BRAND_RULES.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <Icon
                        name="check-circle"
                        size={18}
                        className="text-success-green mt-0.5 shrink-0"
                      />
                      {rule}
                    </li>
                  ))}
                </ul>
                <p className="text-text-secondary mt-4 text-sm">
                  Nome por extenso: {INSTITUTION.legalName}. Forma curta: {INSTITUTION.name}.
                </p>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
