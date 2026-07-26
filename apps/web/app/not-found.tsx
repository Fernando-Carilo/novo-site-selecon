import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">Erro 404</p>
      <h1 className="text-navy-primary mt-2 text-3xl font-bold">Página não encontrada</h1>
      <p className="text-text-secondary mt-4">
        O endereço acessado não existe ou foi removido. Verifique a URL ou volte para a home.
      </p>
      <Link href="/" className={`${buttonClassNames("primary")} mt-8 inline-flex`}>
        Voltar para a home
      </Link>
    </section>
  );
}
