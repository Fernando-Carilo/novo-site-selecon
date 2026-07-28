import { HeroSection } from "@/components/home/HeroSection";
import { SearchPanel } from "@/components/home/SearchPanel";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ContestsSection } from "@/components/home/ContestsSection";
import { ClientsSection } from "@/components/home/ClientsSection";
import { ProofSection } from "@/components/home/ProofSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ContactBand } from "@/components/home/ContactBand";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchPanel />
      <ServicesSection />
      <ContestsSection />
      <ClientsSection />
      <ProofSection />
      <NewsSection />
      <ContactBand />
    </>
  );
}
