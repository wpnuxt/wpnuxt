# Deploying WPNuxt to Vercel

This guide covers the configuration needed to deploy a WPNuxt application to Vercel with proper SSR and client-side navigation support.

## Required Configuration

When deploying to Vercel, add the following to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... your other config

  // Force SSR for all routes (required for catch-all routes on Vercel)
  routeRules: {
    '/**': { ssr: true }
  },

  // Enable native SWR for proper Vercel ISR handling
  nitro: {
    future: {
      nativeSWR: true
    }
  }
})
```

## Why This Configuration is Needed

### Route Rules for SSR

Vercel's serverless environment handles catch-all routes (`[...slug].vue`) differently than static routes. Without explicitly enabling SSR via route rules, these pages may not be server-rendered, causing:
- Content not appearing on initial page load
- Missing SEO metadata
- Hydration issues

### Native SWR

The `nitro.future.nativeSWR: true` option enables Vercel's native Stale-While-Revalidate caching behavior. This is required because:
- Vercel's ISR (Incremental Static Regeneration) implementation expects this configuration
- Without it, GraphQL response data may not be properly passed to the client
- It resolves issues with client-side navigation not fetching data

## Client-Side Navigation

For pages with dynamic routes that fetch data based on the URL, you may need to add an `onMounted` fallback to handle client-side navigation:

```vue
<script setup lang="ts">
const route = useRoute()

const { data: post, pending, status, execute } = await useNodeByUri({
  uri: route.path
})

// Fallback for client-side navigation
onMounted(async () => {
  if (!import.meta.server && !post.value && status.value !== 'success') {
    await execute()
  }
})
</script>
```

This ensures that when navigating between pages on the client, the data fetch is triggered if SSR data isn't available.

## Caching Configuration

WPNuxt automatically configures server-side caching for GraphQL requests:

```typescript
// Default caching (configured in @wpnuxt/core)
routeRules: {
  '/api/graphql_middleware/**': {
    cache: {
      maxAge: 300, // 5 minutes
      swr: true
    }
  }
}
```

You can customize this in your `wpNuxt` config:

```typescript
wpNuxt: {
  cache: {
    enabled: true,  // default: true
    maxAge: 600,    // default: 300 (5 minutes)
    swr: true       // default: true
  }
}
```

## Troubleshooting

### Content not loading on page navigation

If content loads on hard refresh but not when navigating from another page:
1. Ensure `routeRules: { '/**': { ssr: true } }` is set
2. Ensure `nitro.future.nativeSWR: true` is set
3. Add the `onMounted` fallback as shown above

### SSR not executing

Check your Vercel function logs for errors. Common issues:
- Missing environment variables (`WPNUXT_WORDPRESS_URL`)
- WordPress GraphQL endpoint not accessible from Vercel's servers
- CORS issues with the WordPress site

### GraphQL errors

Enable debug mode to see detailed GraphQL errors:

```typescript
wpNuxt: {
  debug: true
}
```
