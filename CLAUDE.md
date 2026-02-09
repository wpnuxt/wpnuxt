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
pnpm run dev:core              # Run core playground (minimal setup)
pnpm run dev:build             # Build main playground
pnpm run dev:core:build        # Build core playground
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

**Runtime Components (`src/runtime/components/WPContent.vue`)**
- `<WPContent>` - renders WordPress content with automatic internal link interception
- Uses `BlockRenderer` when `@wpnuxt/blocks` is installed, falls back to `v-sanitize-html`
- Intercepts clicks on internal `<a>` tags and uses `navigateTo()` for client-side navigation
- Props: `node` (content object), `replaceLinks` (per-instance override of global config)
- Auto-imported utilities: `isInternalLink()` and `toRelativePath()` from `src/runtime/util/links.ts`

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
  replaceLinks: boolean             // Default: true (intercept internal links in <WPContent>)
  imageRelativePaths: boolean       // Default: false (convert featured image URLs to relative paths)
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

**Full Playground (`playgrounds/full/`)** - `pnpm dev:full`
- Full-featured example using **@nuxt/ui v4**
- Renders WordPress HTML content using Tailwind Typography (`prose` classes) with `v-sanitize-html` directive
- Uses `<BlockRenderer>` for structured Gutenberg blocks, falls back to prose-styled HTML
- Best for: Simple content sites where you want great styling out of the box

**Blocks Playground (`playgrounds/blocks/`)** - `pnpm dev:blocks`
- Demonstrates the **@wpnuxt/blocks** package for Gutenberg block rendering
- Renders structured `editorBlocks` data using `<BlockRenderer :node="node" />`
- Each block type has its own Vue component (CoreParagraph, CoreHeading, CoreImage, etc.)
- Best for: Sites needing custom rendering per block type, lazy-loading images, or interactive blocks

**Core Playground (`playgrounds/core/`)** - `pnpm dev:core`
- Minimal setup with only @wpnuxt/core
- No UI framework dependencies
- Good for testing core functionality

All playgrounds connect to the same WordPress instance (https://wordpress.wpnuxt.com).

### @wpnuxt/blocks Package

The blocks package provides Vue components for rendering WordPress Gutenberg blocks in Nuxt. Key features:

- **BlockRenderer**: Iterates over `editorBlocks` and renders each block with the appropriate component
- **BlockComponent**: Resolves block type to Vue component (e.g., `core/paragraph` → `CoreParagraph`)
- **Custom Components**: Users can override any block component by creating their own in `components/blocks/`
- **Nuxt UI Integration**: When @nuxt/ui is available, components like CoreButton use UButton automatically

To override a block component, create a file in your project's `components/blocks/` directory with the same name (e.g., `CoreParagraph.vue`).

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

## Development Rules for Claude Code

### Forbidden Without Permission
- Never start the dev server (`pnpm run dev`, `pnpm run dev:*`) - always ask the user to start it manually
- Never run background shell processes for long-running servers                                                            
- Never commit or push to git without explicit user confirmation - always show staged changes and ask before committing      

### After Every Code Change
- Run `pnpm run lint` to check for linting errors
- Run `pnpm run typecheck` to verify TypeScript types
- Report results to the user before continuing
