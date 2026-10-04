import Link from 'next/link';
import Journey from '@/components/portfolio/Journey';
import FeaturedWork from '@/components/portfolio/FeaturedWork';
import CapabilityExhibit from '@/components/portfolio/CapabilityExhibit';
import PortfolioFooter from '@/components/portfolio/PortfolioFooter';
import { AssemblyInspector } from '@/components/experience/ExperienceBoundary';
import ContactSection from '@/components/ContactSection';
import FitCheck from '@/components/FitCheck';

export default function HomePage() {
  return <div className="portfolio-home">
    <Journey />
    <section id="hero" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-kicker"><span className="signal-dot" />Inside the system <span className="kicker-divider">/</span> Portfolio</p>
        <h1 id="hero-title">Vardhan<span className="name-period">.</span></h1>
        <p className="hero-role">Full stack engineer.<br /><span>Systems with depth.</span></p>
        <p className="hero-description">Enterprise platforms. Interactive interfaces.<br className="desktop-break" /> A curiosity for what happens beneath the surface.</p>
        <div className="hero-actions"><a className="button button-primary" href="#work">Explore work <span aria-hidden="true">↘</span></a><Link className="action-link" href="/resume">View résumé <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="hero-object-caption" aria-hidden="true"><span className="caption-cross">＋</span><div>V / ASSEMBLY STUDY<br /><span>Form follows the system.</span></div><span className="caption-line" /></div>
      <div className="hero-bottom"><a href="#unfold" className="scroll-cue"><span className="scroll-icon" aria-hidden="true">↓</span><span>Scroll to enter</span></a><p className="hero-location">Cincinnati, Ohio <span aria-hidden="true">↗</span><span className="location-note">Working at the intersection of design & engineering</span></p><span className="chapter-counter"><strong>01</strong> / 06</span></div>
    </section>

    <section id="unfold" className="unfold section-shell dark-section" aria-labelledby="unfold-title">
      <span id="positioning" className="anchor-alias" />
      <div className="unfold-copy"><p className="eyebrow"><span className="section-number">02</span> Beneath the surface</p><h2 id="unfold-title">Good interfaces<br />have something<br /><em>behind them.</em></h2><p>I build the parts you see, and the systems that make them work. From content architecture to the last interaction, the details belong together.</p><a className="action-link" href="#work">Step inside the work <span aria-hidden="true">↘</span></a></div>
      <AssemblyInspector />
      <div className="unfold-footer"><span>One assembly. Many ways of thinking.</span><span aria-hidden="true">DESIGN ↔ ENGINEERING</span></div>
    </section>

    <FeaturedWork />
    <section id="capability" className="capability-section section-shell dark-section" aria-labelledby="capability-title">
      <div className="section-intro"><p className="eyebrow"><span className="section-number">04</span> Connected thinking</p><div><h2 id="capability-title">The whole system.<br /><span className="muted">Not just the surface.</span></h2><p>Four connected areas of practice. Select a part to see the work and decisions behind it.</p></div></div>
      <CapabilityExhibit />
    </section>

    <section id="about" className="about-section section-shell" aria-labelledby="about-title">
      <div className="about-top"><p className="eyebrow"><span className="section-number">05</span> The person behind it</p><span className="about-location">BASED IN CINCINNATI, OHIO</span></div>
      <div className="about-grid"><h2 id="about-title">An engineer.<br />Always a<br /><em>work in progress.</em></h2><div className="about-prose"><p className="about-lead">I like knowing how things fit together.</p><p>I’m a full stack engineer with five years of experience, most of it on enterprise content platforms. Adobe Experience Manager, React and TypeScript at the front; Java Spring Boot and Node services behind it.</p><p>I’ve worked on platforms for a national telecom carrier, a mortgage finance agency, a global insurer, and a university. My independent projects leave room to explore retrieval, browser interaction, and new ways to build.</p><p>I have a master’s in information technology from the University of Cincinnati. I’m open to full-time work.</p><Link className="action-link" href="/resume">The experience, in detail <span aria-hidden="true">↗</span></Link></div></div>
      <div className="experience-list" aria-label="Selected experience"><div><span className="eyebrow">Enterprise content</span><p>AEM & authoring systems</p><span>Telecom · Finance · Insurance</span></div><div><span className="eyebrow">Full stack delivery</span><p>Interfaces to infrastructure</p><span>React · Java · Node · AWS</span></div><div><span className="eyebrow">Independent practice</span><p>Room for experiments</p><span>Retrieval · Browser tools · Graphics</span></div></div>
      <details className="recruiter-utility" id="recruiter-tools"><summary><div><span className="eyebrow">For hiring teams</span><h3>A role in mind?</h3></div><span>Open fit check <span aria-hidden="true">＋</span></span></summary><FitCheck /></details>
    </section>
    <ContactSection />
    <PortfolioFooter />
  </div>;
}
