"use client";

/**
 * Boundary de último recurso — captura erros no próprio layout raiz (fora do alcance
 * de app/error.tsx). Precisa renderizar <html>/<body> porque substitui o layout inteiro.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <section
          style={{
            maxWidth: 32 + "rem",
            margin: "0 auto",
            padding: "6rem 1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Algo deu errado</h1>
          <p style={{ marginTop: "1rem", color: "#4b5563" }}>
            Não foi possível carregar o portal agora. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "2rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#1d4ed8",
              color: "#fff",
            }}
          >
            Tentar novamente
          </button>
        </section>
      </body>
    </html>
  );
}
