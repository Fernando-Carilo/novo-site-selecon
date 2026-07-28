const REPORTS = [
  { protocol: "SC-2026-483920", status: "TRIAGE", category: "Fraude em concurso", priority: "CRITICAL", date: "28/07/2026" },
  { protocol: "SC-2026-291047", status: "INVESTIGATING", category: "Assédio moral", priority: "HIGH", date: "27/07/2026" },
  { protocol: "SC-2026-158302", status: "RECEIVED", category: "Irregularidade", priority: "NORMAL", date: "26/07/2026" },
  { protocol: "SC-2026-094817", status: "CONCLUDED_SUBSTANTIATED", category: "Corrupção", priority: "HIGH", date: "25/07/2026" },
  { protocol: "SC-2026-073621", status: "WAITING_REPORTER", category: "Desvio de conduta", priority: "NORMAL", date: "24/07/2026" },
];

const priorityCls: Record<string, string> = { CRITICAL: "bg-red/10 text-red", HIGH: "bg-yellow/10 text-yellow", NORMAL: "bg-soft text-muted" };
const statusCls: Record<string, string> = { RECEIVED: "bg-soft-blue text-blue-700", TRIAGE: "bg-yellow/10 text-yellow", INVESTIGATING: "bg-soft-blue text-blue-700", WAITING_REPORTER: "bg-yellow/10 text-yellow", CONCLUDED_SUBSTANTIATED: "bg-green-soft text-green-700" };

export default function AdminDenunciasPage() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-ink">Canal de Denúncias — Painel</h2>
      <p className="mt-1 text-sm text-muted">Gestão de casos recebidos pelo canal de integridade</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Pendentes</p><p className="mt-1 text-xl font-bold text-ink">5</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Em investigação</p><p className="mt-1 text-xl font-bold text-blue-700">3</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Críticas</p><p className="mt-1 text-xl font-bold text-red">1</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Concluídas (mês)</p><p className="mt-1 text-xl font-bold text-green-700">12</p></div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted"><tr><th className="px-4 py-3 text-left">Protocolo</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Categoria</th><th className="px-4 py-3 text-left">Prioridade</th><th className="px-4 py-3 text-left">Data</th></tr></thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.protocol} className="border-t border-line hover:bg-soft/50 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs font-bold text-ink">{r.protocol}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusCls[r.status] ?? "bg-soft text-muted"}`}>{r.status.replace(/_/g, " ")}</span></td>
                <td className="px-4 py-3 text-ink">{r.category}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${priorityCls[r.priority]}`}>{r.priority}</span></td>
                <td className="px-4 py-3 text-muted">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
