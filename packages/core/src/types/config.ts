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
   * Bearer token for authenticated schema introspection at build time.
   *
   * Required when your WordPress GraphQL endpoint has public introspection disabled.
   * The token is sent as an `Authorization: Bearer <token>` header during:
   * - Endpoint validation (introspection query)
   * - Schema download (get-graphql-schema)
   *
   * Can also be set via `WPNUXT_SCHEMA_AUTH_TOKEN` environment variable.
   *
   * This token is only used at build time and is NOT included in client bundles.
   */
  schemaAuthToken?: string

  /**
   * Whether to replace internal WordPress links with client-side navigation (NuxtLink).
   *
   * When enabled, clicks on `<a>` tags pointing to the WordPress domain inside
   * `<WPContent>` are intercepted and handled via `navigateTo()`.
   *
   * @default true
   */
  replaceLinks?: boolean

  /**
   * Whether to convert featured image `sourceUrl` values to relative paths.
   *
   * When enabled, a `relativePath` property is added to `featuredImage.node`
   * by stripping the WordPress domain from `sourceUrl`.
   *
   * Set to `true` when using relative image paths with Nuxt Image or a proxy.
   * Leave `false` (default) for SSG or external image providers (Vercel, Cloudflare)
   * that need full URLs.
   *
   * @default false
   */
  imageRelativePaths?: boolean

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

    /**
     * Secret token for the cache revalidation webhook endpoint.
     *
     * When set, WPNuxt registers a POST endpoint at `/api/_wpnuxt/revalidate`
     * that WordPress can call to purge all cached GraphQL responses immediately.
     *
     * On self-hosted (Node.js), purges Nitro's internal handler cache.
     * On Vercel, also purges the CDN cache when `VERCEL_TOKEN` and
     * `VERCEL_PROJECT_ID` environment variables are set.
     *
     * Can also be set via `WPNUXT_REVALIDATE_SECRET` environment variable.
     *
     * @see https://wpnuxt.com/guide/caching#webhook-revalidation
     */
    revalidateSecret?: string
  }

  /**
   * Auto-generation of fragments + queries for Custom Post Types.
   *
   * WPNuxt parses the downloaded `schema.graphql` at build time, finds every
   * object type implementing `ContentNode`, and emits a base fragment plus
   * `Listing`, `ByUri`, and `BySlug` queries for each discovered CPT. Built-in
   * types (Post, Page, MediaItem, Revision, Comment) are excluded because
   * they already have default queries.
   *
   * Generated files land in `.queries/` and can be fully overridden by
   * dropping a file with the same name in `extend/queries/fragments/`
   * (for fragments) or `extend/queries/` (for queries).
   */
  cpt?: {
    /**
     * Enable CPT auto-generation.
     *
     * @default true
     */
    enabled?: boolean

    /**
     * Type names to skip in addition to the built-in exclusions.
     *
     * @example ['DraftPost', 'InternalNote']
     */
    exclude?: string[]

    /**
     * If set, only these type names will be auto-generated.
     *
     * Useful when you want fine-grained control over which CPTs get
     * auto-generated output. Built-in exclusions still apply.
     *
     * @example ['Event', 'Artist']
     */
    include?: string[]
  }
}
