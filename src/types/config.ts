import type { ModuleOptions as GraphqlMiddlewareConfig } from 'nuxt-graphql-middleware'

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

  graphqlMiddleware: GraphqlMiddlewareConfig
}
