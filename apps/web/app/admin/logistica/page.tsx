import Link from "next/link";

const KPIS = [
  { label: "Concursos Ativos", value: "4", color: "text-blue-700" },
  { label: "Locais de Prova", value: "38", color: "text-ink" },
  { label: "Aplicadores", value: "215", color: "text-green-700" },
  { label: "Materiais Pendentes", value: "12", color: "text-yellow" },
];

const UPCOMING = [
  { date: "02/08/2026", contest: "Pref. Curitiba", location: "UFPR - Campus Centro", status: "CONFIRMADO" },
  { date: "09/08/2026", contest: "TRF 4ª Região", location: "PUC-PR - Campus Toledo", status: "PENDENTE" },
  { date: "16/08/2026", contest: "Câmara Goiânia", location: "UFG - Campus Samambaia", status: "EM PREPARAÇÃO" },
];

const statusCls: Record<string, string> = { CONFIRMADO: "bg-green-soft text-green-700", PENDENTE: "bg-yellow/10 text-yellow", "EM PREPARAÇÃO": "bg-soft-blue text-blue-700" };

export default function LogisticaPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">Logística</h2>
          <p className="mt-1 text-sm text-muted">Planejamento operacional de concursos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/logistica/locais" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 transition-all">Locais</Link>
          <Link href="/admin/logistica/aplicadores" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 transition-all">Aplicadores</Link>
          <Link href="/admin/logistica/materiais" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 transition-all">Materiais</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (<div key={k.label} className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">{k.label}</p><p className={`mt-1 text-xl font-bold ${k.color}`}>{k.value}</p></div>))}
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Próximas aplicações</h3>
      <div className="mt-3 space-y-3">
        {UPCOMING.map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-white p-4">
            <div>
              <p className="text-sm font-bold text-ink">{e.contest}</p>
              <p className="text-xs text-muted">{e.location} — {e.date}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${statusCls[e.status] ?? "bg-soft text-muted"}`}>{e.status}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Alertas</h3>
      <div className="mt-3 space-y-2">
        <div className="rounded-lg border border-yellow/30 bg-yellow/5 p-4 text-sm"><span className="font-semibold text-yellow">⚠️</span> 12 kits de material ainda não confirmados para Pref. Curitiba (02/08)</div>
        <div className="rounded-lg border border-red/30 bg-red/5 p-4 text-sm"><span className="font-semibold text-red">🚨</span> 3 aplicadores sem confirmação de presença para TRF 4ª Região</div>
      </div>
    </div>
  );
}
