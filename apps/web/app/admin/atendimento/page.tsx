import Link from "next/link";

const KPIS = [
  { label: "Total Hoje", value: "142" },
  { label: "Resolvidos", value: "118" },
  { label: "Pendentes", value: "24" },
  { label: "Tempo Médio", value: "4min" },
];

const ATENDIMENTOS = [
  { id: "1", data: "28/07/2026", atendente: "Maria Silva", certame: "Pref. Curitiba", canal: "Telefone", status: "ABERTO" },
  { id: "2", data: "28/07/2026", atendente: "João Santos", certame: "TRF 4ª Região", canal: "E-mail", status: "FECHADO" },
  { id: "3", data: "28/07/2026", atendente: "Ana Costa", certame: "Câmara Goiânia", canal: "WhatsApp", status: "ABERTO" },
  { id: "4", data: "28/07/2026", atendente: "Pedro Lima", certame: "Pref. Curitiba", canal: "Chat", status: "VALIDADO" },
  { id: "5", data: "27/07/2026", atendente: "Maria Silva", certame: "Gov. Paraná", canal: "Telefone", status: "FECHADO" },
];

const statusCls: Record<string, string> = {
  ABERTO: "bg-soft-blue text-blue-700",
  FECHADO: "bg-green-soft text-green-700",
  VALIDADO: "bg-green-soft text-green-700",
};

export default function AtendimentoPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-ink">Atendimento</h2>
        <Link href="/admin/atendimento/novo" className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">Novo Atendimento</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (<div key={k.label} className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">{k.label}</p><p className="mt-1 text-xl font-bold text-ink">{k.value}</p></div>))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted"><tr><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-left">Atendente</th><th className="px-4 py-3 text-left">Certame</th><th className="px-4 py-3 text-left">Canal</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>
            {ATENDIMENTOS.map((a) => (
              <tr key={a.id} className="border-t border-line hover:bg-soft/50">
                <td className="px-4 py-3 text-muted">{a.data}</td>
                <td className="px-4 py-3 font-medium text-ink">{a.atendente}</td>
                <td className="px-4 py-3 text-ink">{a.certame}</td>
                <td className="px-4 py-3 text-muted">{a.canal}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusCls[a.status] ?? "bg-soft text-muted"}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
