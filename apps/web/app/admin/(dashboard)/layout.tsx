import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";
import { AdminMobileNav } from "./admin-mobile-nav";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Command Center" },
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/noticias", label: "Notícias" },
  { href: "/admin/concursos", label: "Concursos" },
  { href: "/admin/atendimento", label: "Atendimento" },
  { href: "/admin/denuncias", label: "Canal de denúncias" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/perfis", label: "Perfis e permissões" },
  { href: "/admin/auditoria", label: "Auditoria" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/trocar-senha");

  return (
    <div className="flex min-h-screen">
      <aside className="bg-navy-primary hidden w-64 flex-col p-6 text-white md:flex">
        <p className="text-lg font-bold">Selecon Admin</p>
        <nav className="mt-8" aria-label="Navegação administrativa">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-visible:ring-support-cyan block rounded-md px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="border-border bg-navy-primary md:bg-surface relative flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <AdminMobileNav items={NAV_ITEMS} />
            <p className="md:text-text-primary text-sm text-white">
              <span className="font-semibold">{user.displayName}</span>{" "}
              <span className="md:text-text-secondary text-white/70">
                ({user.roles.join(", ")})
              </span>
            </p>
          </div>
          <LogoutButton />
        </header>
        <main id="main-content" className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
