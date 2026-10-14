import { createConsola } from 'consola'
import { defineEventHandler, readBody, createError } from 'h3'

const logger = createConsola().withTag('wpnuxt')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useRuntimeConfig: (event?: any) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useStorage: (base?: string) => any

export default defineEventHandler(async (event) => {
  const body = await readBody<{ secret?: string }>(event)
  const { wpNuxtRevalidateSecret } = useRuntimeConfig(event)

  if (!wpNuxtRevalidateSecret || body?.secret !== wpNuxtRevalidateSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid secret' })
  }

  // Purge Nitro's server cache (works on Node.js/self-hosted).
  // The /api/wpnuxt/query/** route rule caches under nitro:routes with name 'wpnuxt' (see module.ts).
  const purgedPerGroup = await Promise.all(['cache:nitro:routes', 'cache:nitro:handlers'].map(async (base) => {
    const storage = useStorage(base)
    const keys: string[] = await storage.getKeys()
    const wpnuxtKeys = keys.filter(k => k.includes('wpnuxt'))
    await Promise.all(wpnuxtKeys.map(key => storage.removeItem(key)))
    return wpnuxtKeys.length
  }))

  // Purge Vercel CDN cache if running on Vercel
  // Uses the cache tag invalidation API — responses are tagged with 'wpnuxt' via Vercel-Cache-Tag header
  // VERCEL and VERCEL_PROJECT_ID are auto-set by Vercel; VERCEL_TOKEN must be added manually
  let vercelPurged = false
  if (process.env.VERCEL && process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
    try {
      const response = await fetch(`https://api.vercel.com/v1/edge-cache/invalidate-by-tags?projectIdOrName=${process.env.VERCEL_PROJECT_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags: ['wpnuxt'] })
      })
      vercelPurged = response.ok
      if (!response.ok) {
        logger.warn(`Vercel cache purge failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logger.warn('Vercel cache purge request failed:', error)
    }
  }

  const purged = purgedPerGroup.reduce((sum, count) => sum + count, 0)
  logger.info(`Cache revalidated: purged ${purged} Nitro entries${vercelPurged ? ', Vercel CDN cache purged' : ''}`)

  return { success: true, purged, vercelPurged }
})
