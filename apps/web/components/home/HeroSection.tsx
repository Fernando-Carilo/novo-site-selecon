import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"
      aria-label="Apresentação do Instituto Selecon"
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

      {/* Abstract decorative circles */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-green/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-3xl" />

      <div className="w-[min(1200px,calc(100%-40px))] mx-auto flex min-h-[540px] flex-col items-center justify-center py-20 text-center lg:py-[92px]">
        <p className="text-[13px] font-black uppercase tracking-wider text-green">
          Instituto Selecon
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-[3.5rem]">
          Excelência em processos seletivos e concursos públicos
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
          Transparência, segurança e inovação na organização e execução de concursos públicos,
          processos seletivos e avaliações educacionais para órgãos públicos em todo o Brasil.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/concursos"
            className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
          >
            Ver concursos abertos
          </Link>
          <Link
            href="/institucional"
            className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-white/10 text-white border border-white/25 backdrop-blur-md hover:bg-white/20 transition-all duration-base"
          >
            Conheça o Instituto
          </Link>
          <Link
            href="/contato"
            className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white transition-all duration-base"
          >
            Fale conosco
          </Link>
        </div>
      </div>
    </section>
  );
}
