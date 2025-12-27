import { promises as fsp, existsSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, installModule, createResolver, addComponentsDir, addTemplate, hasNuxtModule, useLogger } from '@nuxt/kit'

const logger = useLogger('@wpnuxt/blocks')

export interface WPNuxtBlocksConfig {
  /**
   * Enable or disable the module
   * @default true
   */
  enabled?: boolean
  /**
   * Domains to allow for @nuxt/image
   * @default []
   */
  imageDomains?: string[]
  /**
   * Enable Nuxt UI integration for enhanced button styling
   * Set to false to use native HTML elements
   * @default 'auto' - uses Nuxt UI if available
   */
  nuxtUI?: boolean | 'auto'
  /**
   * Skip the WPGraphQL Content Blocks plugin check
   * @default false
   */
  skipPluginCheck?: boolean
}

export default defineNuxtModule<WPNuxtBlocksConfig>({
  meta: {
    name: '@wpnuxt/blocks',
    configKey: 'wpNuxtBlocks'
  },
  defaults: {
    enabled: true,
    imageDomains: [],
    nuxtUI: 'auto',
    skipPluginCheck: false
  },
  async setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)

    // Set up alias for #wpnuxt/blocks
    nuxt.options.alias['#wpnuxt/blocks'] = resolve(nuxt.options.buildDir, 'wpnuxt/blocks')

    // Install @nuxt/ui if explicitly enabled or if auto and already available
    if (options.nuxtUI === true || (options.nuxtUI === 'auto' && hasNuxtModule('@nuxt/ui'))) {
      await installModule('@nuxt/ui')
    }

    // Install @nuxt/image (always required for CoreImage)
    await installModule('@nuxt/image', {
      domains: options.imageDomains
    })

    // Install @radya/nuxt-dompurify for v-sanitize directive (used by block components)
    await installModule('@radya/nuxt-dompurify')

    // Check for WPGraphQL Content Blocks plugin
    if (!options.skipPluginCheck) {
      const wpNuxtConfig = nuxt.options.runtimeConfig?.public?.wpNuxt as { wordpressUrl?: string, graphqlEndpoint?: string } | undefined
      const wordpressUrl = wpNuxtConfig?.wordpressUrl || process.env.WPNUXT_WORDPRESS_URL
      const graphqlEndpoint = wpNuxtConfig?.graphqlEndpoint || process.env.WPNUXT_GRAPHQL_ENDPOINT || '/graphql'

      if (wordpressUrl) {
        const graphqlUrl = `${wordpressUrl}${graphqlEndpoint}`

        // Check if editorBlocks field exists using introspection
        const introspectionQuery = `
          query CheckEditorBlocks {
            __type(name: "Post") {
              fields {
                name
              }
            }
          }
        `

        try {
          const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: introspectionQuery })
          })

          if (response.ok) {
            const data = await response.json() as { data?: { __type?: { fields?: Array<{ name: string }> } } }
            const fields = data?.data?.__type?.fields || []
            const hasEditorBlocks = fields.some((f: { name: string }) => f.name === 'editorBlocks')

            if (!hasEditorBlocks) {
              logger.warn('WPGraphQL Content Blocks plugin not detected on WordPress.')
              logger.warn('Install it from: https://github.com/wpengine/wp-graphql-content-blocks')
              logger.warn('Without this plugin, BlockRenderer will not work correctly.')
            }
          }
        } catch (error) {
          // Silently ignore network errors during build (WordPress may not be reachable)
          logger.debug('Could not check for WPGraphQL Content Blocks plugin:', error)
        }
      }
    }

    // Copy block queries to the merged queries folder
    // @wpnuxt/core creates .queries in srcDir (which is 'app/' in Nuxt 4)
    const blocksQueriesPath = resolveRuntimeModule('./queries')
    const mergedQueriesFolder = join(nuxt.options.srcDir, '.queries')

    // Copy block queries synchronously to ensure they're available
    if (existsSync(mergedQueriesFolder) && existsSync(blocksQueriesPath)) {
      cpSync(blocksQueriesPath, mergedQueriesFolder, { recursive: true })
    }

    // Register module block components
    addComponentsDir({
      path: resolveRuntimeModule('./components'),
      pathPrefix: false,
      prefix: '',
      global: true
    })

    // Register user block components from layers
    const _layers = [...nuxt.options._layers].reverse()
    for (const layer of _layers) {
      const srcDir = layer.config.srcDir
      const blockComponents = resolve(srcDir, 'components/blocks')
      const dirStat = await fsp.stat(blockComponents).catch(() => null)
      if (dirStat && dirStat.isDirectory()) {
        nuxt.hook('components:dirs', (dirs) => {
          dirs.unshift({
            path: blockComponents,
            global: true,
            pathPrefix: false,
            prefix: ''
          })
        })
      }
    }

    // Generate blocks module (re-exports from graphql-operations)
    addTemplate({
      write: true,
      filename: 'wpnuxt/blocks.mjs',
      getContents() {
        return `// Generated by @wpnuxt/blocks
export * from '#build/graphql-operations'
`
      }
    })

    // Generate type declarations for blocks
    addTemplate({
      write: true,
      filename: 'wpnuxt/blocks.d.ts',
      getContents() {
        return `// Generated by @wpnuxt/blocks
export * from '#build/graphql-operations'

export interface EditorBlock {
  __typename?: string
  name?: string | null
  clientId?: string | null
  parentClientId?: string | null
  renderedHtml?: string | null
  attributes?: Record<string, unknown> | null
  innerBlocks?: (EditorBlock | null)[] | null
}

export interface CoreParagraph extends EditorBlock {
  __typename?: 'CoreParagraph'
  attributes?: {
    content?: string | null
    anchor?: string | null
    className?: string | null
    fontSize?: string | null
    textColor?: string | null
    style?: string | null
  } | null
}

export interface CoreHeading extends EditorBlock {
  __typename?: 'CoreHeading'
  attributes: {
    content?: string | null
    level: number
    anchor?: string | null
    className?: string | null
    fontSize?: string | null
    textColor?: string | null
  }
}

export interface CoreImage extends EditorBlock {
  __typename?: 'CoreImage'
  attributes?: {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
    scale?: string | null
    caption?: string | null
    className?: string | null
  } | null
}

export interface CoreButton extends EditorBlock {
  __typename?: 'CoreButton'
  attributes: {
    url?: string | null
    text?: string | null
    linkTarget?: string | null
    rel?: string | null
    style?: string | null
    fontSize?: string | null
    className?: string | null
    cssClassName?: string | null
    metadata?: string | null
  }
}

export interface CoreButtons extends EditorBlock {
  __typename?: 'CoreButtons'
  innerBlocks?: (CoreButton | null)[] | null
}

export interface CoreQuote extends EditorBlock {
  __typename?: 'CoreQuote'
  innerBlocks?: (CoreParagraph | null)[] | null
}

export interface CoreGallery extends EditorBlock {
  __typename?: 'CoreGallery'
  innerBlocks?: (CoreImage | null)[] | null
}

export interface CoreSpacer extends EditorBlock {
  __typename?: 'CoreSpacer'
  attributes?: {
    spacerHeight?: string | null
    spacerWidth?: string | null
    className?: string | null
  } | null
}

export interface CoreDetails extends EditorBlock {
  __typename?: 'CoreDetails'
  attributes?: {
    summary?: string | null
    showContent?: boolean | null
    className?: string | null
  } | null
}
`
      }
    })
  }
})
