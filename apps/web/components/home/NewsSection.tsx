import Link from "next/link";

const FEATURE_ARTICLE = {
  badge: "Destaque",
  title: "Instituto Selecon lança plataforma de nova geração com IA integrada",
  description:
    "A nova versão do sistema operacional traz assistente inteligente com RAG, painel unificado e experiência redesenhada para candidatos e gestores.",
  href: "/noticias/lancamento-plataforma-v2",
};

const STACK_ARTICLES = [
  {
    badge: "Institucional",
    title: "Parceria com Governo do Paraná amplia capacidade operacional",
    href: "/noticias/parceria-parana",
  },
  {
    badge: "Tecnologia",
    title: "Infraestrutura migra para containers com deploy contínuo",
    href: "/noticias/infraestrutura-containers",
  },
  {
    badge: "Compliance",
    title: "Canal de Denúncias atinge conformidade ISO 37002",
    href: "/noticias/compliance-iso-37002",
  },
];

export function NewsSection() {
  return (
    <section className="py-16 sm:py-[92px]" aria-labelledby="news-heading">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
        <p className="text-[13px] font-black uppercase tracking-wider text-green-700">
          Informação
        </p>
        <h2 id="news-heading" className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Publicações
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Feature */}
          <article className="group rounded-lg border border-line bg-white p-6 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md sm:p-8">
            <span className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-black uppercase text-green-700">
              {FEATURE_ARTICLE.badge}
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink sm:text-xl">
              {FEATURE_ARTICLE.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {FEATURE_ARTICLE.description}
            </p>
            <Link
              href={FEATURE_ARTICLE.href}
              className="mt-4 inline-flex text-sm font-bold text-green-700 transition-colors hover:text-green"
            >
              Ler publicação →
            </Link>
          </article>

          {/* Stack */}
          <div className="flex flex-col gap-4">
            {STACK_ARTICLES.map((article) => (
              <article
                key={article.title}
                className="group flex-1 rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
              >
                <span className="rounded-full bg-soft-blue px-2.5 py-1 text-xs font-black uppercase text-blue-700">
                  {article.badge}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{article.title}</h3>
                <Link
                  href={article.href}
                  className="mt-2 inline-flex text-xs font-bold text-green-700 transition-colors hover:text-green"
                >
                  Ler mais →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
