import { FeaturedContests } from "@/components/home/FeaturedContests";
import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { Shortcuts } from "@/components/home/Shortcuts";

/**
 * Home — hero com busca, concursos em destaque e últimas notícias (ambos vindos da
 * Selecon Central; as seções só aparecem quando há conteúdo publicado) e atalhos.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedContests />
      <Shortcuts />
      <LatestNews />
    </>
  );
}
