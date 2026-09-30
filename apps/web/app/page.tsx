import { Hero } from "@/components/home/Hero";
import { PhaseNotice } from "@/components/home/PhaseNotice";
import { Shortcuts } from "@/components/home/Shortcuts";

/**
 * Home — seção 9.2. Nesta fase entrega os itens 1 (hero com busca), 2 (atalhos) e 5
 * (jornada do candidato, no painel do hero). Concursos em destaque, publicações, campanhas,
 * notícias e parceiros dependem de CMS/catálogo (Fases 2 e 3) e não são simulados aqui.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Shortcuts />
      <PhaseNotice />
    </>
  );
}
