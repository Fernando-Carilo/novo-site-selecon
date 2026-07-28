import Link from "next/link";

const KPIS = [
  { label: "Concursos Ativos", value: "17", color: "text-blue-700" },
  { label: "Atendimentos Hoje", value: "142", color: "text-green-700" },
  { label: "Denúncias Pendentes", value: "5", color: "text-yellow" },
  { label: "Receita do Mês", value: "R$ 84.500", color: "text-ink" },
];

const QUICK_ACTIONS = [
  { href: "/admin/atendimento", label: "Novo Atendimento" },
  { href: "/admin/concursos", label: "Gerenciar Concursos" },
  { href: "/admin/financeiro", label: "Ver Financeiro" },
  { href: "/admin/logistica", label: "Planejamento Logístico" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-ink">Dashboard</h2>
      <p className="mt-1 text-sm text-muted">Visão geral do sistema</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{kpi.label}</p>
            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 text-lg font-bold text-ink">Ações rápidas</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 hover:shadow-sm transition-all">
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
