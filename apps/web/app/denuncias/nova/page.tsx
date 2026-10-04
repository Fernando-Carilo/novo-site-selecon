import type { Metadata } from "next";
import { DenunciaForm } from "@/components/denuncias/DenunciaForm";

export const metadata: Metadata = {
  title: "Registrar denúncia",
  description: "Registre uma denúncia com sigilo. Você recebe um protocolo e um código de acesso para acompanhar.",
  robots: { index: false, follow: false },
};

export default function NovaDenunciaPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">Canal de denúncias</p>
      <h1 className="text-navy-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Registrar uma denúncia
      </h1>
      <p className="text-text-secondary mt-4 text-base leading-relaxed">
        Preencha o que souber. Nenhum campo pede CPF; a identificação é opcional. Ao final, guarde o
        protocolo e o código de acesso — eles são a única forma de acompanhar a denúncia.
      </p>
      <DenunciaForm />
    </section>
  );
}
