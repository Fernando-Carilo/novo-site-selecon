"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { NewsPostDetail, NewsPostSummary } from "@selecon/contracts";
import { buttonClassNames } from "@selecon/ui";
import { apiFetch, ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<NewsPostSummary["status"], string> = {
  DRAFT: "Rascunho",
  IN_REVIEW: "Em revisão",
  PUBLISHED: "Publicado",
  UNPUBLISHED: "Despublicado",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsPostSummary[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsPostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setNews(await apiFetch<NewsPostSummary[]>("/admin/content/news"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar notícias");
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function openNews(id: string) {
    setError(null);
    try {
      setSelectedNews(await apiFetch<NewsPostDetail>(`/admin/content/news/${id}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao abrir notícia");
    }
  }

  async function handleCreateNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await apiFetch("/admin/content/news", {
        method: "POST",
        body: JSON.stringify({
          slug: form.get("slug"),
          title: form.get("title"),
          body: form.get("body"),
        }),
      });
      setShowNewForm(false);
      // `event.currentTarget` é anulado pelo React assim que o handler assíncrono
      // sofre um `await` — captura-se o elemento antes para poder resetar o form.
      formElement.reset();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao criar notícia");
    }
  }

  async function runNewsAction(action: string) {
    if (!selectedNews) return;
    setError(null);
    try {
      await apiFetch(`/admin/content/news/${selectedNews.id}/${action}`, {
        method: "POST",
        body: "{}",
      });
      setSelectedNews(await apiFetch<NewsPostDetail>(`/admin/content/news/${selectedNews.id}`));
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao executar ação");
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-navy-primary text-2xl font-bold">Notícias</h1>
        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className={buttonClassNames("primary")}
        >
          {showNewForm ? "Cancelar" : "Nova notícia"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="bg-institutional-red/10 text-institutional-red mt-4 rounded-md p-3 text-sm"
        >
          {error}
        </p>
      )}

      {showNewForm && (
        <form
          onSubmit={handleCreateNews}
          className="border-border bg-surface mt-4 space-y-3 rounded-lg border p-4"
        >
          <div>
            <label htmlFor="news-slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="news-slug"
              name="slug"
              required
              placeholder="instituto-selecon-lanca-novo-portal"
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="news-title" className="text-sm font-medium">
              Título
            </label>
            <input
              id="news-title"
              name="title"
              required
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="news-body" className="text-sm font-medium">
              Conteúdo
            </label>
            <textarea
              id="news-body"
              name="body"
              required
              rows={6}
              className="border-border mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className={buttonClassNames("primary")}>
            Criar notícia (rascunho)
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <caption className="sr-only">Notícias</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Título
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {news.map((post) => (
                <tr
                  key={post.id}
                  className={`border-border hover:bg-background-light cursor-pointer border-b ${selectedNews?.id === post.id ? "bg-background-light" : ""}`}
                  onClick={() => openNews(post.id)}
                >
                  <td className="py-2 pr-4">{post.title}</td>
                  <td className="py-2">{STATUS_LABEL[post.status]}</td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-text-secondary py-6 text-center">
                    Nenhuma notícia cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedNews && (
          <div className="border-border bg-surface rounded-lg border p-5">
            <h2 className="text-navy-primary text-lg font-semibold">{selectedNews.title}</h2>
            <p className="bg-background-light mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium">
              {STATUS_LABEL[selectedNews.status]}
            </p>
            <p className="text-text-secondary mt-3 whitespace-pre-wrap text-sm">
              {selectedNews.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {selectedNews.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => runNewsAction("submit-for-review")}
                  className={buttonClassNames("secondary")}
                >
                  Enviar para revisão
                </button>
              )}
              {(selectedNews.status === "DRAFT" || selectedNews.status === "IN_REVIEW") && (
                <button
                  type="button"
                  onClick={() => runNewsAction("publish")}
                  className={buttonClassNames("primary")}
                >
                  Publicar
                </button>
              )}
              {selectedNews.status === "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => runNewsAction("unpublish")}
                  className={buttonClassNames("secondary")}
                >
                  Despublicar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
