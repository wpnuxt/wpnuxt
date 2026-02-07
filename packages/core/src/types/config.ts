export interface WPNuxtConfig {

  /**
   * URL of the WordPress site
   *
   * There is no default value for this option, so it's required.
   *
   * @example 'https://wordpress.wpnuxt.com'
   */
  wordpressUrl: string

  /**
   * The endpoint to use for the GraphQL API.
   *
   * (will be appended to the wordpressUrl)
   *
   * @default '/graphql'
   */
  graphqlEndpoint: string

  queries: {
    /**
     * Path to the folder containing the queries to extend the default WPNuxt queries
     *
     * @default '~/extend/queries/'
     */
    extendFolder: string

    /**
     * Path to the folder containing the merged queries
     *
     * @default '.queries/'
     */
    mergedOutputFolder: string

    /**
     * Whether to warn when a user query file overrides a default query file
     * @default true
     */
    warnOnOverride?: boolean
  }

  /**
   * Whether to download the schema from the WordPress site and save it to disk
   * If downloadSchema is false, the file must be present at './schema.graphql' in order to generate types.
   *
   * https://nuxt-graphql-middleware.dulnan.net/configuration/module.html#downloadschema-boolean
   *
   * @default true
   */
  downloadSchema: boolean

  /**
   * Whether to enable debug mode
   *
   * @default false
   */
  debug: boolean

  /**
   * Server-side caching configuration
   *
   * Uses Nitro's built-in caching with stale-while-revalidate support
   */
  cache?: {
    /**
     * Enable server-side caching
     *
     * @default true
     */
    enabled?: boolean

    /**
     * Cache duration in seconds
     *
     * @default 300 (5 minutes)
     */
    maxAge?: number

    /**
     * Enable stale-while-revalidate
     * Serves stale content while refreshing in background
     *
     * @default true
     */
    swr?: boolean
  }
}
