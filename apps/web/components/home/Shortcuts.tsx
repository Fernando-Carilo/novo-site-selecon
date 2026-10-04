import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRightIcon,
  FileSearchIcon,
  HeadsetIcon,
  ShieldIcon,
  UserCircleIcon,
} from "@/components/icons";

interface Shortcut {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: "blue" | "red";
  badge?: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    href: "/concursos",
    title: "Encontrar concurso",
    description: "Editais abertos, em andamento e encerrados, com filtros por órgão e região.",
    icon: FileSearchIcon,
    tone: "blue",
  },
  {
    href: "/candidato",
    title: "Área do candidato",
    description: "Inscrições, comprovantes, locais de prova, recursos e resultados.",
    icon: UserCircleIcon,
    tone: "blue",
  },
  {
    href: "/atendimento",
    title: "Atendimento",
    description: "Perguntas frequentes, abertura de chamado e acompanhamento por protocolo.",
    icon: HeadsetIcon,
    tone: "blue",
  },
  {
    href: "/denuncias",
    title: "Canal de denúncias",
    description: "Relate irregularidades com sigilo e acompanhe pelo código de acesso.",
    icon: ShieldIcon,
    tone: "red",
    badge: "Sigiloso",
  },
];

const TONE_CLASSES: Record<Shortcut["tone"], { chip: string; hover: string }> = {
  blue: {
    chip: "bg-action-blue/10 text-action-blue",
    hover: "hover:border-action-blue/40",
  },
  red: {
    chip: "bg-institutional-red/10 text-institutional-red",
    hover: "hover:border-institutional-red/40",
  },
};

/**
 * Atalhos principais — seção 9.2, item 2. Cada card tem um único link que cobre toda a
 * área (via pseudo-elemento), mantendo um nome acessível curto e sem links aninhados.
 */
export function Shortcuts() {
  return (
    <section aria-labelledby="shortcuts-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
          Acesso rápido
        </p>
        <h2
          id="shortcuts-title"
          className="text-navy-primary mt-2 text-3xl font-bold tracking-tight"
        >
          O que você precisa fazer hoje?
        </h2>
        <p className="text-text-secondary mt-3 text-base">
          Os quatro serviços mais procurados, a um clique da página inicial.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {SHORTCUTS.map(({ href, title, description, icon: Icon, tone, badge }) => (
          <li key={href}>
            <article
              className={[
                "border-border bg-surface shadow-low group relative flex h-full flex-col rounded-xl border p-6",
                "duration-base transition-[transform,box-shadow,border-color] ease-out",
                "hover:shadow-medium hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                "focus-within:ring-action-blue focus-within:ring-[3px] focus-within:ring-offset-2",
                TONE_CLASSES[tone].hover,
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${TONE_CLASSES[tone].chip}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                {badge ? (
                  <span className="bg-institutional-red/10 text-institutional-red rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {badge}
                  </span>
                ) : null}
              </div>

              <h3 className="text-navy-primary mt-5 text-lg font-semibold">
                <Link
                  href={href}
                  className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
                >
                  {title}
                </Link>
              </h3>
              <p className="text-text-secondary mt-2 flex-1 text-sm leading-relaxed">
                {description}
              </p>

              <span
                aria-hidden="true"
                className="text-action-blue mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
              >
                Acessar
                <ArrowRightIcon className="duration-base h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </span>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
