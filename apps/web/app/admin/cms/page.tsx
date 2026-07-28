const PAGES = [
  { title: "Home", slug: "/", status: "PUBLICADO", updated: "28/07/2026" },
  { title: "Quem Somos", slug: "/institucional", status: "PUBLICADO", updated: "25/07/2026" },
  { title: "Serviços", slug: "/servicos", status: "RASCUNHO", updated: "20/07/2026" },
  { title: "Política de Privacidade", slug: "/privacidade", status: "PUBLICADO", updated: "15/07/2026" },
  { title: "Termos de Uso", slug: "/termos", status: "PUBLICADO", updated: "15/07/2026" },
];

const NEWS = [
  { title: "Selecon lança nova plataforma digital", status: "PUBLICADO", date: "28/07/2026" },
  { title: "Parceria com Governo do Paraná", status: "PUBLICADO", date: "25/07/2026" },
  { title: "Canal de Denúncias ISO 37002", status: "EM REVISÃO", date: "22/07/2026" },
];

const statusCls: Record<string, string> = { PUBLICADO: "bg-green-soft text-green-700", RASCUNHO: "bg-soft text-muted", "EM REVISÃO": "bg-yellow/10 text-yellow" };

export default function AdminCmsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">CMS — Gestão de Conteúdo</h2>
          <p className="mt-1 text-sm text-muted">Gerencie páginas, notícias e mídia do portal público</p>
        </div>
        <button className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-200">
          Nova Página
        </button>
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Páginas</h3>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted"><tr><th className="px-4 py-3 text-left">Título</th><th className="px-4 py-3 text-left">URL</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Atualizado</th></tr></thead>
          <tbody>
            {PAGES.map((p) => (
              <tr key={p.slug} className="border-t border-line hover:bg-soft/50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{p.slug}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusCls[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-muted">{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Notícias</h3>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted"><tr><th className="px-4 py-3 text-left">Título</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Data</th></tr></thead>
          <tbody>
            {NEWS.map((n) => (
              <tr key={n.title} className="border-t border-line hover:bg-soft/50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-ink">{n.title}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusCls[n.status]}`}>{n.status}</span></td>
                <td className="px-4 py-3 text-muted">{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
