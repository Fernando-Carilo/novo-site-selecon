import { HeroSection } from "@/components/home/HeroSection";
import { SearchPanel } from "@/components/home/SearchPanel";
import { ProfilesSection } from "@/components/home/ProfilesSection";
import { ContestsSection } from "@/components/home/ContestsSection";
import { SystemSection } from "@/components/home/SystemSection";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { ProofSection } from "@/components/home/ProofSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ContactBand } from "@/components/home/ContactBand";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchPanel />
      <ProfilesSection />
      <ContestsSection />
      <SystemSection />
      <ArchitectureSection />
      <ProofSection />
      <NewsSection />
      <ContactBand />
    </>
  );
}
