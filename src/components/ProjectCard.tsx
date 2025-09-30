"use client";
import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';
import { Project } from '@/types';
import Magnetic from './Magnetic';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      {project.image && (
        <Image
          src={urlFor(project.image).url()}
          alt={project.title}
          width={400}
          height={300}
          className="rounded-md"
        />
      )}

      <h2 className="text-xl font-semibold mt-2 text-slate-900">{project.title}</h2>
      <p className="text-sm text-slate-600">{project.description}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {project.technologies?.map((tech) => {
  const colorMap: { [key: string]: string } = {
    React: 'bg-blue-100 text-blue-800',
    Vue: 'bg-green-100 text-green-800',
    HTML: 'bg-orange-100 text-orange-800',
    CSS: 'bg-indigo-100 text-indigo-800',
    JS: 'bg-yellow-100 text-yellow-800',
    Node: 'bg-lime-100 text-lime-800',
    TypeScript: 'bg-sky-100 text-sky-800',
    Vardhantech: 'bg-purple-100 text-purple-800',
  };

  const tagStyle =
    'px-2 py-1 text-xs rounded-full font-medium mr-1 mb-1 ' +
    (colorMap[tech] || 'bg-gray-100 text-gray-800');

  return (
    <span key={tech} className={tagStyle}>
      {tech}
    </span>
  );
})}

      </div>

      <div className="mt-4 space-x-4">
        <Magnetic strength={12}>
          <a href={project.github} className="inline-block text-sky-700 hover:text-sky-900">GitHub</a>
        </Magnetic>
        <Magnetic strength={12}>
          <a href={project.liveDemo} className="inline-block text-sky-700 hover:text-sky-900">Live Demo</a>
        </Magnetic>
      </div>
    </div>
  );
}
