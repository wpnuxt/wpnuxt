import { defineNitroPlugin } from 'nitropack/runtime'

interface SitemapSourcesContext {
  sources: unknown[]
}

// 'sitemap:sources' is only typed when @nuxtjs/sitemap is installed
interface SitemapHooks {
  hook: (name: 'sitemap:sources', handler: (ctx: SitemapSourcesContext) => void) => void
}

// Adds the WordPress URLs to @nuxtjs/sitemap. Only registered when that module is installed (see module.ts).
export default defineNitroPlugin((nitroApp) => {
  (nitroApp.hooks as unknown as SitemapHooks).hook('sitemap:sources', (ctx) => {
    ctx.sources.push('/api/_wpnuxt/sitemap')
  })
})
