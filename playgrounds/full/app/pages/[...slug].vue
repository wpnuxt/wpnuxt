<script setup lang="ts">
// Debug: log the route path to see what's happening on Vercel
const route = useRoute()
const isServer = import.meta.server

// Store debug info that will be visible in SSR HTML
const debugInfo = ref({
  routePath: route.path,
  isServer,
  beforeFetch: new Date().toISOString()
})

console.log('[DEBUG] route.path:', route.path, 'isServer:', isServer)

// Use a unique key based on the route path to ensure proper caching/hydration
const { data: post, pending, refresh, clear, error } = await useNodeByUri(
  { uri: route.path },
  {
    key: `node-${route.path}`,
    watch: [() => route.path]
  }
)

debugInfo.value.afterFetch = new Date().toISOString()
debugInfo.value.pending = pending.value
debugInfo.value.hasError = !!error.value
debugInfo.value.errorMsg = error.value?.message || null
debugInfo.value.hasData = !!post.value

console.log('[DEBUG] after fetch - pending:', pending.value, 'error:', error.value, 'data:', !!post.value)
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderSinglePost
        :post="post"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
      />
      <UPageBody>
        <pre>const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: route.path })</pre>
        <pre style="background: #ffcccc; padding: 8px; white-space: pre-wrap;">SSR DEBUG: {{ JSON.stringify(debugInfo, null, 2) }}</pre>
        <UPageCard>
          <MDC
            v-if="post?.content"
            :value="post.content"
          />
          <LoadingPage v-else />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
