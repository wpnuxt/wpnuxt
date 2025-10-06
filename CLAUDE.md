# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

WPNuxt is a Nuxt module that integrates WordPress with Nuxt 4 via GraphQL (WPGraphQL). It generates type-safe composables from GraphQL queries and provides utilities for fetching WordPress content.

## Development Commands

### Setup
```bash
pnpm install                    # Install dependencies
pnpm run dev:prepare           # Build module stub, prepare playgrounds, generate types
```

### Development
```bash
pnpm run dev                   # Run main playground (with @nuxt/ui)
pnpm run dev:basic             # Run basic playground (minimal setup)
pnpm run dev:build             # Build main playground
pnpm run dev:basic:build       # Build basic playground
```

### Testing & Linting
```bash
pnpm run test                  # Run Vitest tests
pnpm run test:watch            # Run tests in watch mode
pnpm run test:types            # Type check module and playground
pnpm run lint                  # Run ESLint
```

### Build & Release
```bash
pnpm run prepack               # Build the module for distribution
pnpm run release               # Lint, test, build, create changelog, publish, and push tags
```

## Architecture

### Module Structure

**Core Module (`src/module.ts`)**
- Entry point that configures the WPNuxt module
- Registers `nuxt-graphql-middleware` and `@radya/nuxt-dompurify` dependencies
- Validates configuration (WordPress URL required, no trailing slash)
- Merges default queries from `src/runtime/queries/` with user queries from `extend/queries/`
- Triggers composable generation via `src/generate.ts`

**Composable Generation (`src/generate.ts`)**
- Scans merged `.gql`/`.graphql` files and parses them using `src/utils/useParser.ts`
- For each GraphQL query, generates two auto-imported composables:
  - `use{QueryName}()` - synchronous version using `useWPContent()`
  - `useAsync{QueryName}()` - async version using `useAsyncWPContent()`
- Generates TypeScript declarations with proper return types based on fragments
- Output written to `.nuxt/wpnuxt/index.mjs` and `.nuxt/wpnuxt/index.d.ts`

**Runtime Composables (`src/runtime/composables/useWPContent.ts`)**
- `useWPContent()` - wraps `useGraphqlQuery()` from nuxt-graphql-middleware
- `useAsyncWPContent()` - wraps `useAsyncGraphqlQuery()`
- Both extract nested data using the `nodes` path and optionally fix image paths

### Query System

**Default Queries (`src/runtime/queries/`)**
Provides base queries for:
- Posts (by URI, ID, category)
- Pages (by URI, ID, all pages)
- Menus, Nodes, Revisions, Viewer, GeneralSettings
- Fragments for common WordPress types (Post, Page, ContentNode, etc.)

**Query Merging (`src/utils/index.ts:mergeQueries()`)**
1. Copies default queries from `src/runtime/queries/` to `.queries/` folder
2. If `extend/queries/` exists in the project, copies/overwrites queries from there
3. This merged folder is then scanned to generate composables

**Extending Queries**
Create `.gql` files in your project's `extend/queries/` folder (configurable via `queries.extendFolder`). These will override default queries or add new ones. Example:

```graphql
# extend/queries/CustomPosts.gql
query CustomPosts($limit: Int = 5) {
  posts(first: $limit) {
    nodes {
      ...Post
      customField  # Add custom fields
    }
  }
}
```

This generates `useCustomPosts()` and `useAsyncCustomPosts()` composables.

### Configuration

Module configuration in `nuxt.config.ts` under the `wpNuxt` key:

```typescript
wpNuxt: {
  wordpressUrl: string              // Required: WordPress site URL (no trailing slash)
  graphqlEndpoint: string           // Default: '/graphql'
  queries: {
    extendFolder: string            // Default: 'extend/queries/'
    mergedOutputFolder: string      // Default: '.queries/'
  }
  downloadSchema: boolean           // Default: true (downloads schema.graphql from WP)
  debug: boolean                    // Default: false (enables debug logging)
}
```

Environment variables (`.env`):
- `WPNUXT_WORDPRESS_URL` - WordPress site URL
- `WPNUXT_GRAPHQL_ENDPOINT` - GraphQL endpoint path
- `WPNUXT_DOWNLOAD_SCHEMA` - Whether to download schema
- `WPNUXT_DEBUG` - Enable debug mode

### Type Generation

The module relies on `nuxt-graphql-middleware` for GraphQL type generation:
1. Schema downloaded to `schema.graphql` (if `downloadSchema: true`)
2. Types generated to `.nuxt/graphql-operations.d.ts` from schema + queries
3. WPNuxt composables reference these types for return values

### Playgrounds

**Main Playground (`playground/`)**
- Full-featured example using @nuxt/ui v4 and @nuxtjs/mdc
- Demonstrates posts listing, post detail pages, and Nuxt UI components
- Configuration in `playground/nuxt.config.ts`

**Basic Playground (`playground-basic/`)**
- Minimal setup without UI dependencies
- Good for testing core functionality

Both playgrounds have their own `.env` files and can connect to different WordPress instances.

### Build Output

The module is built using `@nuxt/module-builder`:
- Output: `dist/module.mjs` (ESM)
- Types: `dist/types.d.mts`
- Published files include only the `dist/` folder

## Key Patterns

### Adding New Default Queries
1. Add `.gql` file to `src/runtime/queries/` or `src/runtime/queries/fragments/`
2. Run `pnpm run dev:prepare` to regenerate types
3. Generated composables are auto-imported in consuming projects

### Working with Generated Composables
Generated composables return data extracted from the query response based on the `nodes` parameter passed during generation. For example, `usePosts()` extracts `data.posts.nodes` automatically.

### Image Path Handling
The `useWPContent` composables can transform WordPress image URLs to relative paths using `getRelativeImagePath()` from `src/runtime/util/images.ts`.
