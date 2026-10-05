import Link from "next/link";
import { Container } from "@selecon/ui";

/**
 * Banners da home governados na Selecon Central (Site público → Banners).
 * Lidos de /v1/portal/banners?position=HOME_HERO. Sem banners no ar, nada é
 * renderizado — nunca um espaço vazio.
 */
export interface PortalBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageDesktopUrl: string;
  imageMobileUrl: string | null;
  link: string | null;
  linkLabel: string | null;
  bgColor: string | null;
}

export async function fetchBanners(
  position: "HOME_HERO" | "HOME_FAIXA" | "ATENDIMENTO",
): Promise<PortalBanner[]> {
  const base = process.env.CENTRAL_SERVICOS_API_URL;
  if (process.env.CONTENT_SOURCE !== "central" || !base) return [];
  try {
    const res = await fetch(`${base}/v1/portal/banners?position=${position}`, {
      headers: {
        Accept: "application/json",
        ...(process.env.CENTRAL_SERVICOS_API_TOKEN
          ? { Authorization: `Bearer ${process.env.CENTRAL_SERVICOS_API_TOKEN}` }
          : {}),
      },
      next: { revalidate: Number(process.env.CENTRAL_SERVICOS_REVALIDATE_SECONDS ?? 60) },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: PortalBanner[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

function BannerFigure({ banner }: { banner: PortalBanner }) {
  const picture = (
    <picture>
      {banner.imageMobileUrl ? (
        <source media="(max-width: 640px)" srcSet={banner.imageMobileUrl} />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- origem configurada na Central (S3/CloudFront), sem domínio fixo */}
      <img
        src={banner.imageDesktopUrl}
        alt={banner.title ?? ""}
        className="mx-auto block h-auto w-full max-w-[1600px] object-cover"
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
  const isInternal = banner.link?.startsWith("/");
  const body = (
    <figure
      className="border-border shadow-low relative overflow-hidden rounded-lg border"
      style={{ backgroundColor: banner.bgColor ?? undefined }}
    >
      {picture}
      {banner.title || banner.subtitle ? (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white sm:p-6">
          {banner.title ? (
            <span className="block text-lg font-bold sm:text-2xl">{banner.title}</span>
          ) : null}
          {banner.subtitle ? (
            <span className="mt-1 block text-sm text-white/85 sm:text-base">{banner.subtitle}</span>
          ) : null}
          {banner.link && banner.linkLabel ? (
            <span className="mt-3 inline-flex min-h-10 items-center rounded-md bg-white/95 px-4 text-sm font-semibold text-[#071B3D]">
              {banner.linkLabel}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
  if (!banner.link) return body;
  return isInternal ? (
    <Link
      href={banner.link}
      className="focus-visible:ring-action-blue block rounded-lg focus-visible:outline-none focus-visible:ring-[3px]"
      aria-label={banner.title ?? banner.linkLabel ?? "Abrir campanha"}
    >
      {body}
    </Link>
  ) : (
    <a
      href={banner.link}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:ring-action-blue block rounded-lg focus-visible:outline-none focus-visible:ring-[3px]"
      aria-label={`${banner.title ?? banner.linkLabel ?? "Abrir campanha"} (abre em nova aba)`}
    >
      {body}
    </a>
  );
}

export function HomeBanners({
  banners,
  label = "Campanhas e avisos",
}: {
  banners: PortalBanner[];
  label?: string;
}) {
  if (!banners.length) return null;
  return (
    <section className="py-8" aria-label={label}>
      <Container>
        <ul className="grid gap-4">
          {banners.map((b) => (
            <li key={b.id}>
              <BannerFigure banner={b} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
