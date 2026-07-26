import Link from "next/link";
import { cookies } from "next/headers";
import type { ContestSummary } from "@selecon/contracts";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

async function getAdminContests(): Promise<ContestSummary[]> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_INTERNAL_URL}/admin/contests`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!response.ok) return [];
  return response.json();
}

export default async function AdminHomePage() {
  const contests = await getAdminContests();
  const byStatus = contests.reduce<Record<string, number>>((acc, contest) => {
    acc[contest.status] = (acc[contest.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section>
      <h1 className="text-navy-primary text-2xl font-bold">Command Center</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Visão geral do portal. Cada card abre a fila filtrada correspondente.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/concursos"
          className="border-border bg-surface hover:border-action-blue block rounded-lg border p-5"
        >
          <p className="text-text-secondary text-sm">Concursos publicados</p>
          <p className="text-navy-primary mt-1 text-3xl font-bold">{byStatus.PUBLISHED ?? 0}</p>
        </Link>
        <Link
          href="/admin/concursos?status=DRAFT"
          className="border-border bg-surface hover:border-action-blue block rounded-lg border p-5"
        >
          <p className="text-text-secondary text-sm">Rascunhos</p>
          <p className="text-navy-primary mt-1 text-3xl font-bold">{byStatus.DRAFT ?? 0}</p>
        </Link>
        <Link
          href="/admin/concursos?status=IN_REVIEW"
          className="border-border bg-surface hover:border-action-blue block rounded-lg border p-5"
        >
          <p className="text-text-secondary text-sm">Em revisão</p>
          <p className="text-navy-primary mt-1 text-3xl font-bold">{byStatus.IN_REVIEW ?? 0}</p>
        </Link>
        <Link
          href="/admin/concursos?status=SUSPENDED"
          className="border-border bg-surface hover:border-action-blue block rounded-lg border p-5"
        >
          <p className="text-text-secondary text-sm">Suspensos</p>
          <p className="text-navy-primary mt-1 text-3xl font-bold">{byStatus.SUSPENDED ?? 0}</p>
        </Link>
      </div>
    </section>
  );
}
