import Link from "next/link";
import type { Metadata } from "next";
import {
  Alert,
  Card,
  Container,
  Icon,
  SectionHeading,
  buttonClassNames,
  type IconName,
} from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { INSTITUTION, KEY_NUMBERS, MISSION, TRACK_RECORD } from "@/lib/content/data/institution";
import { formatInteger } from "@/lib/format";

export const metadata: Metadata = {
  title: "Transparência institucional",
  description:
    "Identificação institucional do Instituto Selecon, base legal de contratação, relação de certames conduzidos com número de inscritos, princípios e canais de contato e de denúncias.",
  alternates: { canonical: "/transparencia" },
};

const SORTED_TRACK_RECORD = [...TRACK_RECORD].sort((a, b) => b.registered - a.registered);
const LISTED_TOTAL = SORTED_TRACK_RECORD.reduce((sum, item) => sum + item.registered, 0);
const TOTAL_REGISTERED = KEY_NUMBERS.find((n) => n.label === "de candidatos inscritos");
const TOTAL_CONTESTS = KEY_NUMBERS.find((n) => n.label === "certames realizados");

const CHANNELS: {
  href: string;
  label: string;
  description: string;
  icon: IconName;
  external?: boolean;
}[] = [
  {
    href: "/fale-conosco",
    label: "Fale Conosco",
    description:
      "Dúvidas, solicitações e pedidos de documentos institucionais, com protocolo de acompanhamento.",
    icon: "headset",
  },
  {
    href: "/integridade",
    label: "Canal de denúncias",
    description:
      "Relatos de irregularidades, sigilosos e com opção de anonimato, em canal segregado do atendimento.",
    icon: "shield",
  },
  {
    href: "/candidato",
    label: "Área do candidato",
    description: "Inscrição, boleto, cartão de confirmação, recursos e resultados de cada certame.",
    icon: "user",
  },
];

export default function TransparencyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transparência"
        title="Transparência institucional"
        description="Quem somos juridicamente, como somos contratados, o que já realizamos e por quais canais a sociedade pode nos acionar."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência" }]}
      />

      <Container className="py-10 sm:py-14">
        <div className="space-y-16">
          {/* Identificação */}
          <section aria-labelledby="identificacao-title">
            <SectionHeading
              id="identificacao-title"
              eyebrow="Identificação"
              title="Identificação institucional"
            />
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { term: "Razão social", detail: INSTITUTION.legalName },
                { term: "Nome fantasia", detail: INSTITUTION.name },
                { term: "CNPJ", detail: INSTITUTION.cnpj },
                { term: "Natureza jurídica", detail: INSTITUTION.legalNature },
                { term: "Endereço da sede", detail: INSTITUTION.address.full },
                { term: "Telefone", detail: INSTITUTION.phone },
              ].map((row) => (
                <div key={row.term} className="border-border bg-surface rounded-lg border p-5">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    {row.term}
                  </dt>
                  <dd className="text-navy-primary mt-1 text-base font-medium">{row.detail}</dd>
                </div>
              ))}
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
                  Base legal de contratação
                </dt>
                <dd className="text-text-primary mt-1 text-base leading-relaxed">
                  {MISSION.legalBasis}
                </dd>
              </div>
            </dl>
          </section>

          {/* Como somos contratados */}
          <section aria-labelledby="contratacao-title">
            <SectionHeading
              id="contratacao-title"
              eyebrow="Contratação"
              title="Como somos contratados"
              description="O Instituto não participa de licitações competitivas de preço: a contratação ocorre por dispensa de licitação, mediante proposta técnica e de preço analisada pelo órgão."
            />
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Demanda do órgão",
                  description:
                    "O órgão público ou instituição apresenta a necessidade: cargos, vagas, etapas e prazos.",
                },
                {
                  title: "Proposta técnica e de preço",
                  description:
                    "O Instituto apresenta metodologia, equipe, cronograma, estrutura e custos do certame.",
                },
                {
                  title: "Contrato e execução",
                  description:
                    "Formalizado o contrato, cada etapa é executada e documentada até a homologação.",
                },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="border-border bg-surface relative rounded-lg border p-5 pt-7"
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
            <div className="mt-6">
              <Link href="/servicos" className={buttonClassNames("secondary")}>
                Conhecer as linhas de serviço
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </section>

          {/* Certames conduzidos */}
          <section id="certames" aria-labelledby="certames-title" className="scroll-mt-24">
            <SectionHeading
              id="certames-title"
              eyebrow="Atuação"
              title="Relação de certames conduzidos"
              description={
                TOTAL_REGISTERED && TOTAL_CONTESTS
                  ? `O Instituto já realizou ${TOTAL_CONTESTS.value} ${TOTAL_CONTESTS.label} (${TOTAL_CONTESTS.caption}), somando ${TOTAL_REGISTERED.value} ${TOTAL_REGISTERED.label}. A tabela lista os principais, com o número oficial de inscritos de cada um.`
                  : "A tabela lista os principais certames conduzidos, com o número oficial de inscritos de cada um."
              }
            />
            <div className="border-border bg-surface mt-8 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="text-navy-primary px-4 py-3 text-left text-base font-bold">
                  Principais certames conduzidos pelo Instituto, por número de inscritos
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
                  {SORTED_TRACK_RECORD.map((item) => (
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
                <tfoot className="border-border-strong bg-background-light text-navy-primary border-t-2 font-semibold">
                  <tr>
                    <th scope="row" colSpan={3} className="px-4 py-3">
                      Soma dos {SORTED_TRACK_RECORD.length} certames listados
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatInteger(LISTED_TOTAL)}
                    </td>
                  </tr>
                  {TOTAL_REGISTERED ? (
                    <tr>
                      <th scope="row" colSpan={3} className="px-4 py-3">
                        Somatório de todos os certames conduzidos pelo Instituto
                      </th>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {TOTAL_REGISTERED.value}
                      </td>
                    </tr>
                  ) : null}
                </tfoot>
              </table>
            </div>
            <p className="text-text-secondary mt-3 text-sm">
              Fonte: apresentação institucional do Instituto. Certames com menor número de inscritos
              não estão relacionados individualmente nesta tabela.
            </p>
          </section>

          {/* Princípios */}
          <section aria-labelledby="principios-title">
            <SectionHeading
              id="principios-title"
              eyebrow="Princípios"
              title="Valores que orientam cada certame"
              description={MISSION.mission}
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MISSION.values.map((value) => (
                <li
                  key={value}
                  className="border-border bg-surface text-navy-primary flex items-center gap-3 rounded-lg border p-4 text-base font-medium"
                >
                  <Icon name="check-circle" size={20} className="text-success-green shrink-0" />
                  {value}
                </li>
              ))}
            </ul>
          </section>

          {/* Canais */}
          <section aria-labelledby="canais-title">
            <SectionHeading id="canais-title" eyebrow="Canais" title="Como falar com o Instituto" />
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {CHANNELS.map((channel) => (
                <li key={channel.href}>
                  <Link
                    href={channel.href}
                    className="border-border bg-surface hover:shadow-medium focus-visible:ring-action-blue group flex h-full gap-4 rounded-lg border p-5 transition-shadow focus-visible:outline-none focus-visible:ring-[3px]"
                  >
                    <span className="bg-wash-blue text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                      <Icon name={channel.icon} size={22} />
                    </span>
                    <span>
                      <span className="text-navy-primary group-hover:text-action-blue block text-base font-bold">
                        {channel.label}
                      </span>
                      <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                        {channel.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-text-secondary mt-4 text-sm">
              Telefone {INSTITUTION.phone}, {INSTITUTION.businessHours.toLowerCase()} E-mail
              institucional:{" "}
              <a
                href={`mailto:${INSTITUTION.emails.faleConosco}`}
                className="text-action-blue font-medium underline underline-offset-4"
              >
                {INSTITUTION.emails.faleConosco}
              </a>
              .
            </p>
          </section>

          {/* Documentos institucionais */}
          <section aria-labelledby="documentos-title">
            <Card padding="lg">
              <h2 id="documentos-title" className="text-navy-primary text-xl font-bold">
                Documentos institucionais
              </h2>
              <Alert
                tone="info"
                className="mt-4"
                icon={<Icon name="info" size={20} className="text-action-blue" />}
              >
                Documentos institucionais (estatuto social, balanços e certidões) podem ser
                solicitados pelo Fale Conosco. A solicitação recebe protocolo e é respondida pelo
                canal informado no pedido.
              </Alert>
              <Link href="/fale-conosco" className={buttonClassNames("primary", "mt-5")}>
                Solicitar pelo Fale Conosco
                <Icon name="arrow-right" size={16} />
              </Link>
            </Card>
          </section>
        </div>
      </Container>
    </>
  );
}
