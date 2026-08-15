import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Check for HTTPS certificates (optional for local dev)
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        https: false,
        open: true,
        allowedHosts: [
          '.ngrok-free.dev',
          '.ngrok.io',
          'localhost',
        ],
      },
      plugins: [react()],
      define: {
        // Legacy support (not needed for Vite, but kept for compatibility)
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
