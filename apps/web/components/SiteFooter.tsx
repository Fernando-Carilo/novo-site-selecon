import Link from "next/link";
import { Container, Icon } from "@selecon/ui";
import { BrandLogo } from "@/components/BrandLogo";
import { INSTITUTION } from "@/lib/content/data/institution";
import { FOOTER_COLUMNS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-navy-primary text-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <BrandLogo variant="dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
            {INSTITUTION.legalName}. {INSTITUTION.legalNature}, CNPJ {INSTITUTION.cnpj}.
          </p>
          <address className="mt-5 space-y-2 text-sm not-italic text-white/90">
            <p className="flex gap-2">
              <Icon name="map-pin" size={18} className="text-support-cyan mt-0.5" />
              <span>
                {INSTITUTION.address.street} — {INSTITUTION.address.district}
                <br />
                {INSTITUTION.address.city}/{INSTITUTION.address.uf}, CEP {INSTITUTION.address.zip}
              </span>
            </p>
            <p className="flex gap-2">
              <Icon name="phone" size={18} className="text-support-cyan mt-0.5" />
              <a href={INSTITUTION.phoneHref} className="underline-offset-4 hover:underline">
                {INSTITUTION.phone}
              </a>
            </p>
            <p className="flex gap-2">
              <Icon name="mail" size={18} className="text-support-cyan mt-0.5" />
              <a
                href={`mailto:${INSTITUTION.emails.faleConosco}`}
                className="break-all underline-offset-4 hover:underline"
              >
                {INSTITUTION.emails.faleConosco}
              </a>
            </p>
          </address>
          <ul className="mt-5 flex gap-3" aria-label="Redes sociais">
            <li>
              <a
                href={INSTITUTION.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-3 text-sm font-medium hover:bg-white/10"
              >
                Instagram
                <Icon name="external-link" size={14} label="abre em nova aba" />
              </a>
            </li>
            <li>
              <a
                href={INSTITUTION.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-3 text-sm font-medium hover:bg-white/10"
              >
                Facebook
                <Icon name="external-link" size={14} label="abre em nova aba" />
              </a>
            </li>
          </ul>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-support-cyan text-sm font-bold uppercase tracking-wide">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="focus-visible:ring-support-cyan inline-block py-0.5 text-sm text-white/85 underline-offset-4 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-3 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {INSTITUTION.legalName}. Todos os direitos reservados.
          </p>
          <p>
            Publicações oficiais de concursos são divulgadas exclusivamente neste portal e nos
            sistemas de inscrição do Instituto.
          </p>
        </Container>
      </div>
    </footer>
  );
}
