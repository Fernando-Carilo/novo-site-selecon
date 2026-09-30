import type { Metadata } from "next";
import { PlaceholderPage } from "../_placeholder";

export const metadata: Metadata = {
  title: "Área do candidato",
  description: "Inscrições, comprovantes, locais de prova, recursos e resultados.",
  robots: { index: false, follow: false },
};

export default function CandidatePage() {
  return (
    <PlaceholderPage
      title="Área do candidato"
      phase="Fase 4"
      currentPath="/candidato"
      description="A experiência unificada com o sistema do candidato (via CandidateProvider) será implementada na Fase 4."
    />
  );
}
