import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";

export default function ServicePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-navy-primary text-3xl font-bold">Central de atendimento</h1>
      <p className="text-text-secondary mt-4">
        Abra uma solicitação e acompanhe o andamento pelo número de protocolo, sem precisar criar
        conta.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/atendimento/novo" className={buttonClassNames("primary")}>
          Abrir solicitação
        </Link>
        <Link href="/atendimento/consultar" className={buttonClassNames("secondary")}>
          Consultar protocolo
        </Link>
      </div>
    </section>
  );
}
