import type { Metadata } from "next";
import { Consulta } from "@/components/denuncias/Consulta";

export const metadata: Metadata = {
  title: "Consultar denúncia",
  description: "Acompanhe sua denúncia pelo protocolo e código de acesso.",
  robots: { index: false, follow: false },
};

export default function ConsultarPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
        Canal de denúncias
      </p>
      <h1 className="text-navy-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Consultar denúncia
      </h1>
      <p className="text-text-secondary mt-4 text-base leading-relaxed">
        Informe o protocolo e o código de acesso recebidos no registro. Após algumas tentativas
        erradas, o protocolo fica temporariamente bloqueado.
      </p>
      <Consulta />
    </section>
  );
}
