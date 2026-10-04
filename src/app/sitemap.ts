import { MetadataRoute } from 'next';
import { projects } from '@/content/portfolio';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vardhansudo.me';
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...projects.map(project => ({ url: `${baseUrl}/work/${project.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
