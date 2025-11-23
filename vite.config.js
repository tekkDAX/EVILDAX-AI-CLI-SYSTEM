
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  
  // To use the Netlify Dev environment, run `netlify dev`.
  // This will proxy requests to your serverless functions automatically.
  server: {
    proxy: {
      '/api': 'http://localhost:8888',
    },
  },
  
  // Vitest configuration is integrated here
  test: {
    environment: 'jsdom',
  },
});
