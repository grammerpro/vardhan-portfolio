import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './sanity';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
