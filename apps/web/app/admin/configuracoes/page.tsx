const USERS = [
  { name: "Fernando Carilo", email: "fernando@selecon.org.br", role: "ADMIN", active: true },
  { name: "Maria Silva", email: "maria@selecon.org.br", role: "SUPERVISOR", active: true },
  { name: "João Santos", email: "joao@selecon.org.br", role: "ATENDENTE", active: true },
  { name: "Ana Costa", email: "ana@selecon.org.br", role: "ATENDENTE", active: true },
  { name: "Pedro Lima", email: "pedro@selecon.org.br", role: "CONSULTA", active: false },
];

const roleCls: Record<string, string> = {
  ADMIN: "bg-red/10 text-red",
  SUPERVISOR: "bg-yellow/10 text-yellow",
  ATENDENTE: "bg-soft-blue text-blue-700",
  CONSULTA: "bg-soft text-muted",
};

export default function AdminConfigPage() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-ink">Configurações</h2>
      <p className="mt-1 text-sm text-muted">Usuários, perfis, permissões e configurações do sistema</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Sistema</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li className="flex justify-between"><span>Versão</span><span className="font-mono text-xs text-muted">0.1.0-beta</span></li>
            <li className="flex justify-between"><span>Ambiente</span><span className="rounded-full bg-yellow/10 px-2 py-0.5 text-[11px] font-semibold text-yellow">DEV</span></li>
            <li className="flex justify-between"><span>Node.js</span><span className="text-xs text-muted">v22.x</span></li>
            <li className="flex justify-between"><span>Database</span><span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-700">CONECTADO</span></li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Segurança</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li className="flex justify-between"><span>Sessões ativas</span><span className="font-bold">3</span></li>
            <li className="flex justify-between"><span>2FA</span><span className="text-xs text-muted">Não habilitado</span></li>
            <li className="flex justify-between"><span>Último backup</span><span className="text-xs text-muted">Hoje, 03:00</span></li>
            <li className="flex justify-between"><span>Audit log</span><span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-700">ATIVO</span></li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Integrações</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li className="flex justify-between"><span>E-mail (Graph API)</span><span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-700">OK</span></li>
            <li className="flex justify-between"><span>WhatsApp</span><span className="rounded-full bg-yellow/10 px-2 py-0.5 text-[11px] font-semibold text-yellow">PENDENTE</span></li>
            <li className="flex justify-between"><span>S3 (Anexos)</span><span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-700">OK</span></li>
            <li className="flex justify-between"><span>OpenAI (Chat IA)</span><span className="text-xs text-muted">Não configurado</span></li>
          </ul>
        </div>
      </div>

      <h3 className="mt-8 text-lg font-bold text-ink">Usuários</h3>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-soft text-xs font-semibold uppercase text-muted"><tr><th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-left">E-mail</th><th className="px-4 py-3 text-left">Perfil</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.email} className="border-t border-line hover:bg-soft/50">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${roleCls[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3">{u.active ? <span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-700">ATIVO</span> : <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-muted">INATIVO</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
