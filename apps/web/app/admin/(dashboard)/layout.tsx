import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Command Center" },
  { href: "/admin/concursos", label: "Concursos" },
  { href: "/admin/atendimento", label: "Atendimento" },
  { href: "/admin/denuncias", label: "Canal de denúncias" },
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
        <header className="border-border bg-surface flex items-center justify-between border-b px-6 py-4">
          <p className="text-sm">
            <span className="font-semibold">{user.displayName}</span>{" "}
            <span className="text-text-secondary">({user.roles.join(", ")})</span>
          </p>
          <LogoutButton />
        </header>
        <main id="main-content" className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
