import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  // Ensure the base path uses a clean relative track to your markdown folder
  loader: glob({ pattern: '*.md', base: "src/content/insights" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tag: z.string(),
    excerpt: z.string(),
  }),
});

export const collections = { insights };