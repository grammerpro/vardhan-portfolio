import HeroSection from "@/components/HeroSection";
import PositioningSection from "@/components/PositioningSection";
import ProjectsSection from "@/components/ProjectsSection";
import CapabilitySection from "@/components/CapabilitySection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  // Not a <main>: layout.tsx already provides the single main landmark, and
  // nesting a second one gave the page two.
  return (
    <div className="w-full">
      <HeroSection />
      <PositioningSection />
      <ProjectsSection />
      <CapabilitySection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
