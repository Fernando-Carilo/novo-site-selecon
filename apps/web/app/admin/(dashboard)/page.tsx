import Link from "next/link";

const KPI_CARDS = [
  { label: "Concursos Ativos", value: "12", href: "/admin/concursos" },
  { label: "Atendimentos Hoje", value: "34", href: "/admin/atendimento" },
  { label: "Denúncias Pendentes", value: "7", href: "/admin/denuncias" },
  { label: "Receita do Mês", value: "R$ 2,4M", href: "/admin/financeiro" },
];

const QUICK_ACTIONS = [
  { label: "Novo Concurso", href: "/admin/concursos" },
  { label: "Novo Atendimento", href: "/admin/atendimento/novo" },
  { label: "Ver Denúncias", href: "/admin/denuncias" },
  { label: "Relatório Financeiro", href: "/admin/financeiro" },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    action: "Concurso publicado",
    detail: "Prefeitura de Volta Redonda - Edital 001/2025",
    time: "Há 2 horas",
  },
  {
    id: "2",
    action: "Atendimento encerrado",
    detail: "Protocolo ATD-20250115-001",
    time: "Há 3 horas",
  },
  {
    id: "3",
    action: "Nova denúncia recebida",
    detail: "Protocolo DEN-20250115-A3B",
    time: "Há 5 horas",
  },
  {
    id: "4",
    action: "Pagamento confirmado",
    detail: "Nota fiscal #1234 - Gráfica Express",
    time: "Há 6 horas",
  },
];

export default function AdminDashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Bem-vindo ao painel administrativo.</p>

      {/* KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-lg border border-line bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{kpi.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted">
          Ações rápidas
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-soft transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted">
          Atividade recente
        </h2>
        <div className="mt-3 rounded-lg border border-line bg-white shadow-sm">
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-5 py-3 ${
                i < RECENT_ACTIVITY.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-ink">{item.action}</p>
                <p className="text-xs text-muted">{item.detail}</p>
              </div>
              <p className="text-xs text-muted whitespace-nowrap">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
