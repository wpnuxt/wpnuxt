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

  const storage = useStorage('cache:nitro:handlers')
  const keys: string[] = await storage.getKeys()
  const wpnuxtKeys = keys.filter(k => k.includes('wpnuxt'))

  await Promise.all(wpnuxtKeys.map(key => storage.removeItem(key)))

  logger.info(`Cache revalidated: purged ${wpnuxtKeys.length} entries`)

  return { success: true, purged: wpnuxtKeys.length }
})
