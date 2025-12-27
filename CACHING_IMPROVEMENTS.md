# WPNuxt Caching Improvements

This document outlines the phased approach to implementing `getCachedData` and optimizing caching in WPNuxt, as identified in IMPROVEMENTS.md item 2.3.

## Background

### Current State

1. **WPNuxt already enables client-side cache** in `packages/core/src/module.ts`:
   ```typescript
   clientCache: {
     enabled: true,
     maxSize: 50
   }
   ```

2. **nuxt-graphql-middleware fully supports `getCachedData`** - it passes all `AsyncDataOptions` through to Nuxt's `useAsyncData`.

3. **Individual queries must opt-in** to client caching with `graphqlCaching: { client: true }` - WPNuxt doesn't currently do this by default.

4. **`useWPContent` doesn't use `getCachedData`** - it relies entirely on nuxt-graphql-middleware's default behavior.

### Two Caching Layers Available

| Layer | Scope | Persistence | Purpose |
|-------|-------|-------------|---------|
| **nuxt-graphql-middleware clientCache** | Browser tab | In-memory (lost on refresh) | Deduplicate identical queries during navigation |
| **Nuxt payload/static data** | SSR → Client | Serialized in HTML | Hydration, payload extraction |

### What `getCachedData` Provides (Nuxt 4)

```typescript
getCachedData?: (key: string, nuxtApp: NuxtApp, ctx: AsyncDataRequestContext) => DataT | undefined
```

- **Default behavior**: Only returns cached data during hydration (`nuxtApp.isHydrating`)
- **Context object** includes `cause`: `"initial"`, `"refresh:manual"`, `"refresh:hook"`, or `"watch"`
- **Returns `null`/`undefined`** to trigger a fetch, or cached data to skip fetching

---

## Implementation Phases

### Phase 1: Enable GraphQL Client Caching by Default ✅

**Status**: Completed

**What**: Add `graphqlCaching: { client: true }` to `useWPContent` default options.

**Why**: The cache infrastructure is already configured but not utilized. This provides immediate benefits for client-side navigation by deduplicating identical GraphQL queries.

**Changes**:
- `packages/core/src/runtime/composables/useWPContent.ts`: Merge `graphqlCaching: { client: true }` into options

**Benefits**:
- Identical queries during client-side navigation are served from LRU cache
- Reduces redundant network requests
- Zero configuration required from users

**Risk**: Low - cache infrastructure already enabled at module level

---

### Phase 2: Add Custom getCachedData for Payload Optimization

**Status**: Pending

**What**: Implement a custom `getCachedData` function that:
1. Returns payload data during hydration
2. Returns cached data for watch-triggered refetches (when data hasn't changed)
3. Allows fresh fetch for manual refreshes

**Why**: Optimizes SSR payload handling and prevents unnecessary refetches.

**Proposed implementation**:
```typescript
// In useWPContent.ts
import { useNuxtApp } from '#imports'

const nuxtApp = useNuxtApp()

const defaultOptions: WPContentOptions = {
  graphqlCaching: { client: true },
  getCachedData: (key, app, ctx) => {
    // Always use payload during hydration
    if (app.isHydrating) {
      return app.payload.data[key]
    }
    // For watch-triggered refetches, allow using cached data
    if (ctx.cause === 'watch') {
      return app.payload.data[key] ?? app.static.data[key]
    }
    // For manual refresh, always fetch fresh
    return undefined
  }
}
```

**Considerations**:
- Key generation must be unique per query+params combination
- `JSON.stringify(params)` may have issues with object key ordering
- Need to verify behavior with/without `experimental.payloadExtraction`
- Requires testing across SSR, CSR, navigation, and refresh scenarios

**Risk**: Medium - needs thorough testing

---

### Phase 3: Expose Caching Configuration

**Status**: Pending

**What**: Add caching options to `WPContentOptions` interface for per-query control.

**Why**: Allow users to fine-tune caching behavior for specific use cases (e.g., disable for real-time data).

**Proposed changes**:
```typescript
export interface WPContentOptions {
  // ... existing options

  /** Enable client-side GraphQL caching. Default: true */
  clientCache?: boolean

  /** Custom cache key suffix for payload deduplication */
  cacheKey?: string
}
```

**Usage examples**:
```typescript
// Disable client caching for real-time data
const { data } = usePosts(undefined, { clientCache: false })

// Custom cache key for complex scenarios
const { data } = usePosts({ category: 'news' }, {
  cacheKey: `posts-news-${locale.value}`
})
```

**Risk**: Low - additive API change

---

### Phase 4: Documentation

**Status**: Pending

**What**: Document the caching behavior comprehensively.

**Topics to cover**:
- Default caching behavior (client cache enabled)
- When to disable caching (mutations, real-time data, authenticated content)
- How to customize `getCachedData` for specific use cases
- Server-side caching via Nitro route rules (already configured)
- Cache invalidation strategies

**Files to update**:
- `docs/content/2.guide/` - Add caching guide
- `docs/content/3.composables/` - Document caching options in composable docs

---

## Testing Requirements

Before completing Phase 2, test the following scenarios:

1. **SSR Hydration**: Data fetched on server is properly hydrated on client
2. **Client Navigation**: Subsequent navigations use cached data
3. **Manual Refresh**: `refresh()` always fetches fresh data
4. **Watch Triggers**: Reactive variable changes trigger refetch appropriately
5. **Deployment Targets**: Test on Vercel, Cloudflare, Netlify, Node.js

---

## References

- [nuxt-graphql-middleware useAsyncGraphqlQuery](https://nuxt-graphql-middleware.dulnan.net/composables/useAsyncGraphqlQuery)
- [nuxt-graphql-middleware Caching](https://nuxt-graphql-middleware.dulnan.net/features/caching)
- [Nuxt 4 useAsyncData](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt 4 useNuxtData](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data)
