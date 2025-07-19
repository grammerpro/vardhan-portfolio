import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'p9p1iil8',       // 👈 Replace this
  dataset: 'production',
  apiVersion: '2024-07-19',           // today's date, or any recent
  useCdn: true,
});
