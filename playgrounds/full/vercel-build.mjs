import { execSync } from 'node:child_process'

const isSSG = process.env.VERCEL_SSG === 'true'

console.log(`[vercel-build] Mode: ${isSSG ? 'SSG (static)' : 'Hybrid (SSR)'}`)

const command = isSSG ? 'pnpm run generate' : 'pnpm run build'
console.log(`[vercel-build] Running: ${command}`)

execSync(command, { stdio: 'inherit' })
