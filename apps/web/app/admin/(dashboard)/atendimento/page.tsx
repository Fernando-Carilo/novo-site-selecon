import Link from "next/link";

const SUMMARY_CARDS = [
  { label: "Total Hoje", value: "34" },
  { label: "Resolvidos", value: "28" },
  { label: "Pendentes", value: "6" },
  { label: "Tempo Médio", value: "2h 15min" },
];

const MOCK_ATTENDANCES = [
  {
    id: "1",
    date: "15/01/2025",
    attendant: "Maria Silva",
    contest: "Pref. Volta Redonda",
    channel: "Telefone",
    status: "resolvido",
  },
  {
    id: "2",
    date: "15/01/2025",
    attendant: "João Santos",
    contest: "SAAE Barra Mansa",
    channel: "WhatsApp",
    status: "pendente",
  },
  {
    id: "3",
    date: "15/01/2025",
    attendant: "Ana Costa",
    contest: "Câmara Resende",
    channel: "E-mail",
    status: "resolvido",
  },
  {
    id: "4",
    date: "15/01/2025",
    attendant: "Maria Silva",
    contest: "Pref. Angra dos Reis",
    channel: "Chat",
    status: "em andamento",
  },
  {
    id: "5",
    date: "14/01/2025",
    attendant: "João Santos",
    contest: "Pref. Volta Redonda",
    channel: "Telefone",
    status: "resolvido",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    resolvido: "bg-green-soft text-green-700",
    "em andamento": "bg-soft-blue text-blue-700",
    pendente: "bg-yellow/10 text-yellow",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${styles[status] ?? "bg-soft text-muted"}`}
    >
      {status}
    </span>
  );
}

export default function AtendimentoPage() {
  return (
    <section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Atendimento</h1>
          <p className="mt-1 text-sm text-muted">Gerenciamento de atendimentos ao público.</p>
        </div>
        <Link
          href="/admin/atendimento/novo"
          className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
        >
          Novo Atendimento
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-line bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <caption className="sr-only">Atendimentos recentes</caption>
          <thead>
            <tr className="border-b border-line bg-soft">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Data
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Atendente
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Certame
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Canal
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ATTENDANCES.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0 hover:bg-soft/50">
                <td className="px-4 py-3 text-ink">{item.date}</td>
                <td className="px-4 py-3 text-ink">{item.attendant}</td>
                <td className="px-4 py-3 text-ink">{item.contest}</td>
                <td className="px-4 py-3 text-ink">{item.channel}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
