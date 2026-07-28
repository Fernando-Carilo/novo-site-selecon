const CLIENTS = [
  { name: "Prefeitura de Volta Redonda", type: "Prefeitura" },
  { name: "Câmara Municipal de Resende", type: "Câmara" },
  { name: "Prefeitura de Barra Mansa", type: "Prefeitura" },
  { name: "SAAE Volta Redonda", type: "Autarquia" },
  { name: "Prefeitura de Pinheiral", type: "Prefeitura" },
  { name: "Câmara Municipal de Itatiaia", type: "Câmara" },
  { name: "Prefeitura de Porto Real", type: "Prefeitura" },
  { name: "Universidade Federal Fluminense", type: "Universidade" },
];

export function ClientsSection() {
  return (
    <section className="bg-soft py-16 sm:py-[92px]" aria-labelledby="clients-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Quem confia em nós
        </p>
        <h2
          id="clients-heading"
          className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
        >
          Órgãos que confiam no Instituto Selecon
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Prefeituras, câmaras municipais, autarquias e instituições de ensino em todo o
          estado do Rio de Janeiro e além.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CLIENTS.map((client) => (
            <article
              key={client.name}
              className="flex flex-col items-center justify-center rounded-lg border border-line bg-white p-5 text-center transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {client.type}
              </span>
              <p className="mt-2 text-sm font-bold text-ink">{client.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
