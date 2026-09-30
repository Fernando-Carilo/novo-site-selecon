"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

interface NavLinkProps extends ComponentProps<typeof Link> {
  href: string;
  activeClassName?: string;
}

/**
 * Link de navegação com estado ativo (`aria-current="page"`) — a rota atual é comunicada
 * também para leitores de tela, não apenas por cor (seção 5.4).
 */
export function NavLink({ href, className = "", activeClassName = "", ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[className, isActive ? activeClassName : ""].join(" ").trim()}
      {...props}
    />
  );
}
