'use client';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'Web Development',
    description: 'A modern e-commerce solution with React and Node.js, featuring real-time inventory management and seamless payment integration.',
    image: '/api/placeholder/600/400',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Data Visualization Dashboard',
    category: 'Data Analytics',
    description: 'Interactive dashboard for business analytics with real-time data processing and advanced visualization capabilities.',
    image: '/api/placeholder/600/400',
    tags: ['D3.js', 'Python', 'PostgreSQL', 'React'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Mobile Banking App',
    category: 'Mobile Development',
    description: 'User-friendly mobile banking interface with biometric authentication and advanced security features.',
    image: '/api/placeholder/600/400',
    tags: ['React Native', 'Firebase', 'Node.js'],
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 4,
    title: 'AI Chat Application',
    category: 'AI Integration',
    description: 'Real-time chat app with AI integration, featuring natural language processing and contextual responses.',
    image: '/api/placeholder/600/400',
    tags: ['Next.js', 'OpenAI', 'Socket.io', 'TypeScript'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 5,
    title: 'Portfolio Website',
    category: 'Web Design',
    description: 'Personal portfolio with Three.js animations, featuring interactive 3D elements and smooth scroll experiences.',
    image: '/api/placeholder/600/400',
    tags: ['Next.js', 'Three.js', 'Tailwind', 'Framer Motion'],
    color: 'from-indigo-500 to-purple-500'
  }
];

const categories = ['All', 'Web Development', 'Data Analytics', 'Mobile Development', 'AI Integration', 'Web Design'];

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleProjects, setVisibleProjects] = useState<number[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  useEffect(() => {
    // Animate projects in sequence
    const timer = setTimeout(() => {
      filteredProjects.forEach((_, index) => {
        setTimeout(() => {
          setVisibleProjects(prev => [...prev, index]);
        }, index * 300);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [activeCategory, filteredProjects.length, filteredProjects]);

  return (
    <section id="projects" className="relative w-full min-h-screen bg-white dark:bg-neutral-950 py-20 snap-start overflow-hidden">
      {/* Parallax background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-5"
      >
        <div className="absolute top-10 right-10 w-64 h-64 bg-sky-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-100 rounded-full blur-2xl"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Featured Work
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
            A collection of projects that showcase my passion for creating meaningful digital experiences
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setVisibleProjects([]);
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-sky-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid with Storytelling Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={`${project.id}-${activeCategory}`}
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{
                opacity: visibleProjects.includes(index) ? 1 : 0,
                y: visibleProjects.includes(index) ? 0 : 100,
                scale: visibleProjects.includes(index) ? 1 : 0.8
              }}
              transition={{
                duration: 0.8,
                delay: visibleProjects.includes(index) ? index * 0.2 : 0,
                ease: "easeOut"
              }}
              className="group relative"
            >
              {/* Project Card */}
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <span className="text-4xl">�</span>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-sky-400 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-pulse delay-300"></div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full mb-3">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 text-sky-600 font-medium hover:text-sky-700 transition-colors duration-300"
                  >
                    View Project
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-20"
        >
          <p className="text-gray-600 mb-8 text-lg">
            Interested in working together?
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-sky-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-sky-600"
          >
            Let&apos;s Talk
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
