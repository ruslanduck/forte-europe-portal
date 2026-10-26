import { existsSync } from 'node:fs'
import { defineConfig, loadEnv, mergeConfig, type PluginOption } from 'vite'
import base from './vite.config'

// Local dev only (`npm run dev`). server/ is kept out of the public repo; when present locally,
// it serves real Teamo data. TEAMO_TOKEN has no VITE_ prefix, so it stays on the dev server.
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = []
  if (existsSync('./server/devApi.ts')) {
    const env = loadEnv(mode, process.cwd(), '')
    const { devApi } = await import('./server/devApi')
    plugins.push(devApi(env.TEAMO_TOKEN))
  }
  return mergeConfig(base, { plugins })
})
