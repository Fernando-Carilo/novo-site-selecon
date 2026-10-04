import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { ArrowRightIcon, FileSearchIcon, LockIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Canal de denúncias",
  description:
    "Canal de integridade do Instituto Selecon: relate irregularidades com sigilo e acompanhe pelo protocolo.",
};

const POINTS = [
  {
    icon: LockIcon,
    title: "Sigilo e anonimato",
    description:
      "Você pode relatar sem se identificar. O relato fica em ambiente de acesso restrito à Ouvidoria, com trilha de auditoria de cada acesso.",
  },
  {
    icon: FileSearchIcon,
    title: "Protocolo e acompanhamento",
    description:
      "Ao registrar, você recebe um protocolo e um código de acesso para acompanhar a apuração e responder à equipe.",
  },
  {
    icon: ShieldIcon,
    title: "Apuração independente",
    description:
      "Cada caso é distribuído a um responsável, com prazos por etapa e registro de todas as ações.",
  },
];

/** Entrada do canal de integridade. O registro e a consulta ficam neste portal, atendidos pela Selecon Central. */
export default function WhistleblowingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
            Integridade
          </p>
          <h1 className="text-navy-primary mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Canal de denúncias
          </h1>
          <p className="text-text-secondary mt-5 max-w-xl text-lg leading-relaxed">
            Relate fraudes em concursos, irregularidades em processos seletivos, assédio,
            discriminação ou qualquer desvio de conduta envolvendo o Instituto Selecon. O canal é
            sigiloso e aceita relatos anônimos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/denuncias/nova" className={buttonClassNames("primary", "", "lg")}>
              Registrar uma denúncia
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/denuncias/consultar" className={buttonClassNames("secondary", "", "lg")}>
              Consultar pelo protocolo
            </Link>
          </div>
          <p className="text-text-secondary mt-4 text-sm">
            Em situação de risco imediato à integridade física, procure também as autoridades
            competentes.
          </p>
        </div>
        <ul className="space-y-4 lg:col-span-4 lg:col-start-9">
          {POINTS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="border-border bg-surface shadow-low flex gap-4 rounded-xl border p-5"
            >
              <span className="bg-action-blue/10 text-action-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="text-navy-primary block font-semibold">{title}</span>
                <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                  {description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
