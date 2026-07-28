import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canal de Denúncias | Instituto Selecon",
  description: "Canal seguro para relatar irregularidades em concursos e processos seletivos.",
};

const TRUST = [
  { icon: "🔒", title: "Segurança", text: "Infraestrutura dedicada com trilha de auditoria completa." },
  { icon: "🤫", title: "Confidencialidade", text: "Somente a equipe autorizada da ouvidoria acessa os relatos." },
  { icon: "👤", title: "Anonimato", text: "Você decide se se identifica. Denúncias anônimas não registram dados pessoais." },
  { icon: "📋", title: "Acompanhamento", text: "Protocolo e código de acesso para consultar o andamento a qualquer momento." },
];

const STEPS = [
  { n: "1", title: "Registre o relato", text: "Descreva o ocorrido com detalhes. Escolha se identifica ou permanece anônimo." },
  { n: "2", title: "Receba seu protocolo", text: "Geramos um protocolo e código de acesso exclusivos — só você tem." },
  { n: "3", title: "Acompanhe", text: "Consulte o andamento, envie informações adicionais e receba respostas da equipe." },
  { n: "4", title: "Conclusão", text: "A ouvidoria analisa, investiga e comunica o resultado pelo canal seguro." },
];

export default function DenunciasPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-[92px]" aria-label="Canal de Denúncias">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">Canal de Denúncias</p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Relate com segurança
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Canal independente e seguro para relato de irregularidades em concursos, processos seletivos ou condutas contrárias à ética no Instituto Selecon.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/denuncias/nova" className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">
              Fazer uma denúncia
            </Link>
            <Link href="/denuncias/consultar" className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-white/10 text-white border border-white/25 hover:bg-white/20 transition-all duration-base">
              Consultar denúncia
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="trust-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <h2 id="trust-heading" className="text-2xl font-extrabold text-ink sm:text-3xl">Garantias do canal</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="rounded-lg border border-line bg-white p-5">
                <span className="text-2xl">{t.icon}</span>
                <h3 className="mt-3 text-sm font-bold text-ink">{t.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft py-16 sm:py-[92px]" aria-labelledby="steps-heading">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <h2 id="steps-heading" className="text-2xl font-extrabold text-ink sm:text-3xl">Como funciona</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-lg border border-line bg-white p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-soft text-sm font-black text-green-700">{s.n}</span>
                <h3 className="mt-3 text-sm font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
