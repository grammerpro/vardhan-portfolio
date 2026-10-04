import { sanityClient } from './sanity';

export const getProjects = async (options: { signal?: AbortSignal } = {}): Promise<unknown> => {
  const query = `*[_type == "project"] | order(_createdAt desc){
    _id,
    title,
    description,
    github,
    liveDemo,
    technologies,
    image
  }`;

  const projects = await sanityClient.withConfig({ timeout: 1800, maxRetries: 0 }).fetch<unknown>(query, {}, {
    signal: options.signal,
    next: { revalidate: 3600 },
  });
  return projects;
};
