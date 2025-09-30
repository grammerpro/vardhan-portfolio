'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import Reveal from '@/components/Reveal';
import { motion, AnimatePresence } from 'framer-motion';


interface Props {
  projects: Project[];
}

export default function ProjectsPage({ projects }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>(['All']);

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const allTags = new Set<string>();
    projects.forEach((project) => {
      project.technologies?.forEach((tech) => allTags.add(tech));
    });

    setTechStacks(['All', ...Array.from(allTags)]);
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    let updatedProjects = [...projects];

    if (activeFilter !== 'All') {
      updatedProjects = updatedProjects.filter((project) =>
        project.technologies?.includes(activeFilter)
      );
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      updatedProjects = updatedProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(updatedProjects);
  }, [activeFilter, searchQuery, projects]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Reveal>
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Projects</h1>
      </Reveal>

      {/* 🔍 Search Bar */}
      <Reveal>
        <div className="mb-4">
          <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </Reveal>

      {/* 🧩 Filter Buttons */}
      <Reveal>
        <div className="flex flex-wrap gap-2 mb-8">
          {techStacks.map((tech) => (
            <button
            key={tech}
            onClick={() => setActiveFilter(tech)}
            className={`px-4 py-2 rounded-full border transition ${
              activeFilter === tech
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-100 text-slate-700 hover:bg-sky-100 border-slate-200'
            }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </Reveal>

      {/* 🧱 Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <AnimatePresence>
    {filteredProjects.map((project) => (
      <motion.div
        key={project._id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <ProjectCard project={project} />
      </motion.div>
    ))}
  </AnimatePresence>
</div>

    </div>
  );
}
