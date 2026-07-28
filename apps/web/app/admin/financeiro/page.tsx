import Link from "next/link";

const KPIS = [
  { label: "Receita Mensal", value: "R$ 284.500", color: "text-green-700" },
  { label: "Despesas", value: "R$ 142.300", color: "text-red" },
  { label: "Saldo", value: "R$ 142.200", color: "text-ink" },
  { label: "Inadimplência", value: "3,2%", color: "text-yellow" },
];

const TRANSACTIONS = [
  { date: "28/07", desc: "Pagamento - Pref. Curitiba (Concurso 2026)", type: "receita", value: "R$ 45.000" },
  { date: "27/07", desc: "Aluguel gráfica - Impressão de provas", type: "despesa", value: "R$ 12.800" },
  { date: "26/07", desc: "Pagamento - Câmara Goiânia", type: "receita", value: "R$ 32.000" },
  { date: "25/07", desc: "Folha de pagamento - Aplicadores jul/26", type: "despesa", value: "R$ 28.500" },
  { date: "24/07", desc: "Pagamento - Gov. Paraná (2ª parcela)", type: "receita", value: "R$ 67.000" },
];

export default function FinanceiroPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">Financeiro</h2>
          <p className="mt-1 text-sm text-muted">Gestão financeira do Instituto</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/financeiro/contas-pagar" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 transition-all">Contas a Pagar</Link>
          <Link href="/admin/financeiro/contas-receber" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-green/40 transition-all">Contas a Receber</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (<div key={k.label} className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">{k.label}</p><p className={`mt-1 text-xl font-bold ${k.color}`}>{k.value}</p></div>))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-6">
        <h3 className="text-sm font-bold text-ink">Fluxo de Caixa - Julho/2026</h3>
        <div className="mt-4 flex h-40 items-end gap-2">
          {[65, 45, 72, 38, 90, 55, 80].map((h, i) => (<div key={i} className="flex-1 rounded-t bg-green/20" style={{ height: `${h}%` }} />))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
        </div>
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Últimas movimentações</h3>
      <div className="mt-3 space-y-2">
        {TRANSACTIONS.map((t, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${t.type === "receita" ? "text-green-700" : "text-red"}`}>{t.type === "receita" ? "↑" : "↓"}</span>
              <div><p className="text-sm font-medium text-ink">{t.desc}</p><p className="text-xs text-muted">{t.date}/2026</p></div>
            </div>
            <span className={`text-sm font-bold ${t.type === "receita" ? "text-green-700" : "text-red"}`}>{t.type === "receita" ? "+" : "-"}{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
