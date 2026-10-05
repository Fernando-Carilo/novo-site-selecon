import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Container, Icon, buttonClassNames, type IconName } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Canal de denúncias",
  description:
    "Canal de integridade do Instituto Selecon: relate irregularidades com sigilo, receba protocolo e código de acesso e acompanhe a apuração.",
  alternates: { canonical: "/denuncias" },
};

const POINTS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "lock",
    title: "Sigilo e anonimato",
    description:
      "Você pode relatar sem se identificar. O relato fica em ambiente de acesso restrito à equipe de apuração, com trilha de auditoria de cada acesso.",
  },
  {
    icon: "file-text",
    title: "Protocolo e acompanhamento",
    description:
      "Ao registrar, você recebe um protocolo e um código de acesso para acompanhar a apuração e responder à equipe.",
  },
  {
    icon: "shield",
    title: "Apuração independente",
    description:
      "Cada caso é distribuído a um responsável, com prazos por etapa e registro de todas as ações.",
  },
];

/** Entrada do canal de integridade. Registro e consulta acontecem aqui, atendidos pela Selecon Central. */
export default function WhistleblowingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Integridade"
        title="Canal de denúncias"
        description="Relate fraudes em concursos, irregularidades em processos seletivos, assédio, discriminação ou qualquer desvio de conduta envolvendo o Instituto Selecon. O canal é sigiloso e aceita relatos anônimos."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Integridade", href: "/integridade" },
          { label: "Canal de denúncias" },
        ]}
        tone="navy"
        actions={
          <>
            <Link href="/denuncias/nova" className={buttonClassNames("cyan", "", "lg")}>
              Registrar uma denúncia
              <Icon name="arrow-right" size={18} />
            </Link>
            <Link href="/denuncias/consultar" className={buttonClassNames("inverse", "", "lg")}>
              Consultar pelo protocolo
            </Link>
          </>
        }
      />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Alert
              tone="danger"
              role="note"
              title="Em caso de risco à vida ou crime em andamento, procure as autoridades"
              icon={<Icon name="alert-triangle" size={20} className="text-institutional-red" />}
            >
              <p>
                Este canal não é um serviço de emergência. Ligue para a Polícia Militar (190) ou
                para o Disque Direitos Humanos (Disque 100). Depois, se quiser, registre o relato
                aqui para que o Instituto também apure.
              </p>
            </Alert>
            <Alert
              tone="warning"
              role="note"
              title="Guarde o protocolo e o código de acesso"
              icon={<Icon name="info" size={20} className="text-warning-amber" />}
            >
              <p>
                O código é exibido uma única vez, no momento do envio, e não pode ser recuperado
                pelo Instituto. É essa regra que garante que só você abre o seu relato.
              </p>
            </Alert>
            <p className="text-text-secondary text-sm">
              O que relatar, o que vai para o atendimento comum e como funciona a apuração:{" "}
              <Link href="/integridade" className="text-action-blue font-semibold underline">
                leia a página de integridade
              </Link>
              .
            </p>
          </div>
          <ul className="space-y-4 lg:col-span-5">
            {POINTS.map((p) => (
              <li
                key={p.title}
                className="border-border bg-surface shadow-low flex gap-4 rounded-lg border p-5"
              >
                <span className="bg-action-blue/10 text-action-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon name={p.icon} size={20} />
                </span>
                <span>
                  <span className="text-navy-primary block font-semibold">{p.title}</span>
                  <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                    {p.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
