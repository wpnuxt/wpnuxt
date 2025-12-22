# nuxt-graphql-middleware Integration Improvements

This document tracks planned improvements to how WPNuxt uses nuxt-graphql-middleware.

**Created:** 2025-12-20
**Completed:** 2025-12-20
**Based on:** nuxt-graphql-middleware v5.2.3

---

## Summary

| # | Improvement | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 1 | [Fix route rules path](#1-fix-route-rules-path) | High | Low | Done |
| 2 | [Add server options configuration](#2-add-server-options-configuration) | High | Medium | Done |
| 3 | [Add mutation composable generation](#3-add-mutation-composable-generation) | Medium | Medium | Done |
| 4 | [Add client context support](#4-add-client-context-support) | Medium | Low | Done |
| 5 | [Enable file upload support](#5-enable-file-upload-support) | Low | Low | Done |
| 6 | [Add error hook integration](#6-add-error-hook-integration) | Low | Low | Done |
| 7 | [Add codegenConfig for better types](#7-add-codegenconfig-for-better-types) | Low | Low | Done |
| 8 | [Document DevTools integration](#8-document-devtools-integration) | Low | Low | Done |
| 9 | [Enable improved query param encoding](#9-enable-improved-query-param-encoding) | Low | Low | Done |

---

## Detailed Improvements

### 1. Fix route rules path

**Priority:** High
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
Current Nitro route rules use `/graphql-middleware/**` but the actual API path is `/api/graphql_middleware/**`.

**Current code** (`packages/core/src/module.ts`):
```typescript
nuxt.options.nitro.routeRules['/graphql-middleware/**'] = { ... }
```

**Fix:**
```typescript
nuxt.options.nitro.routeRules['/api/graphql_middleware/**'] = { ... }
```

**Impact:** Server-side caching is not working as intended.

---

### 2. Add server options configuration

**Priority:** High
**Effort:** Medium
**Status:** Done (2025-12-20)

**Problem:**
WPNuxt doesn't leverage `defineGraphqlServerOptions()` for request customization.

**Benefits:**
- Forward cookies/auth headers to WordPress (enables preview mode)
- Custom error handling for WordPress-specific errors
- Dynamic endpoint selection (preview vs published)

**Implementation:**

Create `packages/core/src/runtime/server/graphqlMiddleware.serverOptions.ts`:

```typescript
import { defineGraphqlServerOptions } from 'nuxt-graphql-middleware/server-options'
import { getHeader } from 'h3'

export default defineGraphqlServerOptions({
  async serverFetchOptions(event, operation, operationName, context) {
    return {
      headers: {
        // Forward WordPress auth cookies for previews
        'Cookie': getHeader(event, 'cookie') || '',
        // Forward authorization header if present
        'Authorization': getHeader(event, 'authorization') || '',
      }
    }
  },

  async onServerError(event, error, operation, operationName) {
    console.error(`[WPNuxt] GraphQL error in ${operationName}:`, error.message)
    // Could add error tracking integration here
  }
})
```

**Files to modify:**
- `packages/core/src/module.ts` - Register the server options file
- Create new server options file

---

### 3. Add mutation composable generation

**Priority:** Medium
**Effort:** Medium
**Status:** Done (2025-12-20)

**Problem:**
WPNuxt only generates query composables. Mutations in `.gql` files are ignored.

**Use cases:**
- Contact form submissions
- Comment posting
- User authentication (WPGraphQL JWT)
- Custom mutations

**Implementation:**

Update `packages/core/src/generate.ts` to:
1. Detect mutation operations (not just queries)
2. Generate `useMutation{Name}()` composables that wrap `useGraphqlMutation()`

**Example output:**
```typescript
// For a mutation like: mutation CreateComment($input: CreateCommentInput!) { ... }
export const useMutationCreateComment = (variables, options) =>
  useGraphqlMutation('CreateComment', variables, options)
```

**Files to modify:**
- `packages/core/src/generate.ts`
- `packages/core/src/utils/useParser.ts` (if needed)

---

### 4. Add client context support

**Priority:** Medium
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
nuxt-graphql-middleware's `defineGraphqlClientOptions()` isn't used. This limits client-to-server context passing.

**Use cases:**
- Preview mode tokens
- Language/locale
- User authentication state

**Implementation:**

Create `packages/core/src/runtime/app/graphqlMiddleware.clientOptions.ts`:

```typescript
import { defineGraphqlClientOptions } from 'nuxt-graphql-middleware/client-options'

export interface WPNuxtClientContext {
  preview?: boolean
  previewToken?: string
  locale?: string
}

export default defineGraphqlClientOptions<WPNuxtClientContext>({
  buildClientContext() {
    const route = useRoute()
    const { locale } = useI18n?.() ?? { locale: ref('en') }

    return {
      preview: route.query.preview === 'true',
      previewToken: route.query.token as string | undefined,
      locale: locale.value
    }
  }
})
```

**Files to modify:**
- `packages/core/src/module.ts` - Register the client options file
- Create new client options file
- Update server options to use context

---

### 5. Enable file upload support

**Priority:** Low
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
`enableFileUploads` option and `useGraphqlUploadMutation` aren't available.

**Use cases:**
- Media uploads to WordPress
- Gravity Forms file fields
- Custom file upload mutations

**Implementation:**

Update module configuration:
```typescript
await registerModule('nuxt-graphql-middleware', 'graphql', {
  // ... existing options
  enableFileUploads: true
})
```

Optionally expose a wrapper composable for WordPress media uploads.

**Files to modify:**
- `packages/core/src/module.ts`
- Optionally: new composable for WordPress media uploads

---

### 6. Add error hook integration

**Priority:** Low
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
The `nuxt-graphql-middleware:errors` hook isn't utilized for centralized error handling.

**Benefits:**
- Centralized error logging
- Error tracking service integration (Sentry, etc.)
- User-friendly error notifications

**Implementation:**

Create `packages/core/src/runtime/plugins/graphqlErrors.ts`:

```typescript
export default defineNuxtPlugin({
  setup() {
    const nuxtApp = useNuxtApp()

    nuxtApp.hook('nuxt-graphql-middleware:errors', (errors) => {
      if (import.meta.dev) {
        console.error('[WPNuxt] GraphQL errors:', errors)
      }

      // Users can extend this via their own plugin
      nuxtApp.callHook('wpnuxt:graphql-errors', errors)
    })
  }
})
```

**Files to modify:**
- Create new plugin file
- `packages/core/src/module.ts` - Register the plugin

---

### 7. Add codegenConfig for better types

**Priority:** Low
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
Default scalar type mappings may not be optimal for WordPress types.

**Implementation:**

Add to module configuration:
```typescript
await registerModule('nuxt-graphql-middleware', 'graphql', {
  // ... existing options
  codegenConfig: {
    scalars: {
      DateTime: 'string',
      ID: 'string',
      // Add other WordPress-specific scalars as needed
    }
  }
})
```

**Files to modify:**
- `packages/core/src/module.ts`

---

### 8. Document DevTools integration

**Priority:** Low
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
nuxt-graphql-middleware has Nuxt DevTools support but this isn't documented for WPNuxt users.

**Implementation:**

Add documentation explaining:
- DevTools is enabled by default
- How to view GraphQL operations in DevTools
- Debugging tips

**Files to modify:**
- Documentation files (README, docs site)

---

### 9. Enable improved query param encoding

**Priority:** Low
**Effort:** Low
**Status:** Done (2025-12-20)

**Problem:**
Newer experimental feature for better query parameter encoding isn't enabled.

**Implementation:**

Add to module configuration:
```typescript
await registerModule('nuxt-graphql-middleware', 'graphql', {
  // ... existing options
  experimental: {
    improvedQueryParamEncoding: true
  }
})
```

**Files to modify:**
- `packages/core/src/module.ts`

---

## Implementation Order

Recommended order based on dependencies and impact:

1. **#1 Fix route rules path** - Quick bug fix
2. **#9 Enable improved query param encoding** - Quick win
3. **#7 Add codegenConfig** - Quick win
4. **#2 Add server options** - Enables preview mode
5. **#4 Add client context** - Works with #2
6. **#6 Add error hook** - Better DX
7. **#3 Add mutation support** - Feature completeness
8. **#5 Enable file uploads** - Niche use case
9. **#8 Document DevTools** - Documentation only

---

## References

- [nuxt-graphql-middleware documentation](https://nuxt-graphql-middleware.dulnan.net/)
- [nuxt-graphql-middleware GitHub](https://github.com/dulnan/nuxt-graphql-middleware)
- Local clone: `~/git/wpnuxt/nuxt-graphql-middleware`
