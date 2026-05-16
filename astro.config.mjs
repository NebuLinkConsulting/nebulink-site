import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nebulink.co.uk',
  output: 'server',
  adapter: cloudflare(),
});