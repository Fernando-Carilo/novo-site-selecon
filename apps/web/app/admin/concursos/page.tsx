import Link from "next/link";

const CONTESTS = [
  { id: "1", title: "Prefeitura de Curitiba — Técnico Administrativo", status: "PUBLICADO", vagas: 120, inscritos: 3420, date: "15/08/2026" },
  { id: "2", title: "TRF 4ª Região — Analista Judiciário", status: "INSCRIÇÕES ABERTAS", vagas: 35, inscritos: 890, date: "22/08/2026" },
  { id: "3", title: "Câmara Municipal de Goiânia — Assessor Jurídico", status: "EM ANDAMENTO", vagas: 8, inscritos: 215, date: "10/08/2026" },
  { id: "4", title: "Governo do Paraná — Agente de Saúde", status: "RESULTADO", vagas: 450, inscritos: 8700, date: "02/08/2026" },
  { id: "5", title: "Prefeitura de Barra Mansa — Diversos cargos", status: "RASCUNHO", vagas: 65, inscritos: 0, date: "—" },
];

const statusCls: Record<string, string> = {
  PUBLICADO: "bg-green-soft text-green-700",
  "INSCRIÇÕES ABERTAS": "bg-green-soft text-green-700",
  "EM ANDAMENTO": "bg-soft-blue text-blue-700",
  RESULTADO: "bg-soft-blue text-blue-700",
  RASCUNHO: "bg-soft text-muted",
};

export default function AdminConcursosPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">Gestão de Concursos</h2>
          <p className="mt-1 text-sm text-muted">Cadastre, edite e acompanhe todos os processos seletivos</p>
        </div>
        <button className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-200">
          Novo Concurso
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Ativos</p><p className="mt-1 text-xl font-bold text-blue-700">4</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Inscrições Abertas</p><p className="mt-1 text-xl font-bold text-green-700">2</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Total Inscritos</p><p className="mt-1 text-xl font-bold text-ink">13.225</p></div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-muted">Encerrados (2026)</p><p className="mt-1 text-xl font-bold text-muted">12</p></div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted">
            <tr><th className="px-4 py-3 text-left">Concurso</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Vagas</th><th className="px-4 py-3 text-right">Inscritos</th><th className="px-4 py-3 text-right">Prova</th></tr>
          </thead>
          <tbody>
            {CONTESTS.map((c) => (
              <tr key={c.id} className="border-t border-line hover:bg-soft/50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-ink">{c.title}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusCls[c.status] ?? "bg-soft text-muted"}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-right text-ink">{c.vagas}</td>
                <td className="px-4 py-3 text-right text-muted">{c.inscritos.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-right text-muted">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
