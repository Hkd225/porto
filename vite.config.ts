import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The chat agent runs as a sibling Node process (`npm run chat:dev`,
    // http://localhost:8787) and Vite forwards /api to it — the same
    // shape the deployed Vercel function serves.
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  preview: {
    // `vite preview` serves the built dist/ — without this block the
    // /api proxy only exists in dev, so the phone site (served via
    // preview on 4173) could never reach the agent. Same target.
    proxy: {
      '/api': 'http://localhost:8787',
    },
    // LAN/tunnel access (loca.lt / trycloudflare) sends foreign Host
    // headers; Vite's default host allowlist refuses them with 403.
    allowedHosts: true,
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Keep the animation runtime out of the app chunk so first paint
        // isn't blocked by GSAP + Motion.
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          return undefined;
        },
      },
    },
  },
});