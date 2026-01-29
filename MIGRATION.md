# Migration Guide: WPNuxt 1.x to 2.x

This guide covers migrating from the old separate WPNuxt packages to the new unified monorepo version (2.x).

## Overview

WPNuxt 2.x is a complete rewrite for **Nuxt 4** with a simplified API and improved architecture. The migration difficulty depends on which features you were using.

| Complexity | Scenario |
|------------|----------|
| **Easy** | Using only basic queries (Posts, Pages, Menu) |
| **Medium** | Using custom queries, blocks package |
| **Complex** | Using auth package, removed composables, or heavily customized setup |

## Package Changes

The package names remain the same, but the repository structure has changed:

| Old Package | New Package | Notes |
|-------------|-------------|-------|
| `@wpnuxt/core@1.x` | `@wpnuxt/core@2.x` | Same npm package name |
| `@wpnuxt/blocks@0.x` | `@wpnuxt/blocks@2.x` | Same npm package name |
| `@wpnuxt/auth@0.x` | `@wpnuxt/auth@2.x` | Same npm package name |

### Update Dependencies

```bash
# Remove old packages
npm uninstall @wpnuxt/core @wpnuxt/blocks @wpnuxt/auth

# Install new packages
npm install @wpnuxt/core@^2.0.0
npm install @wpnuxt/blocks@^2.0.0  # if using blocks
```

## Nuxt Version Requirements

| Version | Nuxt Requirement |
|---------|-----------------|
| WPNuxt 1.x | Nuxt 3.x |
| WPNuxt 2.x | **Nuxt 4.x** |

Make sure to migrate your Nuxt app to Nuxt 4 first. See [Nuxt 4 migration guide](https://nuxt.com/docs/getting-started/upgrade).

## Configuration Changes

### nuxt.config.ts

```typescript
// OLD (1.x)
export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],
  wpNuxt: {
    wordpressUrl: 'https://example.com',
    frontendUrl: 'https://frontend.com',      // REMOVED
    defaultMenuName: 'main',                   // REMOVED
    enableCache: true,                         // Changed
    cacheMaxAge: 300,                          // Changed
    staging: false,                            // REMOVED
    logLevel: 3,                               // Changed to debug
    composablesPrefix: 'useWP',               // REMOVED (now fixed to 'use')
    queries: {
      extendDir: 'extend/queries',            // Renamed
      outputDir: '.queries'                   // Renamed
    },
    downloadSchema: true
  }
})

// NEW (2.x)
export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],
  wpNuxt: {
    wordpressUrl: 'https://example.com',
    graphqlEndpoint: '/graphql',              // NEW (defaults to /graphql)
    debug: false,                              // Replaces logLevel
    downloadSchema: true,
    queries: {
      extendFolder: 'extend/queries/',        // Renamed from extendDir
      mergedOutputFolder: '.queries/'         // Renamed from outputDir
    },
    cache: {                                   // NEW structured config
      enabled: true,                           // Replaces enableCache
      maxAge: 300,                             // Replaces cacheMaxAge
      swr: true                                // NEW: stale-while-revalidate
    }
  }
})
```

### Removed Configuration Options

| Option | Alternative |
|--------|-------------|
| `frontendUrl` | Not needed in 2.x |
| `defaultMenuName` | Pass menu name to query directly |
| `staging` | Use environment variables |
| `logLevel` | Use `debug: true/false` |
| `composablesPrefix` | Fixed to `use` prefix |
| `hasBlocksModule` | Auto-detected |
| `hasAuthModule` | Auto-detected |

### Environment Variables

```bash
# OLD
WPNUXT_WORDPRESS_URL=https://example.com
WPNUXT_FRONTEND_URL=https://frontend.com
WPNUXT_ENABLE_CACHE=true
WPNUXT_CACHE_MAX_AGE=300
WPNUXT_LOG_LEVEL=3
WPNUXT_STAGING=false

# NEW (only these environment variables are supported)
WPNUXT_WORDPRESS_URL=https://example.com
WPNUXT_GRAPHQL_ENDPOINT=/graphql
WPNUXT_DOWNLOAD_SCHEMA=true
WPNUXT_DEBUG=false
```

> **Note:** Cache settings can only be configured in `nuxt.config.ts`, not via environment variables.

## Composable Changes

### Renamed Composables

The `composablesPrefix` option was removed. The prefix is now always `use`:

```typescript
// OLD (with default prefix 'useWP')
const { data } = await useWPPosts()
const { data } = await useAsyncWPPosts()

// NEW (fixed 'use' prefix, lazy is now an option)
const { data } = usePosts()                         // Blocking (default)
const { data } = usePosts(undefined, { lazy: true }) // Non-blocking (replaces useAsync*)
```

### Removed Composables

The following composables were **intentionally removed** from 2.x:

| Removed | Alternative |
|---------|-------------|
| `useFeaturedImage()` | Access `featuredImage` directly from post data |
| `isStaging()` | Use environment variables: `process.env.NODE_ENV` |
| `useWPUri()` | Use `useRoute().params` directly |

> **Note:** `usePrevNextPost()` is available in v2 and works out of the box.

#### Example: Replacing useFeaturedImage

```typescript
// OLD
const image = useFeaturedImage(post)

// NEW: Access directly
const image = post.featuredImage?.node
```

### Mutations

```typescript
// OLD
const { mutate } = useMutationLogin()

// NEW (same)
const { mutate } = useMutationLogin()
```

## Component Changes

### Removed Components

| Removed | Alternative |
|---------|-------------|
| `<WPContent>` | Use `<MDC>` from @nuxtjs/mdc or `<BlockRenderer>` from @wpnuxt/blocks |
| `<ContentRenderer>` | Use `<MDC>` or `<BlockRenderer>` |
| `<StagingBanner>` | Implement in your app if needed |
| `<WordPressLogo>` | Use your own SVG or `<WPNuxtLogo>` |

### Available Components (2.x)

```vue
<!-- @wpnuxt/core -->
<WPNuxtLogo />

<!-- @wpnuxt/blocks (if installed) -->
<BlockRenderer :node="page" />
<BlockComponent :block="block" />
```

## Directive Changes

The HTML sanitization directive changed:

```vue
<!-- OLD -->
<div v-sanitize="htmlContent" />

<!-- NEW -->
<div v-sanitize-html="htmlContent" />
```

This change is due to switching from `vue-sanitize-directive` to `@radya/nuxt-dompurify`.

## Query Files

Query file locations are compatible, but the configuration option names changed:

```
# OLD
extend/queries/          (extendDir option)
.queries/               (outputDir option)

# NEW
extend/queries/          (extendFolder option)
.queries/               (mergedOutputFolder option)
```

Your existing `.gql` files in `extend/queries/` should work without changes.

## GraphQL Middleware Options

WPNuxt 2.x now auto-generates default server and client options files:

### Server Options

A `server/graphqlMiddleware.serverOptions.ts` file is created automatically with:
- Cookie forwarding for WordPress previews
- Authorization header forwarding

If you have custom server options, keep your file and it won't be overwritten.

### Client Options

A `app/graphqlMiddleware.clientOptions.ts` file is created automatically with:
- Preview mode support (passes `preview` and `token` query params)

## @wpnuxt/blocks Migration

### Module Configuration

```typescript
// OLD
export default defineNuxtConfig({
  modules: ['@wpnuxt/core', '@wpnuxt/blocks'],
  wpNuxtBlocks: {
    // options
  }
})

// NEW (same structure)
export default defineNuxtConfig({
  modules: ['@wpnuxt/core', '@wpnuxt/blocks'],
  wpNuxtBlocks: {
    imageDomains: ['wordpress.wpnuxt.com']
  }
})
```

### Block Components

Custom block components should be placed in `components/blocks/`:

```
components/
  blocks/
    CoreParagraph.vue    # Override default CoreParagraph
    MyCustomBlock.vue    # Custom block component
```

### Block Component Props

Block components receive a `block` prop:

```vue
<script setup lang="ts">
import type { EditorBlock } from '#wpnuxt/blocks'

interface CoreParagraph extends EditorBlock {
  __typename?: 'CoreParagraph'
  attributes?: {
    content?: string | null
    // ... other attributes
  } | null
}

defineProps<{
  block: CoreParagraph
}>()
</script>

<template>
  <p v-sanitize-html="block.attributes?.content" />
</template>
```

## @wpnuxt/auth Migration

The auth module has been migrated to 2.x with a new composable-based API.

### Module Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@wpnuxt/core', '@wpnuxt/auth'],
  wpNuxtAuth: {
    // Configuration options
  }
})
```

### Using useWPAuth

```typescript
// NEW: Use the useWPAuth composable
const {
  login,
  logout,
  user,
  isAuthenticated,
  isLoading,
  error
} = useWPAuth()

// Login with username/password
await login({ username: 'user', password: 'pass' })

// Check authentication status
if (isAuthenticated.value) {
  console.log('Logged in as:', user.value?.name)
}

// Logout
await logout()
```

### Supported Authentication Methods

The auth module supports multiple authentication providers:
- **Password auth**: Headless Login for WPGraphQL plugin
- **OAuth2**: miniOrange WP OAuth Server plugin
- **Headless Login**: External OAuth providers (Google, GitHub, etc.)

## Checklist

Use this checklist to track your migration progress:

- [ ] Update Nuxt to version 4.x
- [ ] Update `@wpnuxt/core` to `^2.0.0`
- [ ] Update `@wpnuxt/blocks` to `^2.0.0` (if used)
- [ ] Update `nuxt.config.ts` configuration options
- [ ] Update environment variables
- [ ] Rename composables (e.g., `useWPPosts` → `usePosts`)
- [ ] Replace `useAsync*` with `lazy: true` option (e.g., `usePosts(undefined, { lazy: true })`)
- [ ] Replace removed composables with alternatives
- [ ] Replace removed components
- [ ] Update `v-sanitize` to `v-sanitize-html`
- [ ] Test all GraphQL queries
- [ ] Test preview mode
- [ ] Test server-side rendering
- [ ] Test production build

## Common Issues

### "Cannot find module '#wpnuxt'"

Run `pnpm run dev:prepare` or `nuxt prepare` to generate types.

### "WordPress url is missing"

Ensure `wordpressUrl` is set in `nuxt.config.ts` or via `WPNUXT_WORDPRESS_URL` environment variable.

### "WordPress url should not have a trailing slash"

Remove the trailing slash from your WordPress URL:

```typescript
// Wrong
wordpressUrl: 'https://example.com/'

// Correct
wordpressUrl: 'https://example.com'
```

### Types not generated

Make sure your WordPress site has WPGraphQL installed and the schema is accessible at the configured endpoint.

## Getting Help

- GitHub Issues: https://github.com/wpnuxt/wpnuxt/issues
- Documentation: https://wpnuxt.com (coming soon)
