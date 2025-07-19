import { getProjects } from '@/lib/queries';
import ProjectsPage from './projectsPage';

export default async function Projects() {
  const projects = await getProjects();
  return <ProjectsPage projects={projects} />;
}
