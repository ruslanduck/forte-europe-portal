import { existsSync } from 'node:fs'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command, mode }) => {
  const plugins: PluginOption[] = [react()]

  // server/ is kept out of the public repo; when present locally, it serves real Teamo data in dev.
  if (command === 'serve' && existsSync('./server/devApi.ts')) {
    // TEAMO_TOKEN has no VITE_ prefix, so it stays on the dev server and is never bundled.
    const env = loadEnv(mode, process.cwd(), '')
    const { devApi } = await import('./server/devApi')
    plugins.push(devApi(env.TEAMO_TOKEN))
  }

  return {
    // GitHub Pages serves the site from /forte-europe-portal/.
    base: command === 'build' ? '/forte-europe-portal/' : '/',
    plugins,
  }
})
