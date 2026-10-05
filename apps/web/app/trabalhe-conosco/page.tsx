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
import { INSTITUTION } from "@/lib/content/data/institution";

export const metadata: Metadata = {
  title: "Trabalhe conosco",
  description:
    "Frentes de atuação no Instituto Selecon: banca de elaboradores e revisores, coordenadores e fiscais de aplicação, corretores de redação e equipe administrativa e de TI. Requisitos e como se candidatar.",
  alternates: { canonical: "/trabalhe-conosco" },
};

const APPLY_HREF = "/fale-conosco?assunto=trabalhe-conosco";

const FRONTS: { title: string; description: string; requirements: string[]; icon: IconName }[] = [
  {
    title: "Banca de elaboradores e revisores",
    description:
      "Elaboração de questões inéditas, revisão técnica e linguística, análise de recursos e composição de gabaritos, por área de conhecimento.",
    requirements: [
      "Mestrado ou doutorado na área de atuação",
      "Experiência docente ou profissional comprovada",
      "Disponibilidade para trabalho sob sigilo e prazos definidos",
    ],
    icon: "book-open",
  },
  {
    title: "Coordenadores e fiscais de aplicação de provas",
    description:
      "Coordenação de locais de prova, fiscalização de sala, controle de acesso, guarda de material e registro de ocorrências nos dias de aplicação.",
    requirements: [
      "Ensino médio completo (fiscais) ou superior (coordenadores)",
      "Participação obrigatória no treinamento no padrão Selecon",
      "Disponibilidade aos fins de semana nas datas de prova",
    ],
    icon: "users",
  },
  {
    title: "Corretores de redação e provas discursivas",
    description:
      "Correção por grade de critérios, com dupla correção e calibração entre corretores, em plataforma on-line.",
    requirements: [
      "Licenciatura em Letras ou área afim à prova discursiva",
      "Experiência em correção por critérios",
      "Disponibilidade no período de correção previsto em cronograma",
    ],
    icon: "file-text",
  },
  {
    title: "Equipe administrativa e de tecnologia",
    description:
      "Atendimento ao candidato, logística, operação gráfica, administração e sistemas (inscrição, Área do Candidato, infraestrutura e segurança).",
    requirements: [
      "Formação compatível com a função",
      "Atuação presencial na sede, no centro do Rio de Janeiro, conforme a vaga",
      "Compromisso com sigilo e com as normas de segurança do Instituto",
    ],
    icon: "server",
  },
];

const GENERAL_REQUIREMENTS = [
  "Não ter participado, como candidato, de certame em andamento conduzido pelo Instituto na mesma função.",
  "Não ter vínculo com candidatos ou com a comissão do certame que gere conflito de interesses.",
  "Assinar termo de sigilo e de conduta antes de qualquer acesso a material ou local de prova.",
  "Concordar com o tratamento dos dados do cadastro conforme a Política de Privacidade.",
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trabalhe conosco"
        title="Faça parte da equipe dos certames"
        description="O Instituto mobiliza, a cada certame, bancas, equipes de aplicação, corretores e profissionais administrativos e de tecnologia. Veja as frentes, os requisitos e como se candidatar."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Trabalhe conosco" }]}
        actions={
          <Link href={APPLY_HREF} className={buttonClassNames("primary")}>
            Enviar candidatura
            <Icon name="arrow-right" size={16} />
          </Link>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="space-y-16">
          {/* Frentes */}
          <section aria-labelledby="frentes-title">
            <SectionHeading
              id="frentes-title"
              eyebrow="Frentes de atuação"
              title="Onde você pode atuar"
            />
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {FRONTS.map((front) => (
                <li key={front.title}>
                  <Card className="flex h-full flex-col">
                    <span className="bg-wash-blue text-action-blue flex h-12 w-12 items-center justify-center rounded-lg">
                      <Icon name={front.icon} size={24} />
                    </span>
                    <h3 className="text-navy-primary mt-4 text-lg font-bold">{front.title}</h3>
                    <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                      {front.description}
                    </p>
                    <h4 className="text-text-secondary mt-4 text-sm font-semibold uppercase tracking-wide">
                      Requisitos
                    </h4>
                    <ul className="text-text-primary mt-2 space-y-1.5 text-sm">
                      {front.requirements.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Icon
                            name="check"
                            size={18}
                            className="text-success-green mt-0.5 shrink-0"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          {/* Requisitos gerais */}
          <section aria-labelledby="requisitos-title">
            <SectionHeading
              id="requisitos-title"
              eyebrow="Requisitos gerais"
              title="Condições para todas as frentes"
              description="A isonomia do certame começa pela equipe. Por isso, algumas condições valem para qualquer função."
            />
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {GENERAL_REQUIREMENTS.map((item) => (
                <li
                  key={item}
                  className="border-border bg-surface text-text-primary flex gap-3 rounded-lg border p-4 text-sm leading-relaxed"
                >
                  <Icon name="shield" size={20} className="text-action-blue mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Como se candidatar */}
          <section aria-labelledby="candidatar-title">
            <Card padding="lg" className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                  Como se candidatar
                </p>
                <h2 id="candidatar-title" className="text-navy-primary mt-1 text-2xl font-bold">
                  Envie sua candidatura pelo Fale Conosco
                </h2>
                <p className="text-text-secondary mt-2 text-base leading-relaxed">
                  Use o formulário com o assunto <strong>Trabalhe conosco</strong>. O pedido recebe
                  protocolo e é classificado para a área responsável pela frente escolhida. Informe
                  a frente de interesse, a formação, a cidade de residência e a disponibilidade, e
                  anexe o currículo.
                </p>
                <p className="text-text-secondary mt-3 text-sm">
                  As convocações acontecem conforme a demanda de cada certame. O cadastro não
                  garante contratação e os dados são tratados conforme a{" "}
                  <Link
                    href="/privacidade"
                    className="text-action-blue font-medium underline underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link href={APPLY_HREF} className={buttonClassNames("primary", "", "lg")}>
                  Enviar candidatura
                  <Icon name="arrow-right" size={18} />
                </Link>
              </div>
            </Card>
          </section>

          {/* Fraudes */}
          <section aria-labelledby="fraudes-title">
            <h2 id="fraudes-title" className="sr-only">
              Alerta sobre fraudes
            </h2>
            <Alert
              tone="warning"
              role="note"
              title="O Instituto não cobra taxa para cadastro, seleção ou contratação"
              icon={<Icon name="alert-triangle" size={20} className="text-warning-amber" />}
            >
              <p>
                Desconfie de anúncios de &ldquo;vagas&rdquo; em nome do Instituto que peçam
                pagamento, dados bancários ou cadastro em sites de terceiros. As candidaturas são
                recebidas apenas pelo Fale Conosco deste portal e os contatos oficiais são o
                telefone {INSTITUTION.phone} e os e-mails do domínio selecon.org.br. Se você
                identificou um anúncio falso, relate no{" "}
                <Link
                  href="/integridade"
                  className="text-action-blue font-medium underline underline-offset-4"
                >
                  canal de denúncias
                </Link>
                .
              </p>
            </Alert>
          </section>
        </div>
      </Container>
    </>
  );
}
