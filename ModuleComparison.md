# WPNuxt Module Comparison

A detailed comparison between `@wpnuxt/core` (wpnuxt-core) and `wpnuxt` (this repository).

---

## Key Differences Between wpnuxt-core and wpnuxt

### 1. Package Configuration

#### wpnuxt-core:

- **Name:** `@wpnuxt/core`
- **Version:** 1.0.0-edge.30 (edge releases)
- More extensive scripts (WordPress env, docs linting, typecheck, etc.)
- **Additional dependencies:** `@vueuse/nuxt`, `consola`, `knitwork`, `lru-cache`, `vue-sanitize-directive`
- `@radya/nuxt-dompurify` is NOT included
- More comprehensive dev tooling

#### wpnuxt:

- **Name:** `wpnuxt`
- **Version:** 1.0.0 (stable)
- Simpler script setup
- Uses `@radya/nuxt-dompurify` for sanitization
- Has `husky` & `lint-staged` for git hooks
- Lighter dependency footprint

---

### 2. Configuration & Features

#### wpnuxt-core:

- **Extensive config:** `frontendUrl`, `defaultMenuName`, `enableCache`, `cacheMaxAge`, `staging`, `logLevel`, `composablesPrefix`
- Detects `@wpnuxt/blocks` and `@wpnuxt/auth` modules
- Built-in caching system with manual cache invalidation
- Staging mode support
- Custom logger with log levels (1-5)
- Server-side cache clearing on Nitro init

#### wpnuxt:

- **Minimal config:** `wordpressUrl`, `graphqlEndpoint`, `queries`, `downloadSchema`, `debug`
- No frontend URL tracking
- Relies on `nuxt-graphql-middleware`'s client cache (max 50 queries)
- Simple debug boolean
- Build hash for GraphQL requests

---

### 3. Content Fetching

#### wpnuxt-core (`useWPContent`):

- Uses custom `/api/wpContent` server endpoint
- Supports both queries and mutations via `operation` parameter
- Server-side caching with configurable TTL
- Fixes malformed URLs (port issues)
- Error handling with `FetchError`
- Single composable, no async variant

#### wpnuxt (`useWPContent` & `useAsyncWPContent`):

- Direct GraphQL via `useGraphqlQuery`/`useAsyncGraphqlQuery`
- Two variants: sync and async with reactive state
- No server-side caching layer
- Simpler implementation (60 lines vs 121 lines)
- Returns `AsyncData` with `pending`, `refresh`, `execute`, etc.

---

### 4. Components & Composables

#### wpnuxt-core has:

- **5 components:** `ContentRenderer`, `StagingBanner`, `WPContent`, `WPNuxtLogo`, `WordPressLogo`
- **6 composables:** `isStaging`, `useWPContent`, `useFeaturedImage`, `usePrevNextPost`, `useWPUri`, plus user auth functions
- `vue-sanitize-directive` plugin
- Components are lazy-loaded

#### wpnuxt has:

- **1 component:** `WPNuxtLogo`
- **1 composable:** `useWPContent` (+ async variant)
- Components are global
- Uses `@radya/nuxt-dompurify` for sanitization

---

### 5. Auto-generated Composables

#### wpnuxt-core:

- Simpler generation in `context.ts`
- Custom composables prefix (default: `useWP`)
- Single function per query

#### wpnuxt:

- More sophisticated in `generate.ts`
- Generates both sync and async variants for each query
- Fragment type inference
- Better TypeScript support with proper typing

---

### 6. Module Architecture

#### wpnuxt-core:

- More monolithic, feature-rich
- Installs `@vueuse/nuxt` automatically
- Custom server routes for content & config
- Manual Nitro cache management

#### wpnuxt:

- Leaner, focused on core GraphQL integration
- Delegates more to `nuxt-graphql-middleware`
- Plugin-based GraphQL config with build hash
- Better separation of concerns

---

## Summary

**wpnuxt-core** is a more complete, production-ready solution with caching, staging support, auth integration, and rich components. It's designed as an edge/canary version with extensive features.

**wpnuxt** is a cleaner, simpler implementation focused on core WordPress-GraphQL integration with modern async patterns and better TypeScript support. It's more modular and easier to extend.

---

## Essential Features Missing in wpnuxt

Based on analysis of `@wpnuxt/core`, here are the essential features currently missing in this repository:

### 1. Server-Side Caching System ⭐ (High Priority)

- LRU memory cache with configurable TTL (500 queries, 5min default)
- Dual-layer caching: in-memory + HTTP cache (SWR)
- Fast hash function for cache keys (FNV-1a)
- Cache invalidation on server restart
- Configurable `enableCache` and `cacheMaxAge` options
- **Impact:** Significantly improves performance for repeated queries

### 2. URL Malformation Fix ⭐ (Important for Dev)

- In `wpnuxt-core`'s `useWPContent.ts:75-86`, fixes malformed URLs like `:4000/wp-admin/` that cause issues in WordPress content
- **Missing in wpnuxt:** This URL fix is not implemented

### 3. Improved Image Path Handling

`wpnuxt-core`'s `images.ts` has better error handling:

- Validates input types
- Try-catch for URL parsing
- Returns empty string for invalid URLs
- Console warnings for debugging

**wpnuxt version:** Basic, no error handling

### 4. Essential Composables

Missing from wpnuxt:

- **`useFeaturedImage`** - Extract relative image paths from content nodes
- **`usePrevNextPost`** - Navigation between posts (blog essential)
- **`useWPUri`** - WordPress admin URL helpers (useful for edit links)
- **`isStaging`** - Environment detection

### 5. Content Components

Missing from wpnuxt:

- **`WPContent`** - Smart content renderer that detects `@wpnuxt/blocks`
- **`ContentRenderer`** - Basic content renderer with `v-sanitize`
- **`StagingBanner`** - Visual indicator for staging environments

### 6. Authentication Support

`wpnuxt-core` has placeholders for:

- `loginUser`, `logoutUser`, `getCurrentUserId`, `getCurrentUserName`
- Bearer token support in GraphQL requests
- `hasAuthModule` detection

_Note:_ These appear to be stubs for the separate `@wpnuxt/auth` module

### 7. Better Type Safety

- More comprehensive TypeScript types
- Fragment type inference in generated composables
- Proper GraphQL operation type handling (query vs mutation)

---

## Recommended Priority for wpnuxt

### Must Have:

1. ✅ Server-side caching (performance critical)
2. ✅ Malformed URL fix (prevents broken links)
3. ✅ `useFeaturedImage` (images are essential)
4. ✅ `ContentRenderer` component (content display)

### Nice to Have:

5. `usePrevNextPost` (blog navigation)
6. Improved image error handling
7. `useWPUri` (admin shortcuts)
8. Staging mode detection

### Optional/Modular:

9. Authentication (separate module?)
10. Blocks integration (separate module?)

**The caching system and URL fixes are the most critical missing pieces for a production-ready WordPress integration.**
