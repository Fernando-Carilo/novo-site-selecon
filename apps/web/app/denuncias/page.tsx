import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";

export default function WhistleblowingPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
        Canal de integridade
      </p>
      <h1 className="text-navy-primary mt-2 text-3xl font-bold">Canal de denúncias</h1>
      <p className="text-text-secondary mt-4">
        Relate condutas irregulares de forma sigilosa. Você pode se identificar ou permanecer
        anônimo. Ao final do registro, você recebe um protocolo e um código de acesso — guarde-os
        com cuidado, pois é a única forma de acompanhar o andamento e nenhuma equipe consegue
        recuperá-los depois.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/denuncias/nova" className={buttonClassNames("primary")}>
          Registrar denúncia
        </Link>
        <Link href="/denuncias/consultar" className={buttonClassNames("secondary")}>
          Consultar denúncia
        </Link>
      </div>
    </section>
  );
}
