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
  title: "Integridade — canal de denúncias",
  description:
    "Canal de denúncias do Instituto Selecon: sigiloso, com opção de anonimato, protocolo e código de acesso. Saiba o que relatar, como funciona o acompanhamento e quando procurar as autoridades.",
  alternates: { canonical: "/integridade" },
};

const WHISTLEBLOWING_URL = INSTITUTION.legacySystems.whistleblowing;

const REPORTABLE: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Fraude em certame",
    description:
      "Cola organizada, uso de equipamentos proibidos, substituição de candidato ou manipulação de resultado.",
    icon: "alert-triangle",
  },
  {
    title: "Vazamento de prova",
    description:
      "Suspeita de acesso indevido a provas, gabaritos ou materiais sigilosos antes da aplicação.",
    icon: "lock",
  },
  {
    title: "Conduta indevida de colaborador",
    description:
      "Fiscal, coordenador, atendente ou prestador que descumpra normas do certame ou do Instituto.",
    icon: "users",
  },
  {
    title: "Assédio ou discriminação",
    description:
      "Assédio moral ou sexual, discriminação ou tratamento desrespeitoso em qualquer etapa ou ambiente.",
    icon: "shield",
  },
  {
    title: "Corrupção",
    description: "Oferta ou pedido de vantagem indevida, favorecimento ou conflito de interesses.",
    icon: "scale",
  },
];

const NOT_HERE = [
  { subject: "Dúvida sobre inscrição, isenção ou cotas", href: "/atendimento" },
  { subject: "Boleto, pagamento ou cartão de confirmação", href: "/candidato" },
  { subject: "Recurso contra questão, gabarito ou resultado", href: "/candidato" },
  {
    subject: "Local de prova, horário ou documentos exigidos",
    href: "/atendimento#perguntas-frequentes",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Você registra o relato",
    description:
      "Descreva o que aconteceu, onde, quando e quem esteve envolvido. Anexe evidências se tiver. A identificação é opcional.",
  },
  {
    title: "O sistema gera protocolo e código de acesso",
    description:
      "Ao enviar, você recebe um número de protocolo e um código de acesso. Guarde os dois: o código não pode ser recuperado depois e não é enviado por e-mail.",
  },
  {
    title: "A análise é feita por equipe restrita",
    description:
      "Somente pessoas designadas para a apuração têm acesso ao conteúdo. O relato não passa pelo atendimento comum nem por áreas envolvidas no fato relatado.",
  },
  {
    title: "Você acompanha pelo protocolo",
    description:
      "Com protocolo e código, você consulta o andamento, lê as respostas da equipe e envia complementos — mesmo em relatos anônimos.",
  },
];

function ExternalCta({
  href,
  children,
  variant,
}: {
  href: string;
  children: string;
  variant: "primary" | "secondary";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClassNames(variant, "", "lg")}
    >
      {children}
      <Icon name="external-link" size={16} label="abre em nova aba" />
    </a>
  );
}

export default function IntegrityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Integridade"
        title="Canal de denúncias"
        description="Um canal sigiloso, segregado do atendimento comum, para relatar irregularidades em certames ou na atuação do Instituto — com opção de anonimato, protocolo e código de acesso."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Integridade" }]}
        tone="navy"
        actions={
          <>
            <ExternalCta href={WHISTLEBLOWING_URL} variant="primary">
              Registrar denúncia
            </ExternalCta>
            <ExternalCta href={WHISTLEBLOWING_URL} variant="secondary">
              Acompanhar denúncia
            </ExternalCta>
          </>
        }
      >
        <p className="text-sm text-white/80">
          Os dois botões abrem o sistema de denúncias do Instituto em uma nova aba, em endereço
          próprio (denuncias.selecon.org.br).
        </p>
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="space-y-16">
          {/* Emergências */}
          <section aria-labelledby="emergencia-title">
            <h2 id="emergencia-title" className="sr-only">
              Emergências
            </h2>
            <Alert
              tone="danger"
              role="note"
              title="Em caso de risco à vida ou crime em andamento, procure as autoridades"
              icon={<Icon name="alert-triangle" size={20} className="text-institutional-red" />}
            >
              <p>
                Este canal não é um serviço de emergência e não funciona em tempo real. Ligue para a
                Polícia Militar (190) ou para o Disque Direitos Humanos (Disque 100). Depois, se
                quiser, registre o relato aqui para que o Instituto também apure.
              </p>
            </Alert>
          </section>

          {/* Finalidade */}
          <section aria-labelledby="finalidade-title">
            <SectionHeading
              id="finalidade-title"
              eyebrow="Finalidade"
              title="Para que serve este canal"
              description="Receber relatos de irregularidades que possam comprometer a lisura dos certames, a isonomia entre candidatos ou a conduta ética do Instituto e de quem trabalha com ele."
            />
            <div className="prose-selecon text-text-primary mt-6 max-w-3xl text-base">
              <p>
                Candidatos, colaboradores, fornecedores, servidores de órgãos contratantes e
                qualquer pessoa podem usar o canal. Cada relato é registrado, analisado e respondido
                pelo próprio sistema. Relatos de boa-fé não geram qualquer retaliação, mesmo quando
                a apuração não confirma a irregularidade.
              </p>
            </div>
          </section>

          {/* O que relatar vs. atendimento */}
          <section aria-labelledby="relatar-title">
            <SectionHeading id="relatar-title" eyebrow="Escopo" title="O que relatar aqui" />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REPORTABLE.map((item) => (
                <li
                  key={item.title}
                  className="border-border bg-surface flex gap-4 rounded-lg border p-5"
                >
                  <span className="bg-wash-red text-institutional-red flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <div>
                    <h3 className="text-navy-primary text-base font-bold">{item.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-border bg-background-light mt-8 rounded-lg border p-6">
              <h3 className="text-navy-primary text-lg font-bold">
                O que vai para o atendimento comum
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Dúvidas e solicitações sobre a sua participação em um certame são respondidas mais
                rápido pelo atendimento, com protocolo. Registrá-las como denúncia atrasa a
                resposta.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {NOT_HERE.map((item) => (
                  <li key={item.subject}>
                    <Link
                      href={item.href}
                      className="border-border bg-surface text-navy-primary hover:text-action-blue flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium"
                    >
                      <Icon name="headset" size={18} className="text-action-blue shrink-0" />
                      {item.subject}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Como funciona */}
          <section aria-labelledby="funcionamento-title">
            <SectionHeading
              id="funcionamento-title"
              eyebrow="Funcionamento"
              title="Como funciona, passo a passo"
            />
            <ol className="mt-8 grid gap-4 md:grid-cols-2">
              {HOW_IT_WORKS.map((step, index) => (
                <li
                  key={step.title}
                  className="border-border bg-surface relative rounded-lg border p-5 pt-7"
                >
                  <span className="bg-navy-primary absolute -top-4 left-5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-navy-primary text-base font-bold">{step.title}</h3>
                  <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Anonimato, sigilo, prazo, limites */}
          <section aria-labelledby="garantias-title">
            <SectionHeading
              id="garantias-title"
              eyebrow="Garantias e limites"
              title="O que você pode esperar"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-navy-primary flex items-center gap-2 text-base font-bold">
                  <Icon name="user" size={20} className="text-action-blue" />
                  Anonimato
                </h3>
                <p className="text-text-primary mt-2 text-sm leading-relaxed">
                  Você escolhe se quer se identificar. Em relatos anônimos, nenhum dado de
                  identificação é exigido, e o acompanhamento acontece apenas com protocolo e código
                  de acesso. Identificar-se ajuda a apuração quando é preciso esclarecer detalhes, e
                  a identidade é protegida da mesma forma.
                </p>
              </Card>
              <Card>
                <h3 className="text-navy-primary flex items-center gap-2 text-base font-bold">
                  <Icon name="lock" size={20} className="text-action-blue" />
                  Sigilo e segregação
                </h3>
                <p className="text-text-primary mt-2 text-sm leading-relaxed">
                  O canal funciona em sistema próprio, separado do Fale Conosco e dos sistemas de
                  inscrição. Não há publicidade, rastreadores nem ferramentas de análise de
                  audiência nas páginas de denúncia. O conteúdo é acessível apenas à equipe
                  designada para a apuração.
                </p>
              </Card>
              <Card>
                <h3 className="text-navy-primary flex items-center gap-2 text-base font-bold">
                  <Icon name="clock" size={20} className="text-action-blue" />
                  Prazo e acompanhamento
                </h3>
                <p className="text-text-primary mt-2 text-sm leading-relaxed">
                  Cada etapa — recebimento, análise, pedidos de complemento e conclusão — fica
                  registrada no protocolo. O tempo de apuração varia com a complexidade do relato e
                  com a necessidade de ouvir envolvidos, por isso consulte o protocolo
                  periodicamente: é por ele que a equipe pede informações adicionais e comunica a
                  conclusão.
                </p>
              </Card>
              <Card>
                <h3 className="text-navy-primary flex items-center gap-2 text-base font-bold">
                  <Icon name="info" size={20} className="text-action-blue" />
                  Limites do canal
                </h3>
                <p className="text-text-primary mt-2 text-sm leading-relaxed">
                  O Instituto apura fatos relacionados aos seus certames, colaboradores e
                  fornecedores, e aplica as medidas ao seu alcance — inclusive comunicar o órgão
                  contratante e as autoridades competentes quando houver indício de crime. O canal
                  não substitui a polícia, o Ministério Público ou o Judiciário, nem julga recursos
                  de prova.
                </p>
              </Card>
            </div>
          </section>

          {/* Guarde o código */}
          <section aria-labelledby="codigo-title">
            <h2 id="codigo-title" className="sr-only">
              Protocolo e código de acesso
            </h2>
            <Alert
              tone="warning"
              role="note"
              title="Guarde o protocolo e o código de acesso"
              icon={<Icon name="alert-triangle" size={20} className="text-warning-amber" />}
            >
              <p>
                O código de acesso é exibido uma única vez, no momento do envio, e não pode ser
                recuperado pelo Instituto — é essa regra que garante que apenas você consegue abrir
                o seu relato. Anote-o ou salve o comprovante antes de fechar a página.
              </p>
            </Alert>
          </section>

          {/* CTA final */}
          <section aria-labelledby="acesso-title">
            <div className="bg-navy-primary rounded-lg p-6 text-white sm:p-8">
              <p className="text-support-cyan text-sm font-semibold uppercase tracking-wide">
                Sistema de denúncias
              </p>
              <h2 id="acesso-title" className="mt-1 text-2xl font-bold">
                Registrar ou acompanhar um relato
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
                O registro e o acompanhamento são feitos no sistema de denúncias do Instituto, em
                endereço próprio. Os links abrem em nova aba. O canal integrado a este portal, com
                formulário em etapas e comprovante em PDF, será disponibilizado em fase futura — até
                lá, o sistema atual segue em operação normal.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={WHISTLEBLOWING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClassNames("cyan", "", "lg")}
                >
                  Registrar denúncia
                  <Icon name="external-link" size={16} label="abre em nova aba" />
                </a>
                <a
                  href={WHISTLEBLOWING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClassNames("inverse", "", "lg")}
                >
                  Acompanhar denúncia
                  <Icon name="external-link" size={16} label="abre em nova aba" />
                </a>
              </div>
              <p className="mt-4 text-sm text-white/70">
                Endereço do sistema:{" "}
                <span className="font-medium text-white">{WHISTLEBLOWING_URL}</span>
              </p>
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
