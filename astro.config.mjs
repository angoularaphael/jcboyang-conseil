import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://jcboyang-conseil.vercel.app',
  output: 'server',
  adapter: vercel(),
});
