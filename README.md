# WPNuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> **Note:** WPNuxt v2 is currently in beta. The API is stable but may still have minor changes before the final release.

A Nuxt module that seamlessly integrates WordPress with Nuxt via GraphQL (WPGraphQL), providing type-safe composables and utilities for fetching WordPress content.

- [Release Notes](/CHANGELOG.md)
- [Migration Guide](/MIGRATION.md) (for users upgrading from 1.x)

## Packages

This monorepo contains the following packages:

| Package | Description | Version |
|---------|-------------|---------|
| [@wpnuxt/core](./packages/core) | Core WordPress integration with GraphQL | [![npm](https://img.shields.io/npm/v/@wpnuxt/core.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/@wpnuxt/core) |
| [@wpnuxt/blocks](./packages/blocks) | Gutenberg block rendering components | [![npm](https://img.shields.io/npm/v/@wpnuxt/blocks.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/@wpnuxt/blocks) |
| [@wpnuxt/auth](./packages/auth) | WordPress authentication (JWT) | [![npm](https://img.shields.io/npm/v/@wpnuxt/auth.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/@wpnuxt/auth) |

## Features

- **Auto-generated Composables** - Automatically generates type-safe composables from your GraphQL queries
- **Type Safety** - Full TypeScript support with generated types from your WordPress GraphQL schema
- **Query Merging** - Extend or override default queries with your custom GraphQL queries
- **Block Rendering** - Render Gutenberg blocks as Vue components with `@wpnuxt/blocks`
- **Image Optimization** - NuxtImg integration for optimized WordPress images
- **Sanitized Content** - Integrated DOMPurify for safe HTML content rendering
- **Vercel Ready** - Optimized settings for Vercel deployment with ISR support

## Quick Setup

### 1. Install the package

```bash
npm install @wpnuxt/core
# or
pnpm add @wpnuxt/core
```

### 2. Add to your Nuxt config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  wpNuxt: {
    wordpressUrl: 'https://your-wordpress-site.com'
  }
})
```

### 3. Start using composables

```vue
<script setup lang="ts">
// Fetch posts
const { data: posts } = await usePosts()

// Fetch a single post by URI
const { data: post } = await usePostByUri({ uri: '/my-post' })

// Lazy loading (non-blocking) with reactive state
const { data: pages, pending, refresh } = usePages(undefined, { lazy: true })
</script>

<template>
  <article v-for="post in posts" :key="post.id">
    <h2>{{ post.title }}</h2>
    <div v-sanitize-html="post.content" />
  </article>
</template>
```

## Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  wpNuxt: {
    // Required: Your WordPress site URL (no trailing slash)
    wordpressUrl: 'https://your-wordpress-site.com',

    // Optional settings
    graphqlEndpoint: '/graphql',  // Default: '/graphql'
    downloadSchema: true,          // Default: true
    debug: false,                  // Default: false

    // Query folders
    queries: {
      extendFolder: 'extend/queries/',      // Default
      mergedOutputFolder: '.queries/'       // Default
    },

    // Server-side caching
    cache: {
      enabled: true,   // Default: true
      maxAge: 300,     // Default: 300 (5 minutes)
      swr: true        // Default: true (stale-while-revalidate)
    }
  }
})
```

### Environment Variables

```env
WPNUXT_WORDPRESS_URL=https://your-wordpress-site.com
WPNUXT_GRAPHQL_ENDPOINT=/graphql
WPNUXT_DOWNLOAD_SCHEMA=true
WPNUXT_DEBUG=false
```

## Custom Queries

Create custom queries by adding `.gql` files to `extend/queries/`:

```graphql
# extend/queries/CustomPosts.gql
query CustomPosts($categoryId: Int!) {
  posts(first: 10, where: { categoryId: $categoryId }) {
    nodes {
      ...Post
      customField
    }
  }
}
```

This generates a `useCustomPosts()` composable. Use `{ lazy: true }` option for non-blocking behavior.

## Using @wpnuxt/blocks

For rendering WordPress Gutenberg blocks as Vue components:

```bash
npm install @wpnuxt/blocks
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@wpnuxt/core', '@wpnuxt/blocks'],

  wpNuxtBlocks: {
    imageDomains: ['your-wordpress-site.com']
  }
})
```

```vue
<script setup lang="ts">
const { data: page } = await usePageByUri({ uri: route.path })
</script>

<template>
  <BlockRenderer v-if="page" :node="page" />
</template>
```

Override default block components by creating your own in `components/blocks/`:

```
components/
  blocks/
    CoreParagraph.vue    # Override default paragraph rendering
    CoreHeading.vue      # Override default heading rendering
    MyCustomBlock.vue    # Custom block component
```

## Requirements

- **Nuxt 3.17+** (for older Nuxt 3, use WPNuxt 1.x)
- **WordPress** with [WPGraphQL](https://www.wpgraphql.com/) plugin installed
- **Node.js 20+**

## Development

```bash
# Install dependencies
pnpm install

# Prepare all packages
pnpm run dev:prepare

# Run playground (full features)
pnpm run dev

# Run core playground (core only)
pnpm run dev:core

# Run blocks playground
pnpm run dev:blocks

# Run tests
pnpm run test

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Migration from 1.x

See the [Migration Guide](/MIGRATION.md) for detailed instructions on upgrading from WPNuxt 1.x.

Key changes:
- Nuxt 3.17+ required (was Nuxt 3)
- Composables renamed: `useWPPosts` → `usePosts`
- Async variants: `useAsyncPosts` → `usePosts(undefined, { lazy: true })`
- Directive changed: `v-sanitize` → `v-sanitize-html`

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@wpnuxt/core/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@wpnuxt/core

[npm-downloads-src]: https://img.shields.io/npm/dm/@wpnuxt/core.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@wpnuxt/core

[license-src]: https://img.shields.io/npm/l/@wpnuxt/core.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@wpnuxt/core

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
