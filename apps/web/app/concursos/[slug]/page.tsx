import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ContestDetail } from "@selecon/contracts";
import { fetchApiOrNull } from "@/lib/api-server";

const STATUS_LABEL: Record<ContestDetail["status"], string> = {
  DRAFT: "Rascunho",
  IN_REVIEW: "Em revisão",
  SCHEDULED: "Publicação agendada",
  PUBLISHED: "Inscrições / vigente",
  SUSPENDED: "Suspenso",
  CLOSED: "Encerrado",
  ARCHIVED: "Arquivado",
};

async function getContest(slug: string): Promise<ContestDetail | null> {
  return fetchApiOrNull<ContestDetail>(`/public/contests/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const contest = await getContest(slug);
  if (!contest) return { title: "Concurso não encontrado | Instituto Selecon" };
  return {
    title: `${contest.title} | Instituto Selecon`,
    description: contest.shortDescription,
    openGraph: { title: contest.title, description: contest.shortDescription },
  };
}

export default async function ContestDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contest = await getContest(slug);
  if (!contest) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
        {contest.organization}
      </p>
      <h1 className="text-navy-primary mt-1 text-3xl font-bold">{contest.title}</h1>
      <p
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
          contest.status === "PUBLISHED"
            ? "bg-success-green/10 text-success-green"
            : "bg-institutional-red/10 text-institutional-red"
        }`}
      >
        {STATUS_LABEL[contest.status]}
      </p>

      <p className="text-text-primary mt-6 text-lg">{contest.shortDescription}</p>

      <dl className="border-border mt-8 grid gap-6 border-t pt-6 sm:grid-cols-3">
        <div>
          <dt className="text-text-secondary text-sm">Vagas</dt>
          <dd className="text-xl font-semibold">{contest.vacancies ?? "A definir"}</dd>
        </div>
        <div>
          <dt className="text-text-secondary text-sm">Escolaridade</dt>
          <dd className="text-xl font-semibold">{contest.educationLevel ?? "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-text-secondary text-sm">Data da prova</dt>
          <dd className="text-xl font-semibold">
            {contest.examDate
              ? new Date(contest.examDate).toLocaleDateString("pt-BR")
              : "A definir"}
          </dd>
        </div>
      </dl>

      {contest.positions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-navy-primary text-xl font-semibold">Cargos e vagas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <caption className="sr-only">Cargos, vagas e requisitos do concurso</caption>
              <thead>
                <tr className="border-border border-b">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Cargo
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Vagas
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Requisitos
                  </th>
                </tr>
              </thead>
              <tbody>
                {contest.positions.map((position) => (
                  <tr key={position.id} className="border-border border-b">
                    <td className="py-2 pr-4">{position.title}</td>
                    <td className="py-2 pr-4">{position.vacancies}</td>
                    <td className="py-2">{position.requirements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {contest.faqs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-navy-primary text-xl font-semibold">Perguntas frequentes</h2>
          <dl className="mt-4 space-y-4">
            {contest.faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="font-semibold">{faq.question}</dt>
                <dd className="text-text-secondary mt-1">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}
