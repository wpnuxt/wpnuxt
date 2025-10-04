import type { OperationTypeNode } from 'graphql'

export interface WPNuxtConfig {

  /**
   * Log level for the WPNuxt module
   * @default 3
   * @example 0 = silent, 1 = error, 2 = warn, 3 = info, 4 = debug, 5 = trace
   */
  logLevel?: number
  /**
   * URL of the WordPress site
   *
   * There is no default value for this option, so it's required.
   *
   * @example 'https://wordpress.wpnuxt.com'
   */
  wordpressUrl: string
  frontendUrl: string

  defaultMenuName?: string

  enableCache?: boolean

  /**
   * Cache duration in seconds for WordPress content
   *
   * @default 300 (5 minutes)
   */
  cacheMaxAge?: number

  staging?: boolean

  /**
   * @default 'useWP'
   */
  composablesPrefix: string

  queries?: WPNuxtConfigQueries

  /**
   * Download the GraphQL schema and store it on disk.
   *
   * When setting this to false, the module will expect a graphql.schema file to be available.
   * You could first enable this, commit the schema file and then set downloadSchema to false to avoid have to query the graphql introspection on each start of the application
   *
   * @default true
   */
  downloadSchema?: boolean

  hasBlocksModule?: boolean
  hasAuthModule?: boolean
}

export interface WPNuxtConfigQueries {

  /**
   * Folder for user defined queries
   *
   * relative to the src dir of your nuxt app
   *
   * @default extend/queries
   */
  extendDir?: string

  /**
   * The predefined queries & the user defined queries will be merged and placed in the queries output folder
   *
   * relative to the src dir of your nuxt app
   *
   * @default queries
   */
  outputDir?: string
}

export type WPNuxtQuery = {
  name: string
  nodes?: string[]
  fragments: string[]
  params: Record<string, string>
  operation: OperationTypeNode
}
