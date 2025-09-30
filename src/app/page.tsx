import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ProjectsSection from "@/components/ProjectsSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ResumeAssistant from "@/components/ResumeAssistant";

export default function HomePage() {
  return (
    <main className="w-full snap-y snap-mandatory scroll-smooth">
      <HeroSection />
      <StatsSection />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />

      {/* Resume Assistant Widget */}
      <ResumeAssistant
        config={{
          displayName: 'Vardhan',
          avatarUrl: '/assets/avatar.png',
          position: { bottom: 100, right: 24 },
          theme: 'auto',
          enableVoice: true,
          resumeUrl: '/data/resume.json'
        }}
      />
    </main>
  );
}