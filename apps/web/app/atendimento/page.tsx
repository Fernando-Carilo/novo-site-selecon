import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { CentralChat } from "@/components/CentralChat";
import { ArrowRightIcon, HeadsetIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Atendimento ao candidato",
  description:
    "Fale com a Central de Atendimento do Instituto Selecon por chat, WhatsApp ou e-mail.",
};

type Channel = { title: string; description: string; href: string; cta: string; external: boolean };

/**
 * Central de atendimento: canais reais, só os configurados no ambiente de execução.
 * O chat é o widget da Selecon Central (fila de atendentes, protocolo); WhatsApp,
 * telefone e e-mail aparecem quando há número/endereço definidos. Nada é simulado.
 */
export default function ServicePage() {
  const CENTRAL_URL = (process.env.SITE_CENTRAL_URL ?? "").trim().replace(/\/+$/, "");
  const WHATSAPP = (process.env.SITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const PHONE = (process.env.SITE_CONTACT_PHONE ?? "").trim();
  const EMAIL = (process.env.SITE_CONTACT_EMAIL ?? "").trim();
  const HOURS = (process.env.SITE_CONTACT_HOURS ?? "").trim();
  const channels: Channel[] = [];
  if (WHATSAPP) {
    channels.push({
      title: "WhatsApp",
      description: "Mande sua dúvida pelo número oficial do Instituto.",
      href: `https://wa.me/${WHATSAPP}`,
      cta: "Abrir WhatsApp",
      external: true,
    });
  }
  if (PHONE) {
    channels.push({
      title: "Telefone",
      description: HOURS ? `Atendimento ${HOURS}.` : "Ligue para a Central de Atendimento.",
      href: `tel:${PHONE.replace(/[^\d+]/g, "")}`,
      cta: PHONE,
      external: false,
    });
  }
  if (EMAIL) {
    channels.push({
      title: "E-mail",
      description: "Você recebe um protocolo de atendimento na confirmação.",
      href: `mailto:${EMAIL}`,
      cta: EMAIL,
      external: false,
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {CENTRAL_URL ? <CentralChat centralUrl={CENTRAL_URL} /> : null}
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
            Central de Atendimento
          </p>
          <h1 className="text-navy-primary mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Fale com o Instituto Selecon
          </h1>
          <p className="text-text-secondary mt-5 max-w-xl text-lg leading-relaxed">
            Dúvidas sobre inscrição, pagamento, isenção, local de prova, gabarito, recurso ou
            resultado. Para identificar você, pedimos o número de inscrição ou o e-mail cadastrado —
            nunca o CPF em canal aberto.
          </p>
          <div className="border-border bg-surface shadow-low mt-8 flex gap-4 rounded-xl border p-5">
            <span className="bg-action-blue/10 text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
              <HeadsetIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-navy-primary font-semibold">Chat com atendente</p>
              {CENTRAL_URL ? (
                <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                  Use o botão de chat no canto inferior direito. A conversa recebe um protocolo e
                  fica no seu histórico de atendimento.
                </p>
              ) : (
                <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                  O chat não está disponível neste ambiente. Use um dos outros canais.
                </p>
              )}
            </div>
          </div>
          <p className="mt-8">
            <Link
              href="/concursos"
              className="text-navy-primary hover:text-action-blue inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Antes de perguntar, veja o cronograma e os documentos do seu concurso
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-[0.14em]">
            Outros canais
          </h2>
          {channels.length === 0 ? (
            <p className="text-text-secondary mt-4 text-sm">
              Nenhum canal adicional configurado neste ambiente.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {channels.map((c) => (
                <li
                  key={c.title}
                  className="border-border bg-surface shadow-low rounded-xl border p-5"
                >
                  <p className="text-navy-primary font-semibold">{c.title}</p>
                  <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                    {c.description}
                  </p>
                  <a
                    href={c.href}
                    className={buttonClassNames("secondary", "mt-4 w-full")}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {c.cta}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
