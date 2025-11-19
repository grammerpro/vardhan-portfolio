'use client';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'Web Development',
    description: 'A modern e-commerce solution with React and Node.js, featuring real-time inventory management.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    color: 'from-blue-500 to-cyan-500',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 2,
    title: 'Data Viz Dashboard',
    category: 'Data Analytics',
    description: 'Interactive dashboard for business analytics with real-time data processing.',
    tags: ['D3.js', 'Python', 'PostgreSQL'],
    color: 'from-purple-500 to-pink-500',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 3,
    title: 'Mobile Banking App',
    category: 'Mobile Development',
    description: 'User-friendly mobile banking interface with biometric authentication.',
    tags: ['React Native', 'Firebase'],
    color: 'from-green-500 to-teal-500',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 4,
    title: 'AI Chat Application',
    category: 'AI Integration',
    description: 'Real-time chat app with AI integration and natural language processing.',
    tags: ['Next.js', 'OpenAI', 'Socket.io'],
    color: 'from-orange-500 to-red-500',
    span: 'md:col-span-2 md:row-span-1',
  },
  {
    id: 5,
    title: 'Portfolio Website',
    category: 'Web Design',
    description: 'Personal portfolio with Three.js animations and interactive 3D elements.',
    tags: ['Next.js', 'Three.js', 'Tailwind'],
    color: 'from-indigo-500 to-purple-500',
    span: 'md:col-span-1 md:row-span-1',
  }
];

const categories = ['All', 'Web Development', 'Data Analytics', 'Mobile Development', 'AI Integration', 'Web Design'];

function ProjectCard({ project, index }: { project: any, index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={`group relative overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 ${project.span}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />
      
      <div className="flex h-full flex-col justify-between p-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full border border-neutral-200 bg-white/50 px-3 py-1 text-xs font-medium text-neutral-600 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
              {project.category}
            </span>
            <motion.div
              whileHover={{ rotate: 45 }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
          
          <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
            {project.title}
          </h3>
          <p className="max-w-md text-neutral-600 dark:text-neutral-400">
            {project.description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {project.tags.map((tag: string) => (
            <span key={tag} className="text-sm font-medium text-neutral-500 dark:text-neutral-500">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Reveal Image/Gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-neutral-200 to-neutral-100 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-neutral-800 dark:to-neutral-900" />
    </motion.div>
  );
}

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <section id="projects" className="relative w-full bg-white py-32 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-4xl font-bold leading-tight text-neutral-900 dark:text-white md:text-6xl">
              Selected Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              A curated selection of projects that demonstrate my passion for building polished, performance-driven web experiences.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
