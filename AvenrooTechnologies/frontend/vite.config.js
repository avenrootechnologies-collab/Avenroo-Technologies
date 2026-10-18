import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBaseUrl = env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || '';

  if (mode === 'production') {
    let apiUrl;

    try {
      apiUrl = new URL(apiBaseUrl);
    } catch {
      throw new Error('Set VITE_API_BASE_URL to the Render API URL before building the production frontend.');
    }

    if (apiUrl.protocol !== 'https:' || !apiUrl.pathname.replace(/\/$/, '').endsWith('/api')) {
      throw new Error('VITE_API_BASE_URL must be an HTTPS Render API URL ending in /api.');
    }
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
})
