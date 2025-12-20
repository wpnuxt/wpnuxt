import { defineNuxtModule, createResolver, addComponentsDir } from '@nuxt/kit'

export interface WPNuxtBlocksConfig {
  prefix?: string
}

export default defineNuxtModule<WPNuxtBlocksConfig>({
  meta: {
    name: '@wpnuxt/blocks',
    configKey: 'wpNuxtBlocks'
  },
  defaults: {
    prefix: 'WP'
  },
  async setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register block components
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: options.prefix,
      global: true
    })
  }
})
