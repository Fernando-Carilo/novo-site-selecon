import Link from "next/link";
import type { Metadata } from "next";
import { Container, Icon, buttonClassNames, type IconName } from "@selecon/ui";
import { ContestSearchForm } from "@/components/home/ContestSearchForm";
import { getContentProvider } from "@/lib/content";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description:
    "A página que você procura não existe ou mudou de endereço. Busque o concurso ou use os atalhos.",
  robots: { index: false, follow: true },
};

const SHORTCUTS: { href: string; label: string; description: string; icon: IconName }[] = [
  {
    href: "/concursos",
    label: "Concursos",
    description: "Catálogo completo com filtros e busca.",
    icon: "search",
  },
  {
    href: "/candidato",
    label: "Área do candidato",
    description: "Inscrição, boleto, recursos e resultados.",
    icon: "user",
  },
  {
    href: "/atendimento",
    label: "Atendimento",
    description: "Perguntas frequentes e Fale Conosco.",
    icon: "headset",
  },
  {
    href: "/",
    label: "Página inicial",
    description: "Destaques, publicações e notícias.",
    icon: "arrow-left",
  },
];

export default async function NotFound() {
  const catalog = await getContentProvider().listContests({ status: "TODOS" });
  const suggestions = Array.from(
    new Set(
      catalog.items
        .flatMap((contest) => [
          contest.organization.shortName,
          contest.organization.city,
          contest.editalNumber,
        ])
        .filter(Boolean),
    ),
  ).slice(0, 40);

  return (
    <section className="py-14 sm:py-20" aria-labelledby="nao-encontrada-title">
      <Container width="narrow">
        <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">Erro 404</p>
        <h1
          id="nao-encontrada-title"
          className="text-navy-primary mt-2 text-3xl font-bold leading-tight sm:text-4xl"
        >
          Página não encontrada
        </h1>
        <p className="text-text-secondary mt-3 text-base leading-relaxed sm:text-lg">
          O endereço pode ter sido digitado errado, ou a página mudou de lugar na migração do
          portal. Se você veio de um link de edital, o concurso continua disponível no catálogo: use
          a busca abaixo.
        </p>

        <div className="border-border bg-surface mt-8 rounded-lg border p-5">
          <ContestSearchForm suggestions={suggestions} variant="inline" />
          <p className="text-text-secondary mt-2 text-sm">
            Pesquise por órgão, cargo, cidade, estado, número do edital ou palavra-chave.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.href}>
              <Link
                href={shortcut.href}
                className="border-border bg-surface hover:shadow-medium focus-visible:ring-action-blue group flex h-full gap-4 rounded-lg border p-5 transition-shadow focus-visible:outline-none focus-visible:ring-[3px]"
              >
                <span className="bg-wash-blue text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                  <Icon name={shortcut.icon} size={22} />
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

        <p className="text-text-secondary mt-8 text-sm">
          Acha que o link deveria funcionar? Informe o endereço pelo{" "}
          <Link
            href="/fale-conosco"
            className="text-action-blue font-medium underline underline-offset-4"
          >
            Fale Conosco
          </Link>{" "}
          para que possamos corrigir ou redirecionar.
        </p>
        <Link href="/mapa-do-site" className={buttonClassNames("secondary", "mt-6")}>
          Ver o mapa do site
        </Link>
      </Container>
    </section>
  );
}
