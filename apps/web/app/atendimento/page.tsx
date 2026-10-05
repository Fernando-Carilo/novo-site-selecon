import Link from "next/link";
import type { Metadata } from "next";
import {
  Accordion,
  Card,
  Container,
  Icon,
  SectionHeading,
  buttonClassNames,
  type IconName,
} from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { ProtocolLookupForm } from "@/components/service/ProtocolLookupForm";
import { INSTITUTION } from "@/lib/content/data/institution";
import { FAQ_GROUPS, listFaqByGroup, listPopularFaq, type FaqItem } from "@/lib/service/faq";

export const metadata: Metadata = {
  title: "Central de atendimento ao candidato",
  description:
    "Perguntas frequentes sobre inscrição, isenção, boleto, cartão de confirmação, provas, recursos e resultados; Fale Conosco com protocolo e consulta de andamento.",
  alternates: { canonical: "/atendimento" },
};

const CHANNELS: {
  icon: IconName;
  title: string;
  description: string;
  href: string;
  label: string;
  external?: boolean;
}[] = [
  {
    icon: "message-circle",
    title: "Fale Conosco",
    description:
      "Abra um chamado com protocolo. A resposta vai para o e-mail informado, em dias úteis.",
    href: "/fale-conosco",
    label: "Abrir chamado",
  },
  {
    icon: "phone",
    title: "Telefone",
    description: `${INSTITUTION.businessHours} Para dúvidas de inscrição, tenha em mãos o número da inscrição.`,
    href: INSTITUTION.phoneHref,
    label: INSTITUTION.phone,
    external: true,
  },
  {
    icon: "mail",
    title: "E-mail",
    description:
      "Para quem prefere escrever. Informe o concurso e o número da inscrição no assunto.",
    href: `mailto:${INSTITUTION.emails.faleConosco}`,
    label: INSTITUTION.emails.faleConosco,
    external: true,
  },
  {
    icon: "user",
    title: "Área do candidato",
    description: "Inscrição, boleto, comprovante, cartão de confirmação, recursos e resultados.",
    href: "/candidato",
    label: "Acessar serviços",
  },
];

function FaqContent({ item }: { item: FaqItem }) {
  return (
    <div className="space-y-3">
      {item.answer.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
      {item.links?.length ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {item.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-action-blue font-semibold underline underline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ServiceHubPage() {
  const popular = listPopularFaq(6);

  return (
    <>
      <PageHeader
        eyebrow="Atendimento"
        title="Central de atendimento ao candidato"
        description="Respostas oficiais para as dúvidas mais comuns, abertura de chamado com protocolo e consulta de andamento. Dúvidas sobre um edital são respondidas com base no documento vigente."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Atendimento" }]}
        actions={
          <>
            <Link href="/fale-conosco" className={buttonClassNames("primary", "", "lg")}>
              Fale Conosco
              <Icon name="arrow-right" size={18} />
            </Link>
            <a href="#protocolo" className={buttonClassNames("secondary", "", "lg")}>
              Consultar protocolo
            </a>
          </>
        }
      />

      {/* Canais */}
      <section className="py-14" aria-labelledby="canais-title">
        <Container>
          <SectionHeading id="canais-title" eyebrow="Canais" title="Como falar com o Instituto" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNELS.map((channel) => (
              <li key={channel.title}>
                <Card className="flex h-full flex-col">
                  <span className="bg-wash-blue text-action-blue flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon name={channel.icon} size={24} />
                  </span>
                  <h3 className="text-navy-primary mt-4 text-lg font-bold">{channel.title}</h3>
                  <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                    {channel.description}
                  </p>
                  {channel.external ? (
                    <a
                      href={channel.href}
                      className="text-action-blue mt-auto inline-flex min-h-11 items-center pt-4 text-sm font-semibold underline underline-offset-4"
                    >
                      {channel.label}
                    </a>
                  ) : (
                    <Link
                      href={channel.href}
                      className="text-action-blue mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-sm font-semibold"
                    >
                      {channel.label}
                      <Icon name="arrow-right" size={16} />
                    </Link>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="border-border bg-surface flex gap-3 rounded-lg border p-5 text-sm">
              <Icon name="map-pin" size={20} className="text-action-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-navy-primary font-semibold">Atendimento presencial</p>
                <p className="text-text-secondary mt-1">
                  {INSTITUTION.address.full}. {INSTITUTION.businessHours}
                </p>
              </div>
            </div>
            <div className="border-border bg-surface flex gap-3 rounded-lg border p-5 text-sm">
              <Icon name="shield" size={20} className="text-institutional-red mt-0.5 shrink-0" />
              <div>
                <p className="text-navy-primary font-semibold">Canal de denúncias</p>
                <p className="text-text-secondary mt-1">
                  Para relatar irregularidades em certames, com sigilo e possibilidade de anonimato.
                  Não é o canal para dúvidas de inscrição.{" "}
                  <Link
                    href="/integridade"
                    className="text-action-blue font-semibold underline underline-offset-4"
                  >
                    Acessar o canal de integridade
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Antes de abrir um chamado */}
      <section className="bg-surface py-14" aria-labelledby="antes-title">
        <Container>
          <SectionHeading
            id="antes-title"
            eyebrow="Antes de abrir um chamado"
            title="A resposta pode já estar aqui"
            description="A maioria das dúvidas é resolvida pelo edital, pela página do concurso ou pela Área do Candidato."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <ul className="divide-border border-border bg-background-light divide-y rounded-lg border">
              {popular.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-navy-primary hover:text-action-blue flex min-h-12 items-center justify-between gap-4 px-5 py-3 text-base font-semibold"
                  >
                    {item.question}
                    <Icon name="chevron-right" size={18} className="text-action-blue shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
            <Card className="flex flex-col">
              <h3 className="text-navy-primary text-lg font-bold">Consulte a página do concurso</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                Cada concurso tem página própria com edital vigente, retificações, cronograma,
                comunicados, gabaritos e resultados — e perguntas frequentes específicas do certame.
              </p>
              <Link href="/concursos" className={buttonClassNames("secondary", "mt-4 self-start")}>
                Encontrar meu concurso
                <Icon name="arrow-right" size={16} />
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* Perguntas frequentes */}
      <section id="perguntas-frequentes" className="scroll-mt-24 py-14" aria-labelledby="faq-title">
        <Container>
          <SectionHeading
            id="faq-title"
            eyebrow="Perguntas frequentes"
            title="Dúvidas do candidato, por tema"
            description="Respostas gerais, válidas para todos os certames. Em caso de divergência, prevalece sempre o edital do concurso."
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {FAQ_GROUPS.map((group) => {
              const items = listFaqByGroup(group.id);
              if (items.length === 0) return null;
              return (
                <div key={group.id} id={`faq-${group.id}`} className="scroll-mt-24">
                  <h3 className="text-navy-primary text-xl font-bold">{group.title}</h3>
                  <p className="text-text-secondary mt-1 text-sm">{group.description}</p>
                  <Accordion
                    className="mt-3"
                    items={items.map((item) => ({
                      id: item.id,
                      title: item.question,
                      content: <FaqContent item={item} />,
                    }))}
                  />
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Consulta de protocolo */}
      <section
        id="protocolo"
        className="bg-surface scroll-mt-24 py-14"
        aria-labelledby="protocolo-title"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <SectionHeading
              id="protocolo-title"
              eyebrow="Consultar protocolo"
              title="Acompanhe o andamento do seu chamado"
              description="Informe o protocolo recebido por e-mail para ver o status, o assunto e as mensagens trocadas. Apenas o conteúdo do seu próprio chamado é exibido."
            />
            <Card padding="lg">
              <ProtocolLookupForm legacyServiceUrl={INSTITUTION.legacySystems.service} />
            </Card>
          </div>
        </Container>
      </section>

      {/* Compromissos */}
      <section className="py-14" aria-labelledby="compromissos-title">
        <Container>
          <SectionHeading
            id="compromissos-title"
            eyebrow="Compromissos"
            title="O que você pode esperar do atendimento"
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "file-text" as IconName,
                title: "Protocolo em toda solicitação",
                description:
                  "Cada chamado recebe um número de protocolo, enviado ao seu e-mail, para acompanhamento.",
              },
              {
                icon: "mail" as IconName,
                title: "Resposta pelo e-mail informado",
                description:
                  "A resposta é enviada ao e-mail cadastrado no chamado, em dias úteis, e fica disponível na consulta por protocolo.",
              },
              {
                icon: "book-open" as IconName,
                title: "Resposta com base no edital vigente",
                description:
                  "Dúvidas sobre regras do certame são respondidas pelo texto do edital e de suas retificações — nunca por interpretação informal.",
              },
              {
                icon: "lock" as IconName,
                title: "Privacidade",
                description:
                  "Usamos seus dados apenas para responder ao chamado. Nunca pedimos senha, e não há cobrança fora do boleto oficial.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="border-border bg-surface flex gap-4 rounded-lg border p-5"
              >
                <Icon name={item.icon} size={24} className="text-action-blue mt-0.5 shrink-0" />
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
