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
   * Whether to download the schema from the WordPress site and save it to disk
   * If downloadSchema is false, the file must be present at './schema.graphql' in order to generate types.
   *
   * https://nuxt-graphql-middleware.dulnan.net/configuration/module.html#downloadschema-boolean
   *
   * @default true
   */
  downloadSchema: boolean
}
