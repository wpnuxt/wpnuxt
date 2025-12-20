/**
 * GraphQL Configuration for IDE Integration
 *
 * This file enables IDE support (VS Code GraphQL extension, WebStorm, etc.) for:
 * - Autocomplete in .gql files
 * - Schema validation
 * - Go to definition for types and fields
 *
 * IMPORTANT: This config imports from the full playground's generated .nuxt folder.
 * Before your IDE can provide GraphQL support, you need to run:
 *
 *   pnpm run dev:prepare
 *
 * This generates the GraphQL schema and config in playgrounds/full/.nuxt/
 */
import config from './playgrounds/full/.nuxt/nuxt-graphql-middleware/graphql.config'

export default config
