import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | Instituto Selecon",
  description:
    "Entre em contato com o Instituto Selecon. Telefone, e-mail, endereço e formulário de contato.",
};

const CONTACT_INFO = [
  {
    label: "Telefone",
    value: "(24) 3344-5566",
    icon: "📞",
  },
  {
    label: "E-mail",
    value: "contato@institutoselecon.org.br",
    icon: "✉️",
  },
  {
    label: "Endereço",
    value: "Volta Redonda - RJ, Brasil",
    icon: "📍",
  },
  {
    label: "Horário",
    value: "Seg a Sex, 8h às 18h",
    icon: "🕐",
  },
];

export default function ContatoPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-[92px]"
        aria-label="Contato"
      >
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">
            Contato
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Fale Conosco
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Estamos prontos para atender sua demanda. Entre em contato por telefone, e-mail ou
            preencha o formulário abaixo.
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="contact-form-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Info */}
            <div>
              <h2
                id="contact-form-heading"
                className="text-2xl font-extrabold text-ink sm:text-3xl"
              >
                Informações de contato
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Nossa equipe está disponível para esclarecer dúvidas, receber sugestões ou
                atender demandas de órgãos públicos interessados em nossos serviços.
              </p>

              <div className="mt-8 space-y-4">
                {CONTACT_INFO.map((info) => (
                  <div
                    key={info.label}
                    className="flex items-start gap-3 rounded-lg border border-line p-4"
                  >
                    <span className="text-xl" role="img" aria-hidden="true">
                      {info.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {info.label}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-ink">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div
                className="mt-8 flex h-48 items-center justify-center rounded-lg border border-line bg-soft"
                role="img"
                aria-label="Mapa com a localização do Instituto Selecon"
              >
                <p className="text-sm text-muted">Mapa — em breve</p>
              </div>
            </div>

            {/* Form */}
            <div>
              <h3 className="text-lg font-extrabold text-ink">Envie sua mensagem</h3>
              <p className="mt-2 text-sm text-muted">
                Preencha os campos abaixo e retornaremos em até 2 dias úteis.
              </p>

              <form
                className="mt-6 space-y-4"
                aria-label="Formulário de contato"
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Nome completo
                  </label>
                  <input
                    id="contact-name"
                    name="nome"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    E-mail
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Assunto
                  </label>
                  <input
                    id="contact-subject"
                    name="assunto"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                    placeholder="Assunto da mensagem"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="contact-message"
                    name="mensagem"
                    rows={5}
                    required
                    className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                    placeholder="Escreva sua mensagem..."
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
                >
                  Enviar mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
