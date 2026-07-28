import Link from "next/link";

export function ContactBand() {
  return (
    <section
      className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-[92px]"
      aria-label="Fale conosco"
    >
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
          Pronto para transformar seus processos seletivos?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70">
          Entre em contato com nossa equipe e descubra como o Instituto Selecon pode elevar a
          qualidade, segurança e eficiência dos seus concursos.
        </p>
        <Link
          href="/contato"
          className="mt-8 min-h-[44px] px-8 rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
        >
          Falar com a equipe
        </Link>
      </div>
    </section>
  );
}
