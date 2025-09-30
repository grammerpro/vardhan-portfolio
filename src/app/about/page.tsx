import Reveal from "@/components/Reveal";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold mb-2 text-slate-900">About Me</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="text-lg text-slate-700">
          Hello! I&apos;m Vardhan — a passionate full-stack developer with a strong background in building modern web applications. My experience includes working with React, Next.js, Tailwind CSS, Sanity CMS, and more.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-lg text-slate-700">
          I enjoy turning ideas into real-world products and love contributing to clean, scalable, and user-friendly software.
        </p>
      </Reveal>
    </div>
  );
}
