"use client";

import { useEffect } from "react";
import { buttonClassNames } from "@selecon/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-institutional-red text-sm font-semibold uppercase tracking-wide">
        Erro inesperado
      </p>
      <h1 className="text-navy-primary mt-2 text-3xl font-bold">Algo deu errado</h1>
      <p className="text-text-secondary mt-4">
        Não foi possível carregar esta página agora. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className={`${buttonClassNames("primary")} mt-8`}
      >
        Tentar novamente
      </button>
    </section>
  );
}
