import Link from "next/link";
import { formatDate, type NewsSummary } from "@/lib/central";
import { ArrowRightIcon } from "@/components/icons";

export function NewsCard({
  post,
  headingLevel = "h3",
}: {
  post: NewsSummary;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const date = formatDate(post.publishedAt, { day: "2-digit", month: "long", year: "numeric" });
  return (
    <article className="border-border bg-surface shadow-low hover:shadow-medium duration-base focus-within:ring-action-blue group relative flex h-full flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] ease-out focus-within:ring-[3px] focus-within:ring-offset-2 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- origem externa (Central/S3), sem domínio fixo para next/image
        <img src={post.coverUrl} alt="" className="h-44 w-full object-cover" loading="lazy" />
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {post.categoryName ? (
            <span className="bg-action-blue/10 text-action-blue rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wide">
              {post.categoryName}
            </span>
          ) : null}
          {date ? <time dateTime={post.publishedAt ?? undefined}>{date}</time> : null}
          {post.contest ? <span>· {post.contest.name}</span> : null}
        </div>
        <Heading className="text-navy-primary mt-3 text-lg font-semibold leading-snug">
          <Link
            href={`/noticias/${post.slug}`}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </Heading>
        {post.summary ? (
          <p className="text-text-secondary mt-2 flex-1 text-sm leading-relaxed">{post.summary}</p>
        ) : (
          <span className="flex-1" />
        )}
        <span
          aria-hidden="true"
          className="text-action-blue mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
        >
          Ler notícia
          <ArrowRightIcon className="duration-base h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
        </span>
      </div>
    </article>
  );
}
