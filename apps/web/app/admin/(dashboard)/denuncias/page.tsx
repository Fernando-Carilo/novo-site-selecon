"use client";

import { useState } from "react";
import Link from "next/link";

const MOCK_REPORTS = [
  {
    id: "1",
    protocol: "DEN-20250115-A3B",
    status: "em análise",
    category: "Fraude em Concurso",
    priority: "alta",
    date: "15/01/2025",
  },
  {
    id: "2",
    protocol: "DEN-20250114-C7D",
    status: "recebida",
    category: "Assédio Moral",
    priority: "urgente",
    date: "14/01/2025",
  },
  {
    id: "3",
    protocol: "DEN-20250113-E1F",
    status: "decidida",
    category: "Desvio de Conduta",
    priority: "média",
    date: "13/01/2025",
  },
  {
    id: "4",
    protocol: "DEN-20250112-G9H",
    status: "em análise",
    category: "Irregularidade Processo Seletivo",
    priority: "alta",
    date: "12/01/2025",
  },
  {
    id: "5",
    protocol: "DEN-20250110-I2J",
    status: "encerrada",
    category: "Discriminação",
    priority: "média",
    date: "10/01/2025",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    recebida: "bg-yellow/10 text-yellow",
    "em análise": "bg-soft-blue text-blue-700",
    decidida: "bg-green-soft text-green-700",
    encerrada: "bg-soft text-muted",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${styles[status] ?? "bg-soft text-muted"}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    urgente: "bg-red/10 text-red",
    alta: "bg-yellow/10 text-yellow",
    média: "bg-soft-blue text-blue-700",
    baixa: "bg-soft text-muted",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${styles[priority] ?? "bg-soft text-muted"}`}
    >
      {priority}
    </span>
  );
}

export default function AdminDenunciasPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = MOCK_REPORTS.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  return (
    <section>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Denúncias</h1>
        <p className="mt-1 text-sm text-muted">
          Gestão do canal de denúncias. Todo acesso é auditado.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="recebida">Recebida</option>
          <option value="em análise">Em análise</option>
          <option value="decidida">Decidida</option>
          <option value="encerrada">Encerrada</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          aria-label="Filtrar por prioridade"
        >
          <option value="">Todas as prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="média">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          <option value="Fraude em Concurso">Fraude em Concurso</option>
          <option value="Assédio Moral">Assédio Moral</option>
          <option value="Desvio de Conduta">Desvio de Conduta</option>
          <option value="Irregularidade Processo Seletivo">Irregularidade Proc. Seletivo</option>
          <option value="Discriminação">Discriminação</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <caption className="sr-only">Fila de denúncias</caption>
          <thead>
            <tr className="border-b border-line bg-soft">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Protocolo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Categoria
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Prioridade
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Data
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id} className="border-b border-line last:border-0 hover:bg-soft/50">
                <td className="px-4 py-3 font-mono text-xs text-ink">{report.protocol}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3 text-ink">{report.category}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={report.priority} />
                </td>
                <td className="px-4 py-3 text-ink">{report.date}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/denuncias/${report.protocol}`}
                    className="text-sm font-semibold text-green hover:text-green-700 transition-colors"
                  >
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  Nenhuma denúncia encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
