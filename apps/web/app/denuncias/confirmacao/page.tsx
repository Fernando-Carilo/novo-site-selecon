import type { Metadata } from "next";
import { Confirmacao } from "@/components/denuncias/Confirmacao";

export const metadata: Metadata = {
  title: "Denúncia registrada",
  robots: { index: false, follow: false },
};

export default function ConfirmacaoPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Confirmacao />
    </section>
  );
}
