"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { buttonClassNames } from "@selecon/ui";
import { ArrowRightIcon, BrandMark, CloseIcon, MenuIcon } from "@/components/icons";
import { CANDIDATE_AREA, NAV_ITEMS } from "@/components/navigation";

/**
 * Menu mobile acessível (seção 9.1) construído sobre `<dialog>` nativo: `showModal()`
 * entrega foco preso, `Esc` para fechar e árvore inerte fora do menu sem JS adicional.
 * Fecha automaticamente ao navegar e ao clicar no backdrop.
 */
export function MobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const unlockScroll = () => document.body.classList.remove("overflow-hidden");
    dialog.addEventListener("close", unlockScroll);
    return () => {
      dialog.removeEventListener("close", unlockScroll);
      unlockScroll();
    };
  }, []);

  const open = () => {
    document.body.classList.add("overflow-hidden");
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="text-navy-primary hover:bg-navy-primary/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors md:hidden"
      >
        <MenuIcon className="h-6 w-6" title="Abrir menu de navegação" />
      </button>

      <dialog
        ref={dialogRef}
        onClick={closeOnBackdrop}
        aria-label="Menu de navegação"
        className="bg-surface text-text-primary shadow-high backdrop:bg-navy-primary/60 m-0 ml-auto h-dvh max-h-none w-full max-w-[20rem] border-0 p-0 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5" onClick={close}>
              <BrandMark className="h-8 w-8" />
              <span className="text-navy-primary text-sm font-bold">Instituto Selecon</span>
            </Link>
            <button
              type="button"
              onClick={close}
              className="text-navy-primary hover:bg-navy-primary/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors"
            >
              <CloseIcon className="h-6 w-6" title="Fechar menu" />
            </button>
          </div>

          <nav aria-label="Navegação principal (mobile)" className="flex-1 overflow-y-auto p-4">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "group flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors",
                        isActive
                          ? "bg-action-blue/10 text-navy-primary"
                          : "hover:bg-background-light",
                      ].join(" ")}
                    >
                      <span>
                        <span className="text-navy-primary block text-base font-semibold">
                          {item.label}
                        </span>
                        <span className="text-text-secondary block text-sm">
                          {item.description}
                        </span>
                      </span>
                      <ArrowRightIcon className="text-text-secondary group-hover:text-action-blue h-5 w-5 shrink-0 transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-border border-t p-4">
            <Link
              href={CANDIDATE_AREA.href}
              className={buttonClassNames("primary", "w-full", "lg")}
              onClick={close}
            >
              {CANDIDATE_AREA.label}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
