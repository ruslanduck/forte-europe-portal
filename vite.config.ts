import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production config (used by Vercel). The private dev backend lives in vite.dev.config.ts,
// so this file never references server/ (which is not in the repo or the Vercel upload).
export default defineConfig({
  // Vercel serves the site from the domain root (vercel.json rewrites every path to index.html).
  base: '/',
  plugins: [react()],
})
