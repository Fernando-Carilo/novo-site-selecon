const PROOFS = [
  {
    number: "50+",
    title: "Órgãos atendidos",
    description: "Prefeituras, câmaras, autarquias e tribunais em todo o Brasil.",
  },
  {
    number: "1.2M",
    title: "Candidatos",
    description: "Inscritos processados desde a fundação com zero indisponibilidade.",
  },
  {
    number: "180+",
    title: "Municípios",
    description: "Cobertura nacional com operação presencial em todas as regiões.",
  },
  {
    number: "265",
    title: "Cases",
    description: "Processos seletivos entregues com excelência operacional comprovada.",
  },
];

export function ProofSection() {
  return (
    <section className="bg-soft py-16 sm:py-[92px]" aria-labelledby="proof-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Resultados
        </p>
        <h2 id="proof-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Provas de confiança
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
          {PROOFS.map((proof) => (
            <article
              key={proof.title}
              className="rounded-lg border border-line bg-white p-6 text-center transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
            >
              <p className="text-3xl font-extrabold text-ink">{proof.number}</p>
              <h3 className="mt-2 text-sm font-bold text-ink">{proof.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{proof.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
