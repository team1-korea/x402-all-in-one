import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 40212, allowedHosts: ['quest.abcfe.net'] },
  preview: { port: 40212, host: true },
});
