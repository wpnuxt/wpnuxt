import { execSync } from 'node:child_process'

const isSSG = process.env.VERCEL_SSG === 'true'

console.log(`[vercel-build] Mode: ${isSSG ? 'SSG (static)' : 'Hybrid (SSR)'}`)

// Build WPNuxt modules first (required for monorepo)
const moduleBuildCommands = [
  'pnpm --filter @wpnuxt/core build',
  'pnpm --filter @wpnuxt/auth build',
  'pnpm --filter @wpnuxt/blocks build'
]

for (const cmd of moduleBuildCommands) {
  console.log(`[vercel-build] Running: ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// Run the playground build/generate
const command = isSSG ? 'pnpm run generate' : 'pnpm run build'
console.log(`[vercel-build] Running: ${command}`)

execSync(command, { stdio: 'inherit' })
