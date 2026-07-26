import Link from "next/link";
import { cookies } from "next/headers";
import type { AdminDashboardStats } from "@selecon/contracts";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

async function getStats(): Promise<AdminDashboardStats | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_INTERNAL_URL}/admin/dashboard/stats`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

function StatCard({ href, label, value }: { href: string; label: string; value: number | string }) {
  return (
    <Link
      href={href}
      className="border-border bg-surface hover:border-action-blue block rounded-lg border p-5"
    >
      <p className="text-text-secondary text-sm">{label}</p>
      <p className="text-navy-primary mt-1 text-3xl font-bold">{value}</p>
    </Link>
  );
}

export default async function AdminHomePage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <section>
        <h1 className="text-navy-primary text-2xl font-bold">Command Center</h1>
        <p className="text-institutional-red mt-4 text-sm">
          Não foi possível carregar as métricas do dashboard agora.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Command Center</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Visão geral do portal, calculada em tempo real a partir do banco. Cada card abre a fila
        filtrada correspondente.
      </p>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Concursos
      </h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard href="/admin/concursos" label="Publicados" value={stats.contests.active} />
        <StatCard
          href="/admin/concursos?status=DRAFT"
          label="Em rascunho"
          value={stats.contests.draft}
        />
        <StatCard
          href="/admin/concursos?status=CLOSED"
          label="Encerrados"
          value={stats.contests.closed}
        />
      </div>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Atendimento
      </h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard href="/admin/atendimento" label="Abertos" value={stats.tickets.open} />
        <StatCard
          href="/admin/atendimento"
          label={`Atrasados (> 48h)`}
          value={stats.tickets.overdueOpen}
        />
        <StatCard
          href="/admin/atendimento"
          label="Tempo médio de resolução (30d)"
          value={
            stats.tickets.averageResolutionHours !== null
              ? `${stats.tickets.averageResolutionHours.toFixed(1)}h`
              : "—"
          }
        />
      </div>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Denúncias e anúncios
      </h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/denuncias"
          label="Denúncias recebidas"
          value={stats.whistleblowing.received}
        />
        <StatCard
          href="/admin/denuncias"
          label="Em análise"
          value={stats.whistleblowing.underAnalysis}
        />
        <StatCard
          href="/admin/anuncios"
          label="Campanhas ativas"
          value={stats.advertising.activeCampaigns}
        />
        <StatCard
          href="/admin/anuncios"
          label="Em revisão"
          value={stats.advertising.pendingReview}
        />
      </div>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Conteúdo pendente
      </h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <StatCard
          href="/admin/conteudo"
          label="Páginas pendentes"
          value={stats.content.pendingPages}
        />
        <StatCard
          href="/admin/conteudo"
          label="Notícias pendentes"
          value={stats.content.pendingNews}
        />
      </div>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Status das integrações
      </h2>
      <div className="border-border bg-surface mt-2 rounded-lg border p-4">
        <ul className="flex flex-wrap gap-3 text-sm">
          {stats.integrations.map((integration) => (
            <li key={integration.name} className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${integration.mode === "real" ? "bg-success-green" : "bg-amber-500"}`}
              />
              {integration.name} — {integration.mode === "real" ? "real" : "simulado (mock)"}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-navy-primary mt-6 text-sm font-semibold uppercase tracking-wide">
        Últimas ações de auditoria
      </h2>
      <div className="border-border bg-surface mt-2 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <caption className="sr-only">Últimas ações de auditoria</caption>
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="p-3 font-semibold">
                Ação
              </th>
              <th scope="col" className="p-3 font-semibold">
                Recurso
              </th>
              <th scope="col" className="p-3 font-semibold">
                Quando
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.recentAuditEvents.map((event) => (
              <tr key={event.id} className="border-border border-b last:border-0">
                <td className="p-3">{event.action}</td>
                <td className="p-3">{event.resourceType}</td>
                <td className="p-3">{new Date(event.occurredAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {stats.recentAuditEvents.length === 0 && (
              <tr>
                <td colSpan={3} className="text-text-secondary p-4 text-center">
                  Nenhuma ação registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Link
        href="/admin/auditoria"
        className="text-action-blue mt-2 inline-block text-sm hover:underline"
      >
        Ver trilha de auditoria completa →
      </Link>
    </section>
  );
}
