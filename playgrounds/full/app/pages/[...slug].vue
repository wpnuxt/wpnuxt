<script setup lang="ts">
// Debug: Use useState to preserve SSR debug info across hydration
const route = useRoute()

// useState persists between SSR and client - won't be overwritten on hydration
const ssrDebug = useState('ssr-debug', () => ({
  ranOnServer: import.meta.server,
  serverRoutePath: import.meta.server ? route.path : null,
  serverTime: import.meta.server ? new Date().toISOString() : null
}))

// This will be different on client
const clientDebug = ref({
  isServer: import.meta.server,
  routePath: route.path,
  time: new Date().toISOString()
})

console.log('[DEBUG] route.path:', route.path, 'isServer:', import.meta.server)

// Use a unique key based on the route path to ensure proper caching/hydration
const { data: post, pending, refresh, clear, error } = await useNodeByUri(
  { uri: route.path },
  {
    key: `node-${route.path}`,
    watch: [() => route.path]
  }
)

const fetchDebug = ref({
  pending: pending.value,
  hasError: !!error.value,
  errorMsg: error.value?.message || null,
  hasData: !!post.value
})

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
        <pre style="background: #ccffcc; padding: 8px; white-space: pre-wrap;">SSR STATE (useState - preserved): {{ JSON.stringify(ssrDebug, null, 2) }}</pre>
        <pre style="background: #ffcccc; padding: 8px; white-space: pre-wrap;">CLIENT STATE (ref - current): {{ JSON.stringify(clientDebug, null, 2) }}</pre>
        <pre style="background: #ccccff; padding: 8px; white-space: pre-wrap;">FETCH STATE: {{ JSON.stringify(fetchDebug, null, 2) }}</pre>
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
