'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const skills = [
  { name: 'React', level: 95, color: 'from-blue-500 to-cyan-500' },
  { name: 'Next.js', level: 90, color: 'from-gray-700 to-gray-900' },
  { name: 'TypeScript', level: 88, color: 'from-blue-600 to-blue-800' },
  { name: 'Node.js', level: 85, color: 'from-green-500 to-green-700' },
  { name: 'Three.js', level: 80, color: 'from-purple-500 to-pink-500' },
  { name: 'Python', level: 82, color: 'from-yellow-500 to-orange-500' }
];

// Default journey shown if resume.json cannot be loaded
const defaultJourney = [
  {
    year: '2020',
    title: 'Started Web Development',
    description: 'Began my journey with HTML, CSS, and JavaScript, building my first interactive websites.'
  },
  {
    year: '2021',
    title: 'Frontend Specialist',
    description: 'Mastered React and modern frontend frameworks, focusing on user experience and performance.'
  },
  {
    year: '2022',
    title: 'Full-Stack Developer',
    description: 'Expanded into backend development with Node.js and database design.'
  },
  {
    year: '2023',
    title: '3D & AI Integration',
    description: 'Incorporated Three.js for 3D experiences and AI APIs for intelligent applications.'
  },
  {
    year: '2024',
    title: 'Senior Developer',
    description: 'Leading projects and mentoring junior developers while pushing the boundaries of web technology.'
  }
];

const tools = [
  { name: 'VS Code', logo: '💻', description: 'Primary IDE' },
  { name: 'Figma', logo: '🎨', description: 'Design & Prototyping' },
  { name: 'GitHub', logo: '🐙', description: 'Version Control' },
  { name: 'Vercel', logo: '▲', description: 'Deployment' }
];

type ResumeExperience = { company?: string; role?: string; period?: string; highlights?: string[] };
type ResumeData = { experience?: ResumeExperience[] };

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Build timeline from resume.json experience
  const [timeline, setTimeline] = useState<Array<{ year: string; title: string; description: string }>>(defaultJourney);

  useEffect(() => {
    let mounted = true;
    const extractStartYear = (period?: string): number | null => {
      if (!period) return null;
      const match = period.match(/(20\d{2}|19\d{2})/); // first year in range
      return match ? parseInt(match[1], 10) : null;
    };
    const load = async () => {
      try {
        const res = await fetch('/data/resume.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load resume.json: ${res.status}`);
        const data: ResumeData = await res.json();
        const exp = Array.isArray(data.experience) ? data.experience : [];
        if (!exp.length) return; // keep default

        const items = exp.map((e) => {
          const start = extractStartYear(e.period);
          const year = start ? String(start) : (e.period || '');
          const title = `${e.role || 'Role'} @ ${e.company || 'Company'}`;
          const description = e.highlights?.[0]
            ? e.highlights[0]
            : (e.period ? `Period: ${e.period}` : '');
          return { year, title, description };
        });

        // Sort ascending by start year (fallback to as-is if missing)
        items.sort((a, b) => {
          const na = parseInt(a.year, 10);
          const nb = parseInt(b.year, 10);
          if (Number.isNaN(na) || Number.isNaN(nb)) return 0;
          return na - nb;
        });

        // Limit to 6 recent entries for layout; otherwise keep all
        const limited = items.slice(Math.max(0, items.length - 6));
        if (mounted) setTimeline(limited);
  } catch {
        // Fallback to defaultJourney silently
        console.warn('AboutSection: resume.json not loaded, using default journey');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative w-full min-h-screen bg-gradient-to-br from-white via-gray-50 to-sky-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 py-20 snap-start overflow-hidden">
      {/* Parallax background elements */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-30"
      >
        <div className="absolute top-20 left-20 w-32 h-32 bg-sky-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-200 rounded-full blur-2xl"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            About Vardhan
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
            Passionate about creating digital experiences that blend creativity, technology, and human-centered design
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Personal Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                I&apos;m Vardhan, a creative developer who believes in the power of technology to solve real-world problems
                and create meaningful connections between people and digital experiences.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                My journey began with a curiosity about how things work on the web, and it has evolved into
                a passion for crafting seamless, interactive experiences that feel both innovative and intuitive.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                When I&apos;m not coding, you&apos;ll find me exploring the latest in AI and machine learning,
                experimenting with 3D graphics, or sharing knowledge with the developer community.
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-neutral-800"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-1">5+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-1">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-1">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Clients</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Skills with Progress Bars */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Core Skills</h3>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
                      className={`h-2 rounded-full bg-gradient-to-r ${skill.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">My Journey</h3>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-sky-400 to-blue-600"></div>

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-sky-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                {/* Content card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="text-sm font-bold text-sky-600 mb-2">{item.year}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tools & Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Tools & Technologies</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {tool.logo}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{tool.name}</h4>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
