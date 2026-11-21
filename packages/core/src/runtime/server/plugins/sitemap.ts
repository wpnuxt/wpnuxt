interface SitemapSourcesContext {
  sources: unknown[]
}

interface NitroAppWithHooks {
  hooks: { hook: (name: string, handler: (ctx: SitemapSourcesContext) => void) => void }
}

declare const defineNitroPlugin: (plugin: (nitroApp: NitroAppWithHooks) => void) => unknown

// Adds the WordPress URLs to @nuxtjs/sitemap. Only registered when that module is installed (see module.ts).
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:sources', (ctx) => {
    ctx.sources.push('/api/_wpnuxt/sitemap')
  })
})
