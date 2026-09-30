import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { ContestSearchForm } from "@/components/home/ContestSearchForm";
import { AccessibilityIcon, ArrowRightIcon, LockIcon, ShieldIcon } from "@/components/icons";

const TRUST_ITEMS = [
  {
    icon: LockIcon,
    title: "Dados protegidos",
    description: "Privacidade por padrão, conforme a LGPD.",
  },
  {
    icon: ShieldIcon,
    title: "Canal de integridade",
    description: "Denúncias com sigilo, em ambiente segregado.",
  },
  {
    icon: AccessibilityIcon,
    title: "Acessível para todos",
    description: "Teclado, leitores de tela e alto contraste.",
  },
];

const JOURNEY_STEPS = [
  {
    title: "Encontre o concurso",
    description: "Busque editais por órgão, cargo ou cidade e leia o documento completo.",
  },
  {
    title: "Inscreva-se e acompanhe",
    description: "Faça sua inscrição e acompanhe cada etapa na área do candidato.",
  },
  {
    title: "Consulte os resultados",
    description: "Receba comunicados oficiais e consulte gabaritos, notas e classificação.",
  },
];

/**
 * Hero institucional — seção 9.2, item 1. Fundo claro (páginas públicas nunca escuras),
 * uma única textura discreta, mensagem direta e a busca de concursos como ação principal.
 * O painel lateral explica a jornada do candidato (item 5) sem inventar dados.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="border-border/70 relative isolate overflow-hidden border-b"
    >
      <div
        aria-hidden="true"
        className="bg-grid-subtle absolute inset-0 -z-20 [mask-image:radial-gradient(70rem_36rem_at_50%_-10%,black_25%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_24rem_at_85%_-5%,rgb(var(--color-support-cyan-rgb)/0.16),transparent_65%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-24">
        <div className="lg:col-span-7">
          <p className="text-navy-secondary border-navy-primary/10 bg-surface/70 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
            <span aria-hidden="true" className="bg-support-cyan h-1.5 w-1.5 rounded-full" />
            <span className="hidden sm:inline">Instituto Selecon · </span>Concursos públicos
          </p>

          <h1
            id="hero-title"
            className="text-navy-primary mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            Concursos públicos com transparência, do edital ao resultado.
          </h1>

          <p className="text-text-secondary mt-6 max-w-xl text-lg leading-relaxed">
            Encontre editais, acompanhe sua inscrição e fale com o Instituto em um único portal —
            pensado para ser claro, acessível e seguro para todo candidato.
          </p>

          <div className="mt-8 max-w-xl">
            <ContestSearchForm />
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="bg-surface text-action-blue ring-border shadow-low flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="text-navy-primary block text-sm font-semibold">{title}</span>
                  <span className="text-text-secondary mt-0.5 block text-sm leading-snug">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside
          aria-labelledby="journey-title"
          className="border-border bg-surface shadow-high relative rounded-xl border p-6 sm:p-8 lg:col-span-5"
        >
          <div
            aria-hidden="true"
            className="from-navy-primary via-action-blue to-support-cyan absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r sm:inset-x-8"
          />
          <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
            Passo a passo
          </p>
          <h2 id="journey-title" className="text-navy-primary mt-2 text-2xl font-bold">
            Sua jornada no portal
          </h2>

          <ol className="mt-6 space-y-6">
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.title} className="relative flex gap-4">
                {index < JOURNEY_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="border-border absolute left-[1.125rem] top-10 h-[calc(100%-1rem)] border-l-2 border-dashed"
                  />
                ) : null}
                <span className="bg-navy-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-1">
                  <span className="text-navy-primary block font-semibold">{step.title}</span>
                  <span className="text-text-secondary mt-1 block text-sm leading-relaxed">
                    {step.description}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-2">
            <Link href="/candidato" className={buttonClassNames("primary", "w-full", "lg")}>
              Acessar área do candidato
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/atendimento"
              className="text-navy-primary hover:text-action-blue inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md px-2 text-sm font-semibold underline-offset-4 transition-colors hover:underline"
            >
              Falar com o atendimento
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
