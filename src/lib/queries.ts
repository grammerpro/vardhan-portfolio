import { sanityClient } from './sanity';

export const getProjects = async () => {
  const query = `*[_type == "project"] | order(_createdAt desc){
    _id,
    title,
    description,
    github,
    liveDemo,
    technologies,
    image
  }`;

  const projects = await sanityClient.fetch(query);
  return projects;
};
