<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: WPNuxt
- Package name: wpnuxt
- Description: My new Nuxt module
-->

# WPNuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt 4 module that seamlessly integrates WordPress with Nuxt via GraphQL (WPGraphQL), providing type-safe composables and utilities for fetching WordPress content.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/wpnuxt?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- 🚀 **Auto-generated Composables** - Automatically generates type-safe composables from your GraphQL queries
- 📝 **Type Safety** - Full TypeScript support with generated types from your WordPress GraphQL schema
- 🔄 **Query Merging** - Extend or override default queries with your custom GraphQL queries
- 🖼️ **Image Handling** - Built-in utilities for transforming WordPress image URLs
- ⚡ **Performance** - Client-side caching and optimized query execution
- 🎨 **Flexible** - Works with any WordPress installation with WPGraphQL plugin
- 🛡️ **Sanitized Content** - Integrated DOMPurify for safe HTML content rendering

## Quick Setup

1. Install the module to your Nuxt application:

```bash
npx nuxi module add wpnuxt
```

2. Add `wpnuxt` to the `modules` section of `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['wpnuxt'],

  wpNuxt: {
    wordpressUrl: 'https://your-wordpress-site.com',
    // Optional configuration
    graphqlEndpoint: '/graphql',
    downloadSchema: true,
    debug: false
  }
})
```

3. Or configure via environment variables in `.env`:

```env
WPNUXT_WORDPRESS_URL=https://your-wordpress-site.com
WPNUXT_GRAPHQL_ENDPOINT=/graphql
WPNUXT_DOWNLOAD_SCHEMA=true
WPNUXT_DEBUG=false
```

That's it! You can now use WPNuxt in your Nuxt app ✨

## Usage

### Using Default Composables

WPNuxt provides default composables for common WordPress queries:

```vue
<script setup lang="ts">
// Fetch posts
const posts = await usePosts({ limit: 10 })

// Fetch a single post by URI
const post = await usePostByUri({ uri: '/my-post' })

// Fetch pages
const pages = await usePages()

// Using async versions for reactive data
const { data: asyncPosts, pending, refresh } = await useLazyPosts()
</script>

<template>
  <div>
    <article v-for="post in posts.data" :key="post.id">
      <h2>{{ post.title }}</h2>
      <div v-html="post.content" />
    </article>
  </div>
</template>
```

### Custom GraphQL Queries

Create custom queries by adding `.gql` files to `extend/queries/` in your project:

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

This automatically generates `useCustomPosts()` and `useAsyncCustomPosts()` composables:

```vue
<script setup lang="ts">
const posts = await useCustomPosts({ categoryId: 5 })
</script>
```

### Working with Fragments

Extend existing fragments or create new ones:

```graphql
# extend/queries/fragments/CustomPost.fragment.gql
fragment CustomPost on Post {
  ...Post
  author {
    node {
      name
      avatar {
        url
      }
    }
  }
  seo {
    title
    metaDesc
  }
}
```

## Configuration

### Module Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wordpressUrl` | `string` | - | **Required.** Your WordPress site URL (no trailing slash) |
| `graphqlEndpoint` | `string` | `/graphql` | GraphQL endpoint path |
| `downloadSchema` | `boolean` | `true` | Download schema from WordPress |
| `debug` | `boolean` | `false` | Enable debug logging |
| `queries.extendFolder` | `string` | `extend/queries/` | Path to custom queries folder |
| `queries.mergedOutputFolder` | `string` | `.queries/` | Path for merged queries output |

### Environment Variables

- `WPNUXT_WORDPRESS_URL` - WordPress site URL
- `WPNUXT_GRAPHQL_ENDPOINT` - GraphQL endpoint path
- `WPNUXT_DOWNLOAD_SCHEMA` - Download schema (true/false)
- `WPNUXT_DEBUG` - Enable debug mode (true/false)


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/wpnuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/wpnuxt

[npm-downloads-src]: https://img.shields.io/npm/dm/wpnuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/wpnuxt

[license-src]: https://img.shields.io/npm/l/wpnuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/wpnuxt

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
